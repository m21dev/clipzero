# Contributing to ClipZero

Thank you for helping improve **ClipZero** for both **Firefox** and **Chromium** users.

## Non-Negotiable Security & Privacy Invariants

Every pull request must preserve these core guarantees:

- **Zero API permissions:** `manifest.json` declares no `"permissions"` array, omits `web_accessible_resources`, and sets `data_collection_permissions.required: ["none"]`.
- **Zero network calls:** No `fetch()`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, telemetry, or external CDN/font/script links.
- **Zero HTML injection sinks:** Never use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, or `new Function`. Build UI strictly via safe DOM APIs inside Closed Shadow DOM (`:host{all:initial...}`) or extension pages.
- **Unminified vanilla source:** No bundlers, transpilers, or third-party runtime dependencies.
- **Extension-isolated state:** Site profiles and custom rules belong strictly in extension-origin `IndexedDB` (`background.js`), never host `window.localStorage`.
- **6-locale parity:** Any UI text addition must be translated across all 6 locales (`de`, `en`, `es`, `fr`, `pt_BR`, `zh_CN`) with `0` missing and `0` unused keys.

## Local Verification & Packaging

```bash
# 1. Verify Firefox + Chromium manifests, 6 locales, static security, HiDPI assets & JS syntax
python -B tests/verify_repo.py

# 2. Build clean unpacked targets and release ZIPs under dist/
python -B scripts/package.py
```

- **Test in Firefox:** Open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → select `manifest.json` (or `dist/firefox/manifest.json`).
- **Test in Chrome / Edge / Brave:** Run `python -B scripts/package.py`, open `chrome://extensions` (or `edge://extensions`), enable **Developer mode**, and click **Load unpacked** → select `dist/chromium/`.

## Submitting Changes

1. Keep `dist/`, `*.zip`, and `__pycache__/` out of commits.
2. When documenting behavior, shortcuts, or setup steps, reflect both **Firefox** and **Chromium** accurately.
3. Never include real API keys, tokens, personal photos, or confidential documents in issues, PRs, or fixtures—use synthetic dummy data only.
