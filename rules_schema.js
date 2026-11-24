// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Shared preferences, custom regex safety, and portable config schema (zero permissions).
// Loaded only in extension-origin contexts (background, popup, options); never exposed in MAIN world.

(() => {
  'use strict';

  const PREFS_SCHEMA_VERSION = 2;
  const CONFIG_EXPORT_SCHEMA = 'clipzero-config';
  const MAX_CUSTOM_WORDS = 50;
  const MAX_CUSTOM_WORDS_LEN = 500;
  const MAX_CUSTOM_REGEX_RULES = 20;
  const MAX_REGEX_PATTERN_LEN = 160;
  const MAX_REGEX_LABEL_LEN = 24;
  const MAX_REGEX_QUANTIFIER = 64;
  const MAX_REGEX_NESTING = 4;
  const MAX_IMPORT_BYTES = 262144;

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

  /**
   * Normalizes comma/semicolon/newline-separated custom hidden words.
   * @param {unknown} raw
   * @returns {string}
   */
  function sanitizeCustomWords(raw) {
    if (typeof raw !== 'string') {
      return '';
    }
    const parts = raw.slice(0, MAX_CUSTOM_WORDS_LEN).split(/[,;\r\n]+/);
    const seen = new Set();
    const clean = [];
    for (let i = 0; i < parts.length && clean.length < MAX_CUSTOM_WORDS; i += 1) {
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

  /**
   * Sanitizes a custom regex token label into [A-Z][A-Z0-9_]{0,23}.
   * @param {unknown} raw
   * @returns {string}
   */
  function sanitizeRegexLabel(raw) {
    if (typeof raw !== 'string') {
      return '';
    }
    const cleaned = raw
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_')
      .replace(/[^A-Z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, MAX_REGEX_LABEL_LEN);
    if (!/^[A-Z][A-Z0-9_]{0,23}$/.test(cleaned)) {
      return '';
    }
    return cleaned;
  }

  /**
   * Sanitizes allowed regex flags ('i', 'm', 'u'); 'g' is always applied at scan time.
   * @param {unknown} raw
   * @returns {string}
   */
  function sanitizeRegexFlags(raw) {
    if (typeof raw !== 'string') {
      return 'i';
    }
    let out = '';
    if (raw.includes('i')) out += 'i';
    if (raw.includes('m')) out += 'm';
    if (raw.includes('u')) out += 'u';
    return out;
  }

  /**
   * Parses a {m} or {m,n} quantifier starting at index `pos` (where pattern[pos] === '{').
   * @param {string} pattern
   * @param {number} pos
   * @returns {{ valid: boolean, end: number, repeating: boolean, exceedsBounds: boolean } | null}
   */
  function parseBraceQuantifier(pattern, pos) {
    const m = /^\{(\d+)(?:,(\d*))?\}/.exec(pattern.slice(pos));
    if (!m) {
      return null;
    }
    const minVal = Number.parseInt(m[1], 10);
    const hasComma = m[2] !== undefined;
    const maxVal = hasComma ? (m[2] === '' ? Infinity : Number.parseInt(m[2], 10)) : minVal;
    const exceedsBounds =
      !Number.isFinite(minVal) ||
      minVal > MAX_REGEX_QUANTIFIER ||
      (maxVal !== Infinity && (!Number.isFinite(maxVal) || maxVal > MAX_REGEX_QUANTIFIER || maxVal < minVal));
    const repeating = maxVal > 1;
    return {
      valid: !exceedsBounds,
      end: pos + m[0].length,
      repeating,
      exceedsBounds,
    };
  }

  /**
   * Checks whether two alternation branches inside a repeated group could overlap ambiguously.
   * @param {string[]} branches
   * @returns {boolean}
   */
  function hasAmbiguousAlternationBranches(branches) {
    if (branches.length < 2) {
      return false;
    }
    const seenFirst = new Set();
    for (let i = 0; i < branches.length; i += 1) {
      const b = branches[i];
      if (!b) {
        return true;
      }
      // Reject wildcards, character classes, or shorthand classes inside repeated alternations.
      if (/[.[\]\\+*?{]/.test(b)) {
        return true;
      }
      const first = b[0].toLowerCase();
      if (seenFirst.has(first)) {
        return true;
      }
      seenFirst.add(first);
    }
    return false;
  }

  /**
   * Static ReDoS & validity check for user-defined regular expressions.
   * Rejects nested quantifiers, backreferences, lookbehinds, huge bounds, and empty-string matches.
   * @param {unknown} pattern
   * @param {unknown} flags
   * @returns {{ ok: boolean, reason?: string, flags?: string }}
   */
  function isSafeRegexPattern(pattern, flags) {
    if (typeof pattern !== 'string' || pattern.length === 0) {
      return { ok: false, reason: 'empty' };
    }
    if (pattern.length > MAX_REGEX_PATTERN_LEN) {
      return { ok: false, reason: 'too_long' };
    }
    if (/[\x00-\x1f\x7f]/.test(pattern)) {
      return { ok: false, reason: 'control_chars' };
    }
    if (/\\(?:[1-9]|k<)/.test(pattern)) {
      return { ok: false, reason: 'backreference' };
    }
    if (/\(\?<[=!]/.test(pattern)) {
      return { ok: false, reason: 'lookbehind' };
    }

    const safeFlags = sanitizeRegexFlags(flags);
    const stack = [
      {
        hasQuantifier: false,
        hasAlternation: false,
        branches: [''],
        isLookaround: false,
      },
    ];
    let inCharClass = false;
    let i = 0;

    while (i < pattern.length) {
      const ch = pattern[i];
      const top = stack[stack.length - 1];

      if (ch === '\\') {
        if (i + 1 >= pattern.length) {
          return { ok: false, reason: 'invalid_syntax' };
        }
        top.branches[top.branches.length - 1] += pattern.slice(i, i + 2);
        i += 2;
        continue;
      }

      if (inCharClass) {
        top.branches[top.branches.length - 1] += ch;
        if (ch === ']') {
          inCharClass = false;
        }
        i += 1;
        continue;
      }

      if (ch === '[') {
        inCharClass = true;
        top.branches[top.branches.length - 1] += ch;
        i += 1;
        continue;
      }

      if (ch === '(') {
        if (stack.length > MAX_REGEX_NESTING) {
          return { ok: false, reason: 'nesting_depth' };
        }
        let isLookaround = false;
        let advance = 1;
        if (pattern[i + 1] === '?') {
          const next2 = pattern[i + 2];
          if (next2 === '=' || next2 === '!') {
            isLookaround = true;
            advance = 3;
          } else if (next2 === ':') {
            advance = 3;
          }
        }
        stack.push({
          hasQuantifier: false,
          hasAlternation: false,
          branches: [''],
          isLookaround,
        });
        i += advance;
        continue;
      }

      if (ch === ')') {
        if (stack.length <= 1) {
          return { ok: false, reason: 'invalid_syntax' };
        }
        const closed = stack.pop();
        const parent = stack[stack.length - 1];
        if (closed.isLookaround && closed.hasQuantifier) {
          return { ok: false, reason: 'nested_quantifier' };
        }
        i += 1;
        let repeating = false;
        let hasAnyQuant = false;
        if (i < pattern.length) {
          const nextCh = pattern[i];
          if (nextCh === '*' || nextCh === '+') {
            repeating = true;
            hasAnyQuant = true;
            i += 1;
            if (pattern[i] === '?') i += 1;
          } else if (nextCh === '?') {
            hasAnyQuant = true;
            i += 1;
            if (pattern[i] === '?') i += 1;
          } else if (nextCh === '{') {
            const bq = parseBraceQuantifier(pattern, i);
            if (bq) {
              if (bq.exceedsBounds) {
                return { ok: false, reason: 'quantifier_bounds' };
              }
              repeating = bq.repeating;
              hasAnyQuant = true;
              i = bq.end;
              if (pattern[i] === '?') i += 1;
            }
          }
        }
        if (repeating) {
          if (closed.hasQuantifier) {
            return { ok: false, reason: 'nested_quantifier' };
          }
          if (closed.hasAlternation && hasAmbiguousAlternationBranches(closed.branches)) {
            return { ok: false, reason: 'overlapping_alternation' };
          }
        }
        if (hasAnyQuant || closed.hasQuantifier) {
          parent.hasQuantifier = true;
        }
        parent.branches[parent.branches.length - 1] += '()';
        continue;
      }

      if (ch === '|') {
        top.hasAlternation = true;
        top.branches.push('');
        i += 1;
        continue;
      }

      if (ch === '*' || ch === '+') {
        top.hasQuantifier = true;
        top.branches[top.branches.length - 1] += ch;
        i += 1;
        if (pattern[i] === '?') i += 1;
        continue;
      }

      if (ch === '?') {
        top.branches[top.branches.length - 1] += ch;
        i += 1;
        if (pattern[i] === '?') i += 1;
        continue;
      }

      if (ch === '{') {
        const bq = parseBraceQuantifier(pattern, i);
        if (bq) {
          if (bq.exceedsBounds) {
            return { ok: false, reason: 'quantifier_bounds' };
          }
          if (bq.repeating) {
            top.hasQuantifier = true;
          }
          top.branches[top.branches.length - 1] += '{q}';
          i = bq.end;
          if (pattern[i] === '?') i += 1;
          continue;
        }
      }

      top.branches[top.branches.length - 1] += ch;
      i += 1;
    }

    if (inCharClass || stack.length !== 1) {
      return { ok: false, reason: 'invalid_syntax' };
    }

    let compiled;
    try {
      compiled = new RegExp(pattern, safeFlags);
    } catch {
      return { ok: false, reason: 'invalid_syntax' };
    }

    try {
      if (compiled.test('')) {
        return { ok: false, reason: 'matches_empty' };
      }
    } catch {
      return { ok: false, reason: 'invalid_syntax' };
    }

    return { ok: true, flags: safeFlags };
  }

  /**
   * Validates and normalizes a single custom regex rule object.
   * @param {unknown} raw
   * @param {number} [idx]
   * @returns {{ ok: boolean, rule?: { id: string, label: string, pattern: string, flags: string, enabled: boolean }, reason?: string }}
   */
  function validateCustomRegexRule(raw, idx = 0) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ok: false, reason: 'invalid_rule' };
    }
    const label = sanitizeRegexLabel(raw.label);
    if (!label) {
      return { ok: false, reason: 'invalid_label' };
    }
    const patCheck = isSafeRegexPattern(raw.pattern, raw.flags);
    if (!patCheck.ok) {
      return { ok: false, reason: patCheck.reason || 'invalid_syntax' };
    }
    let id =
      typeof raw.id === 'string' && /^[a-zA-Z0-9_-]{1,32}$/.test(raw.id)
        ? raw.id
        : `rule_${idx + 1}`;
    if (!id) {
      id = `rule_${idx + 1}`;
    }
    const enabled = raw.enabled === undefined ? true : Boolean(raw.enabled);
    return {
      ok: true,
      rule: {
        id,
        label,
        pattern: raw.pattern,
        flags: patCheck.flags || '',
        enabled,
      },
    };
  }

  /**
   * Sanitizes a list of custom regex rules, silently dropping invalid entries.
   * @param {unknown} rawList
   * @returns {Array<{ id: string, label: string, pattern: string, flags: string, enabled: boolean }>}
   */
  function sanitizeCustomRegexRules(rawList) {
    if (!Array.isArray(rawList)) {
      return [];
    }
    const out = [];
    const seenIds = new Set();
    for (let i = 0; i < rawList.length && out.length < MAX_CUSTOM_REGEX_RULES; i += 1) {
      const res = validateCustomRegexRule(rawList[i], i);
      if (!res.ok || !res.rule) {
        continue;
      }
      let ruleId = res.rule.id;
      let suffix = 1;
      while (seenIds.has(ruleId)) {
        suffix += 1;
        ruleId = `${res.rule.id.slice(0, 24)}_${suffix}`;
      }
      seenIds.add(ruleId);
      out.push({
        id: ruleId,
        label: res.rule.label,
        pattern: res.rule.pattern,
        flags: res.rule.flags,
        enabled: res.rule.enabled,
      });
    }
    return out;
  }

  /**
   * Validates persisted per-site preferences (supports schema v1 and v2).
   * @param {unknown} raw
   * @param {boolean} allowExtraFields
   * @returns {Record<string, unknown> | null}
   */
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

  /**
   * Builds a clean deterministic JSON-serializable export object.
   * @param {unknown} customRegexRules
   * @param {Record<string, unknown>} sitesMap
   */
  function buildExportPayload(customRegexRules, sitesMap) {
    const cleanRules = sanitizeCustomRegexRules(customRegexRules);
    const cleanSites = {};
    if (sitesMap && typeof sitesMap === 'object' && !Array.isArray(sitesMap)) {
      const origins = Object.keys(sitesMap).sort();
      for (const origin of origins) {
        const parsed = parsePersistedPrefs(sitesMap[origin], false);
        if (parsed) {
          cleanSites[origin] = parsed;
        }
      }
    }
    return {
      schema: CONFIG_EXPORT_SCHEMA,
      version: PREFS_SCHEMA_VERSION,
      customRegexRules: cleanRules,
      sites: cleanSites,
    };
  }

  /**
   * Strictly validates an imported portable JSON configuration object.
   * Rejects prototype keys, unallowlisted site origins, invalid prefs, or ReDoS regex patterns.
   * @param {unknown} rawObj
   * @param {object} manifest
   * @param {(url: string, manifest: object) => object | null} findMatchedSiteFn
   */
  function parseImportPayload(rawObj, manifest, findMatchedSiteFn) {
    if (!rawObj || typeof rawObj !== 'object' || Array.isArray(rawObj)) {
      return { ok: false, error: 'invalid_json' };
    }
    if (rawObj.schema !== CONFIG_EXPORT_SCHEMA) {
      return { ok: false, error: 'invalid_schema' };
    }
    if (
      typeof rawObj.version !== 'number' ||
      !Number.isInteger(rawObj.version) ||
      rawObj.version < 1 ||
      rawObj.version > PREFS_SCHEMA_VERSION
    ) {
      return { ok: false, error: 'unsupported_version' };
    }

    const cleanRules = [];
    if (Object.hasOwn(rawObj, 'customRegexRules')) {
      if (!Array.isArray(rawObj.customRegexRules)) {
        return { ok: false, error: 'invalid_rules' };
      }
      if (rawObj.customRegexRules.length > MAX_CUSTOM_REGEX_RULES) {
        return { ok: false, error: 'too_many_rules' };
      }
      const seenIds = new Set();
      for (let i = 0; i < rawObj.customRegexRules.length; i += 1) {
        const check = validateCustomRegexRule(rawObj.customRegexRules[i], i);
        if (!check.ok || !check.rule) {
          return {
            ok: false,
            error: 'unsafe_rule',
            detail: check.reason || 'invalid_rule',
            index: i,
          };
        }
        let id = check.rule.id;
        let n = 1;
        while (seenIds.has(id)) {
          n += 1;
          id = `${check.rule.id.slice(0, 24)}_${n}`;
        }
        seenIds.add(id);
        cleanRules.push({ ...check.rule, id });
      }
    }

    const cleanSites = Object.create(null);
    let siteCount = 0;
    if (Object.hasOwn(rawObj, 'sites')) {
      if (!rawObj.sites || typeof rawObj.sites !== 'object' || Array.isArray(rawObj.sites)) {
        return { ok: false, error: 'invalid_sites' };
      }
      const keys = Object.keys(rawObj.sites);
      if (keys.length > 100) {
        return { ok: false, error: 'too_many_sites' };
      }
      for (const origin of keys) {
        if (origin === '__proto__' || origin === 'constructor' || origin === 'prototype') {
          return { ok: false, error: 'invalid_origin' };
        }
        let parsedUrl;
        try {
          parsedUrl = new URL(origin);
        } catch {
          return { ok: false, error: 'invalid_origin', detail: origin };
        }
        if (
          parsedUrl.protocol !== 'https:' ||
          parsedUrl.origin !== origin ||
          parsedUrl.pathname !== '/' ||
          parsedUrl.search ||
          parsedUrl.hash
        ) {
          return { ok: false, error: 'invalid_origin', detail: origin };
        }
        if (typeof findMatchedSiteFn === 'function' && manifest) {
          const probePath = parsedUrl.hostname === 'huggingface.co' ? '/chat/' : '/';
          if (!findMatchedSiteFn(`${origin}${probePath}`, manifest)) {
            return { ok: false, error: 'unsupported_origin', detail: origin };
          }
        }
        const prefs = parsePersistedPrefs(rawObj.sites[origin], false);
        if (!prefs) {
          return { ok: false, error: 'invalid_site_prefs', detail: origin };
        }
        cleanSites[origin] = prefs;
        siteCount += 1;
      }
    }

    return {
      ok: true,
      customRegexRules: cleanRules,
      sites: Object.assign({}, cleanSites),
      ruleCount: cleanRules.length,
      siteCount,
    };
  }

  globalThis.ClipZeroRules = Object.freeze({
    PREFS_SCHEMA_VERSION,
    CONFIG_EXPORT_SCHEMA,
    PREFS_BOOL_KEYS,
    MAX_CUSTOM_WORDS,
    MAX_CUSTOM_WORDS_LEN,
    MAX_CUSTOM_REGEX_RULES,
    MAX_REGEX_PATTERN_LEN,
    MAX_REGEX_LABEL_LEN,
    MAX_REGEX_QUANTIFIER,
    MAX_IMPORT_BYTES,
    sanitizeCustomWords,
    sanitizeRegexLabel,
    sanitizeRegexFlags,
    isSafeRegexPattern,
    validateCustomRegexRule,
    sanitizeCustomRegexRules,
    parsePersistedPrefs,
    buildExportPayload,
    parseImportPayload,
  });
})();
