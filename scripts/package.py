#!/usr/bin/env python3
"""Package clean runtime ClipZero extension files into dist/clipzero-<version>.zip."""

import hashlib
import json
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUNTIME_FILES = (
    "LICENSE",
    "README.md",
    "background.js",
    "bridge.js",
    "content.js",
    "manifest.json",
    "popup.css",
    "popup.html",
    "popup.js",
    "site_match.js",
)
RUNTIME_DIRS = ("icons", "_locales")


def collect_files():
    items = []
    for rel in RUNTIME_FILES:
        full = os.path.join(ROOT, rel)
        if not os.path.isfile(full):
            raise FileNotFoundError(f"Missing required runtime file: {rel}")
        items.append((rel, full))
    for d in RUNTIME_DIRS:
        base = os.path.join(ROOT, d)
        for cur, _, filenames in os.walk(base):
            for fn in filenames:
                full = os.path.join(cur, fn)
                rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
                items.append((rel, full))
    items.sort(key=lambda x: x[0])
    return items


def main():
    with open(os.path.join(ROOT, "manifest.json"), "r", encoding="utf-8") as f:
        version = json.load(f)["version"]

    dist_dir = os.path.join(ROOT, "dist")
    os.makedirs(dist_dir, exist_ok=True)
    out_zip = os.path.join(dist_dir, f"clipzero-{version}.zip")

    files = collect_files()
    with zipfile.ZipFile(out_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel, full in files:
            zf.write(full, arcname=rel)

    with zipfile.ZipFile(out_zip, "r") as zf:
        bad = zf.testzip()
        if bad is not None:
            raise RuntimeError(f"ZIP CRC failure on entry: {bad}")

    sha = hashlib.sha256(open(out_zip, "rb").read()).hexdigest()
    print(f"Built {out_zip} ({os.path.getsize(out_zip)} bytes, {len(files)} files)")
    print(f"SHA-256: {sha}")


if __name__ == "__main__":
    main()
