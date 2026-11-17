# Changelog

All notable releases of **ClipZero** are documented here following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
