// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Shared manifest content_scripts URL matcher.

'use strict';

/**
 * Checks whether a tab URL matches one of ClipZero's manifest content_scripts patterns.
 * Returns normalized hostname when matched, or null.
 * @param {string} tabUrl
 * @param {{ content_scripts?: Array<{ matches?: string[] }> } | null | undefined} manifest
 * @returns {{ hostname: string } | null}
 */
globalThis.clipzeroFindMatchedSite = function clipzeroFindMatchedSite(tabUrl, manifest) {
  if (!tabUrl || typeof tabUrl !== 'string') {
    return null;
  }
  let parsed;
  try {
    parsed = new URL(tabUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') {
    return null;
  }
  const scripts = Array.isArray(manifest?.content_scripts) ? manifest.content_scripts : [];
  const matches = Array.isArray(scripts[0]?.matches) ? scripts[0].matches : [];
  for (const pattern of matches) {
    if (typeof pattern !== 'string' || !pattern.startsWith('https://')) {
      continue;
    }
    const rest = pattern.slice('https://'.length);
    const slashIdx = rest.indexOf('/');
    if (slashIdx <= 0) {
      continue;
    }
    const hostPattern = rest.slice(0, slashIdx);
    const pathPattern = rest.slice(slashIdx);
    const hostMatches = hostPattern.startsWith('*.')
      ? parsed.hostname === hostPattern.slice(2) ||
        parsed.hostname.endsWith(`.${hostPattern.slice(2)}`)
      : parsed.hostname === hostPattern;
    if (!hostMatches) {
      continue;
    }
    const pathPrefix = pathPattern.endsWith('*') ? pathPattern.slice(0, -1) : pathPattern;
    if (parsed.pathname.startsWith(pathPrefix)) {
      return {
        hostname: parsed.hostname,
      };
    }
  }
  return null;
};
