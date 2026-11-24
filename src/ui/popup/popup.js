// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Browser action popup controller (zero permissions).

'use strict';

const ext = globalThis.browser || globalThis.chrome;

const COMMAND_STATE_KEY = Object.freeze({
  'toggle-enabled': 'enabled',
  'toggle-strict': 'strictMode',
  'toggle-exif': 'stripExif',
  'toggle-redact': 'redactImage',
  'toggle-secrets': 'maskSecrets',
  'toggle-pii': 'maskPii',
  'toggle-optimize': 'optimizeImage',
  'toggle-toast': 'showToast',
  'toggle-save': 'saveSite',
  'toggle-debug': 'debugLogs',
});

const TAB_ORDER = Object.freeze(['main', 'tokens', 'advanced']);

const hostLabelEl = document.getElementById('host-label');
const statusBadgeEl = document.getElementById('status-badge');
const statusTextEl = document.getElementById('status-text');
const noticeAreaEl = document.getElementById('notice-area');
const standbyBannerEl = document.getElementById('standby-banner');
const noticeActionBtnEl = document.getElementById('notice-action-btn');
const optionsBtnEl = document.getElementById('options-btn');
const helpBtnEl = document.getElementById('help-btn');
const helpHeaderBtnEl = document.getElementById('help-header-btn');
const rulesCountBadgeEl = document.getElementById('rules-count-badge');
const shortcutsBtnEl = document.getElementById('shortcuts-btn');
const footerHintEl = document.getElementById('footer-hint');
const customWordsInputEl = document.getElementById('custom-words-input');
const customWordsCountEl = document.getElementById('custom-words-count');
const customWordsClearBtnEl = document.getElementById('custom-words-clear');
const tokensTabCountEl = document.getElementById('tokens-tab-count');
const tokensCountPillEl = document.getElementById('tokens-count-pill');
const tokensClearBtnEl = document.getElementById('tokens-clear-btn');
const tokensEmptyEl = document.getElementById('tokens-empty');
const tokensEmptyTitleEl = document.getElementById('tokens-empty-title');
const tokensEmptyDescEl = document.getElementById('tokens-empty-desc');
const tokensListEl = document.getElementById('tokens-list');
const toggleRows = Array.from(document.querySelectorAll('.toggle-row[data-command]'));
const shortcutBadges = Array.from(document.querySelectorAll('[data-shortcut-for]'));
const tabButtons = Array.from(document.querySelectorAll('.tab-btn[data-tab]'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel[role="tabpanel"]'));

let activeTabId = null;
let currentShortcuts = {};
let isPendingCommand = false;
let pendingNoticeAction = null;
let lastSyncedCustomWords = '';
let isSyncingCustomWords = false;
let queuedCustomWords = null;
let customWordsDebounceTimer = null;
let probeTimer = null;
let detachTimer = null;
let tokensFetchSeq = 0;

/**
 * Looks up a localized message via the extension i18n API.
 * @param {string} key
 * @param {string | string[]} [substitutions]
 * @returns {string}
 */
function msg(key, substitutions) {
  try {
    return ext?.i18n?.getMessage?.(key, substitutions) || '';
  } catch {
    return '';
  }
}

/**
 * Populates static localized text nodes on startup.
 */
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
  for (const el of document.querySelectorAll('[data-i18n-title]')) {
    const key = el.getAttribute('data-i18n-title');
    const translated = key ? msg(key) : '';
    if (translated) {
      el.setAttribute('title', translated);
      el.setAttribute('aria-label', translated);
    }
  }
}

/**
 * Counts unique normalized custom words matching content.js sanitizeCustomWords().
 * @param {string} raw
 * @returns {number}
 */
function countCustomWords(raw) {
  if (typeof raw !== 'string' || !raw) {
    return 0;
  }
  const helper = globalThis.ClipZeroRules;
  if (helper && typeof helper.sanitizeCustomWords === 'function') {
    const clean = helper.sanitizeCustomWords(raw);
    return clean ? clean.split(', ').length : 0;
  }
  const parts = raw.slice(0, 500).split(/[,;\r\n]+/);
  const seen = new Set();
  for (let i = 0; i < parts.length && seen.size < 50; i += 1) {
    const term = parts[i].trim().replace(/\s+/g, ' ');
    if (term.length < 2) {
      continue;
    }
    const key = term.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
    }
  }
  return seen.size;
}

/**
 * Updates the custom words counter badge and clear button visibility.
 */
function updateCustomWordsMeta() {
  const raw = customWordsInputEl && !customWordsInputEl.disabled ? customWordsInputEl.value : '';
  const count = countCustomWords(raw);
  if (customWordsCountEl) {
    customWordsCountEl.textContent = `${count}/50`;
  }
  if (customWordsClearBtnEl) {
    const isDisabled = !customWordsInputEl || customWordsInputEl.disabled;
    customWordsClearBtnEl.disabled = isDisabled;
    customWordsClearBtnEl.hidden = isDisabled || raw.length === 0;
  }
}

/**
 * Updates the active custom regex count pill on the Rules & Backup menu item.
 * @param {unknown} rules
 */
function updateRegexRulesBadge(rules) {
  if (!rulesCountBadgeEl) {
    return;
  }
  const activeCount = Array.isArray(rules)
    ? rules.filter((r) => r && r.enabled !== false).length
    : 0;
  if (activeCount > 0) {
    rulesCountBadgeEl.textContent =
      msg('popupRulesCount', [String(activeCount)]) || `${activeCount} active`;
    rulesCountBadgeEl.hidden = false;
  } else {
    rulesCountBadgeEl.hidden = true;
  }
}

/**
 * Populates live shortcut badges inside each control row.
 * @param {Record<string, string>} shortcuts
 */
function renderShortcuts(shortcuts) {
  currentShortcuts = shortcuts && typeof shortcuts === 'object' ? shortcuts : {};
  const fallback = msg('popupNotSet') || 'Unset';
  for (const badgeEl of shortcutBadges) {
    const commandName = badgeEl.getAttribute('data-shortcut-for');
    const assigned = currentShortcuts[commandName];
    badgeEl.textContent = assigned || fallback;
  }
}

/**
 * Renders the Active Session Token Inspector panel safely via pure DOM nodes.
 * @param {Array<{ token: string, preview: string }>} tokens
 * @param {number} maxEntries
 * @param {boolean} isSupportedTab
 */
function renderTokenInspector(tokens, maxEntries, isSupportedTab) {
  const safeList = Array.isArray(tokens) ? tokens : [];
  const cap = typeof maxEntries === 'number' && maxEntries > 0 ? maxEntries : 500;

  if (tokensTabCountEl) {
    if (isSupportedTab && safeList.length > 0) {
      tokensTabCountEl.textContent = String(safeList.length);
      tokensTabCountEl.hidden = false;
    } else {
      tokensTabCountEl.textContent = '0';
      tokensTabCountEl.hidden = true;
    }
  }
  if (tokensCountPillEl) {
    tokensCountPillEl.textContent = `${safeList.length}/${cap}`;
  }
  if (tokensClearBtnEl) {
    tokensClearBtnEl.disabled = !isSupportedTab || safeList.length === 0;
    tokensClearBtnEl.hidden = !isSupportedTab || safeList.length === 0;
  }
  if (!tokensListEl || !tokensEmptyEl) {
    return;
  }

  while (tokensListEl.firstChild) {
    tokensListEl.removeChild(tokensListEl.firstChild);
  }

  if (!isSupportedTab || safeList.length === 0) {
    tokensListEl.hidden = true;
    tokensEmptyEl.hidden = false;
    if (tokensEmptyTitleEl) {
      tokensEmptyTitleEl.textContent =
        msg('tokensEmptyTitle') || 'No masked tokens in this tab yet';
    }
    if (tokensEmptyDescEl) {
      tokensEmptyDescEl.textContent = isSupportedTab
        ? msg('tokensEmptyDesc') ||
          'Masked secrets, contacts, custom words, and regex matches appear here until the tab reloads or closes.'
        : msg('tokensStandbyDesc') ||
          'Open a supported tab to inspect active masked tokens for that session.';
    }
    return;
  }

  tokensEmptyEl.hidden = true;
  tokensListEl.hidden = false;

  const showLabel = msg('secretsShowBtn') || 'Show';
  const hideLabel = msg('secretsHideBtn') || 'Hide';
  const copyLabel = msg('tokensCopyBtn') || 'Copy';
  const copiedLabel = msg('tokensCopiedBtn') || 'Copied';

  for (const item of safeList) {
    if (!item || typeof item.token !== 'string') {
      continue;
    }
    const row = document.createElement('div');
    row.className = 'token-item';

    const main = document.createElement('div');
    main.className = 'token-main';

    const tagEl = document.createElement('span');
    tagEl.className = 'token-tag';
    tagEl.textContent = item.token;

    const previewEl = document.createElement('span');
    previewEl.className = 'token-preview';
    previewEl.textContent = item.preview || '••••••••';

    main.appendChild(tagEl);
    main.appendChild(previewEl);

    const actions = document.createElement('div');
    actions.className = 'token-actions';

    let isRevealed = false;
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'mini-link-btn';
    toggleBtn.textContent = showLabel;
    toggleBtn.addEventListener('click', async () => {
      if (!isValidTabId(activeTabId)) {
        return;
      }
      if (isRevealed) {
        isRevealed = false;
        previewEl.textContent = item.preview || '••••••••';
        previewEl.classList.remove('is-revealed');
        toggleBtn.textContent = showLabel;
        return;
      }
      toggleBtn.disabled = true;
      try {
        const res = await ext.tabs.sendMessage(activeTabId, {
          type: 'clipzero:reveal-session-token',
          token: item.token,
        });
        if (res && res.ok && typeof res.raw === 'string') {
          isRevealed = true;
          previewEl.textContent = res.raw;
          previewEl.classList.add('is-revealed');
          toggleBtn.textContent = hideLabel;
        }
      } catch {
        // Ignore reveal failure if tab navigated away.
      } finally {
        toggleBtn.disabled = false;
      }
    });

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'mini-link-btn';
    copyBtn.textContent = copyLabel;
    copyBtn.addEventListener('click', async () => {
      if (!isValidTabId(activeTabId)) {
        return;
      }
      copyBtn.disabled = true;
      try {
        const res = await ext.tabs.sendMessage(activeTabId, {
          type: 'clipzero:reveal-session-token',
          token: item.token,
        });
        if (res && res.ok && typeof res.raw === 'string' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(res.raw);
          copyBtn.textContent = copiedLabel;
          setTimeout(() => {
            copyBtn.textContent = copyLabel;
          }, 1400);
        }
      } catch {
        // Ignore clipboard failure cleanly.
      } finally {
        copyBtn.disabled = false;
      }
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(copyBtn);
    row.appendChild(main);
    row.appendChild(actions);
    tokensListEl.appendChild(row);
  }
}

/**
 * Fetches the masked active-session token snapshot from the active tab.
 * @param {number} tabId
 */
async function refreshSessionTokens(tabId) {
  if (!isValidTabId(tabId) || !ext?.tabs?.sendMessage) {
    renderTokenInspector([], 500, false);
    return;
  }
  tokensFetchSeq += 1;
  const seq = tokensFetchSeq;
  try {
    const res = await ext.tabs.sendMessage(tabId, { type: 'clipzero:get-session-tokens' });
    if (seq !== tokensFetchSeq || activeTabId !== tabId) {
      return;
    }
    if (res && res.ok && Array.isArray(res.tokens)) {
      renderTokenInspector(res.tokens, res.maxEntries || 500, true);
    } else {
      renderTokenInspector([], 500, true);
    }
  } catch {
    if (seq === tokensFetchSeq) {
      renderTokenInspector([], 500, false);
    }
  }
}

/**
 * Updates popup header and switches for a supported tab.
 * @param {Record<string, any>} state
 * @param {string} hostPrefix
 */
function renderSupportedState(state, hostPrefix) {
  const prefix = hostPrefix || 'clip';
  if (noticeAreaEl) {
    noticeAreaEl.hidden = true;
  }
  if (standbyBannerEl) {
    standbyBannerEl.hidden = true;
  }
  if (noticeActionBtnEl) {
    noticeActionBtnEl.hidden = true;
  }
  pendingNoticeAction = null;
  if (ext?.action?.setBadgeText && isValidTabId(activeTabId)) {
    try {
      Promise.resolve(ext.action.setBadgeText({ tabId: activeTabId, text: '' })).catch(() => {});
    } catch {
      // Ignore badge clear failures in partial mocks.
    }
  }

  if (state.enabled) {
    statusBadgeEl.className = 'status is-active';
    statusTextEl.textContent = msg('popupActiveBadge') || 'Active';
    if (state.storageReset && !state.saveSite) {
      hostLabelEl.textContent =
        msg('popupSubtitleReset', [prefix]) ||
        `${prefix}_… · Reset (corrupt data)`;
    } else {
      hostLabelEl.textContent = state.saveSite
        ? msg('popupSubtitleSaved', [prefix]) || `${prefix}_… · Saved on site`
        : msg('popupSubtitleSession', [prefix]) || `${prefix}_… · This session only`;
    }
  } else {
    statusBadgeEl.className = 'status is-paused';
    statusTextEl.textContent = msg('popupPausedBadge') || 'Paused';
    hostLabelEl.textContent = msg('popupSubtitlePaused', [prefix]) || `Paused on ${prefix}_…`;
  }

  for (const rowEl of toggleRows) {
    const commandName = rowEl.getAttribute('data-command');
    const stateKey = COMMAND_STATE_KEY[commandName];
    const isChecked = Boolean(state && stateKey && state[stateKey]);
    rowEl.disabled = false;
    rowEl.setAttribute('aria-checked', String(isChecked));
  }
  if (customWordsInputEl) {
    const words = typeof state.customWords === 'string' ? state.customWords : '';
    lastSyncedCustomWords = words;
    customWordsInputEl.disabled = false;
    if (
      document.activeElement !== customWordsInputEl &&
      queuedCustomWords === null &&
      customWordsDebounceTimer === null
    ) {
      customWordsInputEl.value = words;
    }
    updateCustomWordsMeta();
  }
  updateRegexRulesBadge(state.customRegexRules);
  if (isValidTabId(activeTabId)) {
    refreshSessionTokens(activeTabId);
  }
}

/**
 * Checks whether the content script replied with all v1.4 state fields.
 * Older content scripts still running in an already-open tab omit newer keys.
 * @param {unknown} state
 * @returns {boolean}
 */
function hasCompleteState(state) {
  return (
    Boolean(state) &&
    typeof state === 'object' &&
    typeof state.enabled === 'boolean' &&
    typeof state.strictMode === 'boolean' &&
    typeof state.stripExif === 'boolean' &&
    typeof state.redactImage === 'boolean' &&
    typeof state.maskSecrets === 'boolean' &&
    typeof state.maskPii === 'boolean' &&
    typeof state.optimizeImage === 'boolean' &&
    typeof state.showToast === 'boolean' &&
    typeof state.saveSite === 'boolean' &&
    typeof state.debugLogs === 'boolean' &&
    typeof state.customWords === 'string' &&
    Array.isArray(state.customRegexRules)
  );
}

/**
 * Disables interactive per-tab controls when content script state is unavailable.
 */
function disablePerTabControls() {
  activeTabId = null;
  for (const rowEl of toggleRows) {
    rowEl.disabled = true;
    rowEl.setAttribute('aria-checked', 'false');
  }
  if (customWordsDebounceTimer !== null) {
    clearTimeout(customWordsDebounceTimer);
    customWordsDebounceTimer = null;
  }
  queuedCustomWords = null;
  if (customWordsInputEl) {
    customWordsInputEl.disabled = true;
    customWordsInputEl.value = '';
    lastSyncedCustomWords = '';
  }
  updateCustomWordsMeta();
  renderTokenInspector([], 500, false);
}

/**
 * Renders one of the non-active notice states (standby, reload, missing permission, restricted).
 * @param {{ badgeClass: string, badgeText: string, titleText: string, bannerText: string, buttonText?: string, action?: object | null }} opts
 */
function showNoticeState(opts) {
  disablePerTabControls();
  statusBadgeEl.className = opts.badgeClass;
  statusTextEl.textContent = opts.badgeText;
  hostLabelEl.textContent = opts.titleText;
  if (standbyBannerEl) {
    standbyBannerEl.textContent = opts.bannerText;
    standbyBannerEl.hidden = false;
  }
  if (noticeAreaEl) {
    noticeAreaEl.hidden = false;
  }

  pendingNoticeAction = opts.action || null;
  if (noticeActionBtnEl) {
    if (opts.buttonText && pendingNoticeAction) {
      noticeActionBtnEl.textContent = opts.buttonText;
      noticeActionBtnEl.disabled = false;
      noticeActionBtnEl.hidden = false;
    } else {
      noticeActionBtnEl.hidden = true;
    }
  }
}

/**
 * Updates popup header and disables per-tab switches when an already-open tab needs F5 reload.
 * @param {number | null} [tabId]
 */
function renderReloadRequiredState(tabId) {
  showNoticeState({
    badgeClass: 'status is-paused',
    badgeText: msg('popupReloadBadge') || 'Reload',
    titleText: msg('popupReloadTitle') || 'Tab reload needed',
    bannerText:
      msg('popupReloadBanner') ||
      'ClipZero updated.\nReload this tab (F5) once to activate all new controls.',
    buttonText: isValidTabId(tabId) ? msg('popupReloadBtn') || 'Reload tab' : '',
    action: isValidTabId(tabId) ? { type: 'reload', tabId } : null,
  });
}

/**
 * Updates popup header and disables per-tab switches when one or more supported hosts lack permission.
 * @param {number} tabId
 * @param {string[]} missingOrigins
 */
function renderMissingPermissionsState(tabId, missingOrigins) {
  const countStr = String(missingOrigins.length);
  showNoticeState({
    badgeClass: 'status is-paused',
    badgeText: msg('popupPermBadge') || 'Permission',
    titleText:
      msg('popupPermTitle', [countStr]) || `Permissions needed (${countStr})`,
    bannerText:
      msg('popupPermBanner', [countStr]) ||
      `Firefox hasn't granted ClipZero access on ${countStr} supported site(s) yet.\nAllow access once so protection activates automatically.`,
    buttonText:
      msg('popupPermBtn', [countStr]) || `Allow missing sites (${countStr})`,
    action: { type: 'permission', tabId, origins: missingOrigins },
  });
}

/**
 * Updates popup header and disables per-tab switches when no supported tab is active.
 */
function renderStandbyState() {
  showNoticeState({
    badgeClass: 'status is-standby',
    badgeText: msg('popupStandbyBadge') || 'Off',
    titleText: msg('popupStandbyTitle') || 'Not available on this page',
    bannerText:
      msg('popupStandbyBanner') ||
      'Open a supported AI chat, social, or webmail tab to adjust settings.\nKeyboard shortcuts apply to those tabs.',
  });
}

/**
 * Checks manifest host_permissions against granted browser permissions without needing activeTab/tabs.
 * @returns {Promise<string[]>}
 */
async function getMissingHostOrigins() {
  const manifest = ext?.runtime?.getManifest?.();
  const declared = Array.isArray(manifest?.host_permissions)
    ? manifest.host_permissions.filter((origin) => typeof origin === 'string')
    : [];
  if (declared.length === 0 || !ext?.permissions?.getAll) {
    return [];
  }
  try {
    const granted = await ext.permissions.getAll();
    const grantedSet = new Set(Array.isArray(granted?.origins) ? granted.origins : []);
    if (grantedSet.has('<all_urls>') || grantedSet.has('https://*/*')) {
      return [];
    }
    const candidates = declared.filter((origin) => !grantedSet.has(origin));
    if (candidates.length === 0 || !ext?.permissions?.contains) {
      return candidates;
    }
    const checks = await Promise.all(
      candidates.map((origin) =>
        Promise.resolve(ext.permissions.contains({ origins: [origin] }))
          .then((has) => ({ origin, has: Boolean(has) }))
          .catch(() => ({ origin, has: false }))
      )
    );
    return checks.filter((item) => !item.has).map((item) => item.origin);
  } catch {
    return [];
  }
}

/**
 * Updates popup header when a supported tab was already open before ClipZero activated.
 * @param {number} tabId
 * @param {string} hostname
 */
function renderAlreadyOpenTabReloadState(tabId, hostname) {
  showNoticeState({
    badgeClass: 'status is-paused',
    badgeText: msg('popupReloadBadge') || 'Reload',
    titleText:
      msg('popupTabReloadTitle', [hostname]) || `Reload needed · ${hostname}`,
    bannerText:
      msg('popupTabReloadBanner') ||
      'This tab was open before ClipZero activated here.\nReload once to protect uploads and pastes.\n(If reloading still shows this, open about:addons → ClipZero → Run on sites with restrictions → Allow.)',
    buttonText: msg('popupReloadBtn') || 'Reload tab',
    action: { type: 'reload', tabId },
  });
}

/**
 * Finds whether a URL belongs to one of ClipZero's manifest content_scripts.
 * @param {string} tabUrl
 */
function matchTabSite(tabUrl) {
  const manifest = ext?.runtime?.getManifest?.();
  const findSite = globalThis.clipzeroFindMatchedSite;
  return typeof findSite === 'function' ? findSite(tabUrl || '', manifest) : null;
}

/**
 * Resolves why the active tab did not return live content-script state.
 */
async function resolveUnavailableTabState(tab, precomputedMissingPromise) {
  const tabId = tab?.id;
  if (!isValidTabId(tabId)) {
    renderStandbyState();
    return;
  }
  const matched = matchTabSite(tab?.url || '');
  if (matched) {
    renderAlreadyOpenTabReloadState(tabId, matched.hostname);
    return;
  }
  const missingOrigins = await (precomputedMissingPromise || getMissingHostOrigins());
  if (missingOrigins.length > 0) {
    renderMissingPermissionsState(tabId, missingOrigins);
    return;
  }
  renderStandbyState();
}

/**
 * Reads user-configured shortcuts via browser.commands or background fallback.
 * @returns {Promise<Record<string, string>>}
 */
async function loadShortcuts() {
  if (ext?.commands?.getAll) {
    try {
      const commands = await ext.commands.getAll();
      const map = {};
      for (const cmd of commands) {
        if (cmd?.name) {
          map[cmd.name] = cmd.shortcut || '';
        }
      }
      return map;
    } catch {
      // Fallback to background query below.
    }
  }

  if (ext?.runtime?.sendMessage) {
    try {
      const map = await ext.runtime.sendMessage({ type: 'clipzero:get-shortcuts' });
      if (map && typeof map === 'object') {
        return map;
      }
    } catch {
      // Ignore if background is momentarily unavailable.
    }
  }

  return {};
}

/**
 * Loads global regex rule count for standby tabs so the Settings tab badge stays accurate.
 */
async function loadGlobalRulesBadge() {
  if (!ext?.runtime?.sendMessage) {
    return;
  }
  try {
    const res = await ext.runtime.sendMessage({ type: 'clipzero:get-all-config' });
    if (res && res.ok && Array.isArray(res.customRegexRules)) {
      updateRegexRulesBadge(res.customRegexRules);
    }
  } catch {
    // Ignore background unavailability cleanly.
  }
}

/**
 * Applies a live content-script state reply to the popup UI.
 * @param {number} tabId
 * @param {any} response
 * @returns {boolean}
 */
function applyLiveTabResponse(tabId, response) {
  if (!response?.ok || !response.state) {
    return false;
  }
  if (!hasCompleteState(response.state)) {
    renderReloadRequiredState(tabId);
    return true;
  }
  activeTabId = tabId;
  renderSupportedState(response.state, response.hostPrefix || '');
  return true;
}

/**
 * Initializes translations, shortcuts, and active tab state concurrently with zero blocking waits.
 */
async function initPopup() {
  applyTranslations();

  loadShortcuts().then(renderShortcuts).catch(() => {});
  loadGlobalRulesBadge().catch(() => {});
  const missingOriginsPromise = getMissingHostOrigins();

  const tabs = ext?.tabs?.query
    ? await ext.tabs.query({ active: true, currentWindow: true }).catch(() => [])
    : [];

  const activeTab = tabs?.[0];
  const tabId = activeTab?.id;
  if (!isValidTabId(tabId)) {
    renderStandbyState();
    return;
  }

  const matched = matchTabSite(activeTab?.url || '');

  const badgePromise = ext?.action?.getBadgeText
    ? Promise.resolve(ext.action.getBadgeText({ tabId })).catch(() => '')
    : Promise.resolve('');
  const msgPromise = ext?.tabs?.sendMessage
    ? Promise.resolve(ext.tabs.sendMessage(tabId, { type: 'clipzero:get-state' })).catch(
        () => null
      )
    : Promise.resolve(null);

  let resolvedLive = false;
  const applyLateLiveReply = (response) => {
    if (resolvedLive) {
      return true;
    }
    if (applyLiveTabResponse(tabId, response)) {
      resolvedLive = true;
      return true;
    }
    return false;
  };

  const badgeText = await badgePromise;
  if (badgeText === '!' && matched) {
    renderAlreadyOpenTabReloadState(tabId, matched.hostname);
    msgPromise.then(applyLateLiveReply);
    return;
  }

  const probeTimeoutMs = matched ? 550 : 350;
  if (probeTimer !== null) {
    clearTimeout(probeTimer);
    probeTimer = null;
  }
  const outcome = await Promise.race([
    msgPromise.then((response) => ({ kind: 'msg', response })),
    new Promise((resolve) => {
      probeTimer = setTimeout(() => resolve({ kind: 'timeout' }), probeTimeoutMs);
    }),
  ]);
  if (probeTimer !== null) {
    clearTimeout(probeTimer);
    probeTimer = null;
  }

  if (outcome.kind === 'msg' && applyLateLiveReply(outcome.response)) {
    return;
  }

  if (outcome.kind === 'timeout') {
    msgPromise.then(applyLateLiveReply);
  }

  await resolveUnavailableTabState(activeTab, missingOriginsPromise);
}

async function handleActiveTabDisconnected() {
  if (ext?.tabs?.query) {
    try {
      const tabs = await ext.tabs.query({ active: true, currentWindow: true });
      await resolveUnavailableTabState(tabs?.[0]);
      return;
    } catch {
      // Fall through to standby.
    }
  }
  renderStandbyState();
}

for (const rowEl of toggleRows) {
  rowEl.addEventListener('click', async () => {
    if (isPendingCommand || !isValidTabId(activeTabId)) {
      return;
    }

    const command = rowEl.getAttribute('data-command');
    if (!command) {
      return;
    }

    const currentTabId = activeTabId;
    isPendingCommand = true;
    try {
      const response = await ext.tabs.sendMessage(currentTabId, {
        type: 'clipzero:command',
        command,
        shortcuts: currentShortcuts,
      });
      if (!applyLiveTabResponse(currentTabId, response)) {
        await handleActiveTabDisconnected();
      }
    } catch {
      await handleActiveTabDisconnected();
    } finally {
      isPendingCommand = false;
    }
  });
}

async function sendCustomWordsUpdate(forcedWords) {
  if (!customWordsInputEl || !isValidTabId(activeTabId)) {
    return;
  }
  if (customWordsDebounceTimer !== null) {
    clearTimeout(customWordsDebounceTimer);
    customWordsDebounceTimer = null;
  }
  const nextWords = typeof forcedWords === 'string' ? forcedWords : customWordsInputEl.value;
  if (isSyncingCustomWords) {
    queuedCustomWords = nextWords;
    return;
  }
  if (nextWords === lastSyncedCustomWords) {
    return;
  }
  const currentTabId = activeTabId;
  isSyncingCustomWords = true;
  lastSyncedCustomWords = nextWords;
  try {
    const response = await ext.tabs.sendMessage(currentTabId, {
      type: 'clipzero:set-custom-words',
      customWords: nextWords,
    });
    if (!applyLiveTabResponse(currentTabId, response)) {
      await handleActiveTabDisconnected();
    }
  } catch {
    await handleActiveTabDisconnected();
  } finally {
    isSyncingCustomWords = false;
    if (queuedCustomWords !== null) {
      const pending = queuedCustomWords;
      queuedCustomWords = null;
      if (pending !== lastSyncedCustomWords) {
        sendCustomWordsUpdate(pending);
      }
    }
  }
}

function isValidTabId(tabId) {
  return typeof tabId === 'number' && Number.isInteger(tabId) && tabId >= 0;
}

function isChromiumRuntime() {
  try {
    const mf = ext?.runtime?.getManifest?.();
    if (mf?.browser_specific_settings?.gecko) {
      return false;
    }
    if (typeof globalThis.browser?.runtime?.getBrowserInfo === 'function') {
      return false;
    }
    return Boolean(mf && !mf.browser_specific_settings);
  } catch {
    return false;
  }
}

if (tokensClearBtnEl) {
  tokensClearBtnEl.addEventListener('click', async () => {
    if (!isValidTabId(activeTabId)) {
      return;
    }
    const currentTabId = activeTabId;
    tokensClearBtnEl.disabled = true;
    try {
      await ext.tabs.sendMessage(currentTabId, { type: 'clipzero:clear-session-tokens' });
      renderTokenInspector([], 500, true);
    } catch {
      await handleActiveTabDisconnected();
    }
  });
}

if (optionsBtnEl) {
  optionsBtnEl.addEventListener('click', async () => {
    try {
      if (ext?.runtime?.openOptionsPage) {
        await ext.runtime.openOptionsPage();
        window.close();
        return;
      }
    } catch {
      // Fallback to tabs.create below.
    }
    if (ext?.tabs?.create && ext?.runtime?.getURL) {
      try {
        await ext.tabs.create({ url: ext.runtime.getURL('src/ui/options/options.html') });
        window.close();
      } catch {
        // Ignore open failure cleanly.
      }
    }
  });
}

function openHelpPage() {
  if (ext?.tabs?.create && ext?.runtime?.getURL) {
    Promise.resolve(ext.tabs.create({ url: ext.runtime.getURL('src/ui/help/help.html') }))
      .then(() => window.close())
      .catch(() => {});
  }
}

if (helpBtnEl) {
  helpBtnEl.addEventListener('click', openHelpPage);
}

if (helpHeaderBtnEl) {
  helpHeaderBtnEl.addEventListener('click', openHelpPage);
}

if (noticeActionBtnEl) {
  noticeActionBtnEl.addEventListener('click', () => {
    if (!pendingNoticeAction) {
      return;
    }
    if (pendingNoticeAction.type === 'reload') {
      const targetTabId = pendingNoticeAction.tabId;
      if (isValidTabId(targetTabId) && ext?.tabs?.reload) {
        Promise.resolve(ext.tabs.reload(targetTabId)).catch(() => {});
      }
      window.close();
      return;
    }
    if (pendingNoticeAction.type === 'permission') {
      const { tabId: targetTabId, origins } = pendingNoticeAction;
      if (!Array.isArray(origins) || origins.length === 0 || !ext?.permissions?.request) {
        return;
      }
      noticeActionBtnEl.disabled = true;
      let reqPromise;
      try {
        reqPromise = Promise.resolve(ext.permissions.request({ origins }));
      } catch {
        noticeActionBtnEl.disabled = false;
        return;
      }
      const hasValidTab = isValidTabId(targetTabId);
      const armPromise =
        ext?.runtime?.sendMessage && hasValidTab
          ? ext.runtime
              .sendMessage({ type: 'clipzero:arm-reload', tabId: targetTabId })
              .catch(() => {})
          : Promise.resolve();
      let settled = false;
      if (detachTimer !== null) {
        clearTimeout(detachTimer);
        detachTimer = null;
      }
      if (!isChromiumRuntime()) {
        detachTimer = setTimeout(() => {
          detachTimer = null;
          if (!settled) {
            window.close();
          }
        }, 60);
      }
      Promise.allSettled([armPromise, reqPromise]).then(async ([, reqRes]) => {
        settled = true;
        if (detachTimer !== null) {
          clearTimeout(detachTimer);
          detachTimer = null;
        }
        noticeActionBtnEl.disabled = false;
        const granted = reqRes?.status === 'fulfilled' && Boolean(reqRes.value);
        if (granted) {
          if (hasValidTab) {
            let reloadedViaBg = false;
            if (ext?.runtime?.sendMessage) {
              try {
                const res = await ext.runtime.sendMessage({
                  type: 'clipzero:reload-armed-tab',
                  tabId: targetTabId,
                });
                reloadedViaBg = Boolean(res?.ok);
              } catch {
                reloadedViaBg = false;
              }
            }
            if (!reloadedViaBg && ext?.tabs?.reload) {
              await Promise.resolve(ext.tabs.reload(targetTabId)).catch(() => {});
            }
          }
          window.close();
        } else if (hasValidTab && ext?.runtime?.sendMessage) {
          ext.runtime
            .sendMessage({ type: 'clipzero:disarm-reload', tabId: targetTabId })
            .catch(() => {});
        }
      });
    }
  });
}

if (customWordsInputEl) {
  customWordsInputEl.addEventListener('input', () => {
    updateCustomWordsMeta();
    if (customWordsDebounceTimer !== null) {
      clearTimeout(customWordsDebounceTimer);
    }
    customWordsDebounceTimer = setTimeout(() => sendCustomWordsUpdate(), 220);
  });
  customWordsInputEl.addEventListener('change', sendCustomWordsUpdate);
  customWordsInputEl.addEventListener('blur', sendCustomWordsUpdate);
  customWordsInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendCustomWordsUpdate();
      customWordsInputEl.blur();
    }
  });
}

if (customWordsClearBtnEl && customWordsInputEl) {
  customWordsClearBtnEl.addEventListener('click', () => {
    if (customWordsDebounceTimer !== null) {
      clearTimeout(customWordsDebounceTimer);
      customWordsDebounceTimer = null;
    }
    customWordsInputEl.value = '';
    updateCustomWordsMeta();
    sendCustomWordsUpdate('');
    customWordsInputEl.focus();
  });
}

function switchTab(targetTab, focusTabBtn) {
  const activeKey = TAB_ORDER.includes(targetTab) ? targetTab : 'main';
  for (const btn of tabButtons) {
    const isSel = btn.getAttribute('data-tab') === activeKey;
    btn.setAttribute('aria-selected', String(isSel));
    btn.tabIndex = isSel ? 0 : -1;
    if (isSel && focusTabBtn) {
      btn.focus();
    }
  }
  const panelMap = {
    main: 'panel-main',
    tokens: 'panel-tokens',
    advanced: 'panel-advanced',
  };
  const expectedId = panelMap[activeKey];
  for (const panel of tabPanels) {
    panel.hidden = panel.id !== expectedId;
  }
  if (activeKey === 'tokens' && isValidTabId(activeTabId)) {
    refreshSessionTokens(activeTabId);
  }
}

for (const btn of tabButtons) {
  btn.addEventListener('click', () => {
    switchTab(btn.getAttribute('data-tab'), false);
  });
  btn.addEventListener('keydown', (e) => {
    const curKey = btn.getAttribute('data-tab') || 'main';
    const curIdx = TAB_ORDER.indexOf(curKey);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      switchTab(TAB_ORDER[(curIdx + 1) % TAB_ORDER.length], true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      switchTab(TAB_ORDER[(curIdx - 1 + TAB_ORDER.length) % TAB_ORDER.length], true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      switchTab(TAB_ORDER[0], true);
    } else if (e.key === 'End') {
      e.preventDefault();
      switchTab(TAB_ORDER[TAB_ORDER.length - 1], true);
    }
  });
}

shortcutsBtnEl.addEventListener('click', async () => {
  if (ext?.commands?.openShortcutSettings) {
    try {
      await ext.commands.openShortcutSettings();
      window.close();
      return;
    } catch {
      // Fall through to browser-specific handling below.
    }
  }
  const chromium = isChromiumRuntime();
  if (chromium && ext?.tabs?.create) {
    try {
      await ext.tabs.create({ url: 'chrome://extensions/shortcuts' });
      window.close();
      return;
    } catch {
      // Fall through to manual navigation hint.
    }
  }
  footerHintEl.textContent = chromium
    ? 'chrome://extensions/shortcuts'
    : msg('popupShortcutsFallback') || 'Open about:addons → ClipZero → Manage Extension Shortcuts';
  footerHintEl.hidden = false;
});

window.addEventListener('pagehide', () => {
  if (customWordsDebounceTimer !== null) {
    clearTimeout(customWordsDebounceTimer);
    customWordsDebounceTimer = null;
  }
  if (probeTimer !== null) {
    clearTimeout(probeTimer);
    probeTimer = null;
  }
  if (detachTimer !== null) {
    clearTimeout(detachTimer);
    detachTimer = null;
  }
  queuedCustomWords = null;
  pendingNoticeAction = null;
  if (tokensListEl) {
    while (tokensListEl.firstChild) {
      tokensListEl.removeChild(tokensListEl.firstChild);
    }
  }
});

initPopup();
