// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Event-driven background script (zero API permissions).
// Manages extension-isolated IndexedDB site prefs + custom regex rules, dedicated Web Worker
// offloading (Firefox MV3), live rule sync across tabs, shortcuts, and permission-reload arming.

'use strict';

if (typeof importScripts === 'function') {
  if (typeof globalThis.clipzeroFindMatchedSite !== 'function') {
    try {
      importScripts('/src/core/site_match.js');
    } catch {
      // Ignore if already loaded in non-worker environment.
    }
  }
  if (!globalThis.ClipZeroRules) {
    try {
      importScripts('/src/core/rules_schema.js');
    } catch {
      // Ignore if already loaded in non-worker environment.
    }
  }
}

const ext = globalThis.browser || globalThis.chrome;
const PREFS_DB_NAME = 'clipzero_prefs_db';
const PREFS_DB_VERSION = 2;
const PREFS_STORE_NAME = 'site_prefs';
const RULES_STORE_NAME = 'global_rules';
const GLOBAL_REGEX_KEY = 'custom_regex_rules';
const MAX_WORKER_BYTES = 50 * 1024 * 1024;
const WORKER_JOB_TIMEOUT_MS = 15000;
const WORKER_IDLE_TERMINATE_MS = 30000;
const ALLOWED_WORKER_OPS = new Set(['pdf', 'office', 'svg-pre']);

const FALLBACK_BOOL_KEYS = Object.freeze([
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
const FALLBACK_BOOL_SET = new Set(FALLBACK_BOOL_KEYS);

const SUPPORTS_WORKER_OFFLOAD = Boolean(
  typeof globalThis.Worker === 'function' &&
    typeof ext?.runtime?.getURL === 'function' &&
    typeof globalThis.window !== 'undefined'
);

let cachedPrefsDb = null;
let pendingPrefsDbPromise = null;
let armedReload = null;

// Dedicated extension-origin scrubber Web Worker (lazy, auto-terminated when idle)
let scrubberWorker = null;
let workerJobSeq = 0;
let workerIdleTimer = null;
const pendingWorkerJobs = new Map();

function getRulesHelper() {
  return globalThis.ClipZeroRules || null;
}

function sanitizeCustomWords(raw) {
  const helper = getRulesHelper();
  if (helper && typeof helper.sanitizeCustomWords === 'function') {
    return helper.sanitizeCustomWords(raw);
  }
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
  const helper = getRulesHelper();
  if (helper && typeof helper.parsePersistedPrefs === 'function') {
    return helper.parsePersistedPrefs(raw, allowExtraFields);
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  if (Object.hasOwn(raw, '_v')) {
    if (typeof raw._v !== 'number' || !Number.isInteger(raw._v) || raw._v < 1 || raw._v > 2) {
      return null;
    }
  }
  if (!allowExtraFields) {
    for (const k of Object.keys(raw)) {
      if (k !== 'origin' && k !== '_v' && k !== 'customWords' && !FALLBACK_BOOL_SET.has(k)) {
        return null;
      }
    }
  }
  const out = { _v: 2 };
  let validCount = 0;
  for (const key of FALLBACK_BOOL_KEYS) {
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

function sanitizeCustomRegexRules(rawList) {
  const helper = getRulesHelper();
  if (helper && typeof helper.sanitizeCustomRegexRules === 'function') {
    return helper.sanitizeCustomRegexRules(rawList);
  }
  return [];
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

function isSupportedOrigin(origin) {
  if (typeof origin !== 'string') {
    return false;
  }
  const findSite = globalThis.clipzeroFindMatchedSite;
  if (typeof findSite !== 'function' || !ext?.runtime?.getManifest) {
    return false;
  }
  try {
    const parsed = new URL(origin);
    if (
      parsed.protocol !== 'https:' ||
      parsed.origin !== origin ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    ) {
      return false;
    }
    const manifest = ext.runtime.getManifest();
    const probePath = parsed.hostname === 'huggingface.co' ? '/chat/' : '/';
    return Boolean(findSite(`${origin}${probePath}`, manifest));
  } catch {
    return false;
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
        if (db && !db.objectStoreNames.contains(RULES_STORE_NAME)) {
          db.createObjectStore(RULES_STORE_NAME, { keyPath: 'id' });
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

async function idbGetAllSitePrefs() {
  const db = await openPrefsDb();
  if (!db) {
    return {};
  }
  const rows = await new Promise((resolve) => {
    let settled = false;
    const finish = (list) => {
      if (!settled) {
        settled = true;
        resolve(Array.isArray(list) ? list : []);
      }
    };
    try {
      const tx = db.transaction(PREFS_STORE_NAME, 'readonly');
      const store = tx.objectStore(PREFS_STORE_NAME);
      if (typeof store.getAll === 'function') {
        const req = store.getAll();
        req.onsuccess = () => finish(req.result || []);
        req.onerror = () => finish([]);
        tx.onabort = () => finish([]);
      } else {
        finish([]);
      }
    } catch {
      finish([]);
    }
  });
  const sites = {};
  for (const row of rows) {
    if (!row || typeof row.origin !== 'string' || !isSupportedOrigin(row.origin)) {
      continue;
    }
    const clean = parsePersistedPrefs(row, false);
    if (clean) {
      sites[row.origin] = clean;
    }
  }
  return sites;
}

async function idbClearAllSitePrefs() {
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
      if (typeof store.clear === 'function') {
        store.clear();
      } else {
        finish(true);
      }
    } catch {
      finish(false);
    }
  });
}

async function idbGetCustomRegexRules() {
  const db = await openPrefsDb();
  if (!db || !db.objectStoreNames.contains(RULES_STORE_NAME)) {
    return [];
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
      const tx = db.transaction(RULES_STORE_NAME, 'readonly');
      const store = tx.objectStore(RULES_STORE_NAME);
      const req = store.get(GLOBAL_REGEX_KEY);
      req.onsuccess = () => finish(req.result || null);
      req.onerror = () => finish(null);
      tx.onabort = () => finish(null);
    } catch {
      finish(null);
    }
  });
  if (!raw || !Array.isArray(raw.rules)) {
    return [];
  }
  return sanitizeCustomRegexRules(raw.rules);
}

async function idbSetCustomRegexRules(rules) {
  const db = await openPrefsDb();
  if (!db || !db.objectStoreNames.contains(RULES_STORE_NAME)) {
    return false;
  }
  const cleanRules = sanitizeCustomRegexRules(rules);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (!settled) {
        settled = true;
        resolve(Boolean(ok));
      }
    };
    try {
      const tx = db.transaction(RULES_STORE_NAME, 'readwrite');
      const store = tx.objectStore(RULES_STORE_NAME);
      tx.oncomplete = () => finish(true);
      tx.onabort = () => finish(false);
      tx.onerror = () => finish(false);
      store.put({ id: GLOBAL_REGEX_KEY, _v: 2, rules: cleanRules });
    } catch {
      finish(false);
    }
  });
}

// --- Dedicated Extension-Origin Scrubber Web Worker (Firefox MV3) ---

function clearWorkerIdleTimer() {
  if (workerIdleTimer !== null) {
    clearTimeout(workerIdleTimer);
    workerIdleTimer = null;
  }
}

function terminateScrubberWorker() {
  clearWorkerIdleTimer();
  if (scrubberWorker) {
    try {
      scrubberWorker.terminate();
    } catch {
      // Ignore worker termination failures.
    }
    scrubberWorker = null;
  }
  for (const [id, pending] of pendingWorkerJobs.entries()) {
    pendingWorkerJobs.delete(id);
    clearTimeout(pending.timer);
    pending.resolve({ ok: false, modified: false, buffer: null });
  }
}

function scheduleWorkerIdleTerminate() {
  clearWorkerIdleTimer();
  if (pendingWorkerJobs.size === 0 && scrubberWorker) {
    workerIdleTimer = setTimeout(() => {
      workerIdleTimer = null;
      if (pendingWorkerJobs.size === 0) {
        terminateScrubberWorker();
      }
    }, WORKER_IDLE_TERMINATE_MS);
  }
}

function ensureScrubberWorker() {
  if (!SUPPORTS_WORKER_OFFLOAD) {
    return null;
  }
  if (scrubberWorker) {
    clearWorkerIdleTimer();
    return scrubberWorker;
  }
  try {
    const w = new Worker(ext.runtime.getURL('src/workers/scrubber_worker.js'));
    w.onmessage = (event) => {
      const data = event && event.data;
      if (!data || typeof data.id !== 'number') {
        return;
      }
      const pending = pendingWorkerJobs.get(data.id);
      if (!pending) {
        return;
      }
      pendingWorkerJobs.delete(data.id);
      clearTimeout(pending.timer);
      pending.resolve({
        ok: Boolean(data.ok),
        modified: Boolean(data.modified),
        buffer: data.buffer instanceof ArrayBuffer ? data.buffer : null,
      });
      scheduleWorkerIdleTerminate();
    };
    w.onerror = () => {
      terminateScrubberWorker();
    };
    scrubberWorker = w;
    return w;
  } catch {
    scrubberWorker = null;
    return null;
  }
}

function runWorkerScrubJob(op, rawBuffer) {
  if (!SUPPORTS_WORKER_OFFLOAD || !ALLOWED_WORKER_OPS.has(op)) {
    return Promise.resolve({ ok: false, modified: false, buffer: null });
  }
  let buf = null;
  if (rawBuffer instanceof ArrayBuffer) {
    buf = rawBuffer;
  } else if (ArrayBuffer.isView(rawBuffer) && rawBuffer.buffer instanceof ArrayBuffer) {
    buf =
      rawBuffer.byteOffset === 0 && rawBuffer.byteLength === rawBuffer.buffer.byteLength
        ? rawBuffer.buffer
        : rawBuffer.buffer.slice(rawBuffer.byteOffset, rawBuffer.byteOffset + rawBuffer.byteLength);
  }
  if (!buf || buf.byteLength === 0 || buf.byteLength > MAX_WORKER_BYTES) {
    return Promise.resolve({ ok: false, modified: false, buffer: null });
  }
  const worker = ensureScrubberWorker();
  if (!worker) {
    return Promise.resolve({ ok: false, modified: false, buffer: null });
  }
  return new Promise((resolve) => {
    workerJobSeq += 1;
    const jobId = workerJobSeq;
    const timer = setTimeout(() => {
      if (pendingWorkerJobs.has(jobId)) {
        pendingWorkerJobs.delete(jobId);
        resolve({ ok: false, modified: false, buffer: null });
        terminateScrubberWorker();
      }
    }, WORKER_JOB_TIMEOUT_MS);
    pendingWorkerJobs.set(jobId, { resolve, timer });
    try {
      worker.postMessage({ id: jobId, op, buffer: buf }, [buf]);
    } catch {
      pendingWorkerJobs.delete(jobId);
      clearTimeout(timer);
      resolve({ ok: false, modified: false, buffer: null });
      terminateScrubberWorker();
    }
  });
}

// --- Live Rule Broadcast to Already-Open Supported Tabs ---

async function broadcastRulesToOpenTabs(customRegexRules, sitesByOrigin, deletedOrigins) {
  const findSite = globalThis.clipzeroFindMatchedSite;
  if (typeof findSite !== 'function' || !ext?.tabs?.query || !ext?.tabs?.sendMessage || !ext?.runtime?.getManifest) {
    return;
  }
  try {
    const manifest = ext.runtime.getManifest();
    const tabs = await ext.tabs.query({});
    if (!Array.isArray(tabs)) {
      return;
    }
    const deletedSet = new Set(Array.isArray(deletedOrigins) ? deletedOrigins : []);
    await Promise.all(
      tabs.map(async (tab) => {
        if (!tab || !isValidTabId(tab.id) || tab.discarded || typeof tab.url !== 'string') {
          return;
        }
        if (!findSite(tab.url, manifest)) {
          return;
        }
        let origin = null;
        try {
          origin = new URL(tab.url).origin;
        } catch {
          return;
        }
        const msg = {
          type: 'clipzero:sync-rules',
          customRegexRules: Array.isArray(customRegexRules) ? customRegexRules : undefined,
        };
        if (sitesByOrigin && Object.hasOwn(sitesByOrigin, origin)) {
          msg.sitePrefs = sitesByOrigin[origin];
        } else if (deletedSet.has(origin)) {
          msg.siteDeleted = true;
        }
        try {
          await ext.tabs.sendMessage(tab.id, msg);
        } catch {
          // Ignore tabs not yet loaded or needing reload.
        }
      })
    );
  } catch {
    // Ignore broadcast query restrictions cleanly.
  }
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
    return Boolean(
      res?.ok &&
        res.state &&
        typeof res.state.customWords === 'string' &&
        Array.isArray(res.state.customRegexRules)
    );
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

async function handleImportConfig(message) {
  const helper = getRulesHelper();
  const findSite = globalThis.clipzeroFindMatchedSite;
  if (!helper || typeof helper.parseImportPayload !== 'function' || !ext?.runtime?.getManifest) {
    return { ok: false, error: 'schema_unavailable' };
  }
  const manifest = ext.runtime.getManifest();
  const parsed = helper.parseImportPayload(message.config, manifest, findSite);
  if (!parsed.ok) {
    return parsed;
  }
  const replaceMode = message.mode === 'replace';
  const prevSites = await idbGetAllSitePrefs();
  const prevRules = await idbGetCustomRegexRules();

  let finalRules;
  if (replaceMode) {
    finalRules = parsed.customRegexRules;
  } else {
    const merged = [...prevRules];
    const existingKeys = new Set(merged.map((r) => `${r.label}|${r.pattern}|${r.flags}`));
    for (const r of parsed.customRegexRules) {
      const k = `${r.label}|${r.pattern}|${r.flags}`;
      if (!existingKeys.has(k) && merged.length < helper.MAX_CUSTOM_REGEX_RULES) {
        merged.push(r);
        existingKeys.add(k);
      }
    }
    finalRules = sanitizeCustomRegexRules(merged);
  }

  const savedRulesOk = await idbSetCustomRegexRules(finalRules);
  if (!savedRulesOk) {
    return { ok: false, error: 'storage_error' };
  }

  const deletedOrigins = [];
  if (replaceMode) {
    for (const orig of Object.keys(prevSites)) {
      if (!Object.hasOwn(parsed.sites, orig)) {
        deletedOrigins.push(orig);
      }
    }
    await idbClearAllSitePrefs();
  }

  for (const [origin, prefs] of Object.entries(parsed.sites)) {
    await idbSetSitePrefs(origin, prefs);
  }

  const allSites = await idbGetAllSitePrefs();
  await broadcastRulesToOpenTabs(finalRules, parsed.sites, deletedOrigins);

  return {
    ok: true,
    ruleCount: parsed.ruleCount,
    siteCount: parsed.siteCount,
    customRegexRules: finalRules,
    sites: allSites,
  };
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
    if (details?.reason === 'install' && ext?.tabs?.create && ext?.runtime?.getURL) {
      try {
        Promise.resolve(ext.tabs.create({ url: ext.runtime.getURL('src/ui/welcome/welcome.html') })).catch(() => {});
      } catch {
        // Ignore welcome tab creation errors in restricted environments.
      }
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

function isTrustedExtensionPageSender(sender) {
  if (!ext?.runtime?.id || !sender || sender.id !== ext.runtime.id) {
    return false;
  }
  if (!sender.tab) {
    return true;
  }
  if (typeof sender.url === 'string' && typeof ext?.runtime?.getURL === 'function') {
    const optUrl = ext.runtime.getURL('src/ui/options/options.html');
    const popUrl = ext.runtime.getURL('src/ui/popup/popup.html');
    const welcomeUrl = ext.runtime.getURL('src/ui/welcome/welcome.html');
    const helpUrl = ext.runtime.getURL('src/ui/help/help.html');
    const baseUrl = sender.url.split(/[?#]/, 1)[0];
    if (
      (optUrl && baseUrl === optUrl) ||
      (popUrl && baseUrl === popUrl) ||
      (welcomeUrl && baseUrl === welcomeUrl) ||
      (helpUrl && baseUrl === helpUrl)
    ) {
      return true;
    }
  }
  return false;
}

ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') {
    return undefined;
  }
  if (!ext?.runtime?.id || !sender || sender.id !== ext.runtime.id) {
    return undefined;
  }
  if (!isTrustedExtensionPageSender(sender)) {
    const senderOrigin = getVerifiedSenderOrigin(sender);
    if (!senderOrigin) {
      return undefined;
    }
    if (message.type === 'clipzero:get-shortcuts') {
      getShortcutMap().then(sendResponse);
      return true;
    }
    if (message.type === 'clipzero:load-site-prefs') {
      Promise.all([idbGetSitePrefs(senderOrigin), idbGetCustomRegexRules()]).then(
        ([siteRes, customRegexRules]) => {
          sendResponse({
            ...siteRes,
            customRegexRules,
            supportsWorkerOffload: SUPPORTS_WORKER_OFFLOAD,
          });
        }
      );
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
    if (message.type === 'clipzero:worker-scrub') {
      runWorkerScrubJob(message.op, message.buffer).then(sendResponse);
      return true;
    }
    return undefined;
  }

  // Extension-page requests (popup.html, options.html)
  if (message.type === 'clipzero:get-shortcuts') {
    getShortcutMap().then(sendResponse);
    return true;
  }
  if (message.type === 'clipzero:get-all-config') {
    Promise.all([idbGetCustomRegexRules(), idbGetAllSitePrefs()]).then(
      ([customRegexRules, sites]) => {
        sendResponse({
          ok: true,
          customRegexRules,
          sites,
          supportsWorkerOffload: SUPPORTS_WORKER_OFFLOAD,
        });
      }
    );
    return true;
  }
  if (message.type === 'clipzero:save-custom-regex-rules') {
    const helper = getRulesHelper();
    if (!Array.isArray(message.rules)) {
      sendResponse({ ok: false, error: 'invalid_rules' });
      return false;
    }
    if (helper && message.rules.length > helper.MAX_CUSTOM_REGEX_RULES) {
      sendResponse({ ok: false, error: 'too_many_rules' });
      return false;
    }
    if (helper && typeof helper.validateCustomRegexRule === 'function') {
      for (let i = 0; i < message.rules.length; i += 1) {
        const chk = helper.validateCustomRegexRule(message.rules[i], i);
        if (!chk.ok) {
          sendResponse({ ok: false, error: chk.reason || 'invalid_rule', index: i });
          return false;
        }
      }
    }
    const cleanRules = sanitizeCustomRegexRules(message.rules);
    idbSetCustomRegexRules(cleanRules).then(async (ok) => {
      if (ok) {
        await broadcastRulesToOpenTabs(cleanRules, null, null);
      }
      sendResponse({ ok, customRegexRules: cleanRules });
    });
    return true;
  }
  if (message.type === 'clipzero:import-config') {
    handleImportConfig(message).then(sendResponse);
    return true;
  }
  if (message.type === 'clipzero:delete-site-prefs-origin') {
    if (!isSupportedOrigin(message.origin)) {
      sendResponse({ ok: false, error: 'invalid_origin' });
      return false;
    }
    idbDeleteSitePrefs(message.origin).then(async (ok) => {
      if (ok) {
        await broadcastRulesToOpenTabs(undefined, null, [message.origin]);
      }
      sendResponse({ ok });
    });
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
