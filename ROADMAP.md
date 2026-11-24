# ClipZero Roadmap

> **Core principles:** 100% local execution inside Firefox and Chromium, zero network calls, zero telemetry, minimal permissions (`0` API permissions), and readable unminified source.

```mermaid
flowchart LR
    V130["v1.3.0<br/>Low-RAM Pipeline & Tools"] --> V131["v1.3.1<br/>Mobile Touch, Crop & Hardening"]
    V131 --> V132["v1.3.2<br/>Pixelate, File Guard & Lifecycle"]
    V132 --> V133["v1.3.3<br/>SPA Stability & Chromium Build"]
    V133 --> V134["v1.3.4<br/>Security Hardening & UI Polish"]
    V134 --> V140["v1.4.0 (Current)<br/>Office Docs, Workers & Rules"]
    V140 --> V200["v2.0.0<br/>On-Demand Sites & Local OCR"]
```

---

## Shipped

### `v1.4.0` — Office Documents, Workers, Portable Rules & Token Inspector *(Current)*
- **Deep lossless Office metadata scrubber (`.docx`, `.xlsx`, `.pptx`):** Pure-JS OOXML ZIP scrubber cleaning `docProps/{core,app,custom}.xml`, thumbnails (`_rels/.rels` + `[Content_Types].xml`), Word/Excel/PPT comments and track-changes authors/dates, Word `rsid` & local template paths, Excel `absPath` & `fileSharing`, ZIP timestamps/comments/OS extra fields, and embedded `*/media/*` image EXIF while copying untouched entries verbatim.
- **Dedicated Web Worker offloading (`scrubber_worker.js`):** Extension-origin worker (`worker-src 'self'`, `Transferable` `ArrayBuffer` transfers, idle auto-termination) offloading PDF (`<= 50 MB`), Office ZIP (`<= 50 MB`), and large SVG (`>= 256 KB`) pre-scrubbing in Firefox MV3 with seamless native-stream fallback in Chromium MV3.
- **Portable rules, guided builder, custom regex & Token Inspector:** 3-tab Acorn popup (**Protection** | **Tokens** | **Settings**) with on-demand masked session token inspection and `?` Help shortcut, plus dedicated **Rules & Backup** (`options.html`) tab with 5 one-click templates, a beginner-friendly **Guided builder (no regex needed)**, anti-ReDoS custom regex (`<= 20`) + cheatsheet, live draft tester, remembered-site manager, and validated `.json` export/import (Merge/Replace).
- **Interactive Welcome sandbox (`welcome.html`) & offline Help & Guide (`help.html`):** Opens once strictly on first install (`reason === 'install'`, `0` extra permissions) across Firefox and Chromium with 3 protection pillars, 3 fake-secret presets + 1-click paste test, detailed RAM-only file metadata report, one-click host-permission recovery, and a searchable offline Help guide covering both Firefox and Chromium.

### `v1.3.4` — Security Hardening & Soft-Geometry UI Polish
- **Extension-isolated `IndexedDB` storage & audit hardening:** Moved per-site preferences and `customWords` from host `window.localStorage` into extension-origin `IndexedDB` (`clipzero_prefs_db`) scoped to verified `sender.url` origins, added fail-closed text/mixed-paste scanning, complete `document_start` native captures, strict `bridge.js`/`background.js` validation, dead-port cleanup, drag-and-drop SPA compatibility, `.jxl` flattening, and synchronous teardown guards.
- **Sober soft-geometry Firefox Acorn UI & icon refresh:** Upgraded the toolbar icon (`16`–`128 px`), redesigned Light/Dark floating toast, unified dark-mode Firefox Blue (`#0a84ff`) buttons, and refined spacing, rounding, status pills, inset toggle rows, and modals across all surfaces.

### `v1.3.3` — SPA Stability & Chromium MV3 Build
- **SPA chat-switch stability:** Freeze-proof 2-hop `checkBridgeAlive` timing without `pointerdown`/`keydown` triggers, explicit `{ alive: false }` bridge pong on uninstall/disable, and `hasIsolatedBridge` bound strictly on `MessagePort`.
- **Dual Firefox + Chromium MV3 builds:** Shared codebase outputs `dist/firefox/` and `dist/chromium/` (`service_worker`, `minimum_chrome_version: "111"`, 4 default shortcuts) via `scripts/package.py`.

### `v1.3.2` — Pixelate, Custom Words UX & Lifecycle Hardening
- **Irreversible Pixelate (`P`) & live dimensions pill:** Quantized mosaic tool (`#09090b` base + zeroed `<= 64×64` buffer), `D` shortcut for Pen, real-time `origW×origH → outW×outH` output dimensions badge, `28 px` modal footer buttons, and overflow-free stage.
- **Custom hidden words & upload toast tags:** Added `0/50` counter, **Clear** button, auto-remember current site on save, and `Secrets masked` upload toast tag for text/code uploads.
- **Lifecycle safety & R2 RAM optimization:** Automatic `MAIN`-world teardown when the extension is removed/disabled (`teardownMainWorld`), `injectedAtDocumentStart` verification for already-open tabs, shared `XMLSerializer`, `256 KB` animated GIF probing, `<noscript>` HTML wrapper fix, and `scheduleUnconfirmedCleanup(700)`.

### `v1.3.1` — Mobile & Editor Polish
- **Active `pointerId` touch lock:** Ignores accidental secondary fingers and palm touches during drawing/cropping, with `lostpointercapture` cleanup.
- **Stroke widths:** Thin, Medium, and Thick selector for **Outline** and **Pen** tools.
- **Non-destructive Crop (`C`):** Interactive margin cropping aligned pixel-for-pixel with redaction marks, plus arrow clamping inside active crops.
- **Scroll mode (`H`) & tall-portrait layout:** Touch `pan-x pan-y` plus desktop mouse drag-to-pan for long phone screenshots.
- **Undo & security hardening:** Chronological undo history including deleted boxes, expanded `document_start` native captures, SVG `marker` URL and PDF XMP fixes, fail-closed paste/bridge checks, and clean permission-reload disarming.

### `v1.3.0` — Low-RAM Pipeline & Batch Redactor
- **Cover / Outline / Pen** tools across 6 colors with per-tool color memory, batch pagination + jump selector, and rich-text focus restoration.
- EXIF-aware `ImageBitmap` decoding (`1400 px` preview cache, `<= 2` live batch slides), immediate `<canvas>` memory release, and `<= 500`-entry / `<= 1 MB` LRU token storage.
- `site_match.js` `!` reload badge on already-open tabs, compact `408 px` tabbed popup, and `MessageChannel` ACK cold-start recovery.

---

## Ongoing Maintenance
- **DOM adapter resilience:** Keep paste, drop, and hidden file-input hooks reliable as supported web apps (WhatsApp Web, Outlook, Gmail, Gemini) update their frontend editors across Firefox and Chromium releases.

---

## Planned

### `v2.0.0` — On-Demand Sites & Offline OCR
- **On-demand custom sites (`optional_host_permissions`):** Activate ClipZero on Notion, Slack, Teams, Jira, or private portals on request without expanding default install permissions.
- **Offline image OCR (local WASM):** Detect emails, tokens, cards, or custom words inside screenshots locally and suggest Cover boxes before upload.
- **Chrome Web Store / Edge Add-ons publication:** Distribute signed Chromium packages alongside Firefox Desktop and Android AMO releases from the same shared unminified codebase.
