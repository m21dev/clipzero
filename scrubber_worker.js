// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Dedicated Web Worker & pure-JS lossless binary scrubber engine (zero permissions, zero network).
// Handles PDF (<= 50 MB), Office OOXML (.docx/.xlsx/.pptx <= 50 MB + embedded media EXIF), and large SVG pre-scrub.

(() => {
  'use strict';

  const MAX_PDF_BYTES = 50 * 1024 * 1024;
  const MAX_OFFICE_BYTES = 50 * 1024 * 1024;
  const MAX_OFFICE_ENTRIES = 2000;
  const MAX_OFFICE_XML_UNCOMPRESSED = 8 * 1024 * 1024;
  const MAX_OFFICE_MEDIA_UNCOMPRESSED = 12 * 1024 * 1024;
  const MAX_SVG_BYTES = 8 * 1024 * 1024;
  const ZIP_DOS_TIME_ZERO = 0x0000;
  const ZIP_DOS_DATE_EPOCH = 0x0021; // 1980-01-01

  const utf8Encoder = typeof TextEncoder === 'function' ? new TextEncoder() : null;
  const utf8Decoder =
    typeof TextDecoder === 'function' ? new TextDecoder('utf-8', { fatal: false }) : null;
  let latin1Decoder = null;
  function getLatin1Decoder() {
    if (!latin1Decoder && typeof TextDecoder === 'function') {
      latin1Decoder = new TextDecoder('latin1');
    }
    return latin1Decoder;
  }

  // --- Shared Binary Helpers & IEEE CRC-32 ---

  let crc32Table = null;
  function getCrc32Table() {
    if (crc32Table) {
      return crc32Table;
    }
    const tbl = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      tbl[n] = c >>> 0;
    }
    crc32Table = tbl;
    return tbl;
  }

  function computeCrc32(bytes) {
    const tbl = getCrc32Table();
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.byteLength; i += 1) {
      crc = tbl[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function concatChunks(chunks) {
    let total = 0;
    for (let i = 0; i < chunks.length; i += 1) {
      total += chunks[i].byteLength;
    }
    const out = new Uint8Array(total);
    let offset = 0;
    for (let i = 0; i < chunks.length; i += 1) {
      out.set(chunks[i], offset);
      offset += chunks[i].byteLength;
    }
    return out;
  }

  function asciiBytesEquals(bytes, start, ascii) {
    if (start < 0 || start + ascii.length > bytes.byteLength) {
      return false;
    }
    for (let i = 0; i < ascii.length; i += 1) {
      if (bytes[start + i] !== ascii.charCodeAt(i)) {
        return false;
      }
    }
    return true;
  }

  function bytesEqualRange(bytes, start, expected) {
    if (start + expected.length > bytes.byteLength) {
      return false;
    }
    for (let i = 0; i < expected.length; i += 1) {
      if (bytes[start + i] !== expected[i]) {
        return false;
      }
    }
    return true;
  }

  async function transformDeflateRaw(bytes, isCompress, maxOutBytes) {
    const StreamCtor = isCompress
      ? globalThis.CompressionStream
      : globalThis.DecompressionStream;
    if (typeof StreamCtor !== 'function') {
      throw new Error('streams-unavailable');
    }
    const stream = new StreamCtor('deflate-raw');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    let writeErr = null;
    const writePromise = (async () => {
      try {
        await writer.write(bytes);
        await writer.close();
      } catch (err) {
        writeErr = err;
      }
    })();

    const chunks = [];
    let total = 0;
    try {
      while (true) {
        const res = await reader.read();
        if (res.done) {
          break;
        }
        const chunk = res.value;
        if (chunk && chunk.byteLength > 0) {
          total += chunk.byteLength;
          if (!isCompress && maxOutBytes && total > maxOutBytes) {
            await reader.cancel().catch(() => {});
            throw new Error('zip-entry-too-large');
          }
          chunks.push(chunk);
        }
      }
    } finally {
      await writePromise;
    }
    if (writeErr) {
      throw writeErr;
    }
    return concatChunks(chunks);
  }

  // --- Lossless Embedded Image Metadata Scrubbers (JPEG, PNG, WebP, GIF) ---

  const PNG_SAFE_CHUNKS = new Set([
    'IHDR',
    'PLTE',
    'IDAT',
    'IEND',
    'tRNS',
    'gAMA',
    'cHRM',
    'sRGB',
    'iCCP',
    'sBIT',
    'bKGD',
    'hIST',
    'pHYs',
    'acTL',
    'fcTL',
    'fdAT',
    'cICP',
    'mDCv',
    'cLLi',
  ]);

  const WEBP_SAFE_CHUNKS = new Set([
    'VP8 ',
    'VP8L',
    'VP8X',
    'ICCP',
    'ALPH',
    'ANIM',
    'ANMF',
  ]);

  const ICC_SIG = [0x49, 0x43, 0x43, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x00];
  const JFIF_SIG = [0x4a, 0x46, 0x49, 0x46, 0x00];
  const ADOBE_SIG = [0x41, 0x64, 0x6f, 0x62, 0x65];
  const EXIF_SIG = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];

  function parseJpegOrientation(bytes, tiffStart, tiffLen) {
    if (tiffLen < 8 || tiffStart + tiffLen > bytes.byteLength) {
      return 1;
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset + tiffStart, tiffLen);
    const bo = view.getUint16(0, false);
    if (bo !== 0x4949 && bo !== 0x4d4d) {
      return 1;
    }
    const le = bo === 0x4949;
    if (view.getUint16(2, le) !== 42) {
      return 1;
    }
    const ifd0Offset = view.getUint32(4, le);
    if (ifd0Offset < 8 || ifd0Offset + 2 > tiffLen) {
      return 1;
    }
    const entryCount = view.getUint16(ifd0Offset, le);
    const maxEntries = Math.min(entryCount, 128);
    for (let i = 0; i < maxEntries; i += 1) {
      const entryPos = ifd0Offset + 2 + i * 12;
      if (entryPos + 12 > tiffLen) {
        break;
      }
      if (view.getUint16(entryPos, le) === 0x0112) {
        const type = view.getUint16(entryPos + 2, le);
        const count = view.getUint32(entryPos + 4, le);
        if (type === 3 && count >= 1) {
          const val = view.getUint16(entryPos + 8, le);
          if (val >= 1 && val <= 8) {
            return val;
          }
        }
        break;
      }
    }
    return 1;
  }

  function buildMinimalOrientationApp1(orientation) {
    return new Uint8Array([
      0xff, 0xe1, 0x00, 0x22,
      0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
      0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
      0x00, 0x01,
      0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01,
      0x00, orientation & 0xff, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ]);
  }

  function scrubJpegBytes(bytes) {
    if (bytes.byteLength < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      return null;
    }
    const chunks = [bytes.subarray(0, 2)];
    let pos = 2;
    let stripped = false;
    let orientation = 1;
    let foundOrientation = false;
    let orientationInsertIdx = -1;

    while (pos < bytes.byteLength) {
      if (bytes[pos] !== 0xff) {
        return null;
      }
      let m = pos;
      while (m < bytes.byteLength && bytes[m] === 0xff) {
        m += 1;
      }
      if (m >= bytes.byteLength) {
        break;
      }
      const marker = bytes[m];
      if (marker === 0xd9) {
        chunks.push(bytes.subarray(pos, m + 1));
        break;
      }
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
        chunks.push(bytes.subarray(pos, m + 1));
        pos = m + 1;
        continue;
      }
      if (m + 2 >= bytes.byteLength) {
        return null;
      }
      const segLen = (bytes[m + 1] << 8) | bytes[m + 2];
      if (segLen < 2) {
        return null;
      }
      const segEnd = m + 1 + segLen;
      if (segEnd > bytes.byteLength) {
        return null;
      }
      if (marker === 0xda) {
        let scanEnd = segEnd;
        let eoiReached = false;
        while (scanEnd < bytes.byteLength - 1) {
          if (bytes[scanEnd] !== 0xff) {
            scanEnd += 1;
            continue;
          }
          let nm = scanEnd;
          while (nm < bytes.byteLength && bytes[nm] === 0xff) {
            nm += 1;
          }
          if (nm >= bytes.byteLength) {
            scanEnd = bytes.byteLength;
            break;
          }
          const nextMarker = bytes[nm];
          if (nextMarker === 0x00 || (nextMarker >= 0xd0 && nextMarker <= 0xd7)) {
            scanEnd = nm + 1;
            continue;
          }
          if (nextMarker === 0xd9) {
            chunks.push(bytes.subarray(pos, nm + 1));
            pos = nm + 1;
            eoiReached = true;
            break;
          }
          chunks.push(bytes.subarray(pos, scanEnd));
          pos = scanEnd;
          break;
        }
        if (eoiReached) {
          if (pos < bytes.byteLength) {
            stripped = true;
          }
          break;
        }
        if (scanEnd >= bytes.byteLength - 1) {
          chunks.push(bytes.subarray(pos));
          break;
        }
        continue;
      }

      const isApp = marker >= 0xe0 && marker <= 0xef;
      const isCom = marker === 0xfe;
      if (isApp || isCom) {
        if (marker === 0xe0 && segLen >= 16 && bytesEqualRange(bytes, m + 3, JFIF_SIG)) {
          const xThumb = bytes[m + 15];
          const yThumb = bytes[m + 16];
          if (xThumb === 0 && yThumb === 0 && segLen === 16) {
            chunks.push(bytes.subarray(pos, segEnd));
          } else {
            const cleanApp0 = new Uint8Array(18);
            cleanApp0[0] = 0xff;
            cleanApp0[1] = 0xe0;
            cleanApp0[2] = 0x00;
            cleanApp0[3] = 0x10;
            cleanApp0.set(bytes.subarray(m + 3, m + 15), 4);
            cleanApp0[16] = 0;
            cleanApp0[17] = 0;
            chunks.push(cleanApp0);
            stripped = true;
          }
        } else if (marker === 0xe2 && segLen >= 14 && bytesEqualRange(bytes, m + 3, ICC_SIG)) {
          chunks.push(bytes.subarray(pos, segEnd));
        } else if (marker === 0xee && segLen >= 14 && bytesEqualRange(bytes, m + 3, ADOBE_SIG)) {
          chunks.push(bytes.subarray(pos, segEnd));
        } else {
          if (
            marker === 0xe1 &&
            !foundOrientation &&
            segLen >= 16 &&
            bytesEqualRange(bytes, m + 3, EXIF_SIG)
          ) {
            orientation = parseJpegOrientation(bytes, m + 9, segLen - 8);
            if (orientation > 1 && orientation <= 8) {
              foundOrientation = true;
              if (orientationInsertIdx === -1) {
                orientationInsertIdx = chunks.length;
              }
            }
          }
          stripped = true;
        }
      } else {
        chunks.push(bytes.subarray(pos, segEnd));
      }
      pos = segEnd;
    }

    if (!stripped) {
      return null;
    }
    if (foundOrientation && orientation > 1) {
      const insertAt = orientationInsertIdx >= 1 ? orientationInsertIdx : 1;
      chunks.splice(insertAt, 0, buildMinimalOrientationApp1(orientation));
    }
    return concatChunks(chunks);
  }

  function scrubPngBytes(bytes) {
    if (bytes.byteLength < 12) {
      return null;
    }
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (!bytesEqualRange(bytes, 0, sig)) {
      return null;
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const chunks = [bytes.subarray(0, 8)];
    let pos = 8;
    let stripped = false;
    while (pos + 12 <= bytes.byteLength) {
      const length = view.getUint32(pos, false);
      const end = pos + 12 + length;
      if (end > bytes.byteLength) {
        return null;
      }
      const type = String.fromCharCode(
        bytes[pos + 4],
        bytes[pos + 5],
        bytes[pos + 6],
        bytes[pos + 7]
      );
      if (PNG_SAFE_CHUNKS.has(type)) {
        chunks.push(bytes.subarray(pos, end));
      } else {
        stripped = true;
      }
      pos = end;
      if (type === 'IEND') {
        if (pos < bytes.byteLength) {
          stripped = true;
        }
        break;
      }
    }
    return stripped ? concatChunks(chunks) : null;
  }

  function scrubWebpBytes(bytes) {
    if (
      bytes.byteLength < 20 ||
      !asciiBytesEquals(bytes, 0, 'RIFF') ||
      !asciiBytesEquals(bytes, 8, 'WEBP')
    ) {
      return null;
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const bodyChunks = [];
    let pos = 12;
    let stripped = false;
    while (pos + 8 <= bytes.byteLength) {
      const fourcc = String.fromCharCode(
        bytes[pos],
        bytes[pos + 1],
        bytes[pos + 2],
        bytes[pos + 3]
      );
      const size = view.getUint32(pos + 4, true);
      const padded = size + (size & 1);
      const end = pos + 8 + padded;
      if (end > bytes.byteLength) {
        return null;
      }
      if (WEBP_SAFE_CHUNKS.has(fourcc)) {
        if (fourcc === 'VP8X' && size >= 10) {
          const copy = bytes.slice(pos, end);
          copy[8] &= ~(0x08 | 0x04);
          bodyChunks.push(copy);
        } else {
          bodyChunks.push(bytes.subarray(pos, end));
        }
      } else {
        stripped = true;
      }
      pos = end;
    }
    if (!stripped) {
      return null;
    }
    let bodyLen = 0;
    for (let i = 0; i < bodyChunks.length; i += 1) {
      bodyLen += bodyChunks[i].byteLength;
    }
    const header = new Uint8Array(12);
    header.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], 0);
    new DataView(header.buffer).setUint32(4, 4 + bodyLen, true);
    return concatChunks([header, ...bodyChunks]);
  }

  function skipGifSubBlocks(bytes, pos, len) {
    let cur = pos;
    while (cur < len) {
      const sz = bytes[cur];
      cur += 1;
      if (sz === 0) {
        return cur;
      }
      if (cur + sz > len) {
        return -1;
      }
      cur += sz;
    }
    return -1;
  }

  function scrubGifBytes(bytes) {
    const len = bytes.byteLength;
    if (len < 14 || (!asciiBytesEquals(bytes, 0, 'GIF89a') && !asciiBytesEquals(bytes, 0, 'GIF87a'))) {
      return null;
    }
    let pos = 13;
    const packed = bytes[10];
    if ((packed & 0x80) !== 0) {
      pos += 3 * (1 << ((packed & 0x07) + 1));
    }
    if (pos >= len) {
      return null;
    }
    const chunks = [bytes.subarray(0, pos)];
    let stripped = false;
    while (pos < len) {
      const intro = bytes[pos];
      if (intro === 0x3b) {
        chunks.push(bytes.subarray(pos, pos + 1));
        pos += 1;
        if (pos < len) stripped = true;
        break;
      }
      if (intro === 0x2c) {
        if (pos + 10 >= len) return null;
        let next = pos + 10;
        const lctPacked = bytes[pos + 9];
        if ((lctPacked & 0x80) !== 0) {
          next += 3 * (1 << ((lctPacked & 0x07) + 1));
        }
        if (next >= len) return null;
        next += 1;
        const end = skipGifSubBlocks(bytes, next, len);
        if (end < 0) return null;
        chunks.push(bytes.subarray(pos, end));
        pos = end;
        continue;
      }
      if (intro === 0x21) {
        if (pos + 2 >= len) return null;
        const label = bytes[pos + 1];
        if (label === 0xf9) {
          const end = skipGifSubBlocks(bytes, pos + 2, len);
          if (end < 0) return null;
          chunks.push(bytes.subarray(pos, end));
          pos = end;
        } else if (label === 0xfe) {
          const end = skipGifSubBlocks(bytes, pos + 2, len);
          if (end < 0) return null;
          stripped = true;
          pos = end;
        } else if (label === 0xff) {
          const blkSize = bytes[pos + 2];
          if (blkSize === 0 || pos + 3 + blkSize > len) return null;
          const end = skipGifSubBlocks(bytes, pos + 3 + blkSize, len);
          if (end < 0) return null;
          const keepApp =
            blkSize === 11 &&
            (asciiBytesEquals(bytes, pos + 3, 'NETSCAPE2.0') ||
              asciiBytesEquals(bytes, pos + 3, 'ANIMEXTS1.0') ||
              asciiBytesEquals(bytes, pos + 3, 'ICCRGBG1012'));
          if (keepApp) {
            chunks.push(bytes.subarray(pos, end));
          } else {
            stripped = true;
          }
          pos = end;
        } else {
          const end = skipGifSubBlocks(bytes, pos + 2, len);
          if (end < 0) return null;
          stripped = true;
          pos = end;
        }
        continue;
      }
      return null;
    }
    return stripped ? concatChunks(chunks) : null;
  }

  // --- In-place Lossless PDF Metadata Scrubber (<= 50 MB) ---

  const PDF_SENSITIVE_INFO_KEYS = new Set([
    'Author',
    'Creator',
    'Producer',
    'Title',
    'Subject',
    'Keywords',
    'CreationDate',
    'ModDate',
    'Company',
    'SourceModified',
  ]);
  const PDF_DELIM_CODES = new Set([0x28, 0x29, 0x3c, 0x3e, 0x5b, 0x5d, 0x7b, 0x7d, 0x2f, 0x25]);
  const PDF_XMP_OPEN_TAG_RE = /<(?:[a-zA-Z0-9_-]+:)?xmpmeta\b[^>]*>/gi;
  const PDF_XMP_CLOSE_TAG_RE = /<\/(?:[a-zA-Z0-9_-]+:)?xmpmeta>/i;
  const PDF_XMP_SENSITIVE_TAGS = [
    'dc:creator',
    'dc:title',
    'dc:subject',
    'dc:description',
    'dc:publisher',
    'dc:contributor',
    'xmp:CreatorTool',
    'xmp:CreateDate',
    'xmp:ModifyDate',
    'xmp:MetadataDate',
    'pdf:Producer',
    'pdf:Keywords',
    'photoshop:AuthorsPosition',
    'photoshop:City',
    'photoshop:State',
    'photoshop:Country',
    'photoshop:Credit',
    'photoshop:Source',
    'xmpMM:DocumentID',
    'xmpMM:InstanceID',
    'xmpMM:OriginalDocumentID',
  ];

  function blankPdfByteRange(out, start, end) {
    let changed = false;
    for (let i = start; i < end; i += 1) {
      if (out[i] !== 0x20) {
        out[i] = 0x20;
        changed = true;
      }
    }
    return changed;
  }

  function decodePdfName(rawName) {
    if (!rawName.includes('#')) {
      return rawName;
    }
    return rawName.replace(/#([0-9a-fA-F]{2})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    );
  }

  function findPdfStreamRanges(text) {
    const ranges = [];
    const streamRe = /\bstream(?:\r\n|\n)/g;
    let m;
    while ((m = streamRe.exec(text)) !== null) {
      const start = m.index + m[0].length;
      const endIdx = text.indexOf('endstream', start);
      if (endIdx < 0) {
        break;
      }
      ranges.push([start, endIdx]);
      streamRe.lastIndex = endIdx + 9;
    }
    return ranges;
  }

  function isInsideStreamRanges(pos, streamRanges) {
    let lo = 0;
    let hi = streamRanges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const range = streamRanges[mid];
      if (pos < range[0]) {
        hi = mid - 1;
      } else if (pos >= range[1]) {
        lo = mid + 1;
      } else {
        return true;
      }
    }
    return false;
  }

  function skipPdfWsAndComments(out, pos, limit) {
    let p = pos;
    while (p < limit) {
      const c = out[p];
      if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d || c === 0x0c || c === 0x00) {
        p += 1;
      } else if (c === 0x25) {
        while (p < limit && out[p] !== 0x0a && out[p] !== 0x0d) {
          p += 1;
        }
      } else {
        break;
      }
    }
    return p;
  }

  function blankPdfStringValue(out, text, valStart, limit, isExplicitInfo, indirectTargets) {
    const p = skipPdfWsAndComments(out, valStart, limit);
    if (p >= limit) {
      return { modified: false, nextPos: p };
    }
    const ch = out[p];
    if (ch === 0x28) {
      let depth = 1;
      let q = p + 1;
      while (q < limit && depth > 0) {
        const b = out[q];
        if (b === 0x5c) {
          q += 2;
          continue;
        }
        if (b === 0x28) depth += 1;
        else if (b === 0x29) depth -= 1;
        q += 1;
      }
      if (depth !== 0) {
        return { modified: false, nextPos: q };
      }
      return { modified: blankPdfByteRange(out, p + 1, q - 1), nextPos: q };
    }
    if (ch === 0x3c && p + 1 < limit && out[p + 1] !== 0x3c) {
      let q = p + 1;
      while (q < limit && out[q] !== 0x3e) {
        q += 1;
      }
      if (q >= limit) {
        return { modified: false, nextPos: q };
      }
      return { modified: blankPdfByteRange(out, p + 1, q), nextPos: q + 1 };
    }
    if (isExplicitInfo && ch >= 0x30 && ch <= 0x39) {
      const refM = /^(\d+)\s+(\d+)\s+R\b/.exec(text.slice(p, Math.min(limit, p + 40)));
      if (refM) {
        if (indirectTargets) {
          indirectTargets.add(`${refM[1]} ${refM[2]}`);
        }
        return { modified: false, nextPos: p + refM[0].length };
      }
    }
    return { modified: false, nextPos: p };
  }

  function scrubPdfDictRegion(out, text, start, end, isExplicitInfo, indirectTargets) {
    let modified = false;
    let p = start;
    while (p < end) {
      if (out[p] !== 0x2f) {
        p += 1;
        continue;
      }
      const nameStart = p + 1;
      let q = nameStart;
      while (q < end) {
        const c = out[q];
        if (c <= 0x20 || PDF_DELIM_CODES.has(c)) {
          break;
        }
        q += 1;
      }
      if (q > nameStart) {
        const decodedKey = decodePdfName(text.slice(nameStart, q));
        if (PDF_SENSITIVE_INFO_KEYS.has(decodedKey)) {
          const res = blankPdfStringValue(out, text, q, end, isExplicitInfo, indirectTargets);
          if (res.modified) {
            modified = true;
          }
          p = Math.max(q, res.nextPos);
          continue;
        }
      }
      p = q;
    }
    return modified;
  }

  function collectPdfXmpSpans(text) {
    const spans = [];
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const piStart = text.indexOf('<?xpacket begin=', searchFrom);
      if (piStart < 0) break;
      const piEnd = text.indexOf('<?xpacket end=', piStart);
      if (piEnd < 0) break;
      const closeEnd = text.indexOf('?>', piEnd);
      if (closeEnd < 0) break;
      spans.push([piStart, closeEnd + 2]);
      searchFrom = closeEnd + 2;
    }
    PDF_XMP_OPEN_TAG_RE.lastIndex = 0;
    let m;
    while ((m = PDF_XMP_OPEN_TAG_RE.exec(text)) !== null) {
      const spanStart = m.index;
      if (spans.some(([s, e]) => spanStart >= s && spanStart < e)) {
        continue;
      }
      const tail = text.slice(spanStart + m[0].length);
      const closeM = PDF_XMP_CLOSE_TAG_RE.exec(tail);
      if (!closeM) {
        continue;
      }
      const spanEnd = spanStart + m[0].length + closeM.index + closeM[0].length;
      spans.push([spanStart, spanEnd]);
      PDF_XMP_OPEN_TAG_RE.lastIndex = spanEnd;
    }
    return spans;
  }

  function scrubPdfXmpPacket(out, text, spanStart, spanEnd) {
    let modified = false;
    const pkt = text.slice(spanStart, spanEnd);
    for (let i = 0; i < PDF_XMP_SENSITIVE_TAGS.length; i += 1) {
      const tag = PDF_XMP_SENSITIVE_TAGS[i];
      const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const elRe = new RegExp(`<${escaped}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${escaped}>`, 'gi');
      let m;
      while ((m = elRe.exec(pkt)) !== null) {
        if (blankPdfByteRange(out, spanStart + m.index, spanStart + m.index + m[0].length)) {
          modified = true;
        }
      }
      const attrRe = new RegExp(`\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'gi');
      let am;
      while ((am = attrRe.exec(pkt)) !== null) {
        const fullMatch = am[0];
        const quoteIdx = fullMatch.search(/["']/);
        if (quoteIdx >= 0) {
          const innerStart = spanStart + am.index + quoteIdx + 1;
          const innerEnd = spanStart + am.index + fullMatch.length - 1;
          if (innerEnd > innerStart && blankPdfByteRange(out, innerStart, innerEnd)) {
            modified = true;
          }
        }
      }
    }
    return modified;
  }

  function hasPdfDictKeyBoundaryBefore(out, text, idx) {
    let p = idx - 1;
    while (p >= 0 && (out[p] === 0x20 || out[p] === 0x09 || out[p] === 0x0a || out[p] === 0x0d)) {
      p -= 1;
    }
    if (p < 0) return true;
    const prev = out[p];
    if (prev === 0x3c || prev === 0x29 || prev === 0x3e || prev === 0x5d) {
      return true;
    }
    if (prev === 0x52 && p >= 2) {
      const tail = text.slice(Math.max(0, p - 24), p + 1);
      if (/\d+\s+\d+\s+R$/.test(tail)) return true;
    }
    if (prev === 0x65 || prev === 0x6c) {
      const tail = text.slice(Math.max(0, p - 6), p + 1);
      if (/\b(?:true|false|null)$/.test(tail)) return true;
    }
    if (prev >= 0x30 && prev <= 0x39) {
      return true;
    }
    return false;
  }

  function isInsidePdfLiteralOrComment(out, text, idx) {
    let lineStart = idx;
    while (lineStart > 0 && out[lineStart - 1] !== 0x0a && out[lineStart - 1] !== 0x0d) {
      lineStart -= 1;
    }
    const scanStart = Math.max(0, Math.min(lineStart, idx - 512));
    let depth = 0;
    let inHex = false;
    let inComment = false;
    for (let i = scanStart; i < idx; i += 1) {
      const c = out[i];
      if (inComment) {
        if (c === 0x0a || c === 0x0d) inComment = false;
        continue;
      }
      if (depth > 0) {
        if (c === 0x5c) {
          i += 1;
          continue;
        }
        if (c === 0x28) depth += 1;
        else if (c === 0x29) depth -= 1;
        continue;
      }
      if (inHex) {
        if (c === 0x3e) inHex = false;
        continue;
      }
      if (c === 0x25) {
        inComment = true;
      } else if (c === 0x28) {
        depth = 1;
      } else if (c === 0x3c) {
        if (i + 1 < idx && out[i + 1] === 0x3c) i += 1;
        else inHex = true;
      }
    }
    return depth > 0 || inHex || inComment;
  }

  function scrubPdfBytes(bytes, inPlace = false) {
    if (!bytes || bytes.byteLength < 16 || bytes.byteLength > MAX_PDF_BYTES) {
      return null;
    }
    const decoder = getLatin1Decoder();
    if (!decoder) {
      return null;
    }
    const headLen = Math.min(bytes.byteLength, 1024);
    let pdfSigFound = false;
    for (let i = 0; i <= headLen - 5; i += 1) {
      if (asciiBytesEquals(bytes, i, '%PDF-')) {
        pdfSigFound = true;
        break;
      }
    }
    if (!pdfSigFound) {
      return null;
    }

    const out = inPlace ? bytes : new Uint8Array(bytes);
    const text = decoder.decode(out);
    const streamRanges = findPdfStreamRanges(text);
    let modified = false;

    const explicitInfoObjIds = new Set();
    const infoRefRe = /\/Info\s+(\d+)\s+(\d+)\s+R\b/g;
    let rm;
    while ((rm = infoRefRe.exec(text)) !== null) {
      if (!isInsideStreamRanges(rm.index, streamRanges)) {
        explicitInfoObjIds.add(`${rm[1]} ${rm[2]}`);
      }
    }

    const objIdAtDict = new Map();
    const objRe = /(?:^|[\r\n])\s*(\d+)\s+(\d+)\s+obj\b/g;
    let om;
    while ((om = objRe.exec(text)) !== null) {
      if (isInsideStreamRanges(om.index, streamRanges)) continue;
      const objId = `${om[1]} ${om[2]}`;
      if (!explicitInfoObjIds.has(objId)) continue;
      const dictPos = skipPdfWsAndComments(out, om.index + om[0].length, out.byteLength);
      if (dictPos + 1 < out.byteLength && out[dictPos] === 0x3c && out[dictPos + 1] === 0x3c) {
        objIdAtDict.set(dictPos, objId);
      }
    }

    const indirectTargets = new Set();
    const dictRe = /<</g;
    let dm;
    while ((dm = dictRe.exec(text)) !== null) {
      const dictStart = dm.index;
      if (isInsideStreamRanges(dictStart, streamRanges)) continue;
      if (isInsidePdfLiteralOrComment(out, text, dictStart)) continue;
      const isExplicitInfo = objIdAtDict.has(dictStart);

      let depth = 0;
      let p = dictStart;
      let inStr = 0;
      let inHex = false;
      const maxDictEnd = Math.min(out.byteLength, dictStart + 65536);
      while (p < maxDictEnd) {
        const c = out[p];
        if (inStr > 0) {
          if (c === 0x5c) {
            p += 2;
            continue;
          }
          if (c === 0x28) inStr += 1;
          else if (c === 0x29) inStr -= 1;
          p += 1;
          continue;
        }
        if (inHex) {
          if (c === 0x3e) inHex = false;
          p += 1;
          continue;
        }
        if (c === 0x28) {
          inStr = 1;
          p += 1;
          continue;
        }
        if (c === 0x3c && p + 1 < maxDictEnd) {
          if (out[p + 1] === 0x3c) {
            depth += 1;
            p += 2;
            continue;
          }
          inHex = true;
          p += 1;
          continue;
        }
        if (c === 0x3e && p + 1 < maxDictEnd && out[p + 1] === 0x3e) {
          depth -= 1;
          p += 2;
          if (depth === 0) break;
          continue;
        }
        p += 1;
      }
      if (depth !== 0) continue;
      const dictEnd = p;
      const regionText = text.slice(dictStart, dictEnd);
      if (!isExplicitInfo && /\/(?:Type|Subtype)\s*\/(?:Page|Pages|Catalog|Font|XObject|Annot|StructElem|ExtGState|ColorSpace|Pattern|Shading|Action|Sig|Encrypt)\b/.test(regionText)) {
        continue;
      }
      if (!isExplicitInfo && !/\/(?:Author|Creator|Producer|Title|Subject|Keywords|CreationDate|ModDate|Company|SourceModified)\b/.test(regionText) && !regionText.includes('#')) {
        continue;
      }
      if (scrubPdfDictRegion(out, text, dictStart + 2, dictEnd - 2, isExplicitInfo, indirectTargets)) {
        modified = true;
      }
    }

    if (indirectTargets.size > 0) {
      for (const targetKey of indirectTargets) {
        const parts = targetKey.split(' ');
        const targetObjRe = new RegExp(`(?:^|[\\r\\n])\\s*${parts[0]}\\s+${parts[1]}\\s+obj\\b`, 'g');
        let tm;
        while ((tm = targetObjRe.exec(text)) !== null) {
          if (isInsideStreamRanges(tm.index, streamRanges)) continue;
          const endObjIdx = text.indexOf('endobj', tm.index + tm[0].length);
          if (endObjIdx < 0) continue;
          const res = blankPdfStringValue(out, text, tm.index + tm[0].length, endObjIdx, false, null);
          if (res.modified) {
            modified = true;
          }
        }
      }
    }

    // Fallback for plain /Key (val) entries inside non-stream regions not caught above
    const keyFallbackRe = /\/(Author|Creator|Producer|Title|Subject|Keywords|CreationDate|ModDate|Company|SourceModified)\b/g;
    let km;
    while ((km = keyFallbackRe.exec(text)) !== null) {
      if (isInsideStreamRanges(km.index, streamRanges)) continue;
      if (isInsidePdfLiteralOrComment(out, text, km.index)) continue;
      if (!hasPdfDictKeyBoundaryBefore(out, text, km.index)) continue;
      const res = blankPdfStringValue(
        out,
        text,
        km.index + km[0].length,
        Math.min(out.byteLength, km.index + km[0].length + 4096),
        false,
        null
      );
      if (res.modified) {
        modified = true;
      }
    }

    const xmpSpans = collectPdfXmpSpans(text);
    for (let i = 0; i < xmpSpans.length; i += 1) {
      if (scrubPdfXmpPacket(out, text, xmpSpans[i][0], xmpSpans[i][1])) {
        modified = true;
      }
    }

    return modified ? out : null;
  }

  // --- Deep Lossless Office OOXML ZIP Metadata Scrubber (.docx, .xlsx, .pptx) ---

  const STRIP_ZIP_EXTRA_IDS = new Set([0x5455, 0x5855, 0x7875, 0x000a]);

  function stripSensitiveZipExtra(extraBytes) {
    if (!extraBytes || extraBytes.byteLength === 0) {
      return { bytes: extraBytes, changed: false };
    }
    const view = new DataView(extraBytes.buffer, extraBytes.byteOffset, extraBytes.byteLength);
    const kept = [];
    let pos = 0;
    let changed = false;
    while (pos + 4 <= extraBytes.byteLength) {
      const headerId = view.getUint16(pos, true);
      const dataSize = view.getUint16(pos + 2, true);
      const end = pos + 4 + dataSize;
      if (end > extraBytes.byteLength) {
        // Malformed extra field — preserve verbatim to avoid breaking non-standard ZIPs.
        return { bytes: extraBytes, changed: false };
      }
      if (STRIP_ZIP_EXTRA_IDS.has(headerId)) {
        changed = true;
      } else {
        kept.push(extraBytes.subarray(pos, end));
      }
      pos = end;
    }
    if (!changed) {
      return { bytes: extraBytes, changed: false };
    }
    return { bytes: concatChunks(kept), changed: true };
  }

  /**
   * Empties child elements inside a docProps XML root tag while preserving its original
   * XML declaration and root namespace attributes (zero hardcoded namespace URLs).
   */
  function emptyXmlRootPreservingAttrs(xmlText, rootLocalPattern) {
    const declM = /^\s*(<\?xml\b[^>]*\?>)/.exec(xmlText);
    const xmlDecl = declM ? declM[1] : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    const openRe = new RegExp(`<((?:[a-zA-Z0-9_-]+:)?${rootLocalPattern})(\\s[^<>]*?)?\\s*(\\/?)>`, 'i');
    const openM = openRe.exec(xmlText);
    if (!openM) {
      return null;
    }
    const tagName = openM[1];
    const attrs = (openM[2] || '').replace(/\s+\/$/, '');
    const isSelfClosing = openM[3] === '/';
    if (isSelfClosing) {
      // Check if there are any sensitive comments outside root
      if (!xmlText.includes('<!--')) {
        return null;
      }
    }
    const nextXml = `${xmlDecl}\n<${tagName}${attrs}/>`;
    return nextXml === xmlText ? null : nextXml;
  }

  function scrubOoxmlTextEntry(lowerName, xmlText, removedThumbSet) {
    let next = xmlText;

    if (lowerName === 'docprops/core.xml') {
      return emptyXmlRootPreservingAttrs(xmlText, 'coreProperties');
    }
    if (lowerName === 'docprops/app.xml' || lowerName === 'docprops/custom.xml') {
      return emptyXmlRootPreservingAttrs(xmlText, 'Properties');
    }

    if (lowerName === '_rels/.rels' && removedThumbSet.size > 0) {
      next = next.replace(
        /<Relationship\b[^>]*\bTarget\s*=\s*(?:"\/?docProps\/thumbnail\.[^"]*"|'\/?docProps\/thumbnail\.[^']*')[^>]*?(?:\/>|>\s*<\/Relationship>)/gi,
        ''
      );
      return next === xmlText ? null : next;
    }

    if (lowerName === '[content_types].xml' && removedThumbSet.size > 0) {
      next = next.replace(
        /<Override\b[^>]*\bPartName\s*=\s*(?:"\/?docProps\/thumbnail\.[^"]*"|'\/?docProps\/thumbnail\.[^']*')[^>]*?(?:\/>|>\s*<\/Override>)/gi,
        ''
      );
      return next === xmlText ? null : next;
    }

    // Word document, headers, footers, footnotes, endnotes: anonymize track changes & strip rsid fingerprints
    if (
      lowerName === 'word/document.xml' ||
      /^word\/(?:header|footer)\d*\.xml$/.test(lowerName) ||
      lowerName === 'word/footnotes.xml' ||
      lowerName === 'word/endnotes.xml'
    ) {
      next = next
        .replace(/\b(w:author\s*=\s*)(?:"[^"]*"|'[^']*')/gi, '$1""')
        .replace(/\s+\bw:date\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        .replace(/\s+\bw15:userId\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        .replace(/\s+\bw16cid:durableId\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        .replace(/\s+\bw:rsid(?:R|RPr|RDefault|P|Del|Tr|Sect|SectPr)?\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
      return next === xmlText ? null : next;
    }

    // Word comments & people metadata
    if (/^word\/comments[a-z0-9_-]*\.xml$/.test(lowerName) || lowerName === 'word/people.xml') {
      next = next
        .replace(/\b(w:author\s*=\s*)(?:"[^"]*"|'[^']*')/gi, '$1""')
        .replace(/\b(w:initials\s*=\s*)(?:"[^"]*"|'[^']*')/gi, '$1""')
        .replace(/\b(w15:author\s*=\s*)(?:"[^"]*"|'[^']*')/gi, '$1""')
        .replace(/\s+\bw:date\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        .replace(/\s+\bw16cex:dateUtc\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        .replace(/\s+\bw15:userId\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        .replace(/\s+\bw15:providerId\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
      return next === xmlText ? null : next;
    }

    // Word settings: remove rsid session history
    if (lowerName === 'word/settings.xml') {
      next = next
        .replace(/<w:rsids\b[^>]*>[\s\S]*?<\/w:rsids>/gi, '')
        .replace(/<w:rsids\b[^>]*\/>/gi, '')
        .replace(/<w:rsidRoot\b[^>]*\/>/gi, '');
      return next === xmlText ? null : next;
    }

    // Word settings rels: scrub local filesystem paths in external attachedTemplate links
    if (lowerName === 'word/_rels/settings.xml.rels') {
      next = next.replace(
        /(<Relationship\b[^>]*\bTarget\s*=\s*)(?:"([^"]*)"|'([^']*)')([^>]*>)/gi,
        (full, pre, dq, sq, post) => {
          const target = dq !== undefined ? dq : sq || '';
          const lowerT = target.trim().toLowerCase();
          const isLocalLeak =
            lowerT.startsWith('file:') ||
            /^[a-z]:[\\/]/.test(lowerT) ||
            lowerT.startsWith('\\\\') ||
            lowerT.startsWith('/users/') ||
            lowerT.startsWith('/home/');
          if (!isLocalLeak) {
            return full;
          }
          return `${pre}""${post}`;
        }
      );
      return next === xmlText ? null : next;
    }

    // Excel workbook: strip absPath local folder leak & fileSharing userName / edit metadata
    if (lowerName === 'xl/workbook.xml') {
      next = next
        .replace(/<[a-zA-Z0-9_-]+:absPath\b[^>]*\/>/gi, '')
        .replace(/<[a-zA-Z0-9_-]+:absPath\b[^>]*>[\s\S]*?<\/[a-zA-Z0-9_-]+:absPath>/gi, '')
        .replace(
          /<fileSharing\b[^>]*\/?>/gi,
          (tag) => tag.replace(/\s+\buserName\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        )
        .replace(
          /<fileVersion\b[^>]*\/?>/gi,
          (tag) =>
            tag
              .replace(/\s+\blastEdited\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
              .replace(/\s+\blowestEdited\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
              .replace(/\s+\brupBuild\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        );
      return next === xmlText ? null : next;
    }

    // Excel comments, threadedComments, persons
    if (/^xl\/comments\d*\.xml$/.test(lowerName)) {
      next = next.replace(/<author\b[^>]*>[^<]*<\/author>/gi, '<author/>');
      return next === xmlText ? null : next;
    }
    if (/^xl\/(?:threadedcomments|persons)\/[^/]+\.xml$/.test(lowerName)) {
      next = next
        .replace(/\b(displayName\s*=\s*)(?:"[^"]*"|'[^']*')/gi, '$1""')
        .replace(/\b(userId\s*=\s*)(?:"[^"]*"|'[^']*')/gi, '$1""')
        .replace(/\s+\bdT\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
      return next === xmlText ? null : next;
    }

    // PowerPoint commentAuthors, comments, presentation
    if (lowerName === 'ppt/commentauthors.xml') {
      next = next
        .replace(/\b(name\s*=\s*)(?:"[^"]*"|'[^']*')/gi, '$1""')
        .replace(/\b(initials\s*=\s*)(?:"[^"]*"|'[^']*')/gi, '$1""');
      return next === xmlText ? null : next;
    }
    if (/^ppt\/comments\/[^/]+\.xml$/.test(lowerName)) {
      next = next.replace(/\s+\bdt\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
      return next === xmlText ? null : next;
    }
    if (lowerName === 'ppt/presentation.xml') {
      next = next.replace(/\s+\blastModifiedBy\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
      return next === xmlText ? null : next;
    }

    return null;
  }

  function isOfficeXmlTarget(lowerName, hasRemovedThumb) {
    if (
      lowerName === 'docprops/core.xml' ||
      lowerName === 'docprops/app.xml' ||
      lowerName === 'docprops/custom.xml' ||
      lowerName === 'word/document.xml' ||
      lowerName === 'word/footnotes.xml' ||
      lowerName === 'word/endnotes.xml' ||
      lowerName === 'word/people.xml' ||
      lowerName === 'word/settings.xml' ||
      lowerName === 'word/_rels/settings.xml.rels' ||
      lowerName === 'xl/workbook.xml' ||
      lowerName === 'ppt/commentauthors.xml' ||
      lowerName === 'ppt/presentation.xml'
    ) {
      return true;
    }
    if (hasRemovedThumb && (lowerName === '_rels/.rels' || lowerName === '[content_types].xml')) {
      return true;
    }
    if (
      /^word\/(?:header|footer)\d*\.xml$/.test(lowerName) ||
      /^word\/comments[a-z0-9_-]*\.xml$/.test(lowerName) ||
      /^xl\/comments\d*\.xml$/.test(lowerName) ||
      /^xl\/(?:threadedcomments|persons)\/[^/]+\.xml$/.test(lowerName) ||
      /^ppt\/comments\/[^/]+\.xml$/.test(lowerName)
    ) {
      return true;
    }
    return false;
  }

  function detectEmbeddedMediaFormat(lowerName) {
    if (!/^(?:word|xl|ppt)\/media\/[^/]+$/.test(lowerName)) {
      return null;
    }
    if (/\.jpe?g$/.test(lowerName)) return 'jpeg';
    if (lowerName.endsWith('.png')) return 'png';
    if (lowerName.endsWith('.webp')) return 'webp';
    if (lowerName.endsWith('.gif')) return 'gif';
    return null;
  }

  async function scrubOfficeZipBytes(bytes) {
    if (!bytes || bytes.byteLength < 22 || bytes.byteLength > MAX_OFFICE_BYTES) {
      return null;
    }
    if (!utf8Encoder || !utf8Decoder) {
      return null;
    }
    // Reject OLE2 CFBF (encrypted Office or legacy .doc/.xls/.ppt) and non-ZIP files immediately.
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b || bytes[2] !== 0x03 || bytes[3] !== 0x04) {
      return null;
    }

    const len = bytes.byteLength;
    const view = new DataView(bytes.buffer, bytes.byteOffset, len);

    // Find End of Central Directory (EOCD) scanning backwards
    const minEocd = Math.max(0, len - 65557);
    let eocdPos = -1;
    for (let p = len - 22; p >= minEocd; p -= 1) {
      if (
        bytes[p] === 0x50 &&
        bytes[p + 1] === 0x4b &&
        bytes[p + 2] === 0x05 &&
        bytes[p + 3] === 0x06
      ) {
        const commentLen = view.getUint16(p + 20, true);
        if (p + 22 + commentLen === len) {
          eocdPos = p;
          break;
        }
      }
    }
    if (eocdPos < 0) {
      return null;
    }

    const diskNum = view.getUint16(eocdPos + 4, true);
    const cdDisk = view.getUint16(eocdPos + 6, true);
    const diskEntries = view.getUint16(eocdPos + 8, true);
    const totalEntries = view.getUint16(eocdPos + 10, true);
    const cdSize = view.getUint32(eocdPos + 12, true);
    const cdOffset = view.getUint32(eocdPos + 16, true);
    const zipCommentLen = view.getUint16(eocdPos + 20, true);

    // Reject multi-disk or ZIP64 archives safely
    if (
      diskNum !== 0 ||
      cdDisk !== 0 ||
      diskEntries !== totalEntries ||
      totalEntries === 0 ||
      totalEntries === 0xffff ||
      totalEntries > MAX_OFFICE_ENTRIES ||
      cdSize === 0xffffffff ||
      cdOffset === 0xffffffff ||
      cdOffset + cdSize > eocdPos
    ) {
      return null;
    }
    if (eocdPos >= 20 && view.getUint32(eocdPos - 20, true) === 0x07064b50) {
      return null;
    }

    const entries = [];
    let hasContentTypes = false;
    let hasOfficeRoot = false;
    const removedThumbSet = new Set();
    let cdPos = cdOffset;

    for (let i = 0; i < totalEntries; i += 1) {
      if (cdPos + 46 > cdOffset + cdSize) {
        return null;
      }
      if (view.getUint32(cdPos, true) !== 0x02014b50) {
        return null;
      }
      const versionMadeBy = view.getUint16(cdPos + 4, true);
      const versionNeeded = view.getUint16(cdPos + 6, true);
      const flags = view.getUint16(cdPos + 8, true);
      const method = view.getUint16(cdPos + 10, true);
      const dosTime = view.getUint16(cdPos + 12, true);
      const dosDate = view.getUint16(cdPos + 14, true);
      const crc32 = view.getUint32(cdPos + 16, true);
      const compSize = view.getUint32(cdPos + 20, true);
      const uncompSize = view.getUint32(cdPos + 24, true);
      const nameLen = view.getUint16(cdPos + 28, true);
      const extraLen = view.getUint16(cdPos + 30, true);
      const commentLen = view.getUint16(cdPos + 32, true);
      const diskStart = view.getUint16(cdPos + 34, true);
      const intAttr = view.getUint16(cdPos + 36, true);
      const extAttr = view.getUint32(cdPos + 38, true);
      const localOffset = view.getUint32(cdPos + 42, true);

      const entryEnd = cdPos + 46 + nameLen + extraLen + commentLen;
      if (entryEnd > cdOffset + cdSize || diskStart !== 0) {
        return null;
      }
      // Reject encrypted entries cleanly
      if ((flags & 0x0001) !== 0) {
        return null;
      }
      if (localOffset + 30 > cdOffset || view.getUint32(localOffset, true) !== 0x04034b50) {
        return null;
      }
      const lfhNameLen = view.getUint16(localOffset + 26, true);
      const lfhExtraLen = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + lfhNameLen + lfhExtraLen;
      const dataEnd = dataStart + compSize;
      if (dataEnd > cdOffset) {
        return null;
      }

      const nameBytes = bytes.subarray(cdPos + 46, cdPos + 46 + nameLen);
      const cdExtraBytes = bytes.subarray(cdPos + 46 + nameLen, cdPos + 46 + nameLen + extraLen);
      const lfhExtraBytes = bytes.subarray(localOffset + 30 + lfhNameLen, dataStart);
      const nameStr = utf8Decoder.decode(nameBytes);
      const lowerName = nameStr.replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase();

      if (lowerName === '[content_types].xml') {
        hasContentTypes = true;
      } else if (
        lowerName.startsWith('word/') ||
        lowerName.startsWith('xl/') ||
        lowerName.startsWith('ppt/')
      ) {
        hasOfficeRoot = true;
      }

      const isThumbnail =
        !lowerName.includes('..') &&
        /^docprops\/thumbnail\.(?:jpe?g|png|wmf|emf|gif|bmp)$/.test(lowerName);
      if (isThumbnail) {
        removedThumbSet.add(lowerName);
      }

      entries.push({
        versionMadeBy,
        versionNeeded,
        flags,
        method,
        dosTime,
        dosDate,
        crc32,
        compSize,
        uncompSize,
        commentLen,
        intAttr,
        extAttr,
        nameBytes,
        cdExtraBytes,
        lfhExtraBytes,
        lowerName,
        isThumbnail,
        dataStart,
        dataEnd,
      });
      cdPos = entryEnd;
    }

    if (!hasContentTypes || !hasOfficeRoot) {
      return null;
    }

    const hasRemovedThumb = removedThumbSet.size > 0;
    let modified = hasRemovedThumb || zipCommentLen > 0;
    const outEntries = [];

    for (let i = 0; i < entries.length; i += 1) {
      const e = entries[i];
      if (e.isThumbnail) {
        modified = true;
        continue;
      }

      let outMethod = e.method;
      let outFlags = e.flags & ~0x0008; // Always write authoritative LFH sizes/CRC (no Data Descriptor)
      let outCrc32 = e.crc32;
      let outCompBytes = bytes.subarray(e.dataStart, e.dataEnd);
      let outUncompSize = e.uncompSize;

      const cleanCdExtra = stripSensitiveZipExtra(e.cdExtraBytes);
      const cleanLfhExtra = stripSensitiveZipExtra(e.lfhExtraBytes);
      if (
        cleanCdExtra.changed ||
        cleanLfhExtra.changed ||
        e.commentLen > 0 ||
        e.dosTime !== ZIP_DOS_TIME_ZERO ||
        e.dosDate !== ZIP_DOS_DATE_EPOCH
      ) {
        modified = true;
      }

      const safePath = !e.lowerName.includes('..');
      if (safePath && (e.method === 0 || e.method === 8)) {
        if (isOfficeXmlTarget(e.lowerName, hasRemovedThumb)) {
          if (e.uncompSize <= MAX_OFFICE_XML_UNCOMPRESSED) {
            try {
              const rawXmlBytes =
                e.method === 0
                  ? outCompBytes
                  : await transformDeflateRaw(outCompBytes, false, MAX_OFFICE_XML_UNCOMPRESSED);
              const xmlText = utf8Decoder.decode(rawXmlBytes);
              const scrubbedXml = scrubOoxmlTextEntry(e.lowerName, xmlText, removedThumbSet);
              if (scrubbedXml !== null) {
                const newRawBytes = utf8Encoder.encode(scrubbedXml);
                outCrc32 = computeCrc32(newRawBytes);
                outUncompSize = newRawBytes.byteLength;
                if (e.method === 8 && newRawBytes.byteLength > 0) {
                  const deflated = await transformDeflateRaw(newRawBytes, true, 0);
                  if (deflated.byteLength < newRawBytes.byteLength) {
                    outMethod = 8;
                    outCompBytes = deflated;
                  } else {
                    outMethod = 0;
                    outCompBytes = newRawBytes;
                  }
                } else {
                  outMethod = 0;
                  outCompBytes = newRawBytes;
                }
                modified = true;
              }
            } catch {
              // On stream or size-limit error, keep original compressed entry verbatim (fail safe).
            }
          }
        } else {
          const mediaFmt = detectEmbeddedMediaFormat(e.lowerName);
          if (mediaFmt && e.uncompSize <= MAX_OFFICE_MEDIA_UNCOMPRESSED) {
            try {
              const rawMediaBytes =
                e.method === 0
                  ? outCompBytes
                  : await transformDeflateRaw(outCompBytes, false, MAX_OFFICE_MEDIA_UNCOMPRESSED);
              let scrubbedMedia = null;
              if (mediaFmt === 'jpeg') scrubbedMedia = scrubJpegBytes(rawMediaBytes);
              else if (mediaFmt === 'png') scrubbedMedia = scrubPngBytes(rawMediaBytes);
              else if (mediaFmt === 'webp') scrubbedMedia = scrubWebpBytes(rawMediaBytes);
              else if (mediaFmt === 'gif') scrubbedMedia = scrubGifBytes(rawMediaBytes);

              if (scrubbedMedia) {
                outCrc32 = computeCrc32(scrubbedMedia);
                outUncompSize = scrubbedMedia.byteLength;
                if (e.method === 8 && scrubbedMedia.byteLength > 0) {
                  const deflated = await transformDeflateRaw(scrubbedMedia, true, 0);
                  if (deflated.byteLength < scrubbedMedia.byteLength) {
                    outMethod = 8;
                    outCompBytes = deflated;
                  } else {
                    outMethod = 0;
                    outCompBytes = scrubbedMedia;
                  }
                } else {
                  outMethod = 0;
                  outCompBytes = scrubbedMedia;
                }
                modified = true;
              }
            } catch {
              // On stream or size-limit error, preserve embedded media verbatim.
            }
          }
        }
      }

      outEntries.push({
        versionMadeBy: e.versionMadeBy,
        versionNeeded: e.versionNeeded,
        flags: outFlags,
        method: outMethod,
        crc32: outCrc32,
        compBytes: outCompBytes,
        uncompSize: outUncompSize,
        intAttr: e.intAttr,
        extAttr: e.extAttr,
        nameBytes: e.nameBytes,
        cdExtraBytes: cleanCdExtra.bytes,
        lfhExtraBytes: cleanLfhExtra.bytes,
      });
    }

    if (!modified) {
      return null;
    }

    // Reconstruct clean ZIP archive in a single contiguous Uint8Array
    let totalBytes = 22; // EOCD
    for (let i = 0; i < outEntries.length; i += 1) {
      const oe = outEntries[i];
      totalBytes +=
        30 + oe.nameBytes.byteLength + oe.lfhExtraBytes.byteLength + oe.compBytes.byteLength;
      totalBytes += 46 + oe.nameBytes.byteLength + oe.cdExtraBytes.byteLength;
    }

    const out = new Uint8Array(totalBytes);
    const outView = new DataView(out.buffer);
    let offset = 0;
    const localOffsets = new Uint32Array(outEntries.length);

    for (let i = 0; i < outEntries.length; i += 1) {
      const oe = outEntries[i];
      localOffsets[i] = offset;
      outView.setUint32(offset, 0x04034b50, true);
      outView.setUint16(offset + 4, oe.versionNeeded, true);
      outView.setUint16(offset + 6, oe.flags, true);
      outView.setUint16(offset + 8, oe.method, true);
      outView.setUint16(offset + 10, ZIP_DOS_TIME_ZERO, true);
      outView.setUint16(offset + 12, ZIP_DOS_DATE_EPOCH, true);
      outView.setUint32(offset + 14, oe.crc32, true);
      outView.setUint32(offset + 18, oe.compBytes.byteLength, true);
      outView.setUint32(offset + 22, oe.uncompSize, true);
      outView.setUint16(offset + 26, oe.nameBytes.byteLength, true);
      outView.setUint16(offset + 28, oe.lfhExtraBytes.byteLength, true);
      offset += 30;
      out.set(oe.nameBytes, offset);
      offset += oe.nameBytes.byteLength;
      if (oe.lfhExtraBytes.byteLength > 0) {
        out.set(oe.lfhExtraBytes, offset);
        offset += oe.lfhExtraBytes.byteLength;
      }
      if (oe.compBytes.byteLength > 0) {
        out.set(oe.compBytes, offset);
        offset += oe.compBytes.byteLength;
      }
    }

    const newCdOffset = offset;
    for (let i = 0; i < outEntries.length; i += 1) {
      const oe = outEntries[i];
      outView.setUint32(offset, 0x02014b50, true);
      outView.setUint16(offset + 4, oe.versionMadeBy, true);
      outView.setUint16(offset + 6, oe.versionNeeded, true);
      outView.setUint16(offset + 8, oe.flags, true);
      outView.setUint16(offset + 10, oe.method, true);
      outView.setUint16(offset + 12, ZIP_DOS_TIME_ZERO, true);
      outView.setUint16(offset + 14, ZIP_DOS_DATE_EPOCH, true);
      outView.setUint32(offset + 16, oe.crc32, true);
      outView.setUint32(offset + 20, oe.compBytes.byteLength, true);
      outView.setUint32(offset + 24, oe.uncompSize, true);
      outView.setUint16(offset + 28, oe.nameBytes.byteLength, true);
      outView.setUint16(offset + 30, oe.cdExtraBytes.byteLength, true);
      outView.setUint16(offset + 32, 0, true); // commentLen = 0
      outView.setUint16(offset + 34, 0, true); // diskStart = 0
      outView.setUint16(offset + 36, oe.intAttr, true);
      outView.setUint32(offset + 38, oe.extAttr, true);
      outView.setUint32(offset + 42, localOffsets[i], true);
      offset += 46;
      out.set(oe.nameBytes, offset);
      offset += oe.nameBytes.byteLength;
      if (oe.cdExtraBytes.byteLength > 0) {
        out.set(oe.cdExtraBytes, offset);
        offset += oe.cdExtraBytes.byteLength;
      }
    }

    const newCdSize = offset - newCdOffset;
    outView.setUint32(offset, 0x06054b50, true);
    outView.setUint16(offset + 4, 0, true);
    outView.setUint16(offset + 6, 0, true);
    outView.setUint16(offset + 8, outEntries.length, true);
    outView.setUint16(offset + 10, outEntries.length, true);
    outView.setUint32(offset + 12, newCdSize, true);
    outView.setUint32(offset + 16, newCdOffset, true);
    outView.setUint16(offset + 20, 0, true);

    return out;
  }

  // --- Large SVG Linear Pre-Scrubber (Offloads XML metadata/comment stripping to Worker) ---

  function scrubSvgBytesLinear(bytes) {
    if (!bytes || bytes.byteLength === 0 || bytes.byteLength > MAX_SVG_BYTES || !utf8Decoder || !utf8Encoder) {
      return null;
    }
    const text = utf8Decoder.decode(bytes);
    if (!/<svg\b/i.test(text)) {
      return null;
    }
    let next = text
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<(?:[a-zA-Z0-9_-]+:)?metadata\b[^>]*>[\s\S]*?<\/(?:[a-zA-Z0-9_-]+:)?metadata>/gi, '')
      .replace(/<(?:[a-zA-Z0-9_-]+:)?metadata\b[^>]*\/>/gi, '')
      .replace(/<(?:sodipodi|inkscape|rdf|cc|dc):[a-zA-Z0-9_-]+\b[^>]*>[\s\S]*?<\/(?:sodipodi|inkscape|rdf|cc|dc):[a-zA-Z0-9_-]+>/gi, '')
      .replace(/<(?:sodipodi|inkscape|rdf|cc|dc):[a-zA-Z0-9_-]+\b[^>]*\/>/gi, '')
      .replace(/\s+\b(?:inkscape|sodipodi):[a-zA-Z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
    if (next === text) {
      return null;
    }
    return utf8Encoder.encode(next);
  }

  globalThis.ClipZeroScrubber = Object.freeze({
    scrubJpegBytes,
    scrubPngBytes,
    scrubWebpBytes,
    scrubGifBytes,
    scrubPdfBytes,
    scrubOfficeZipBytes,
    scrubSvgBytesLinear,
    computeCrc32,
  });

  // Dedicated Web Worker message handler (Transferable ArrayBuffer zero-copy path)
  if (
    typeof self !== 'undefined' &&
    typeof self.postMessage === 'function' &&
    typeof window === 'undefined'
  ) {
    self.onmessage = async (event) => {
      const data = event && event.data;
      if (!data || typeof data.id !== 'number' || typeof data.op !== 'string') {
        return;
      }
      const { id, op, buffer } = data;
      if (!(buffer instanceof ArrayBuffer)) {
        self.postMessage({ id, ok: false, error: 'invalid-buffer' });
        return;
      }
      try {
        const bytes = new Uint8Array(buffer);
        let out = null;
        if (op === 'pdf') {
          out = scrubPdfBytes(bytes, true);
        } else if (op === 'office') {
          out = await scrubOfficeZipBytes(bytes);
        } else if (op === 'svg-pre') {
          out = scrubSvgBytesLinear(bytes);
        } else {
          self.postMessage({ id, ok: false, error: 'unknown-op' });
          return;
        }
        if (out && out.byteLength > 0) {
          const outBuf =
            out.byteOffset === 0 && out.byteLength === out.buffer.byteLength
              ? out.buffer
              : out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
          self.postMessage({ id, ok: true, modified: true, buffer: outBuf }, [outBuf]);
        } else {
          self.postMessage({ id, ok: true, modified: false, buffer: null });
        }
      } catch {
        self.postMessage({ id, ok: false, error: 'scrub-error' });
      }
    };
  }
})();
