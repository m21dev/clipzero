# Changelog

All notable releases of **ClipZero** are documented here following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## `[1.3.1]` — 2026-11-17 *(Mobile & Editor Polish)*

### Added
- **Stroke Weights:** Added **Thin**, **Medium**, and **Thick** size selector for **Outline** and **Pen** tools, scaled accurately at export resolution.
- **Non-Destructive Crop (`C`):** Interactive crop overlay with live `W×H` badge, pixel-exact box coordinate mapping, proportional minimum clamp on small images, and keyboard clamping inside active crops.
- **Scroll Mode (`H`) & Tall-Portrait Layout:** Dedicated pan mode (`touch-action: pan-x pan-y` on mobile + mouse drag-to-pan on desktop) and scrollable tall-portrait canvas sizing (`h > w * 1.85`).
- **Single-Touch `pointerId` Lock:** Rejects secondary fingers and palm contacts mid-stroke with `lostpointercapture` cleanup.

### Changed
- **Chronological Undo & Ergonomics:** `Delete`/`Backspace` now pushes undoable `{ kind: 'delete' }` entries alongside `Crop` and box draws; `+ Box` (`N`/`Space`) switches out of `Crop`/`Scroll` into `Cover`; clicking a box restores canvas keyboard focus; Black **Outline** previews show a 1px outer `#0a84ff` guide ring; and stage scroll resets cleanly between slides.
- **Popup, Background & Locales:** Deduplicated popup/background helpers, disarmed pending permission reloads on cancel (`clipzero:disarm-reload`), preserved armed tab IDs on mismatch, and removed 2 unused locale keys (`152` synchronized keys across 6 languages).

### Security & Fixes
- Expanded `document_start` native captures (`Array`, `Object`, `Math`, `AbortController`, `MessagePort`, `CanvasRenderingContext2D`, and `Event` descriptors with safe getters).
- Added SVG `marker` URL scrubbing, widened PDF `PDF_XMP_OPEN_TAG_RE` for attributes/digits, enforced fail-closed error handling in `handlePasteSecrets`, enforced `NativeMessagePort` checks and duplicate-handshake `stopImmediatePropagation`, blocked `window.postMessage` replies once `bridgePort` is active, and hardened `background.js` `sender.id` checks + `octet-stream` export detection.

---

## `[1.3.0]` — 2026-11-17

### Added
- **Pre-Upload Canvas Modes:** Added **Cover**, **Outline**, and **Pen** across 6 colors with per-tool color memory and shortcuts (`O`, `P`).
- **Batch Navigation & Tabbed Popup:** Added windowed pagination + slide `<select>`, `site_match.js` `!` reload badge + **Reload tab**, and compact `408 px` tabbed popup (**Protection** | **More settings**) with optional GitHub Sponsors link.

### Changed
- **Low-RAM Pipeline & LRU Vault:** Switched to `ImageBitmap` (`imageOrientation: 'from-image'`) with explicit `.close()`, `1400 px` preview caching (`<= 2` live slides), 1-by-1 full-res export, immediate canvas zeroing, `<= 500`-entry / `<= 1 MB` session token LRU, `MAIN → ISOLATED` load order, `MessageChannel` ACK retries, and rich-text focus restoration.

---

## `[1.2.2]` — 2026-11-17

- Expanded coverage to **`55` host patterns** (adding Outlook Web domains), added missing-host recovery flow, and removed `"activeTab"` (`0` API permissions declared).

## `[1.2.0]` — 2026-11-14

- Added lossless GIF/AVIF handling, in-place PDF `/Info` + XMP cleaning (`<= 50 MB`, preserving `xref` & bookmarks), exotic raster conversion (`.bmp`/`.ico`/`.tiff`/`.heic` → `.png`), numbered session tokens (`[REDACTED_*_N]`), **Custom hidden words**, **Restore originals** toast, and `MessageChannel` + Closed Shadow DOM isolation.

## `[1.1.0]` — 2026-11-13

- Added selective per-finding checkboxes inside the Secret & PII **Review** modal (**Apply selection** / **Copy selection**) and expanded automated security tests.

## `[1.0.0]` — 2026-11-12

- Initial public release of **ClipZero** (evolved from `ClipRename` `1.0.0` / `1.0.1`) under `GPL-3.0-or-later`.
