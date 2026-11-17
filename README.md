# ClipZero

**100% local upload & clipboard privacy shield for AI chats, social media, messaging, and webmail.**

Firefox MV3 (`140+` Desktop / `142+` Android) · **Zero API permissions** · **Zero network calls** · **Zero telemetry** · **`GPL-3.0-or-later`**

---

## Why ClipZero?

Every time you paste a screenshot, drag a photo, attach a PDF, or paste logs/code into an AI chat or web app, browsers can leak original filenames (`Screenshot 2026-11-17...`), GPS/EXIF camera metadata, PDF author tags, or API tokens and personal contacts.

ClipZero intercepts uploads and pastes **locally inside your browser tab** before websites read them—with zero external requests, zero analytics, and zero API permissions in `manifest.json`.

---

## Features

- **Privacy Upload Renamer:** Intercepts paste, drag-and-drop, and `<input type="file">` uploads and replaces local filenames (`clip_XXXXXX.png`, or `doc_XXXXXX.*` when *Rename all files* is enabled), using bounded LRU collision avoidance.
- **Exotic Format Flattening:** Automatically converts decodable `.bmp`, `.ico`, `.tiff`, and `.heic`/`.heif` rasters to clean `.png` via local Canvas so web apps accept them reliably.
- **Lossless Metadata & Document Cleaning:**
  - **JPEG:** Strips EXIF, GPS, XMP, and APP0 RGB thumbnails while rebuilding a safe orientation tag (`0x0112`) so portrait photos stay upright.
  - **PNG & WebP:** Rebuilds files using strict chunk allowlists (removing `eXIf`, `tEXt`, `zTXt`, `iTXt`, `iDOT`, `C2PA`, etc.).
  - **GIF:** Strips Comment and XMP extensions while preserving animated `NETSCAPE2.0` frames.
  - **AVIF:** Detects EXIF/XMP metadata markers in static AVIF headers and re-exports cleanly via local Canvas.
  - **SVG:** Sanitizes active scripts, `on*` attributes, `<foreignObject>`, unsafe URIs, external CSS URLs/@import rules, and editor namespaces (Figma, Sketch, Illustrator, Inkscape, etc.) up to `8 MB`.
  - **PDF:** Blanks `/Info` (direct, `#xx` hex names, and indirect references) and XMP packets in-place with whitespace of identical byte length up to `50 MB`, keeping `xref` tables and `/Outlines` bookmarks intact.
- **Pre-Upload Canvas Redactor & Optimizer:**
  - **Cover:** Irreversible opaque solid fill across 6 high-contrast colors (`#09090b`, `#ffffff`, `#ef4444`, `#2563eb`, `#16a34a`, `#eab308`)—zero reversible blur or mosaic filters.
  - **Outline:** Color frames to highlight areas while keeping inner content visible.
  - **Pen:** Freehand drawing smoothed with quadratic curves at export resolution.
  - **Low-RAM Batch Streaming:** Uses native `ImageBitmap` decoding (`imageOrientation: 'from-image'`), cached `1400 px` preview windows (max `2` live batch slides), windowed pagination + quick slide jump selector, `Skip` / `Include` per slide, optional max `2048 px` resize, sequential 1-by-1 export, and immediate `.close()` + `<canvas>` memory release.
- **Secret, PII & Custom Hidden Words Guard:**
  - Masks pasted API keys, tokens, JWTs, Luhn-valid payment cards, IBANs, URL credentials, private PEM keys, optional emails/phones/IPs, and user-defined comma-separated **Custom hidden words** with consistent session placeholders (`[REDACTED_EMAIL_1]`), bounded by a `500`-entry / `1 MB` LRU session vault.
  - Includes a selective **Review** modal (uncheck individual findings) and a **Restore originals** toast button when copying masked tokens back from chat responses.
- **Smart Site Profiles & Tab Reload Detection:**
  - Defaults to full Secret + Metadata protection on AI chats & GitHub, and seamless Metadata + Renaming protection on social media, messaging, and webmail.
  - Automatically flags already-open supported tabs (`!`) after install or update with a 1-click **Reload tab** button in the compact tabbed popup (**Protection** | **More settings**), plus cold-start handshake recovery.

---

## Supported Sites (55 Host Patterns)

- **AI Chats & Builders:** Gemini (`gemini.google.com`), Google AI Studio, ChatGPT, Claude, Perplexity, Grok, Mistral (`chat.mistral.ai`, `lechat.mistral.ai`), Microsoft Copilot, Poe, HuggingChat, DeepSeek, Qwen, Kimi, Z.ai, ChatGLM, Doubao, Yuanbao, Ernie/Yiyan, NotebookLM, v0, Bolt, Lovable, OpenRouter, Duck.ai.
- **Developer Platforms:** GitHub (`github.com`).
- **Messaging & Social:** WhatsApp Web, Telegram Web, Discord, Messenger, Facebook (`facebook.com`, `m.facebook.com`), Instagram, X / Twitter, Reddit, LinkedIn.
- **Webmail:** Gmail (`mail.google.com`) and Outlook (`outlook.live.com`, `outlook.office.com`, `outlook.office365.com`, `outlook.cloud.microsoft`).

---

## Keyboard Shortcuts

| Shortcut (Windows / Linux) | macOS | Action |
| :--- | :--- | :--- |
| `Alt+Shift+P` | `MacCtrl+Shift+P` | Pause / resume ClipZero on the active tab (`toggle-enabled`) |
| `Alt+Shift+S` | `MacCtrl+Shift+S` | Toggle rename all files & documents (`toggle-strict`) |
| `Alt+Shift+E` | `MacCtrl+Shift+E` | Toggle lossless metadata cleaning (`toggle-exif`) |
| `Alt+Shift+B` | `MacCtrl+Shift+B` | Toggle pre-upload Canvas visual redactor (`toggle-redact`) |
| `Alt+Shift+K` | `MacCtrl+Shift+K` | Toggle Secret & API Key Guard on paste (`toggle-secrets`) |
| `Alt+Shift+T` | `MacCtrl+Shift+T` | Show / hide on-screen confirmation notice (`toggle-toast`) |
| `Alt+Shift+G` | `MacCtrl+Shift+G` | Remember / forget settings for this site (`toggle-save`) |

Inside the **Canvas Redactor** modal: `N` adds a box, `O` selects **Outline**, `P` selects **Pen**, `Arrow` keys move/resize (hold `Shift` for resize), `Delete`/`Backspace` removes selected box, `PageUp`/`PageDown` switches slides, and `Enter` uploads.

---

## Installation

### Official Signed Add-on (Recommended)
Install ClipZero directly from **Mozilla Firefox Add-ons (AMO)** (search **ClipZero** by `m21dev`). Standard Firefox releases require Mozilla-signed `.xpi` packages.

### Load Unpacked Source in Firefox (Development)
1. Clone or download this repository (`git clone https://github.com/m21dev/clipzero.git`).
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on…** and select `manifest.json` from the repository root.

---

## Architecture & Security

1. **`content.js` (`MAIN` world at `document_start`):** Captures native browser globals at startup, enforces filename/metadata/canvas/secret sanitization locally, isolates UI inside closed Shadow DOM (`:host{all:initial...}`), and explicitly releases `ImageBitmap` / `<canvas>` memory.
2. **`bridge.js` (`ISOLATED` world at `document_start`):** Loaded after `content.js`; supplies localized strings (`browser.i18n`, 6 locales: `de`, `en`, `es`, `fr`, `pt_BR`, `zh_CN`), command relays, and popup state queries over a private `MessageChannel` with cold-start retry recovery.
3. **`site_match.js` & `background.js`:** Detects already-open supported tabs needing a reload after install/update (`!`), manages permission-request auto-reloads cleanly, and relays keyboard commands without requiring `"tabs"` or `"activeTab"`.
4. **`popup.html` / `popup.css` / `popup.js`:** Tabbed popup (`408 px` wide, zero vertical scrollbars) with non-blocking initialization and instant `!` reload guidance.

No build step or minification is used: all JavaScript, HTML, and CSS files shipped to AMO match this repository.

---

## Verification & Packaging

Run the standalone repository integrity & security checks (requires Python `3.9+`, optional Node.js for JS syntax checking):

```bash
python tests/verify_repo.py
```

Build a clean runtime ZIP into `dist/` (excluded by `.gitignore`):

```bash
python scripts/package.py
```

---

## Roadmap & Security

- See [ROADMAP.md](ROADMAP.md) for upcoming milestones (`v1.3.1`, `v1.4.0`, `v2.0.0`).
- See [SECURITY.md](SECURITY.md) for responsible disclosure instructions.
- See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## License & Support

- Licensed under the **GNU General Public License v3.0 or later (`GPL-3.0-or-later`)** — see [LICENSE](LICENSE).
- Voluntary support (optional): [GitHub Sponsors (`m21dev`)](https://github.com/sponsors/m21dev).
