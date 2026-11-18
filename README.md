<div align="center">

<img src="assets/banner.png" width="880" alt="ClipZero v1.3.2 overview">

<br><br>

[![Firefox Add-ons](https://img.shields.io/amo/v/clipzero?label=Firefox%20AMO&style=flat-square&color=0060df)](https://addons.mozilla.org/firefox/addon/clipzero/)
[![CI](https://img.shields.io/github/actions/workflow/status/m21dev/clipzero/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/m21dev/clipzero/actions/workflows/ci.yml)
![Zero Permissions](https://img.shields.io/badge/API%20Permissions-0-16a34a?style=flat-square)
![License](https://img.shields.io/badge/License-GPL--3.0-52525b?style=flat-square)

[Install on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/clipzero/) · [Releases](https://github.com/m21dev/clipzero/releases) · [Roadmap](ROADMAP.md) · [Changelog](CHANGELOG.md) · [Security](SECURITY.md)

</div>

<br>

ClipZero intercepts file uploads and clipboard pastes **inside your Firefox tab** before websites read them—with **zero API permissions**, **zero network calls**, and **unminified source code**.

- **Anonymize filenames:** Renames pasted, dropped, and picked files (`clip_XXXXXX.png` / `doc_XXXXXX.*`) and flattens `.bmp`, `.ico`, `.tiff`, and `.heic` rasters to `.png`.
- **Clean metadata losslessly:** Strips JPEG EXIF/GPS/APP0, PNG and WebP chunks (`iDOT`, `C2PA`, text), GIF comments/XMP, static AVIF markers, active SVG vectors, and PDF `/Info` + XMP fields in-place.
- **Redact & crop before upload (`v1.3.2`):** Irreversible **Cover** fills, **Pixelate (`P`)** quantized mosaic, **Outline (`O`)** boxes, **Pen (`D`)** strokes (`Thin` / `Medium` / `Thick`), non-destructive **Crop (`C`)** with live `origW×origH → outW×outH` pill, mobile **Scroll (`H`)**, and single-touch `pointerId` lock.
- **Mask secrets & PII on paste & file upload:** Replaces API keys, tokens, JWTs, Luhn cards, IBANs, URL credentials, optional contacts/IPs, and **Custom hidden words** (`0/50` counter + `Clear` + auto-remember site) with consistent session tokens (`[REDACTED_*_N]`).

---

## Screenshots

<p align="center">
  <img src="assets/01-canvas-editor.png" width="800" alt="ClipZero pre-upload Canvas Redactor"><br>
  <sub><b>Pre-upload Canvas Redactor</b> — Cover, <b>Pixelate (<code>P</code>)</b>, Outline (<code>O</code>), Pen (<code>D</code>) stroke widths, Crop (<code>C</code>) with live output dimensions, Scroll (<code>H</code>), and Undo.</sub>
</p>

<br>

<p align="center">
  <img src="assets/03-popup-controls.png" width="800" alt="ClipZero zero-permission tabbed popup"><br>
  <sub><b>Zero-Permission Tabbed Popup</b> — Per-tab toggles, Custom hidden words (<code>0/50</code> + <b>Clear</b>), shortcuts, and automatic reload detection (<code>!</code>) across 55 hosts.</sub>
</p>

<br>

<p align="center">
  <img src="assets/02-secret-guard.png" width="800" alt="ClipZero Secret and PII Guard on paste and text uploads"><br>
  <sub><b>Secret, PII &amp; Custom Words Guard</b> — Masks keys and contacts on paste &amp; text/code uploads with per-item Review checkboxes and Restore originals.</sub>
</p>

<br>

<p align="center">
  <img src="assets/04-metadata-privacy.png" width="800" alt="ClipZero lossless metadata, filename scrubbing, and text file secret masking"><br>
  <sub><b>Filename Anonymizer, Lossless Scrubber &amp; File Secret Guard</b> — Cleans metadata and masks text uploads in tab memory without touching originals on disk.</sub>
</p>

---

## Install

- **Firefox Desktop (`140+`) & Android (`142+`):** Install the signed release from **[addons.mozilla.org/firefox/addon/clipzero](https://addons.mozilla.org/firefox/addon/clipzero/)**.
- **Unpacked source (development):** Open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → select [`manifest.json`](manifest.json).

---

## Reference

<details>
<summary>What's new in v1.3.2</summary>

- **Irreversible Pixelate (`P`) + reassigned Pen (`D`):** Added a quantized mosaic redactor backed by a solid matte base (`<= 64×64` zeroed buffer) alongside `Cover`, `Outline` (`O`), and `Pen` (`D`).
- **Live output dimensions pill (`origW×origH → outW×outH`):** Live Canvas readout reflecting active crops and `2048 px` resize caps, with `28 px` footer controls and overflow-safe stage layout.
- **Custom hidden words UX & text-file tags:** Added `0/50` word counter, **Clear** button, automatic per-site persistence when saving custom words, and `Secrets masked` upload toast tag for text/code files.
- **Extension lifecycle safety & R2 RAM optimizations:** Added automatic `MAIN`-world self-teardown when the extension is removed/disabled (`teardownMainWorld`), `injectedAtDocumentStart` verification on already-open tabs, shared `XMLSerializer`, `256 KB` animated GIF probe, `<noscript>` HTML wrapper fix, `scheduleUnconfirmedCleanup(700)`, and `155` locale keys × 6.

</details>

<details>
<summary>Supported file formats &amp; limits</summary>

| Format | Sanitization | Notes |
| :--- | :--- | :--- |
| **JPEG** | Strips EXIF, GPS, XMP &amp; APP0 RGB thumbnails | Preserves safe orientation tag (`0x0112`) across progressive scans |
| **PNG / WebP** | Rebuilt via strict chunk allowlists | Removes `iDOT`, `C2PA`, `eXIf`, `tEXt`, `zTXt`, `iTXt` |
| **GIF / AVIF** | Strips GIF Comment/XMP; re-exports static AVIFs with metadata | `<= 256 KB` animated GIF probe; keeps animated frames intact |
| **SVG** | Removes `<script>`, `<foreignObject>`, `on*`, unsafe URIs, CSS URLs &amp; `marker` URLs | Up to `8 MB` |
| **PDF** | Blanks `/Info` (direct, `#xx`, indirect) &amp; XMP packets in-place | Up to `50 MB`; `xref` tables &amp; bookmarks preserved |
| **Exotic Rasters** | Flattens `.bmp`, `.ico`, `.tiff`, `.heic`/`.heif` cleanly to `.png` | Handled via local Canvas when browser-decodable |
| **Text / Code Files** | Masks secrets, PII &amp; custom words in `.txt`, `.env`, `.json`, `.md`, `.log`, etc. | Displays `Secrets masked` upload tag; disk originals untouched |

</details>

<details>
<summary>Supported websites (55 host patterns)</summary>

- **AI Chats & Builders:** Gemini, AI Studio, ChatGPT, Claude, Perplexity, Grok, Mistral (`chat.mistral.ai`, `lechat.mistral.ai`), Copilot, Poe, HuggingChat (`/chat/*`), DeepSeek, Qwen, Kimi, Z.ai, ChatGLM, Doubao, Yuanbao, Ernie/Yiyan, NotebookLM, v0, Bolt, Lovable, OpenRouter, Duck.ai.
- **Developer:** GitHub.
- **Messaging & Social:** WhatsApp Web, Telegram Web, Discord, Messenger, Facebook (`www`, `m`), Instagram, X / Twitter, Reddit, LinkedIn.
- **Webmail:** Gmail, Outlook (`live.com`, `office.com`, `office365.com`, `cloud.microsoft`).

</details>

<details>
<summary>Keyboard shortcuts (Global &amp; Canvas Modal)</summary>

| Windows / Linux | macOS | Action |
| :--- | :--- | :--- |
| `Alt+Shift+P` | `MacCtrl+Shift+P` | Pause / resume protection on active tab |
| `Alt+Shift+S` | `MacCtrl+Shift+S` | Rename all files &amp; documents |
| `Alt+Shift+E` | `MacCtrl+Shift+E` | Toggle lossless metadata cleaning |
| `Alt+Shift+B` | `MacCtrl+Shift+B` | Toggle pre-upload Canvas editor |
| `Alt+Shift+K` | `MacCtrl+Shift+K` | Toggle Secret &amp; API Key Guard |
| `Alt+Shift+T` | `MacCtrl+Shift+T` | Show / hide on-screen notice |
| `Alt+Shift+G` | `MacCtrl+Shift+G` | Remember / forget settings for current site |

Inside the Canvas modal: `N` (add box), `P` (Pixelate), `O` (Outline), `D` (Pen), `C` (Crop), `H` (Scroll), `[` / `]` (cycle boxes), `Arrows` / `Shift+Arrows` (move / resize), `Del` (remove, undoable), `Ctrl`/`Cmd+Z` (Undo), `PageUp`/`PageDown` (slides), `Enter` (Upload).

</details>

<details>
<summary>Architecture &amp; repository checks</summary>

1. **`content.js` (`MAIN` @ `document_start`):** Captures native DOM/Canvas/MessagePort/Event globals early, verifies `injectedAtDocumentStart` on open tabs, runs `teardownMainWorld()` automatically when removed/disabled, isolates UI in closed Shadow DOM, and zeros `ImageBitmap` / `<canvas>` buffers immediately.
2. **`bridge.js` (`ISOLATED` @ `document_start`):** Relays localized strings (`6` locales × `155` keys), commands, liveness pongs, and state queries over a confirmed `MessageChannel`.
3. **`site_match.js` &amp; `background.js`:** Detects open tabs missing injection (`!`) after install/update, manages permission-reload arming/disarming, and forwards shortcuts with `0` API permissions.

```bash
python tests/verify_repo.py   # Manifest, locales (155 keys x6), static sinks & JS syntax
python scripts/package.py     # Builds clean runtime ZIP inside dist/
```

</details>

---

[GNU General Public License v3.0 or later](LICENSE) · [Security Policy](SECURITY.md) · [Support `@m21dev` on GitHub Sponsors](https://github.com/sponsors/m21dev)
