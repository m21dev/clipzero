#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
"""Standalone repository verification checks for ClipZero."""

import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPECTED_LOCALES = ("de", "en", "es", "fr", "pt_BR", "zh_CN")
EXPECTED_LOCALE_KEYS = 342
RUNTIME_JS_FILES = (
    "background.js",
    "site_match.js",
    "rules_schema.js",
    "scrubber_worker.js",
    "content.js",
    "bridge.js",
    "popup.js",
    "options.js",
    "welcome.js",
    "help.js",
)
ALL_RUNTIME_TEXT_FILES = RUNTIME_JS_FILES + (
    "popup.html",
    "popup.css",
    "options.html",
    "options.css",
    "welcome.html",
    "welcome.css",
    "help.html",
    "help.css",
)
ALLOWED_JS_URLS = {
    "http://www.w3.org/2000/svg",
    "http://ns.adobe.com/xap/1.0/",
    "https://*/*",
    "https://",
}


def read_text(rel_path):
    with open(os.path.join(ROOT, rel_path), "r", encoding="utf-8") as f:
        return f.read()


def check_manifest():
    manifest = json.loads(read_text("manifest.json"))
    assert manifest.get("manifest_version") == 3, "manifest_version must be 3"
    assert not manifest.get("permissions"), "manifest.json must declare zero API permissions"
    assert "web_accessible_resources" not in manifest, "web_accessible_resources must remain omitted"
    assert "service_worker" not in manifest.get("background", {}), "background.service_worker must be omitted"
    assert manifest.get("background", {}).get("scripts") == [
        "site_match.js",
        "rules_schema.js",
        "background.js",
    ], "background.scripts must load site_match.js and rules_schema.js before background.js"

    options_ui = manifest.get("options_ui", {})
    assert options_ui.get("page") == "options.html" and options_ui.get("open_in_tab") is True, (
        f"Invalid options_ui: {options_ui!r}"
    )

    gecko = manifest.get("browser_specific_settings", {}).get("gecko", {})
    assert gecko.get("id") == "{0985b1c5-a3bc-44fc-a2f8-5c829208c439}", "Invalid gecko.id"
    assert gecko.get("data_collection_permissions", {}).get("required") == [
        "none"
    ], "data_collection_permissions.required must be ['none']"

    hosts = manifest.get("host_permissions", [])
    cs = manifest.get("content_scripts", [])
    assert len(hosts) == 55, f"Expected 55 host_permissions, got {len(hosts)}"
    assert len(cs) == 2, "Expected 2 content_scripts entries (MAIN then ISOLATED)"
    assert cs[0].get("js") == ["content.js"] and cs[0].get("world") == "MAIN"
    assert cs[1].get("js") == ["bridge.js"] and cs[1].get("world") == "ISOLATED"

    main_matches = cs[0].get("matches", [])
    iso_matches = cs[1].get("matches", [])
    assert len(main_matches) == 55 and len(iso_matches) == 55
    for idx, pattern in enumerate(hosts):
        if "huggingface.co" in pattern:
            assert "huggingface.co/chat/*" in main_matches[idx]
            assert "huggingface.co/chat/*" in iso_matches[idx]
        else:
            assert main_matches[idx] == pattern and iso_matches[idx] == pattern, (
                f"Match mismatch at index {idx}: {pattern}"
            )

    commands = manifest.get("commands", {})
    assert len(commands) == 7, f"Expected 7 commands, got {len(commands)}"
    for cmd_name, cmd_cfg in commands.items():
        assert cmd_cfg.get("suggested_key", {}).get("default"), f"Missing suggested_key on {cmd_name}"

    csp = manifest.get("content_security_policy", {}).get("extension_pages", "")
    for directive in ("default-src 'none'", "script-src 'self'", "worker-src 'self'", "object-src 'none'"):
        assert directive in csp, f"Missing CSP directive: {directive}"

    icons = manifest.get("icons", {})
    assert set(icons.keys()) >= {"16", "32", "48", "96", "128"}, f"Missing required icon sizes: {sorted(icons.keys())}"
    for rel_icon in list(icons.values()) + list(manifest.get("action", {}).get("default_icon", {}).values()):
        assert os.path.isfile(os.path.join(ROOT, rel_icon)), f"Missing icon file: {rel_icon}"

    scripts_dir = os.path.join(ROOT, "scripts")
    if scripts_dir not in sys.path:
        sys.path.insert(0, scripts_dir)
    from package import CHROMIUM_DEFAULT_COMMANDS, build_chromium_manifest

    cr = build_chromium_manifest(manifest)
    assert cr.get("background") == {"service_worker": "background.js"}, (
        f"Invalid Chromium background: {cr.get('background')!r}"
    )
    assert cr.get("minimum_chrome_version") == "111", "Missing Chromium minimum_chrome_version"
    assert "browser_specific_settings" not in cr, "Chromium manifest must omit browser_specific_settings"
    assert cr.get("options_ui") == {"page": "options.html", "open_in_tab": True}
    cr_cmds = cr.get("commands", {})
    assert len(cr_cmds) == 7, f"Expected 7 Chromium commands, got {len(cr_cmds)}"
    cr_default_cmds = {k for k, v in cr_cmds.items() if "suggested_key" in v}
    assert cr_default_cmds == set(CHROMIUM_DEFAULT_COMMANDS) and len(cr_default_cmds) == 4, (
        f"Expected 4 Chromium default commands {sorted(CHROMIUM_DEFAULT_COMMANDS)}, got {sorted(cr_default_cmds)}"
    )

    bg_js = read_text("background.js")
    assert "importScripts('site_match.js')" in bg_js, "background.js must import site_match.js for Chromium worker"
    assert "importScripts('rules_schema.js')" in bg_js, "background.js must import rules_schema.js for Chromium worker"

    return manifest


def check_locales():
    base_keys = None
    for lang in EXPECTED_LOCALES:
        rel = os.path.join("_locales", lang, "messages.json")
        data = json.loads(read_text(rel))
        keys = set(data.keys())
        if base_keys is None:
            base_keys = keys
        assert keys == base_keys, f"Locale {lang} key mismatch vs {EXPECTED_LOCALES[0]}"
        for key, entry in data.items():
            msg = entry.get("message", "")
            assert msg.strip(), f"Empty message for {lang}:{key}"
            assert "https://" not in msg and "http://" not in msg, f"Unexpected URL in locale {lang}:{key}"
            placeholders = entry.get("placeholders")
            if placeholders:
                for ph_name, ph_obj in placeholders.items():
                    assert ph_obj.get("content") == "$1", f"Unexpected placeholder in {lang}:{key}:{ph_name}"
                    assert f"${ph_name.upper()}$" in msg or f"${ph_name}$" in msg, (
                        f"Missing placeholder token ${ph_name}$ in {lang}:{key}"
                    )
    assert len(base_keys) == EXPECTED_LOCALE_KEYS, (
        f"Expected {EXPECTED_LOCALE_KEYS} locale keys, got {len(base_keys)}"
    )


def check_security_static(manifest_version):
    forbidden_sinks = (
        r"\.innerHTML\b",
        r"\.outerHTML\b",
        r"\.insertAdjacentHTML\s*\(",
        r"\bdocument\.write\s*\(",
        r"\beval\s*\(",
        r"\bnew\s+Function\s*\(",
        r"\bfetch\s*\(",
        r"\bXMLHttpRequest\b",
        r"\bWebSocket\b",
    )
    for rel in ALL_RUNTIME_TEXT_FILES:
        src = read_text(rel)
        for pat in forbidden_sinks:
            assert not re.search(pat, src), f"Forbidden pattern {pat!r} found in {rel}"

    for rel in RUNTIME_JS_FILES:
        src = read_text(rel)
        urls = set(re.findall(r"https?://[^\s'\"`<>)]*", src))
        bad_urls = sorted(u for u in urls if u not in ALLOWED_JS_URLS)
        assert not bad_urls, f"Unexpected literal URL(s) in {rel}: {bad_urls}"

    popup_html = read_text("popup.html")
    assert f'<span class="version">{manifest_version}</span>' in popup_html, (
        f"popup.html version span must match manifest version {manifest_version}"
    )
    assert 'href="https://github.com/sponsors/m21dev"' in popup_html
    assert 'target="_blank"' in popup_html and 'rel="noopener noreferrer"' in popup_html
    adv_pos = popup_html.index('id="panel-advanced"')
    sponsor_pos = popup_html.index('id="sponsor-link"')
    close_adv_pos = popup_html.index("</section>", adv_pos)
    assert adv_pos < sponsor_pos < close_adv_pos, "Sponsor link must remain inside #panel-advanced"

    options_html = read_text("options.html")
    assert f'<span class="version">{manifest_version}</span>' in options_html, (
        f"options.html version span must match manifest version {manifest_version}"
    )

    welcome_html = read_text("welcome.html")
    assert f'<span class="version">{manifest_version}</span>' in welcome_html, (
        f"welcome.html version span must match manifest version {manifest_version}"
    )

    help_html = read_text("help.html")
    assert f'<span class="version">{manifest_version}</span>' in help_html, (
        f"help.html version span must match manifest version {manifest_version}"
    )

    content_js = read_text("content.js")
    assert "renderPixelatedBox" in content_js and "redactModePixel" in content_js, "Pixelate mode missing"
    assert "isInstanceSuperseded" not in content_js, "Legacy supersede state must not be present"
    assert "REDACT_WEIGHTS" in content_js and ":host{all:initial" in content_js, (
        "Closed shadow CSS reset or stroke weight table missing"
    )
    assert "storageSet" not in content_js and "nativeStorageSetItem" not in content_js, (
        "content.js must never write site preferences to host localStorage"
    )
    assert not re.search(r"\bnew\s+(?:DataView|Uint8Array)\s*\(", content_js), (
        "content.js must use NativeDataView / NativeUint8Array captures"
    )
    assert "stripOfficeZipBytes" in content_js and "getSessionTokensSnapshot" in content_js, (
        "v1.4.0 Office scrubber or Token Inspector missing in content.js"
    )

    worker_js = read_text("scrubber_worker.js")
    assert "scrubOfficeZipBytes" in worker_js and "scrubPdfBytes" in worker_js, (
        "scrubber_worker.js missing core scrubbers"
    )
    rules_js = read_text("rules_schema.js")
    assert "isSafeRegexPattern" in rules_js and "parseImportPayload" in rules_js, (
        "rules_schema.js missing ReDoS or JSON import guards"
    )

    bridge_js = read_text("bridge.js")
    assert "sender.id !== ext.runtime.id || sender.tab" in bridge_js, (
        "bridge.js must enforce strict sender validation on runtime.onMessage"
    )
    bg_js = read_text("background.js")
    assert "clipzero_prefs_db" in bg_js and "getVerifiedSenderOrigin" in bg_js, (
        "background.js must isolate site prefs in IndexedDB per verified origin"
    )
    assert "details?.reason === 'install'" in bg_js and "welcome.html" in bg_js, (
        "background.js must open welcome.html strictly on first install"
    )


def check_js_syntax():
    node = shutil.which("node")
    if not node:
        print("INFO: node not found in PATH; skipping node --check")
        return False
    for rel in RUNTIME_JS_FILES:
        res = subprocess.run([node, "--check", os.path.join(ROOT, rel)], capture_output=True, text=True)
        assert res.returncode == 0, f"Syntax error in {rel}: {res.stderr}"
    return True


def main():
    manifest = check_manifest()
    check_locales()
    check_security_static(manifest["version"])
    js_checked = check_js_syntax()
    print(
        f"OK: ClipZero v{manifest['version']} verified "
        f"(55 hosts, 0 API perms, 6 locales x {EXPECTED_LOCALE_KEYS} keys, 0 sinks, node_syntax={js_checked})."
    )


if __name__ == "__main__":
    main()
