// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Event-driven background script (zero API permissions).
// Relays keyboard shortcuts, answers shortcut map queries, and reloads a tab
// once after the user grants missing host permissions.

'use strict';

if (
  typeof globalThis.clipzeroFindMatchedSite !== 'function' &&
  typeof importScripts === 'function'
) {
  try {
    importScripts('site_match.js');
  } catch {
    // Ignore if already loaded in non-worker environment.
  }
}

const ext = globalThis.browser || globalThis.chrome;
const PREFS_DB_NAME = 'clipzero_prefs_db';
const PREFS_DB_VERSION = 1;
const PREFS_STORE_NAME = 'site_prefs';
const PREFS_SCHEMA_VERSION = 1;
const PREFS_BOOL_KEYS = Object.freeze([
  'enabled',
  'strictMode',
  'stripExif',
  'redactImage',
  'maskSecrets',
  'maskPii',
  'optimizeImage',
  'showToast',
  'debugLogs',
]);
const PREFS_BOOL_KEY_SET = new Set(PREFS_BOOL_KEYS);
let cachedPrefsDb = null;
let pendingPrefsDbPromise = null;
let armedReload = null;

function sanitizeCustomWords(raw) {
  if (typeof raw !== 'string') {
    return '';
  }
  const parts = raw.slice(0, 500).split(/[,;\r\n]+/);
  const seen = new Set();
  const clean = [];
  for (let i = 0; i < parts.length && clean.length < 50; i += 1) {
    const term = parts[i].trim().replace(/\s+/g, ' ');
    if (term.length < 2) {
      continue;
    }
    const key = term.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    clean.push(term);
  }
  return clean.join(', ');
}

function parsePersistedPrefs(raw, allowExtraFields) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  if (Object.hasOwn(raw, '_v')) {
    if (
      typeof raw._v !== 'number' ||
      !Number.isInteger(raw._v) ||
      raw._v < 1 ||
      raw._v > PREFS_SCHEMA_VERSION
    ) {
      return null;
    }
  }
  if (!allowExtraFields) {
    for (const k of Object.keys(raw)) {
      if (k !== 'origin' && k !== '_v' && k !== 'customWords' && !PREFS_BOOL_KEY_SET.has(k)) {
        return null;
      }
    }
  }
  const out = { _v: PREFS_SCHEMA_VERSION };
  let validCount = 0;
  for (const key of PREFS_BOOL_KEYS) {
    if (!Object.hasOwn(raw, key)) {
      continue;
    }
    if (typeof raw[key] !== 'boolean') {
      return null;
    }
    out[key] = raw[key];
    validCount += 1;
  }
  if (Object.hasOwn(raw, 'customWords')) {
    if (typeof raw.customWords !== 'string') {
      return null;
    }
    out.customWords = sanitizeCustomWords(raw.customWords);
  }
  if (validCount === 0) {
    return null;
  }
  return out;
}

function getVerifiedSenderOrigin(sender) {
  if (!sender || !sender.tab || typeof sender.url !== 'string') {
    return null;
  }
  const findSite = globalThis.clipzeroFindMatchedSite;
  if (typeof findSite !== 'function' || !ext?.runtime?.getManifest) {
    return null;
  }
  try {
    const manifest = ext.runtime.getManifest();
    if (!findSite(sender.url, manifest)) {
      return null;
    }
    const parsed = new URL(sender.url);
    return parsed.protocol === 'https:' && parsed.origin && parsed.origin !== 'null'
      ? parsed.origin
      : null;
  } catch {
    return null;
  }
}

function openPrefsDb() {
  if (cachedPrefsDb) {
    return Promise.resolve(cachedPrefsDb);
  }
  if (pendingPrefsDbPromise) {
    return pendingPrefsDbPromise;
  }
  const idb = globalThis.indexedDB;
  if (!idb || typeof idb.open !== 'function') {
    return Promise.resolve(null);
  }
  pendingPrefsDbPromise = new Promise((resolve) => {
    let settled = false;
    const finish = (db) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      pendingPrefsDbPromise = null;
      resolve(db || null);
    };
    const timer = setTimeout(() => finish(null), 1500);
    try {
      const req = idb.open(PREFS_DB_NAME, PREFS_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (db && !db.objectStoreNames.contains(PREFS_STORE_NAME)) {
          db.createObjectStore(PREFS_STORE_NAME, { keyPath: 'origin' });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        if (!db || !db.objectStoreNames.contains(PREFS_STORE_NAME)) {
          try {
            db?.close?.();
          } catch {
            // Ignore close failure cleanly.
          }
          finish(null);
          return;
        }
        db.onversionchange = () => {
          if (cachedPrefsDb === db) {
            cachedPrefsDb = null;
          }
          try {
            db.close();
          } catch {
            // Ignore close failure cleanly.
          }
        };
        db.onclose = () => {
          if (cachedPrefsDb === db) {
            cachedPrefsDb = null;
          }
        };
        cachedPrefsDb = db;
        finish(db);
      };
      req.onerror = () => finish(null);
      req.onblocked = () => finish(null);
    } catch {
      finish(null);
    }
  });
  return pendingPrefsDbPromise;
}

async function idbDeleteSitePrefs(origin) {
  if (!origin) {
    return false;
  }
  const db = await openPrefsDb();
  if (!db) {
    return false;
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (!settled) {
        settled = true;
        resolve(Boolean(ok));
      }
    };
    try {
      const tx = db.transaction(PREFS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(PREFS_STORE_NAME);
      tx.oncomplete = () => finish(true);
      tx.onabort = () => finish(false);
      tx.onerror = () => finish(false);
      store.delete(origin);
    } catch {
      finish(false);
    }
  });
}

async function idbGetSitePrefs(origin) {
  if (!origin) {
    return { ok: false, prefs: null };
  }
  const db = await openPrefsDb();
  if (!db) {
    return { ok: false, prefs: null };
  }
  const raw = await new Promise((resolve) => {
    let settled = false;
    const finish = (val) => {
      if (!settled) {
        settled = true;
        resolve(val);
      }
    };
    try {
      const tx = db.transaction(PREFS_STORE_NAME, 'readonly');
      const store = tx.objectStore(PREFS_STORE_NAME);
      const req = store.get(origin);
      req.onsuccess = () => finish({ ok: true, value: req.result || null });
      req.onerror = () => finish({ ok: false, value: null });
      tx.onabort = () => finish({ ok: false, value: null });
    } catch {
      finish({ ok: false, value: null });
    }
  });
  if (!raw.ok) {
    return { ok: false, prefs: null };
  }
  if (!raw.value) {
    return { ok: true, prefs: null };
  }
  const sanitized = parsePersistedPrefs(raw.value, false);
  if (!sanitized) {
    await idbDeleteSitePrefs(origin);
    return { ok: true, prefs: null, corrupt: true };
  }
  return { ok: true, prefs: sanitized };
}

async function idbSetSitePrefs(origin, prefs) {
  if (!origin) {
    return false;
  }
  const sanitized = parsePersistedPrefs(prefs, true);
  if (!sanitized) {
    return false;
  }
  const db = await openPrefsDb();
  if (!db) {
    return false;
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (!settled) {
        settled = true;
        resolve(Boolean(ok));
      }
    };
    try {
      const tx = db.transaction(PREFS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(PREFS_STORE_NAME);
      tx.oncomplete = () => finish(true);
      tx.onabort = () => finish(false);
      tx.onerror = () => finish(false);
      store.put({ origin, ...sanitized });
    } catch {
      finish(false);
    }
  });
}

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
    const senderOrigin = getVerifiedSenderOrigin(sender);
    if (!senderOrigin) {
      return undefined;
    }
    if (message.type === 'clipzero:get-shortcuts') {
      getShortcutMap().then(sendResponse);
      return true;
    }
    if (message.type === 'clipzero:load-site-prefs') {
      idbGetSitePrefs(senderOrigin).then(sendResponse);
      return true;
    }
    if (message.type === 'clipzero:save-site-prefs') {
      if (message.saveSite === false) {
        idbDeleteSitePrefs(senderOrigin).then((ok) => sendResponse({ ok }));
      } else {
        idbSetSitePrefs(senderOrigin, message.prefs).then((ok) => sendResponse({ ok }));
      }
      return true;
    }
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
