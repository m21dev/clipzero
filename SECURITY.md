# Security Policy

## Core Security & Privacy Design

ClipZero is built around strict local-only isolation:

- **Zero API Permissions:** `manifest.json` declares no WebExtension API `"permissions"` and explicitly sets `"data_collection_permissions": { "required": ["none"] }`.
- **Zero Network Calls:** ClipZero makes no `fetch()`, `XMLHttpRequest`, or `WebSocket` connections, and contains no telemetry or analytics.
- **Zero HTML Injection Sinks:** UI elements are constructed solely via safe DOM APIs inside closed Shadow DOM (`:host{all:initial...}`), with no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, or `eval`.
- **Isolated `MAIN ↔ ISOLATED` Bridge & Self-Teardown:** Commands and i18n payloads cross a private `MessageChannel` authenticated by a random per-tab token. `content.js` verifies `injectedAtDocumentStart` (`document.readyState === 'loading'`) on already-open tabs so un-reloaded tabs stay inert (`needsReload: true`), and verifies extension liveness (`isExtensionContextAlive` ping/pong) to call `teardownMainWorld()` immediately if the extension is disabled or uninstalled.
- **Fail-Closed Redaction & Buffer Zeroing:** Secret/PII scanning fails closed on both clipboard pastes (including `<noscript>` HTML wrapper sanitization and wrapped `Clipboard.prototype.writeText` restore prompts) and text/code file uploads. Canvas redactions flatten pixels destructively, and `Pixelate` offscreen buffers (`<= 64×64`) plus export canvases are zeroed (`width = 0; height = 0`) in `finally`.
- **Strict Extension CSP:** `extension_pages` enforces `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none';`.
- **Unminified Source:** All extension scripts shipped in official AMO packages match this repository directly without bundlers or minifiers.

---

## Reporting a Vulnerability

If you discover a security issue, a bypass in metadata/SVG/PDF sanitization, a secret-masking leak, or an isolated/main-world bridge issue:

1. **Please do NOT post real API keys, passwords, tokens, private documents, or screenshots containing personal data in public Issues.** Use synthetic dummy strings instead (e.g., `AIzaDummyTestKey...`, `user@example.test`).
2. **Preferred channel:** Report the finding privately using GitHub's **Security → Advisories → Report a vulnerability** feature on this repository.
3. Include:
   - ClipZero version and Firefox version (Desktop or Android).
   - Minimal synthetic reproduction steps or sample dummy payload.
   - Expected behavior vs observed behavior.

---

## Out of Scope

- Browser-level origin blocks controlled by Mozilla (such as Firefox *Quarantined Domains* when disabled by the user in `about:addons`).
- File formats not yet claimed as metadata-sanitized in `README.md` (see `ROADMAP.md` for planned Office document support).
