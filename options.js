// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Dedicated Rules, Guided Builder, Custom Regex & Portable JSON Backup controller.

'use strict';

const ext = globalThis.browser || globalThis.chrome;
const Rules = globalThis.ClipZeroRules;

const regexFormEl = document.getElementById('regex-form');
const ruleLabelEl = document.getElementById('rule-label');
const rulePatternEl = document.getElementById('rule-pattern');
const ruleFlagIEl = document.getElementById('rule-flag-i');
const ruleFlagMEl = document.getElementById('rule-flag-m');
const ruleTagPreviewEl = document.getElementById('rule-tag-preview');
const regexErrorEl = document.getElementById('regex-error');
const regexCountPillEl = document.getElementById('regex-count-pill');
const rulesListEl = document.getElementById('rules-list');
const rulesEmptyEl = document.getElementById('rules-empty');
const sandboxInputEl = document.getElementById('sandbox-input');
const sandboxOutputEl = document.getElementById('sandbox-output');
const sandboxStatusEl = document.getElementById('sandbox-status');
const sandboxFillBtnEl = document.getElementById('sandbox-fill-btn');
const summaryRulesPillEl = document.getElementById('summary-rules-pill');
const summarySitesPillEl = document.getElementById('summary-sites-pill');
const exportJsonBtnEl = document.getElementById('export-json-btn');
const copyJsonBtnEl = document.getElementById('copy-json-btn');
const importJsonBtnEl = document.getElementById('import-json-btn');
const importFileInputEl = document.getElementById('import-file-input');
const backupFeedbackEl = document.getElementById('backup-feedback');
const sitesListEl = document.getElementById('sites-list');
const sitesEmptyEl = document.getElementById('sites-empty');

const modeEasyBtnEl = document.getElementById('mode-easy-btn');
const modeAdvancedBtnEl = document.getElementById('mode-advanced-btn');
const easyBuilderEl = document.getElementById('easy-builder');
const advancedBuilderEl = document.getElementById('advanced-builder');
const easyLabelEl = document.getElementById('easy-label');
const easyPrefixEl = document.getElementById('easy-prefix');
const easyCharsetEl = document.getElementById('easy-charset');
const easyMinEl = document.getElementById('easy-min');
const easyMaxEl = document.getElementById('easy-max');
const easyExampleValEl = document.getElementById('easy-example-val');
const easyPatternValEl = document.getElementById('easy-pattern-val');
const templateButtons = Array.from(document.querySelectorAll('.tpl-chip[data-tpl]'));

const RULE_TEMPLATES = Object.freeze({
  emp: {
    mode: 'easy',
    label: 'EMPLOYEE_ID',
    prefix: 'EMP-',
    charset: 'digits',
    min: 6,
    max: 6,
    pattern: 'EMP-\\d{6}',
    flags: 'i',
    sample: 'Assigned to EMP-104298 for Q4 deployment review.',
  },
  ticket: {
    mode: 'advanced',
    label: 'TICKET_ID',
    pattern: '(?:INC|TKT)-\\d{4,8}',
    flags: 'i',
    sample: 'Escalated ticket INC-84920 and follow-up TKT-502190.',
  },
  client: {
    mode: 'advanced',
    label: 'CLIENT_CODE',
    pattern: 'CLI-[A-Z]{2,4}-\\d{4}',
    flags: 'i',
    sample: 'Account CLI-ES-4092 requested contract export.',
  },
  order: {
    mode: 'advanced',
    label: 'ORDER_ID',
    pattern: '(?:ORD|INV|FAC)-\\d{4,10}',
    flags: 'i',
    sample: 'Invoice FAC-2026481 paid for order ORD-99102.',
  },
  token: {
    mode: 'advanced',
    label: 'INTERNAL_TOKEN',
    pattern: '(?:INT|PRIV)_[A-Za-z0-9]{12,32}',
    flags: 'i',
    sample: 'Service header X-Auth: INT_Ab92kLm84Pq19XyZ',
  },
});

let currentRules = [];
let currentSites = {};
let activeBuilderMode = 'easy';

function msg(key, substitutions) {
  try {
    return ext?.i18n?.getMessage?.(key, substitutions) || '';
  } catch {
    return '';
  }
}

function applyTranslations() {
  const uiLang = ext?.i18n?.getUILanguage?.();
  if (uiLang) {
    document.documentElement.lang = uiLang;
  }
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const key = el.getAttribute('data-i18n');
    const translated = key ? msg(key) : '';
    if (translated) {
      el.textContent = translated;
    }
  }
  for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = key ? msg(key) : '';
    if (translated) {
      el.setAttribute('placeholder', translated);
    }
  }
}

function escapeRegexLiteral(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clampLen(val, fallback) {
  const n = Number.parseInt(String(val), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(32, n));
}

function buildSampleChars(charset, count) {
  const pool =
    charset === 'letters'
      ? 'ABCDEFGHJKLMNPQRSTUVWXYZ'
      : charset === 'alnum'
        ? 'A7B2K9M4P8Q3X5'
        : '4829105736';
  let out = '';
  for (let i = 0; i < count; i += 1) {
    out += pool[i % pool.length];
  }
  return out;
}

function computeEasyRule() {
  const rawLabel = easyLabelEl ? easyLabelEl.value.trim() : '';
  const rawPrefix = easyPrefixEl ? easyPrefixEl.value.trim() : '';
  const charset = easyCharsetEl ? easyCharsetEl.value : 'digits';
  let minLen = clampLen(easyMinEl ? easyMinEl.value : 6, 6);
  let maxLen = clampLen(easyMaxEl ? easyMaxEl.value : 6, minLen);
  if (maxLen < minLen) {
    maxLen = minLen;
  }

  const charClass =
    charset === 'letters' ? '[A-Za-z]' : charset === 'alnum' ? '[A-Za-z0-9]' : '\\d';
  const quant = minLen === maxLen ? `{${minLen}}` : `{${minLen},${maxLen}}`;
  const hasInput = Boolean(rawLabel || rawPrefix);
  const effectivePrefix = rawPrefix || 'EMP-';
  const effectiveLabel = rawLabel || 'EMPLOYEE_ID';
  const pattern = `${escapeRegexLiteral(effectivePrefix)}${charClass}${quant}`;
  const cleanTag = Rules ? Rules.sanitizeRegexLabel(effectiveLabel) || 'LABEL' : 'LABEL';
  const sampleMatch = `${effectivePrefix}${buildSampleChars(charset, minLen)}`;

  return {
    hasInput,
    label: rawLabel,
    effectiveLabel,
    prefix: rawPrefix,
    pattern,
    sampleMatch,
    tag: `[REDACTED_${cleanTag}]`,
  };
}

function syncEasyBuilderToForm() {
  const built = computeEasyRule();
  if (easyExampleValEl) {
    easyExampleValEl.textContent = `${built.sampleMatch} → ${built.tag}`;
  }
  if (easyPatternValEl) {
    easyPatternValEl.textContent = built.pattern;
  }
  if (activeBuilderMode === 'easy') {
    if (ruleLabelEl) {
      ruleLabelEl.value = built.label;
    }
    if (rulePatternEl) {
      rulePatternEl.value = built.hasInput ? built.pattern : '';
    }
  }
  updateTagPreview();
  runSandboxPreview();
}

function setBuilderMode(mode) {
  const nextMode = mode === 'advanced' ? 'advanced' : 'easy';
  activeBuilderMode = nextMode;
  if (modeEasyBtnEl) {
    modeEasyBtnEl.classList.toggle('is-active', nextMode === 'easy');
    modeEasyBtnEl.setAttribute('aria-selected', String(nextMode === 'easy'));
  }
  if (modeAdvancedBtnEl) {
    modeAdvancedBtnEl.classList.toggle('is-active', nextMode === 'advanced');
    modeAdvancedBtnEl.setAttribute('aria-selected', String(nextMode === 'advanced'));
  }
  if (easyBuilderEl) {
    easyBuilderEl.hidden = nextMode !== 'easy';
  }
  if (advancedBuilderEl) {
    advancedBuilderEl.hidden = nextMode !== 'advanced';
  }
  if (nextMode === 'easy') {
    if (easyLabelEl && ruleLabelEl && ruleLabelEl.value && !easyLabelEl.value) {
      easyLabelEl.value = ruleLabelEl.value;
    }
    syncEasyBuilderToForm();
  } else {
    updateTagPreview();
    runSandboxPreview();
  }
  showRegexError('');
}

function mapRegexErrorReason(reason) {
  if (reason === 'invalid_label') {
    return msg('optionsErrInvalidLabel') || 'Label must start with a letter (A–Z, 0–9, _ · max 24 chars).';
  }
  if (reason === 'matches_empty') {
    return msg('optionsErrEmptyMatch') || 'Pattern must not match empty text.';
  }
  if (
    reason === 'nested_quantifier' ||
    reason === 'overlapping_alternation' ||
    reason === 'backreference' ||
    reason === 'lookbehind' ||
    reason === 'quantifier_bounds' ||
    reason === 'nesting_depth'
  ) {
    return (
      msg('optionsErrUnsafeRegex') ||
      'Pattern rejected for safety (nested quantifiers, backreferences, or ReDoS risk).'
    );
  }
  if (reason === 'too_many_rules') {
    return msg('optionsErrTooManyRules') || 'Maximum of 20 custom regex rules reached.';
  }
  return msg('optionsErrInvalidRegex') || 'Invalid regular expression syntax.';
}

function showRegexError(text) {
  if (!regexErrorEl) return;
  if (!text) {
    regexErrorEl.hidden = true;
    regexErrorEl.textContent = '';
    return;
  }
  regexErrorEl.textContent = text;
  regexErrorEl.hidden = false;
}

function showBackupFeedback(text, isError) {
  if (!backupFeedbackEl) return;
  if (!text) {
    backupFeedbackEl.hidden = true;
    backupFeedbackEl.textContent = '';
    return;
  }
  backupFeedbackEl.textContent = text;
  backupFeedbackEl.className = isError ? 'feedback is-error' : 'feedback is-ok';
  backupFeedbackEl.hidden = false;
}

function updateTagPreview() {
  if (!ruleTagPreviewEl || !Rules) return;
  const rawVal =
    activeBuilderMode === 'easy' && easyLabelEl ? easyLabelEl.value : ruleLabelEl ? ruleLabelEl.value : '';
  const clean = Rules.sanitizeRegexLabel(rawVal);
  ruleTagPreviewEl.textContent = `[REDACTED_${clean || 'LABEL'}]`;
}

function updateSummaryPills() {
  const maxRules = Rules ? Rules.MAX_CUSTOM_REGEX_RULES : 20;
  if (regexCountPillEl) {
    regexCountPillEl.textContent = `${currentRules.length}/${maxRules}`;
  }
  if (summaryRulesPillEl) {
    summaryRulesPillEl.textContent =
      msg('optionsCountRules', [String(currentRules.length)]) ||
      `${currentRules.length} regex rules`;
  }
  const siteCount = Object.keys(currentSites).length;
  if (summarySitesPillEl) {
    summarySitesPillEl.textContent =
      msg('optionsCountSites', [String(siteCount)]) || `${siteCount} saved sites`;
  }
}

function getDraftRuleForSandbox() {
  if (!Rules) return null;
  let flags = '';
  if (ruleFlagIEl && ruleFlagIEl.checked) flags += 'i';
  if (ruleFlagMEl && ruleFlagMEl.checked) flags += 'm';

  const rawLabel =
    activeBuilderMode === 'easy' && easyLabelEl ? easyLabelEl.value : ruleLabelEl ? ruleLabelEl.value : '';
  const rawPattern = rulePatternEl ? rulePatternEl.value : '';
  if (!rawLabel.trim() || !rawPattern.trim()) {
    return null;
  }
  const chk = Rules.validateCustomRegexRule(
    { id: '__draft__', label: rawLabel, pattern: rawPattern, flags, enabled: true },
    0
  );
  return chk.ok && chk.rule ? chk.rule : null;
}

function runSandboxPreview() {
  if (!sandboxInputEl || !sandboxOutputEl || !sandboxStatusEl || !Rules) {
    return;
  }
  const input = sandboxInputEl.value;
  if (!input) {
    sandboxOutputEl.hidden = true;
    sandboxOutputEl.textContent = '';
    sandboxStatusEl.textContent = msg('optionsSandboxNoMatch') || 'No matches';
    return;
  }

  const evalRules = currentRules.filter((r) => r && r.enabled);
  const draftRule = getDraftRuleForSandbox();
  if (draftRule) {
    const dup = evalRules.some(
      (r) => r.label === draftRule.label && r.pattern === draftRule.pattern && r.flags === draftRule.flags
    );
    if (!dup) {
      evalRules.push(draftRule);
    }
  }

  let output = input;
  let matchCount = 0;
  for (const rule of evalRules) {
    const chk = Rules.isSafeRegexPattern(rule.pattern, rule.flags);
    if (!chk.ok) continue;
    try {
      const re = new RegExp(rule.pattern, `g${Rules.sanitizeRegexFlags(rule.flags)}`);
      const tag = `[REDACTED_${rule.label}]`;
      const t0 = Date.now();
      let perRule = 0;
      output = output.replace(re, (m) => {
        if (!m || perRule >= 200 || Date.now() - t0 > 25) {
          return m;
        }
        perRule += 1;
        matchCount += 1;
        return tag;
      });
    } catch {
      // Skip invalid rule cleanly.
    }
  }
  sandboxOutputEl.textContent = output;
  sandboxOutputEl.hidden = false;
  sandboxStatusEl.textContent =
    matchCount > 0
      ? msg('optionsSandboxMatches', [String(matchCount)]) || `${matchCount} match(es) masked`
      : msg('optionsSandboxNoMatch') || 'No matches';
}

async function persistRules(nextRules) {
  if (!ext?.runtime?.sendMessage) {
    return false;
  }
  const res = await ext.runtime.sendMessage({
    type: 'clipzero:save-custom-regex-rules',
    rules: nextRules,
  });
  if (res && res.ok) {
    currentRules = Array.isArray(res.customRegexRules) ? res.customRegexRules : [];
    renderRulesList();
    updateSummaryPills();
    runSandboxPreview();
    return true;
  }
  showRegexError(mapRegexErrorReason(res?.error || 'invalid_syntax'));
  return false;
}

function renderRulesList() {
  if (!rulesListEl || !rulesEmptyEl) return;
  while (rulesListEl.firstChild) {
    rulesListEl.removeChild(rulesListEl.firstChild);
  }
  if (currentRules.length === 0) {
    rulesEmptyEl.hidden = false;
    return;
  }
  rulesEmptyEl.hidden = true;
  const delText = msg('optionsDeleteBtn') || 'Delete';

  for (let idx = 0; idx < currentRules.length; idx += 1) {
    const rule = currentRules[idx];
    const row = document.createElement('div');
    row.className = 'item-row';

    const main = document.createElement('div');
    main.className = 'item-main';

    const title = document.createElement('span');
    title.className = 'item-title mono';
    title.textContent = `[REDACTED_${rule.label}]`;

    const sub = document.createElement('span');
    sub.className = 'item-sub mono';
    sub.textContent = `/${rule.pattern}/g${rule.flags || ''}`;

    main.appendChild(title);
    main.appendChild(sub);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'rule-switch';
    toggleBtn.setAttribute('role', 'switch');
    toggleBtn.setAttribute('aria-checked', String(Boolean(rule.enabled)));
    toggleBtn.setAttribute('aria-label', rule.label);
    toggleBtn.addEventListener('click', async () => {
      const next = currentRules.map((item, i) =>
        i === idx ? { ...item, enabled: !item.enabled } : item
      );
      await persistRules(next);
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn-danger-link';
    delBtn.textContent = delText;
    delBtn.addEventListener('click', async () => {
      const next = currentRules.filter((_, i) => i !== idx);
      await persistRules(next);
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(delBtn);
    row.appendChild(main);
    row.appendChild(actions);
    rulesListEl.appendChild(row);
  }
}

function renderSitesList() {
  if (!sitesListEl || !sitesEmptyEl) return;
  while (sitesListEl.firstChild) {
    sitesListEl.removeChild(sitesListEl.firstChild);
  }
  const origins = Object.keys(currentSites).sort();
  if (origins.length === 0) {
    sitesEmptyEl.hidden = false;
    return;
  }
  sitesEmptyEl.hidden = true;
  const forgetLabel = msg('optionsForgetBtn') || 'Forget';

  for (const origin of origins) {
    const prefs = currentSites[origin];
    const row = document.createElement('div');
    row.className = 'item-row';

    const main = document.createElement('div');
    main.className = 'item-main';

    const title = document.createElement('span');
    title.className = 'item-title mono';
    let hostDisplay = origin;
    try {
      hostDisplay = new URL(origin).hostname;
    } catch {
      // Keep origin string if URL parsing fails.
    }
    title.textContent = hostDisplay;

    const flags = [];
    if (prefs.strictMode) flags.push('strict');
    if (prefs.stripExif) flags.push('metadata');
    if (prefs.redactImage) flags.push('redact');
    if (prefs.maskSecrets) flags.push('secrets');
    if (prefs.maskPii) flags.push('pii');
    if (prefs.customWords) {
      const wordCount = prefs.customWords.split(', ').filter(Boolean).length;
      if (wordCount > 0) flags.push(`${wordCount} words`);
    }

    const sub = document.createElement('span');
    sub.className = 'item-sub';
    sub.textContent = flags.length > 0 ? flags.join(' · ') : 'defaults';

    main.appendChild(title);
    main.appendChild(sub);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const forgetBtn = document.createElement('button');
    forgetBtn.type = 'button';
    forgetBtn.className = 'btn-danger-link';
    forgetBtn.textContent = forgetLabel;
    forgetBtn.addEventListener('click', async () => {
      if (!ext?.runtime?.sendMessage) return;
      const res = await ext.runtime.sendMessage({
        type: 'clipzero:delete-site-prefs-origin',
        origin,
      });
      if (res && res.ok) {
        delete currentSites[origin];
        renderSitesList();
        updateSummaryPills();
      }
    });

    actions.appendChild(forgetBtn);
    row.appendChild(main);
    row.appendChild(actions);
    sitesListEl.appendChild(row);
  }
}

async function loadAllConfig() {
  if (!ext?.runtime?.sendMessage) return;
  try {
    const res = await ext.runtime.sendMessage({ type: 'clipzero:get-all-config' });
    if (res && res.ok) {
      currentRules = Array.isArray(res.customRegexRules) ? res.customRegexRules : [];
      currentSites = res.sites && typeof res.sites === 'object' ? res.sites : {};
      renderRulesList();
      renderSitesList();
      updateSummaryPills();
      runSandboxPreview();
    }
  } catch {
    // Ignore background unavailability cleanly.
  }
}

function buildExportJsonString() {
  const payload = Rules
    ? Rules.buildExportPayload(currentRules, currentSites)
    : { schema: 'clipzero-config', version: 2, customRegexRules: currentRules, sites: currentSites };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

if (modeEasyBtnEl) {
  modeEasyBtnEl.addEventListener('click', () => setBuilderMode('easy'));
}

if (modeAdvancedBtnEl) {
  modeAdvancedBtnEl.addEventListener('click', () => setBuilderMode('advanced'));
}

for (const el of [easyLabelEl, easyPrefixEl, easyCharsetEl, easyMinEl, easyMaxEl]) {
  if (!el) continue;
  const evName = el.tagName === 'SELECT' ? 'change' : 'input';
  el.addEventListener(evName, () => {
    showRegexError('');
    syncEasyBuilderToForm();
  });
}

for (const btn of templateButtons) {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-tpl');
    if (!key || !Object.hasOwn(RULE_TEMPLATES, key)) {
      return;
    }
    const tpl = RULE_TEMPLATES[key];
    showRegexError('');
    if (ruleFlagIEl) ruleFlagIEl.checked = tpl.flags.includes('i');
    if (ruleFlagMEl) ruleFlagMEl.checked = tpl.flags.includes('m');
    if (tpl.mode === 'easy') {
      if (easyLabelEl) easyLabelEl.value = tpl.label;
      if (easyPrefixEl) easyPrefixEl.value = tpl.prefix;
      if (easyCharsetEl) easyCharsetEl.value = tpl.charset;
      if (easyMinEl) easyMinEl.value = String(tpl.min);
      if (easyMaxEl) easyMaxEl.value = String(tpl.max);
      setBuilderMode('easy');
    } else {
      if (ruleLabelEl) ruleLabelEl.value = tpl.label;
      if (rulePatternEl) rulePatternEl.value = tpl.pattern;
      setBuilderMode('advanced');
    }
    if (sandboxInputEl) {
      sandboxInputEl.value = tpl.sample;
      runSandboxPreview();
    }
  });
}

if (ruleLabelEl) {
  ruleLabelEl.addEventListener('input', () => {
    updateTagPreview();
    showRegexError('');
    runSandboxPreview();
  });
}

if (rulePatternEl) {
  rulePatternEl.addEventListener('input', () => {
    showRegexError('');
    runSandboxPreview();
  });
}

if (ruleFlagIEl) {
  ruleFlagIEl.addEventListener('change', runSandboxPreview);
}

if (ruleFlagMEl) {
  ruleFlagMEl.addEventListener('change', runSandboxPreview);
}

if (regexFormEl) {
  regexFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    showRegexError('');
    if (!Rules) return;
    if (currentRules.length >= Rules.MAX_CUSTOM_REGEX_RULES) {
      showRegexError(mapRegexErrorReason('too_many_rules'));
      return;
    }
    if (activeBuilderMode === 'easy') {
      syncEasyBuilderToForm();
    }
    let flags = '';
    if (ruleFlagIEl && ruleFlagIEl.checked) flags += 'i';
    if (ruleFlagMEl && ruleFlagMEl.checked) flags += 'm';

    const candidate = {
      id: `rule_${Date.now().toString(36)}`,
      label: ruleLabelEl ? ruleLabelEl.value : '',
      pattern: rulePatternEl ? rulePatternEl.value : '',
      flags,
      enabled: true,
    };
    const check = Rules.validateCustomRegexRule(candidate, currentRules.length);
    if (!check.ok || !check.rule) {
      showRegexError(mapRegexErrorReason(check.reason || 'invalid_syntax'));
      return;
    }
    const saved = await persistRules([...currentRules, check.rule]);
    if (saved) {
      if (ruleLabelEl) ruleLabelEl.value = '';
      if (rulePatternEl) rulePatternEl.value = '';
      if (easyLabelEl) easyLabelEl.value = '';
      if (easyPrefixEl) easyPrefixEl.value = '';
      syncEasyBuilderToForm();
    }
  });
}

if (sandboxInputEl) {
  sandboxInputEl.addEventListener('input', runSandboxPreview);
}

if (sandboxFillBtnEl && sandboxInputEl) {
  sandboxFillBtnEl.addEventListener('click', () => {
    const built = computeEasyRule();
    if (activeBuilderMode === 'easy' && built.hasInput) {
      sandboxInputEl.value = `Sample text containing ${built.sampleMatch} for local verification.`;
    } else {
      sandboxInputEl.value = 'Ticket INC-84920 assigned to EMP-104298 (client CLI-ES-4092, invoice FAC-2026481).';
    }
    runSandboxPreview();
    sandboxInputEl.focus();
  });
}

if (exportJsonBtnEl) {
  exportJsonBtnEl.addEventListener('click', () => {
    const jsonText = buildExportJsonString();
    const version = ext?.runtime?.getManifest?.()?.version || '1.4.0';
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clipzero-config-v${version}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showBackupFeedback(msg('optionsExportDone') || 'Configuration exported locally.', false);
  });
}

if (copyJsonBtnEl) {
  copyJsonBtnEl.addEventListener('click', async () => {
    const jsonText = buildExportJsonString();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(jsonText);
        showBackupFeedback(
          msg('optionsCopyDone') || 'Configuration JSON copied to clipboard.',
          false
        );
      }
    } catch {
      showBackupFeedback(msg('optionsImportErrInvalid') || 'Unable to copy JSON.', true);
    }
  });
}

if (importJsonBtnEl && importFileInputEl) {
  importJsonBtnEl.addEventListener('click', () => {
    importFileInputEl.value = '';
    importFileInputEl.click();
  });

  importFileInputEl.addEventListener('change', async () => {
    const file = importFileInputEl.files && importFileInputEl.files[0];
    if (!file) return;
    const maxBytes = Rules ? Rules.MAX_IMPORT_BYTES : 262144;
    if (file.size > maxBytes) {
      showBackupFeedback(
        msg('optionsImportErrInvalid') || 'Import rejected: invalid or incompatible ClipZero JSON file.',
        true
      );
      return;
    }
    let parsedJson;
    try {
      const rawText = await file.text();
      parsedJson = JSON.parse(rawText);
    } catch {
      showBackupFeedback(
        msg('optionsImportErrInvalid') || 'Import rejected: invalid or incompatible ClipZero JSON file.',
        true
      );
      return;
    }
    const modeRadio = document.querySelector('input[name="import-mode"]:checked');
    const mode = modeRadio && modeRadio.value === 'replace' ? 'replace' : 'merge';
    try {
      const res = await ext.runtime.sendMessage({
        type: 'clipzero:import-config',
        config: parsedJson,
        mode,
      });
      if (res && res.ok) {
        currentRules = Array.isArray(res.customRegexRules) ? res.customRegexRules : currentRules;
        currentSites = res.sites && typeof res.sites === 'object' ? res.sites : currentSites;
        renderRulesList();
        renderSitesList();
        updateSummaryPills();
        runSandboxPreview();
        showBackupFeedback(
          msg('optionsImportDone') || 'Configuration imported and synced to open tabs.',
          false
        );
      } else if (res?.error === 'unsupported_origin' || res?.error === 'invalid_origin') {
        showBackupFeedback(
          msg('optionsImportErrOrigin') || 'Import rejected: file contains an unsupported site origin.',
          true
        );
      } else if (res?.error === 'unsafe_rule' || res?.error === 'too_many_rules') {
        showBackupFeedback(
          msg('optionsImportErrRule') || 'Import rejected: file contains an unsafe or invalid regex rule.',
          true
        );
      } else {
        showBackupFeedback(
          msg('optionsImportErrInvalid') || 'Import rejected: invalid or incompatible ClipZero JSON file.',
          true
        );
      }
    } catch {
      showBackupFeedback(
        msg('optionsImportErrInvalid') || 'Import rejected: invalid or incompatible ClipZero JSON file.',
        true
      );
    }
  });
}

applyTranslations();
syncEasyBuilderToForm();
loadAllConfig();
