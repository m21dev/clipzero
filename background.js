// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Event-driven background script (zero API permissions).
// Relays keyboard shortcuts, answers shortcut map queries, and reloads a tab
// once after the user grants missing host permissions.

'use strict';

const ext = globalThis.browser || globalThis.chrome;
let armedReload = null;

function isValidTabId(tabId) {
  return typeof tabId === 'number' && Number.isInteger(tabId) && tabId >= 0;
}

/**
 * Consumes and returns the pending tab reload id if valid and unexpired.
 * @param {number} [tabIdHint]
 * @returns {number | null}
 */
function consumeArmedReload(tabIdHint) {
  if (!armedReload) {
    return null;
  }
  const { tabId, expiresAt } = armedReload;
  if (Date.now() > expiresAt) {
    armedReload = null;
    return null;
  }
  if (isValidTabId(tabIdHint) && tabId !== tabIdHint) {
    return null;
  }
  armedReload = null;
  return tabId;
}

/**
 * Reloads a tab safely when permissions are added or confirmed.
 * @param {number} tabId
 */
function safeReloadTab(tabId) {
  if (!isValidTabId(tabId)) {
    return;
  }
  if (ext?.tabs?.reload) {
    Promise.resolve(ext.tabs.reload(tabId)).catch(() => {});
  }
}

async function getShortcutMap() {
  try {
    const all = await ext.commands.getAll();
    const map = {};
    for (const cmd of all) {
      if (cmd && cmd.name) {
        map[cmd.name] = cmd.shortcut || '';
      }
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Sets or clears a subtle per-tab reload badge without forcing unexpected page reloads.
 * @param {number} tabId
 * @param {string} text
 */
function setTabBadge(tabId, text) {
  if (!isValidTabId(tabId)) {
    return;
  }
  if (!ext?.action?.setBadgeText) {
    return;
  }
  try {
    Promise.resolve(ext.action.setBadgeText({ tabId, text })).catch(() => {});
    if (text && ext.action.setBadgeBackgroundColor) {
      Promise.resolve(ext.action.setBadgeBackgroundColor({ tabId, color: '#d78200' })).catch(() => {});
    }
    if (text && ext.action.setBadgeTextColor) {
      Promise.resolve(ext.action.setBadgeTextColor({ tabId, color: '#ffffff' })).catch(() => {});
    }
  } catch {
    // Ignore badge API unavailability in partial environments.
  }
}

/**
 * Checks whether a tab already has an up-to-date ClipZero content script injected.
 * @param {number} tabId
 * @returns {Promise<boolean>}
 */
async function isTabScriptReady(tabId) {
  try {
    const res = await ext.tabs.sendMessage(tabId, { type: 'clipzero:get-state' });
    return Boolean(res?.ok && res.state && typeof res.state.customWords === 'string');
  } catch {
    return false;
  }
}

/**
 * Flags already-open supported tabs that lack an active content script after install/update.
 */
async function flagOpenTabsNeedingReload() {
  const findSite = globalThis.clipzeroFindMatchedSite;
  if (typeof findSite !== 'function' || !ext?.tabs?.query || !ext?.runtime?.getManifest) {
    return;
  }
  try {
    const manifest = ext.runtime.getManifest();
    const tabs = await ext.tabs.query({});
    if (!Array.isArray(tabs)) {
      return;
    }
    const candidates = tabs.filter(
      (t) =>
        t &&
        isValidTabId(t.id) &&
        !t.discarded &&
        typeof t.url === 'string' &&
        findSite(t.url, manifest)
    );
    await Promise.all(
      candidates.map(async (tab) => {
        const ready = await isTabScriptReady(tab.id);
        setTabBadge(tab.id, ready ? '' : '!');
      })
    );
  } catch {
    // Ignore startup query restrictions cleanly.
  }
}

if (ext?.permissions?.onAdded?.addListener) {
  ext.permissions.onAdded.addListener(() => {
    const tabId = consumeArmedReload();
    if (typeof tabId === 'number') {
      safeReloadTab(tabId);
    }
  });
}

if (ext?.runtime?.onInstalled?.addListener) {
  ext.runtime.onInstalled.addListener((details) => {
    if (details?.reason === 'install' || details?.reason === 'update') {
      flagOpenTabsNeedingReload();
    }
  });
}

if (ext?.tabs?.onUpdated?.addListener) {
  ext.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo?.status === 'loading') {
      setTabBadge(tabId, '');
    }
  });
}

ext.commands.onCommand.addListener(async (command) => {
  try {
    const tabs = await ext.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs && tabs[0];
    if (!activeTab || activeTab.id === undefined) {
      return;
    }
    const shortcuts = await getShortcutMap();
    await ext.tabs.sendMessage(activeTab.id, {
      type: 'clipzero:command',
      command,
      shortcuts,
    });
  } catch {
    // Ignore tabs where the content script is not injected.
  }
});

ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') {
    return undefined;
  }
  if (!ext?.runtime?.id || !sender || sender.id !== ext.runtime.id) {
    return undefined;
  }
  if (sender.tab) {
    return undefined;
  }
  if (message.type === 'clipzero:get-shortcuts') {
    getShortcutMap().then(sendResponse);
    return true;
  }
  if (message.type === 'clipzero:arm-reload') {
    if (isValidTabId(message.tabId)) {
      armedReload = { tabId: message.tabId, expiresAt: Date.now() + 60000 };
    }
    sendResponse({ ok: true });
    return false;
  }
  if (message.type === 'clipzero:disarm-reload') {
    if (isValidTabId(message.tabId)) {
      consumeArmedReload(message.tabId);
    }
    sendResponse({ ok: true });
    return false;
  }
  if (message.type === 'clipzero:reload-armed-tab') {
    if (isValidTabId(message.tabId)) {
      const tabId = consumeArmedReload(message.tabId);
      if (isValidTabId(tabId)) {
        safeReloadTab(tabId);
      }
    }
    sendResponse({ ok: true });
    return false;
  }
  return undefined;
});
