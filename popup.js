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

const hostLabelEl = document.getElementById('host-label');
const statusBadgeEl = document.getElementById('status-badge');
const statusTextEl = document.getElementById('status-text');
const noticeAreaEl = document.getElementById('notice-area');
const standbyBannerEl = document.getElementById('standby-banner');
const noticeActionBtnEl = document.getElementById('notice-action-btn');
const shortcutsBtnEl = document.getElementById('shortcuts-btn');
const footerHintEl = document.getElementById('footer-hint');
const customWordsInputEl = document.getElementById('custom-words-input');
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

/**
 * Looks up a localized message via Firefox's i18n API.
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
 * Updates popup header and switches for a supported AI tab.
 * @param {{ enabled: boolean, strictMode: boolean, stripExif: boolean, redactImage: boolean, maskSecrets: boolean, optimizeImage: boolean, showToast: boolean, saveSite: boolean }} state
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
        `${prefix}_… · Reset (corrupt data cleared)`;
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
    if (document.activeElement !== customWordsInputEl) {
      customWordsInputEl.value = words;
    }
  }
}

/**
 * Checks whether the content script replied with all v1.2 state fields.
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
    typeof state.customWords === 'string'
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
  if (customWordsInputEl) {
    customWordsInputEl.disabled = true;
    customWordsInputEl.value = '';
    lastSyncedCustomWords = '';
  }
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
    buttonText: typeof tabId === 'number' ? msg('popupReloadBtn') || 'Reload tab' : '',
    action: typeof tabId === 'number' ? { type: 'reload', tabId } : null,
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
 * Updates popup header and disables per-tab switches when no supported AI tab is active.
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
 * Updates popup header when a supported tab was already open before ClipZero activated
 * (or is blocked by Firefox Quarantined Domains after permission grant).
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
 * Resolves why the active tab did not return live content-script state.
 * Uses host_permissions-scoped tab.url to flag already-open supported tabs without activeTab,
 * while keeping unrelated pages (e.g. Google Drive) cleanly in Standby.
 * @param {chrome.tabs.Tab | browser.tabs.Tab | undefined} tab
 * @param {Promise<string[]>} [precomputedMissingPromise]
 */
async function resolveUnavailableTabState(tab, precomputedMissingPromise) {
  const tabId = tab?.id;
  if (!isValidTabId(tabId)) {
    renderStandbyState();
    return;
  }
  const manifest = ext?.runtime?.getManifest?.();
  const findSite = globalThis.clipzeroFindMatchedSite;
  const matched =
    typeof findSite === 'function' ? findSite(tab?.url || '', manifest) : null;
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

  // Never let shortcut enumeration or permission lookups block querying/messaging the active tab.
  loadShortcuts().then(renderShortcuts).catch(() => {});
  const missingOriginsPromise = getMissingHostOrigins();

  const tabs = ext?.tabs?.query
    ? await ext.tabs.query({ active: true, currentWindow: true }).catch(() => [])
    : [];

  const activeTab = tabs?.[0];
  const tabId = activeTab?.id;
  if (typeof tabId !== 'number') {
    renderStandbyState();
    return;
  }

  const manifest = ext?.runtime?.getManifest?.();
  const findSite = globalThis.clipzeroFindMatchedSite;
  const matched =
    typeof findSite === 'function' ? findSite(activeTab?.url || '', manifest) : null;

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

  // Fast path: if onInstalled already flagged this tab with '!' in the parent process, render
  // the reload prompt immediately (<15 ms) without waiting for a busy SPA renderer to time out.
  const badgeText = await badgePromise;
  if (badgeText === '!' && matched) {
    renderAlreadyOpenTabReloadState(tabId, matched.hostname);
    msgPromise.then(applyLateLiveReply);
    return;
  }

  const probeTimeoutMs = matched ? 550 : 350;
  let probeTimer = null;
  const outcome = await Promise.race([
    msgPromise.then((response) => ({ kind: 'msg', response })),
    new Promise((resolve) => {
      probeTimer = setTimeout(() => resolve({ kind: 'timeout' }), probeTimeoutMs);
    }),
  ]);
  if (probeTimer !== null) {
    clearTimeout(probeTimer);
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
    if (isPendingCommand || typeof activeTabId !== 'number') {
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
      if (response?.ok && response.state) {
        if (!hasCompleteState(response.state)) {
          renderReloadRequiredState(currentTabId);
          return;
        }
        renderSupportedState(response.state, response.hostPrefix || '');
      } else {
        await handleActiveTabDisconnected();
      }
    } catch {
      await handleActiveTabDisconnected();
    } finally {
      isPendingCommand = false;
    }
  });
}

async function sendCustomWordsUpdate() {
  if (!customWordsInputEl || typeof activeTabId !== 'number') {
    return;
  }
  if (customWordsDebounceTimer !== null) {
    clearTimeout(customWordsDebounceTimer);
    customWordsDebounceTimer = null;
  }
  const nextWords = customWordsInputEl.value;
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
    if (response?.ok && response.state) {
      if (!hasCompleteState(response.state)) {
        renderReloadRequiredState(currentTabId);
        return;
      }
      renderSupportedState(response.state, response.hostPrefix || '');
    } else {
      renderReloadRequiredState(currentTabId);
    }
  } catch {
    await handleActiveTabDisconnected();
  } finally {
    isSyncingCustomWords = false;
    if (queuedCustomWords !== null) {
      const pending = queuedCustomWords;
      queuedCustomWords = null;
      if (pending !== lastSyncedCustomWords) {
        sendCustomWordsUpdate();
      }
    }
  }
}

function isValidTabId(tabId) {
  return typeof tabId === 'number' && Number.isInteger(tabId) && tabId >= 0;
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
      // Invoke permissions.request synchronously in the click handler to preserve the user gesture.
      let reqPromise;
      try {
        reqPromise = Promise.resolve(ext.permissions.request({ origins }));
      } catch (err) {
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
      // Firefox Bug 1798454: Firefox renders the permission bubble behind the open popup.
      // Close the popup shortly after arming background reload so Allow/Deny is unobstructed.
      let settled = false;
      const detachTimer = setTimeout(() => {
        if (!settled) {
          window.close();
        }
      }, 60);
      Promise.allSettled([armPromise, reqPromise]).then(async ([, reqRes]) => {
        settled = true;
        clearTimeout(detachTimer);
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
        }
      });
    }
  });
}

if (customWordsInputEl) {
  customWordsInputEl.addEventListener('input', () => {
    if (customWordsDebounceTimer !== null) {
      clearTimeout(customWordsDebounceTimer);
    }
    customWordsDebounceTimer = setTimeout(sendCustomWordsUpdate, 220);
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

function switchTab(targetTab, focusTabBtn) {
  const activeKey = targetTab === 'advanced' ? 'advanced' : 'main';
  for (const btn of tabButtons) {
    const isSel = btn.getAttribute('data-tab') === activeKey;
    btn.setAttribute('aria-selected', String(isSel));
    btn.tabIndex = isSel ? 0 : -1;
    if (isSel && focusTabBtn) {
      btn.focus();
    }
  }
  for (const panel of tabPanels) {
    const expectedId = activeKey === 'advanced' ? 'panel-advanced' : 'panel-main';
    panel.hidden = panel.id !== expectedId;
  }
}

for (const btn of tabButtons) {
  btn.addEventListener('click', () => {
    switchTab(btn.getAttribute('data-tab'), false);
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = btn.getAttribute('data-tab') === 'main' ? 'advanced' : 'main';
      switchTab(next, true);
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
      // Fall through to manual navigation hint (e.g., Firefox for Android).
    }
  }
  footerHintEl.textContent =
    msg('popupShortcutsFallback') || 'Open about:addons → ClipZero → Manage Extension Shortcuts';
  footerHintEl.hidden = false;
});

initPopup();
