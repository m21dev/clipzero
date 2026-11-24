#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
"""Package clean runtime ClipZero builds for Firefox MV3 and Chromium MV3 inside dist/."""

import copy
import hashlib
import json
import os
import shutil
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUNTIME_FILES = (
    "LICENSE",
    "README.md",
    "manifest.json",
)
RUNTIME_DIRS = ("icons", "_locales", "src")
CHROMIUM_DEFAULT_COMMANDS = frozenset(
    ("toggle-enabled", "toggle-exif", "toggle-redact", "toggle-secrets")
)


def build_chromium_manifest(ff_manifest):
    """Transform Firefox MV3 manifest.json into a Chromium MV3 manifest (<= 4 suggested keys)."""
    manifest = copy.deepcopy(ff_manifest)
    manifest["minimum_chrome_version"] = "111"
    manifest["background"] = {"service_worker": "src/background/background.js"}
    manifest.pop("browser_specific_settings", None)

    cmds = manifest.get("commands")
    if isinstance(cmds, dict):
        new_cmds = {}
        for cmd_name, cmd_cfg in cmds.items():
            entry = copy.deepcopy(cmd_cfg) if isinstance(cmd_cfg, dict) else {}
            if cmd_name not in CHROMIUM_DEFAULT_COMMANDS:
                entry.pop("suggested_key", None)
            new_cmds[cmd_name] = entry
        manifest["commands"] = new_cmds
    return manifest


def collect_runtime_entries():
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


def write_unpacked_target(target_dir, entries, manifest_override=None):
    if os.path.isdir(target_dir):
        shutil.rmtree(target_dir)
    os.makedirs(target_dir, exist_ok=True)
    for rel, full in entries:
        dst = os.path.join(target_dir, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if rel == "manifest.json" and manifest_override is not None:
            with open(dst, "w", encoding="utf-8", newline="\n") as f:
                json.dump(manifest_override, f, indent=2, ensure_ascii=False)
                f.write("\n")
        else:
            shutil.copy2(full, dst)


def zip_directory(src_dir, out_zip):
    rel_files = []
    for cur, _, filenames in os.walk(src_dir):
        for fn in filenames:
            full = os.path.join(cur, fn)
            rel = os.path.relpath(full, src_dir).replace(os.sep, "/")
            rel_files.append((rel, full))
    rel_files.sort(key=lambda x: x[0])

    with zipfile.ZipFile(out_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel, full in rel_files:
            zf.write(full, arcname=rel)

    with zipfile.ZipFile(out_zip, "r") as zf:
        bad = zf.testzip()
        if bad is not None:
            raise RuntimeError(f"ZIP CRC failure on entry: {bad}")

    with open(out_zip, "rb") as f:
        sha = hashlib.sha256(f.read()).hexdigest()
    print(f"Built {out_zip} ({os.path.getsize(out_zip)} bytes, {len(rel_files)} files)")
    print(f"SHA-256: {sha}")
    return out_zip


def main():
    with open(os.path.join(ROOT, "manifest.json"), "r", encoding="utf-8") as f:
        ff_manifest = json.load(f)
    version = ff_manifest["version"]
    entries = collect_runtime_entries()

    dist_dir = os.path.join(ROOT, "dist")
    os.makedirs(dist_dir, exist_ok=True)

    ff_dir = os.path.join(dist_dir, "firefox")
    cr_dir = os.path.join(dist_dir, "chromium")

    write_unpacked_target(ff_dir, entries, manifest_override=None)
    cr_manifest = build_chromium_manifest(ff_manifest)
    write_unpacked_target(cr_dir, entries, manifest_override=cr_manifest)

    zip_directory(ff_dir, os.path.join(dist_dir, f"clipzero-firefox-{version}.zip"))
    zip_directory(ff_dir, os.path.join(dist_dir, f"clipzero-{version}.zip"))
    zip_directory(cr_dir, os.path.join(dist_dir, f"clipzero-chromium-{version}.zip"))


if __name__ == "__main__":
    main()
