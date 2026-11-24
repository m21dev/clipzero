# Security Policy

## Core Security & Privacy Design

ClipZero is built around strict local-only isolation across Firefox and Chromium:

- **Zero API Permissions:** `manifest.json` declares no WebExtension API `"permissions"` and explicitly sets `"data_collection_permissions": { "required": ["none"] }`, with zero `web_accessible_resources`.
- **Extension-Isolated Storage (`IndexedDB` v2):** Optional per-site preferences, `customWords`, and global `customRegexRules` stay in extension-origin `IndexedDB` (`background.js`: `site_prefs` + `global_rules`), keyed strictly by browser-verified `sender.url` origins without `window.localStorage` writes so host pages can neither read rules nor spoof saved state.
- **Zero Network Calls:** ClipZero makes no `fetch()`, `XMLHttpRequest`, or `WebSocket` connections, and contains no telemetry or analytics.
- **Zero HTML Injection Sinks:** UI elements are constructed solely via safe DOM APIs inside Closed Shadow DOM (`:host{all:initial...}`) and extension pages (`popup.html`, `options.html`, `welcome.html`, `help.html`), with no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, or `new Function`.
- **Anti-ReDoS & Portable Import Validation:** Custom regex rules (`rules_schema.js` & `content.js`) reject nested quantifiers, ambiguous quantified alternations, backreferences, lookbehinds, excessive repetition bounds (`> 64`), and empty-string matches, and enforce per-rule runtime match (`<= 200`) and time (`<= 25 ms`) budgets. Portable `.json` imports (`<= 256 KB`) strictly verify schema version, manifest-allowlisted HTTPS origins, preference types, and regex safety before saving.
- **ZIP-Bomb & Document Safety:** Deep Office OOXML scrubbing (`scrubber_worker.js` & `content.js`, `<= 50 MB`) enforces entry count caps (`<= 2000`), streaming uncompressed byte caps during `deflate-raw` decompression (`<= 8 MB` XML / `<= 12 MB` embedded media), rejects encrypted OLE2 (`D0 CF 11 E0`) and ZIP64 archives cleanly without corruption, and copies untouched ZIP entries verbatim.
- **Isolated `MAIN ↔ ISOLATED` Bridge, Trusted Extension Pages & Self-Teardown:** Commands, `Transferable` worker jobs, and i18n payloads cross a private `MessageChannel` authenticated by a random per-tab token. Extension-page admin requests in `background.js` verify `sender.id === ext.runtime.id` plus an exact allowlisted extension URL (`popup.html`, `options.html`, `welcome.html`, or `help.html`), and `welcome.html` opens only once on `details.reason === 'install'` (never on updates, zero extra permissions). The popup **Tokens** inspector displays masked previews by default and fetches raw values only on explicit user **Show** / **Copy** clicks over verified non-tab (`!sender.tab`) channels. `content.js` verifies `injectedAtDocumentStart` (`document.readyState === 'loading'`) on already-open tabs and runs `teardownMainWorld()` immediately if the extension is disabled or uninstalled.
- **Fail-Closed Redaction & Buffer Zeroing:** Secret/PII/custom-regex scanning fails closed on clipboard pastes, text drops, and text/code file uploads. Canvas redactions flatten pixels destructively, and `Pixelate` offscreen buffers (`<= 64×64`) plus export canvases are zeroed (`width = 0; height = 0`) in `finally`.
- **Strict Extension CSP:** `extension_pages` enforces `default-src 'none'; script-src 'self'; worker-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none';`.
- **Unminified Source:** All extension scripts shipped in official AMO and GitHub release packages match this repository's release tags directly without bundlers or minifiers.

---

## Reporting a Vulnerability

If you discover a security issue, a bypass in metadata/SVG/PDF/Office sanitization, a ReDoS bypass, a secret-masking leak, or an isolated/main-world bridge issue:

1. **Please do NOT post real API keys, passwords, tokens, private documents, or screenshots containing personal data in public Issues.** Use synthetic dummy strings instead (e.g., `AIzaDummyTestKey...`, `user@example.test`).
2. **Preferred channel:** Report the finding privately using GitHub's **Security → Advisories → Report a vulnerability** feature on this repository.
3. Include:
   - ClipZero version and browser version (Firefox Desktop/Android or Chrome/Edge/Brave).
   - Minimal synthetic reproduction steps or sample dummy payload.
   - Expected behavior vs observed behavior.

---

## Out of Scope

- Browser-level origin blocks controlled by the browser vendor (such as Firefox *Quarantined Domains* when disabled by the user in `about:addons`, or browser internal pages like `about:*` / `chrome://*`).
- Legacy binary Office formats (`.doc`, `.xls`, `.ppt`) and password-encrypted OLE2 containers (`D0 CF 11 E0`), which ClipZero intentionally passes through untouched to avoid data corruption.
