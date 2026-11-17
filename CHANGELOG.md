# Changelog

All notable releases of **ClipZero** are documented in this file.

## [1.3.0] — 2026-11-17

### Added
- **Pre-upload Canvas Modes:** Added **Cover** (opaque solid fill), **Outline** (color frames leaving inner content visible), and **Pen** (freehand strokes smoothed via `quadraticCurveTo`) across 6 colors with independent per-tool color memory and keyboard shortcuts (`O`, `P`).
- **Batch Navigation Redesign:** Added windowed batch pagination (`getBatchVisiblePills`) and a quick slide jump `<select>` menu for large image batches without horizontal scrollbars.
- **Already-Open Tab Reload Detection:** Added `site_match.js` + `background.js` `onInstalled` `!` badge detection for supported tabs already open before install/update, plus a 1-click **Reload tab** button and Quarantined Domains hint in the popup.
- **Tabbed Popup Layout:** Split popup controls into **Protection** and **More settings** tabs (`408 px` wide, zero vertical scrollbars) and added a voluntary external link to GitHub Sponsors inside **More settings**.

### Changed & Optimized
- **Low-RAM Media Pipeline:** Switched raster decoding to native EXIF-aware `ImageBitmap` (`imageOrientation: 'from-image'`) with explicit `.close()` lifecycle cleanup, cached `1400 px` preview windows (max `2` live batch slides), sequential 1-at-a-time full-resolution export skipping unedited images, and immediate `<canvas>` backing-store release (`width = 0; height = 0`).
- **Bounded Session Vault:** Replaced full map clears with bounded LRU + `1 MB` memory-budget eviction in `sessionTokenToRaw`, monotonic `nextIdx` + LRU in `sessionTypeEntities`, and LRU in `usedNames`.
- **Instant Popup Open:** Made shortcut loading asynchronous so opening the popup never blocks UI rendering; fast-paths tabs flagged with `!`.
- **Cold-Start Bridge Recovery:** Ordered `content.js` (`MAIN`) before `bridge.js` (`ISOLATED`) in `manifest.json` and added `{ ack: true }` + bounded retries (`90 ms`, `320 ms`) on `MessageChannel` setup for duplicate/heavy SPA tabs.
- **Complex Editor Focus Restoration:** Restores focus cleanly to `previousFocused` rich-text editors before dispatching paste/drop events.
- **Locales:** Updated all 6 translations (`de`, `en`, `es`, `fr`, `pt_BR`, `zh_CN`) to `149` synchronized keys each.

## [1.2.2] — 2026-11-17

### Added
- Expanded coverage to **`55` host patterns**, adding Microsoft Outlook webmail (`outlook.live.com`, `outlook.office.com`, `outlook.office365.com`, `outlook.cloud.microsoft`) alongside Gmail, AI chats, GitHub, and social/messaging sites.
- Added permission-recovery flow for existing users upgrading when Firefox holds new host origins pending manual confirmation.

### Removed
- Removed `"activeTab"` so unsupported pages (e.g. Google Drive) stay cleanly passive without misleading visit-permission prompts (`0` API permissions declared in `manifest.json`).

## [1.2.0] — 2026-11-14

### Added
- **Extended Privacy & Security Suite:** Lossless GIF/AVIF handling alongside JPEG/PNG/WebP/SVG, in-place PDF `/Info` + XMP sanitization preserving `xref` offsets and bookmarks, exotic raster conversion (`.bmp`/`.ico`/`.tiff`/`.heic` -> `.png`), numbered session tokens (`[REDACTED_*_N]`), user-defined **Custom hidden words**, **Restore originals** copy toast, and strict `MessageChannel` + Closed Shadow DOM isolation.

## [1.1.0] — 2026-11-13

### Added
- Per-finding selective checkboxes inside the Secret & PII **Review** modal (**Apply selection** / **Copy selection**) and expanded automated security tests.

## [1.0.0] — 2026-11-12

### Added
- Initial public release of **ClipZero** (evolved from `ClipRename` `1.0.0` / `1.0.1`), establishing zero-permission local upload filename anonymization and privacy protections under `GPL-3.0-or-later`.
