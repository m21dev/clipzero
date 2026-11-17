# ClipZero Roadmap

This roadmap tracks verified capabilities in **`v1.3.0`** and planned improvements for upcoming releases while strictly preserving ClipZero's core rules: **100% local execution, zero telemetry, zero remote network requests, and minimal permissions**.

---

## Shipped — `v1.3.0` (Current)

- **Zero API Permissions (`55` Host Patterns):** AI chats & builders, GitHub, messaging/social platforms, Gmail, and Outlook (`live.com`, `office.com`, `office365.com`, `cloud.microsoft`).
- **Pre-Upload Canvas Redactor & Highlighter:** Permanent solid **Cover** fills, **Outline** boxes, and smooth **Pen** strokes across 6 colors with independent per-tool color memory, batch pagination + jump selector, and rich-text focus restoration.
- **Low-RAM Media & Session Pipeline:** EXIF-aware `ImageBitmap` decoding with `.close()` lifecycle cleanup, `1400 px` preview caching (`<= 2` live batch previews), sequential 1-by-1 full-res export, immediate canvas zeroing, and bounded `500`-entry / `1 MB` LRU token storage.
- **Already-Open Tab Reload Detection & Cold-Start Recovery:** Automatic `!` badge and 1-click **Reload tab** button via `host_permissions`, non-blocking popup open, `MAIN` → `ISOLATED` script ordering with `MessageChannel` ACK retries.
- **Compact Tabbed Popup:** Split into **Protection** and **More settings** without scrollbars, localized across 6 languages (`149` keys each), plus a passive link to GitHub Sponsors inside **More settings**.

---

## Short-Term — `v1.3.1` *(Optional Mobile & Editor Polish)*

Focus: polish real-device mobile touch ergonomics and canvas drawing controls based on Firefox Desktop/Android feedback.

- **Active `pointerId` Tracking on Canvas:** Ignore secondary finger touches / palm contacts during Pen and Cover drags on touchscreens (Firefox Android `142+`).
- **Stroke Width Selector:** Quick Thin / Medium / Thick size control for **Pen** and **Outline** modes.
- **Quick Crop Tool:** Trim sensitive margins directly inside the pre-upload modal before drawing redactions.
- **Live Site DOM Adapter Updates:** Keep paste/drop hooks resilient against frontend updates on WhatsApp Web, Outlook Web, Gmail, and Gemini.

---

## Mid-Term — `v1.4.0` ("Office Documents, Web Workers & Portable Rules")

Focus: extend metadata sanitization to Office documents while offloading heavy binary parsing from the page main thread.

- **Local Office Metadata Cleaner (`.docx`, `.xlsx`, `.pptx`):** Strip `docProps/core.xml`, `app.xml`, author/company fields, local file paths, and revision metadata in memory while keeping ZIP archive integrity intact.
- **Web Worker with `Transferable` Buffers:** Move heavy PDF (`<= 50 MB`), Office ZIP/XML, and large SVG parsing off the main thread to eliminate UI micro-stutters in heavy chat apps.
- **Portable Settings & Advanced Redaction Rules:**
  - Local **Export / Import JSON** configuration backup to reuse *Custom hidden words* and toggles across sites without requiring `"storage"` permission (or evaluate opt-in global sync ergonomics cleanly).
  - User-defined **Custom Regex Patterns** (national IDs, internal ticket/case codes, project prefixes).
  - **Ephemeral Session Token Viewer** in the popup to inspect or copy `[REDACTED_*_N]` values generated in the active tab without scrolling back up long chats.

---

## Long-Term — `v2.0.0` ("On-Demand Sites, Offline OCR & Multi-Browser")

Focus: expand protection to any user-chosen site and add proactive on-device detection without cloud dependencies.

- **On-Demand Custom Sites (`optional_host_permissions`):** Let users click *"Enable ClipZero on this site"* for Notion, Slack, Teams, Jira, or private company portals without expanding default manifest permissions.
- **100% Offline Image OCR (Local WebAssembly):** Detect emails, keys, card numbers, or custom hidden words inside screenshots locally and pre-suggest **Cover** boxes inside the Canvas modal before upload.
- **Dual MV3 Packaging (Firefox + Chromium):** Maintain a unified unminified codebase supporting Firefox Desktop/Android alongside Chrome Web Store, Edge, and Brave builds.
