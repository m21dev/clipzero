# Changelog

All notable releases of **ClipZero** are documented here following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.4.0] — 2026-11-23

### Added
- **Deep lossless Office metadata scrubber (`.docx`, `.xlsx`, `.pptx`):** Pure-JS OOXML ZIP parser & rewriter (`<= 50 MB`, native `CompressionStream`/`DecompressionStream('deflate-raw')` with streaming ZIP-bomb protection and pure-JS IEEE CRC-32) that empties `docProps/core.xml`, `app.xml`, and `custom.xml` while preserving root XML namespaces, removes `docProps/thumbnail.*` alongside its `_rels/.rels` and `[Content_Types].xml` entries, anonymizes Word/Excel/PowerPoint comments and tracked-change authors/dates, strips Word `w:rsid*` session IDs and local external template paths, removes Excel `<*:absPath>` local directory leaks and `fileSharing` usernames, zeros ZIP timestamps/comments/OS extra fields, and losslessly strips EXIF/GPS/XMP from embedded `word/media/*`, `xl/media/*`, and `ppt/media/*` images—copying all untouched entries verbatim and safely skipping encrypted OLE2 (`D0 CF 11 E0`) or malformed files.
- **Dedicated Web Worker offloading (`scrubber_worker.js`):** Packaged static extension-origin Web Worker (zero `blob:` code generation, zero `web_accessible_resources`, `worker-src 'self'` CSP) with zero-copy `Transferable` `ArrayBuffer` transfers for PDF (`<= 50 MB`), Office OOXML (`<= 50 MB`), and large SVG (`>= 256 KB`) pre-scrubbing in Firefox MV3 (`30 s` idle auto-terminate + crash recovery), plus seamless automatic local fallback with native off-thread compression streams for Chromium MV3.
- **Custom Regex Rules with anti-ReDoS protection (`rules_schema.js`):** Create up to `20` global custom regex rules (`[REDACTED_LABEL]`) that apply automatically across all 55 supported sites (paste, text drop, mixed paste, and text/code file uploads) with live synchronization to already-open tabs, static ReDoS rejection (nested quantifiers, ambiguous quantified alternations, backreferences, lookbehinds, huge bounds, empty matches), and per-rule runtime match/time budgets (`<= 200` matches / `<= 25 ms`).
- **Beginner-Friendly Rules & Backup Page (`options.html`):** Full Firefox Acorn Light/Dark extension tab (`options_ui.open_in_tab: true`, solving Firefox's popup file-picker dismissal) with **5 one-click rule templates**, a **Guided builder (no regex needed)** that generates safe patterns and live examples from prefix/type/length inputs, an **Advanced regex** mode with a collapsible syntax cheatsheet, a live local tester that evaluates both saved rules and the current draft, `.json` Export/Copy/Import (**Merge** or **Replace**, strictly validating schema, manifest-allowlisted HTTPS origins, and regex safety), and a **Remembered sites** manager backed by extension-isolated `IndexedDB` v2 (`site_prefs` + `global_rules`).
- **3-Tab Popup, Full-Coverage Copy Restoration & Active Session Token Inspector:** Upgraded the `408 px` Acorn popup to 3 tabs (**Protection** | **Tokens** | **Settings**) with a live token badge, canonical alias deduplication, safe masked previews by default, on-demand **Show/Hide** and **Copy** (fetching raw values over the private `MessageChannel` only on click), one-click **Clear vault**, and direct `?` / **Help & Guide** access. Expanded **Restore originals** copy detection in `content.js` to cover `Clipboard.prototype.write(ClipboardItem)` (used by modern ChatGPT/Claude/Gemini copy buttons), editable `<textarea>`/`<input>`/Shadow DOM selections, `execCommand('copy')` + `event.clipboardData.setData('text/plain', ...)` buttons, and Markdown-escaped placeholders (`\[REDACTED\_...\]`), with burst deduplication and clean teardown.
- **Interactive Welcome Sandbox (`welcome.html`) & Offline Help Guide (`help.html`):** Opens `welcome.html` once strictly on first install (`details.reason === 'install'`, never on updates, `0` extra permissions) in both Firefox and Chromium—featuring 3 automatic protection pillars, 3 selectable fake-secret presets with 1-click paste simulation and token chips, a RAM-only file metadata cleaner showing simulated upload rename & size change, and one-click host-permission recovery. Paired with a dedicated offline searchable **Help & Guide** (`help.html`) covering quick start, secrets vs. custom words vs. rules, file formats, Canvas shortcuts, Firefox vs. Chromium keyboard bindings, and FAQs.

### Changed
- **Documentation, HiDPI visuals, localization & verification:** Added a **"Why It Matters"** real-world use cases section, an `@2x` Retina animated walkthrough (`assets/demo-clipzero.gif`, `1840×1000 px`), organized all `@2x` Retina screenshots under `assets/screenshots/` (`01`–`05`), added `CONTRIBUTING.md` and `*.gif binary` in `.gitattributes`, expanded all 6 locales (`de`, `en`, `es`, `fr`, `pt_BR`, `zh_CN`) to `342` keys with `1:1` parity (`0` missing, `0` unused), and updated `scripts/package.py` and `tests/verify_repo.py` for the new runtime modules, strict URL/sink checks, and HiDPI asset checks.

## [1.3.4] — 2026-11-23

### Fixed & Cross-Browser Compatibility (Firefox `160`–`161+` & Chrome `157+`)
- **Full drag-and-drop compatibility across modern SPA & browser dropzones:**
  - Wrapped `DataTransferItem.prototype.webkitGetAsEntry` and `getAsFileSystemHandle` (reading candidate files synchronously before resolving handles) so synthetic sanitized drops work cleanly with libraries like `file-selector` / `react-dropzone` on both Chrome/Edge and Firefox.
  - Preserved full `DragEvent` pointer coordinates (`clientX/Y`, `screenX/Y`), modifier keys, `dropEffect` (`copy`), and `effectAllowed` (`all`), and dispatched a synthetic `dragover` + `drop` pair directly to active targets.
  - Added native `<input type="file">` dropzone support (`setInputFiles` + synthetic `input`/`change` when `drop` is not canceled) in both synchronous and asynchronous modes, preventing raw unrenamed files from reaching the input natively.
  - Added disconnected overlay re-priming (`dragenter` + `dragover` + frame settle + `deepElementFromPoint()` Shadow DOM piercing) when SPA drop overlays unmount during async EXIF cleaning or Canvas redaction, plus rejection cleanup via `dismissPageDragOverlay()` and Shadow DOM-safe `handleDragLeave` `relatedTarget` checks.
  - Added directory/folder drag passthrough (`webkitGetAsEntry().isDirectory`), text-drop secret masking for editable targets (`insertFromDrop`, fail-closed on scanner error), `hasDraggedFiles()` fallback across `dt.items` (covering Firefox `150+` removal of `application/x-moz-file`), synthetic fallback if non-configurable `event.dataTransfer` blocks sync override in future browsers, and `window.showOpenFilePicker` interception (`Chrome` / `Edge`) with clean teardown in `teardownMainWorld()`.
- **Native JPEG XL (`.jxl` / `image/jxl`) handling:** Added `.jxl` detection and automatic local Canvas flattening to `.png` (stripping any embedded EXIF/XMP/C2PA boxes) for Firefox `158`–`161+` and Chrome `157+`.

### Security & Hardening
- **Extension-isolated site storage (`IndexedDB`):** Moved saved per-site preferences and `customWords` out of host-page `window.localStorage` into extension-origin `IndexedDB` (`background.js` `clipzero_prefs_db`, zero API permissions, strictly scoped to browser-verified `sender.url` origins), while automatically migrating and purging any legacy `clipzero_site_prefs_v1` entry from `localStorage`.
- **Fail-closed text-file and mixed-paste scanning:** `sanitizeTextFileSecrets()` and `sanitizeClipboardStrings()` now halt/cancel uploads and mixed pastes immediately if scanning throws under page tampering, matching `handlePasteSecrets()`.
- **Full `MAIN`-world native constructor capture:** Replaced all remaining uncaptured `new DataView`, `new Uint8Array`, `new Map`, `Array.isArray`, `Math.*`, and `window.removeEventListener` calls with `document_start` native references.
- **Strict `bridge.js` & dead-port checks:** Enforced `sender.id === ext.runtime.id && !sender.tab` in `bridge.js`, verified matched `sender.url` origins for `clipzero:get-shortcuts` and site-prefs messages in `background.js`, cleared `bridgePort`/`channelConfirmed` when closing invalidated ports, and added synchronous paste/upload liveness checks plus `isInstanceTornDown` guards.

### Changed
- **Sober soft-geometry Firefox Acorn UI polish (Light & Dark):** Refined rounding, inset toggle rows (removing table-like row dividers), status/version pills, focus rings, dark-mode primary button parity (`#0a84ff` Firefox Blue), and tactile switches across the Popup, Pre-Upload Canvas Redactor modal, Secret Review modal, and floating toast notice—while strictly preserving the Light & Dark Firefox Acorn color palette and `prefers-reduced-motion` support.
- **Native Firefox Acorn floating notice (`showToastNotice`):** Redesigned the on-screen toast using `getModalPalette()` for automatic Light (`#ffffff` / `#d7d7db`) and Dark (`#2b2a33` / `#42414d`) theme parity with the rest of ClipZero, adding a Firefox-green active dot (`#12bc00` / `#30e60b`), balanced two-column layout, and solid Firefox-blue action button (`#0060df` / `#0a84ff`) with hover and `:focus-visible` states.
- **High-contrast geometric extension icon (`16`–`128 px`):** Replaced the dark-slate toolbar icon with a two-color Firefox Blue (`#0060df`) and white clipboard/redaction emblem (`assets/logo.svg`, `icons/icon-{16,32,48,96,128}.png`) and added explicit `16` and `32` entries to `manifest.json` for crisp rendering on light and dark toolbars.
- **GitHub documentation & CI Node 24 upgrade:** Rebuilt `README.md` with a native GitHub hero, structured Markdown format/shortcut tables comparing Firefox vs. Chromium defaults, updated `.github/workflows/ci.yml` to `@v7` actions (`Node.js 24`), and refreshed `@2x` Retina screenshots (`01-canvas-editor.png`, `02-secret-guard.png`, `03-popup-controls.png`).

## [1.3.3] — 2026-11-19

### Fixed
- **SPA chat switching no longer triggers false reload prompts:** Removed `pointerdown` and `keydown` from proactive liveness triggers, waited 2 macrotask hops before starting `checkBridgeAlive` timeouts so synchronous SPA UI re-renders never cause false positives, required 2 consecutive post-unfreeze proactive timeouts before disconnecting, and bound `hasIsolatedBridge` strictly when `MessagePort` connects.
- **Instant explicit invalidation signal:** `bridge.js` now sends `{ type: 'clipzero:pong', alive: false }` before closing the port when `isExtensionContextAlive()` detects extension removal or disabling, enabling immediate deterministic teardown in `content.js`.

### Added
- **Unified Firefox & Chromium MV3 build pipeline:** Updated `scripts/package.py` and `tests/verify_repo.py` to build and validate both `dist/firefox/` (`clipzero-firefox-1.3.3.zip`) and `dist/chromium/` (`clipzero-chromium-1.3.3.zip`, `service_worker`, `minimum_chrome_version: "111"`, 4 default `suggested_key` shortcuts) from shared source, alongside Chromium compatibility updates in `background.js` (`importScripts('site_match.js')`) and `popup.js` (`isChromiumRuntime()`, `chrome://extensions/shortcuts`).

## [1.3.2] — 2026-11-18

### Added
- **Irreversible Pixelate tool (`P`) & reassigned Pen (`D`):** Added a quantized mosaic brush backed by an opaque `#09090b` matte base and `<= 64×64` offscreen canvas buffer zeroed in `finally` (`renderPixelatedBox`), keeping `O` for Outline and assigning `D` to Pen.
- **Live output dimensions pill (`origW×origH → outW×outH`):** Real-time Canvas modal indicator showing exact input-to-output dimensions across active crops and `2048 px` resize caps.
- **Custom hidden words enhancements:** Added `0/50` active word counter, one-click **Clear** action (`optCustomWordsClear`), and auto-remembering current site settings (`state.saveSite = true`) when saving non-empty custom words.
- **Text-file secret guard & programmatic copy restore:** Masks API keys, PII, and custom words inside uploaded `.txt`, `.env`, `.json`, `.md`, and `.log` files locally across paste, drag-and-drop, and `<input type="file">` with a `Secrets masked` upload toast tag (`toastUploadSecretsTag`), and wraps `Clipboard.prototype.writeText` safely to offer **Restore originals** on copy buttons.
- **Lifecycle safety on install & removal:** Added `isExtensionContextAlive` liveness ping/pong plus `teardownMainWorld()` automatic cleanup (clearing session vaults and restoring wrapped DOM prototypes/listeners when removed or disabled), alongside strict `injectedAtDocumentStart` checks on already-open tabs.

### Changed
- **R2 RAM & UI refinements:** Shared lazily cached `XMLSerializer` in SVG cleaning, skipped DOM node descriptions when debug logs are disabled, skipped conditional `specialChars` counts, capped animated GIF frame probing to `256 KB`, fixed Canvas modal footer button heights (`28 px`) and eliminated horizontal stage scrolling (`155` locale keys × 6).

### Security & Fixes
- Fixed `isImageOnlyHtmlWrapper` parsing inside HTML clipboard wrappers with `<noscript>` tags, extended cold-start `bridge.js` handshake cleanup (`scheduleUnconfirmedCleanup(700)`), and prevented un-reloaded open tabs from reporting active injection state (`needsReload: true`).

## [1.3.1] — 2026-11-17

### Added
- **Stroke weight selector:** Added **Thin**, **Medium**, and **Thick** widths for **Outline** and **Pen**, scaled accurately at export resolution.
- **Non-destructive Crop (`C`):** Trim margins visually with live `W×H` dimensions, aligned box mapping, proportional minimum crop bounds, and keyboard arrow clamping inside active crops.
- **Scroll mode (`H`) & tall-portrait layout:** Dedicated pan tool (`touch-action: pan-x pan-y` on mobile + mouse drag-to-pan on desktop) and scrollable tall-portrait canvas sizing (`h > w * 1.85`).
- **Single-touch `pointerId` lock:** Ignores secondary finger touches and palm contacts mid-stroke, with `lostpointercapture` cleanup.

### Changed
- **Chronological Undo & editor ergonomics:** `Delete` / `Backspace` on boxes pushes undo entries alongside `Crop` and draws; `+ Box` (`N`/`Space`) exits `Crop`/`Scroll` into `Cover`; clicking an existing box restores canvas keyboard focus; Black `Outline` previews add a 1px outer blue contrast guide; and stage scroll resets cleanly across slides.
- **Popup, background & locales:** Deduplicated popup/background helpers, disarmed pending permission reloads on cancel (`clipzero:disarm-reload`), preserved armed tab IDs on mismatch, and removed 2 orphaned locale keys (`152` keys × 6 languages).

### Security & Fixes
- Expanded `document_start` native captures (`Array`, `Object`, `Math`, `AbortController`, `MessagePort`, `CanvasRenderingContext2D`, and safe event getters).
- Added SVG `marker` URL scrubbing, widened PDF `PDF_XMP_OPEN_TAG_RE`, enforced fail-closed handling in `handlePasteSecrets`, enforced `NativeMessagePort` checks and duplicate-handshake propagation blocking, restricted post-bind `window.postMessage` replies, and hardened `background.js` `sender.id` checks and `octet-stream` export format detection.

## [1.3.0] — 2026-11-17

### Added
- Pre-upload **Cover**, **Outline**, and **Pen** tools across 6 colors with independent per-tool color memory and shortcuts (`O`, `P`).
- Windowed batch pagination + slide selector, `site_match.js` `!` open-tab reload detection + **Reload tab** button, and compact `408 px` tabbed popup (**Protection** | **More settings**).

### Changed
- Switched decoding to EXIF-aware `ImageBitmap` (`<= 2` cached `1400 px` batch previews), sequential 1-by-1 full-res export, immediate `<canvas>` memory release, bounded `500`-entry / `1 MB` LRU token storage, `MAIN -> ISOLATED` script order, `MessageChannel` ACK retries, and rich-text focus restoration.

## [1.2.2] — 2026-11-17
- Expanded coverage to `55` host patterns (adding Outlook Web domains), added missing-host permission recovery, and removed `"activeTab"` (`0` API permissions).

## [1.2.0] — 2026-11-14
- Added lossless GIF/AVIF cleaning, in-place PDF `/Info` + XMP scrubbing (`<= 50 MB`, preserving `xref` & bookmarks), exotic raster conversion to `.png`, numbered session tokens (`[REDACTED_*_N]`), **Custom hidden words**, **Restore originals** toast, and `MessageChannel` + Closed Shadow DOM isolation.

## [1.1.0] — 2026-11-13
- Added per-finding checkboxes inside the Secret & PII **Review** modal (**Apply selection** / **Copy selection**) and expanded automated security tests.

## [1.0.0] — 2026-11-12
- Initial public release of ClipZero under `GPL-3.0-or-later`.
