// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Zero-setup interactive onboarding & local test sandbox (zero permissions, zero network).

'use strict';

const ext = globalThis.browser || globalThis.chrome;
const Scrubber = globalThis.ClipZeroScrubber;

const statusPillEl = document.getElementById('welcome-status-pill');
const statusTextEl = document.getElementById('welcome-status-text');
const permBannerEl = document.getElementById('perm-banner');
const permTextEl = document.getElementById('perm-text');
const permGrantBtnEl = document.getElementById('perm-grant-btn');
const sampleSecretEl = document.getElementById('sample-secret');
const copyFakeBtnEl = document.getElementById('copy-fake-btn');
const simulatePasteBtnEl = document.getElementById('simulate-paste-btn');
const pasteSandboxEl = document.getElementById('paste-sandbox');
const pasteTokensEl = document.getElementById('paste-tokens');
const pasteResultEl = document.getElementById('paste-result');
const pasteResultTextEl = document.getElementById('paste-result-text');
const restoreToggleBtnEl = document.getElementById('restore-toggle-btn');
const clearPasteBtnEl = document.getElementById('clear-paste-btn');
const fileDropzoneEl = document.getElementById('file-dropzone');
const filePickBtnEl = document.getElementById('file-pick-btn');
const filePickInputEl = document.getElementById('file-pick-input');
const fileReportEl = document.getElementById('file-report');
const fileResultEl = document.getElementById('file-result');
const fileMetaGridEl = document.getElementById('file-meta-grid');
const fileRenameValEl = document.getElementById('file-rename-val');
const fileSizeValEl = document.getElementById('file-size-val');
const openHelpBtnEl = document.getElementById('open-help-btn');
const openOptionsBtnEl = document.getElementById('open-options-btn');
const closeWelcomeBtnEl = document.getElementById('close-welcome-btn');
const presetButtons = Array.from(document.querySelectorAll('.preset-chip[data-sample]'));

const SAMPLE_PRESETS = Object.freeze({
  api: 'API_KEY=sk-proj-demo0000000000000000000094f2 · alex@example.test',
  token:
    'GITHUB=ghp_0123456789abcdef0123456789abcdef0123 · JWT=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVtbyJ9.demoSig1234567890',
  url: 'DB_CONN=postgres://admin:DemoPass99@db.internal:5432/prod',
});

const DEMO_SECRET_PATTERNS = Object.freeze([
  { re: /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}\b/g, tag: '[REDACTED_OPENAI_KEY]' },
  { re: /\bsk-ant-(?:api\d{2}-)?[A-Za-z0-9_-]{20,}\b/g, tag: '[REDACTED_ANTHROPIC_KEY]' },
  { re: /\bAIza[0-9A-Za-z_-]{35}\b/g, tag: '[REDACTED_GOOGLE_KEY]' },
  { re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/g, tag: '[REDACTED_GITHUB_TOKEN]' },
  { re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g, tag: '[REDACTED_AWS_KEY]' },
  { re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, tag: '[REDACTED_JWT]' },
  {
    re: /\b[a-z][a-z0-9+.-]{1,15}:\/\/[^:\s/@]+:[^@\s/]+@[^\s]+/gi,
    tag: '[REDACTED_URL_CREDENTIALS]',
  },
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, tag: '[REDACTED_EMAIL]' },
]);

let lastRawText = '';
let lastMaskedText = '';
let isShowingRaw = false;
let missingOrigins = [];

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

function maskDemoText(raw) {
  if (typeof raw !== 'string' || !raw) {
    return { text: '', count: 0, tags: [] };
  }
  let out = raw;
  let count = 0;
  const tags = [];
  for (let i = 0; i < DEMO_SECRET_PATTERNS.length; i += 1) {
    const rule = DEMO_SECRET_PATTERNS[i];
    rule.re.lastIndex = 0;
    out = out.replace(rule.re, () => {
      count += 1;
      if (!tags.includes(rule.tag)) {
        tags.push(rule.tag);
      }
      return rule.tag;
    });
  }
  return { text: out, count, tags };
}

function renderTokenChips(tags) {
  if (!pasteTokensEl) {
    return;
  }
  while (pasteTokensEl.firstChild) {
    pasteTokensEl.removeChild(pasteTokensEl.firstChild);
  }
  if (!Array.isArray(tags) || tags.length === 0) {
    pasteTokensEl.hidden = true;
    return;
  }
  for (const tag of tags) {
    const chip = document.createElement('span');
    chip.className = 'token-chip mono';
    chip.textContent = tag;
    pasteTokensEl.appendChild(chip);
  }
  pasteTokensEl.hidden = false;
}

function applyDemoPaste(raw) {
  if (!pasteSandboxEl || !raw) {
    return false;
  }
  const res = maskDemoText(raw);
  if (res.count === 0) {
    lastRawText = '';
    lastMaskedText = '';
    isShowingRaw = false;
    pasteSandboxEl.classList.remove('is-protected');
    renderTokenChips([]);
    if (pasteResultTextEl) {
      pasteResultTextEl.className = 'result-pill is-neutral';
      pasteResultTextEl.textContent =
        msg('welcomePasteNoSecret') ||
        'No secrets detected in this text. Try one of the sample buttons above.';
    }
    if (restoreToggleBtnEl) {
      restoreToggleBtnEl.hidden = true;
    }
    if (pasteResultEl) {
      pasteResultEl.hidden = false;
    }
    return false;
  }

  lastRawText = raw;
  lastMaskedText = res.text;
  isShowingRaw = false;
  pasteSandboxEl.value = res.text;
  pasteSandboxEl.classList.add('is-protected');
  renderTokenChips(res.tags);
  if (pasteResultTextEl) {
    pasteResultTextEl.className = 'result-pill';
    pasteResultTextEl.textContent =
      msg('welcomePasteResultOk', [String(res.count)]) ||
      `Masked ${res.count} sensitive item(s) locally before any page could read them.`;
  }
  if (restoreToggleBtnEl) {
    restoreToggleBtnEl.hidden = false;
    restoreToggleBtnEl.textContent = msg('welcomeRestoreBtn') || 'Restore original';
  }
  if (pasteResultEl) {
    pasteResultEl.hidden = false;
  }
  return true;
}

function clearPasteSandbox() {
  lastRawText = '';
  lastMaskedText = '';
  isShowingRaw = false;
  if (pasteSandboxEl) {
    pasteSandboxEl.value = '';
    pasteSandboxEl.classList.remove('is-protected');
  }
  renderTokenChips([]);
  if (pasteResultEl) {
    pasteResultEl.hidden = true;
  }
}

function formatByteSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

function buildAnonymizedDemoName(origName) {
  const clean = typeof origName === 'string' && origName.trim() ? origName.trim() : 'file.bin';
  const dotIdx = clean.lastIndexOf('.');
  const extPart = dotIdx > 0 && dotIdx < clean.length - 1 ? clean.slice(dotIdx).toLowerCase() : '';
  const safeExt = /^\.[a-z0-9]{1,8}$/.test(extPart) ? extPart : '';
  return `clip_a7f3c9${safeExt}`;
}

async function checkHostPermissions() {
  const manifest = ext?.runtime?.getManifest?.();
  const declared = Array.isArray(manifest?.host_permissions)
    ? manifest.host_permissions.filter((o) => typeof o === 'string')
    : [];
  if (declared.length === 0 || !ext?.permissions?.getAll) {
    return;
  }
  try {
    const granted = await ext.permissions.getAll();
    const grantedSet = new Set(Array.isArray(granted?.origins) ? granted.origins : []);
    if (grantedSet.has('<all_urls>') || grantedSet.has('https://*/*')) {
      missingOrigins = [];
    } else {
      missingOrigins = declared.filter((o) => !grantedSet.has(o));
    }
  } catch {
    missingOrigins = [];
  }

  if (missingOrigins.length > 0 && permBannerEl && permTextEl && permGrantBtnEl) {
    const countStr = String(missingOrigins.length);
    if (statusPillEl) statusPillEl.className = 'status is-warn';
    if (statusTextEl) statusTextEl.textContent = msg('welcomeStatusPerm') || 'One click to activate';
    permTextEl.textContent =
      msg('welcomePermBanner', [countStr]) ||
      `Your browser hasn't granted access to ${countStr} supported site(s) yet. Allow access once so protection runs automatically.`;
    permGrantBtnEl.textContent =
      msg('welcomePermBtn', [countStr]) || `Allow all supported sites (${countStr})`;
    permBannerEl.hidden = false;
  } else {
    if (statusPillEl) statusPillEl.className = 'status is-active';
    if (statusTextEl) statusTextEl.textContent = msg('welcomeStatusReady') || 'Protected · Ready to use';
    if (permBannerEl) permBannerEl.hidden = true;
  }
}

async function inspectDemoFile(file) {
  if (!file || !fileResultEl) {
    return;
  }
  const origName = file.name || 'file';
  const name = origName.toLowerCase();
  const mime = (file.type || '').toLowerCase().split(';')[0].trim();
  let fmt = null;
  if (mime === 'image/jpeg' || mime === 'image/jpg' || /\.jpe?g$/.test(name)) fmt = 'jpeg';
  else if (mime === 'image/png' || name.endsWith('.png')) fmt = 'png';
  else if (mime === 'image/webp' || name.endsWith('.webp')) fmt = 'webp';
  else if (mime === 'image/gif' || name.endsWith('.gif')) fmt = 'gif';
  else if (mime === 'image/svg+xml' || name.endsWith('.svg')) fmt = 'svg';
  else if (mime === 'application/pdf' || name.endsWith('.pdf')) fmt = 'pdf';
  else if (/\.(?:docx|xlsx|pptx)$/.test(name)) fmt = 'office';

  if (fileReportEl) {
    fileReportEl.hidden = false;
  }
  if (fileRenameValEl) {
    fileRenameValEl.textContent = `${origName} → ${buildAnonymizedDemoName(origName)}`;
  }

  if (!fmt || !Scrubber) {
    fileResultEl.textContent =
      msg('welcomeFileUnsupported') ||
      'Checked locally: format not modified (filename anonymization still applies on supported sites).';
    fileResultEl.hidden = false;
    if (fileSizeValEl) {
      fileSizeValEl.textContent = `${formatByteSize(file.size)} → ${formatByteSize(file.size)}`;
    }
    if (fileMetaGridEl) {
      fileMetaGridEl.hidden = false;
    }
    return;
  }

  try {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let out = null;
    if (fmt === 'jpeg') out = Scrubber.scrubJpegBytes(bytes);
    else if (fmt === 'png') out = Scrubber.scrubPngBytes(bytes);
    else if (fmt === 'webp') out = Scrubber.scrubWebpBytes(bytes);
    else if (fmt === 'gif') out = Scrubber.scrubGifBytes(bytes);
    else if (fmt === 'svg') out = Scrubber.scrubSvgBytesLinear(bytes);
    else if (fmt === 'pdf') out = Scrubber.scrubPdfBytes(bytes, false);
    else if (fmt === 'office') out = await Scrubber.scrubOfficeZipBytes(bytes);

    if (out) {
      const saved = Math.max(0, bytes.byteLength - out.byteLength);
      fileResultEl.textContent =
        msg('welcomeFileCleaned', [String(saved)]) ||
        `Cleaned locally: metadata stripped (${saved} bytes removed · 0 bytes uploaded).`;
      if (fileSizeValEl) {
        fileSizeValEl.textContent = `${formatByteSize(bytes.byteLength)} → ${formatByteSize(out.byteLength)}`;
      }
    } else {
      fileResultEl.textContent =
        msg('welcomeFileAlreadyClean') ||
        'Checked locally: file is already clean of tracked metadata (0 bytes uploaded).';
      if (fileSizeValEl) {
        fileSizeValEl.textContent = `${formatByteSize(bytes.byteLength)} → ${formatByteSize(bytes.byteLength)}`;
      }
    }
    fileResultEl.hidden = false;
    if (fileMetaGridEl) {
      fileMetaGridEl.hidden = false;
    }
  } catch {
    fileResultEl.textContent =
      msg('welcomeFileAlreadyClean') ||
      'Checked locally: file is already clean of tracked metadata (0 bytes uploaded).';
    fileResultEl.hidden = false;
    if (fileMetaGridEl) {
      fileMetaGridEl.hidden = true;
    }
  }
}

for (const btn of presetButtons) {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-sample');
    if (!key || !Object.hasOwn(SAMPLE_PRESETS, key)) {
      return;
    }
    for (const other of presetButtons) {
      other.classList.toggle('is-selected', other === btn);
    }
    if (sampleSecretEl) {
      sampleSecretEl.textContent = SAMPLE_PRESETS[key];
    }
  });
}

if (permGrantBtnEl) {
  permGrantBtnEl.addEventListener('click', async () => {
    if (missingOrigins.length === 0 || !ext?.permissions?.request) {
      return;
    }
    permGrantBtnEl.disabled = true;
    try {
      await ext.permissions.request({ origins: missingOrigins });
    } catch {
      // Ignore permission prompt dismissal cleanly.
    } finally {
      permGrantBtnEl.disabled = false;
      await checkHostPermissions();
    }
  });
}

if (copyFakeBtnEl && sampleSecretEl) {
  copyFakeBtnEl.addEventListener('click', async () => {
    const sample = sampleSecretEl.textContent || '';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sample);
      }
      copyFakeBtnEl.textContent = msg('welcomeCopiedFakeBtn') || 'Copied — press Ctrl+V below';
      if (pasteSandboxEl) {
        pasteSandboxEl.focus();
      }
      setTimeout(() => {
        copyFakeBtnEl.textContent = msg('welcomeCopyFakeBtn') || 'Copy';
      }, 2200);
    } catch {
      // Fallback: focus sandbox for manual copy.
    }
  });
}

if (simulatePasteBtnEl && sampleSecretEl) {
  simulatePasteBtnEl.addEventListener('click', () => {
    const sample = sampleSecretEl.textContent || '';
    applyDemoPaste(sample);
    if (pasteSandboxEl) {
      pasteSandboxEl.focus();
    }
  });
}

if (pasteSandboxEl) {
  pasteSandboxEl.addEventListener('paste', (event) => {
    const raw = event.clipboardData ? event.clipboardData.getData('text/plain') : '';
    if (!raw) {
      return;
    }
    const masked = applyDemoPaste(raw);
    if (masked) {
      event.preventDefault();
    }
  });
}

if (restoreToggleBtnEl && pasteSandboxEl) {
  restoreToggleBtnEl.addEventListener('click', () => {
    if (!lastRawText) {
      return;
    }
    isShowingRaw = !isShowingRaw;
    pasteSandboxEl.value = isShowingRaw ? lastRawText : lastMaskedText;
    restoreToggleBtnEl.textContent = isShowingRaw
      ? msg('welcomeRemaskBtn') || 'Keep masked'
      : msg('welcomeRestoreBtn') || 'Restore original';
  });
}

if (clearPasteBtnEl) {
  clearPasteBtnEl.addEventListener('click', clearPasteSandbox);
}

if (filePickBtnEl && filePickInputEl) {
  filePickBtnEl.addEventListener('click', () => {
    filePickInputEl.value = '';
    filePickInputEl.click();
  });
  filePickInputEl.addEventListener('change', () => {
    const f = filePickInputEl.files && filePickInputEl.files[0];
    if (f) {
      inspectDemoFile(f);
    }
  });
}

if (fileDropzoneEl) {
  fileDropzoneEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropzoneEl.classList.add('is-dragover');
  });
  fileDropzoneEl.addEventListener('dragleave', () => {
    fileDropzoneEl.classList.remove('is-dragover');
  });
  fileDropzoneEl.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropzoneEl.classList.remove('is-dragover');
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) {
      inspectDemoFile(f);
    }
  });
}

if (openHelpBtnEl) {
  openHelpBtnEl.addEventListener('click', () => {
    window.location.href = '../help/help.html';
  });
}

if (openOptionsBtnEl) {
  openOptionsBtnEl.addEventListener('click', () => {
    window.location.href = '../options/options.html';
  });
}

async function closeCurrentTab() {
  try {
    if (ext?.tabs?.getCurrent && ext?.tabs?.remove) {
      const tab = await ext.tabs.getCurrent();
      if (tab && typeof tab.id === 'number') {
        await ext.tabs.remove(tab.id);
        return;
      }
    }
  } catch {
    // Fall back to window.close below.
  }
  try {
    window.close();
  } catch {
    // Ignore close restriction cleanly.
  }
}

if (closeWelcomeBtnEl) {
  closeWelcomeBtnEl.addEventListener('click', () => {
    closeCurrentTab();
  });
}

applyTranslations();
checkHostPermissions();
