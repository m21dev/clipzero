#!/usr/bin/env python3
"""Standalone repository verification checks for ClipZero."""

import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPECTED_LOCALES = ("de", "en", "es", "fr", "pt_BR", "zh_CN")
RUNTIME_JS_FILES = ("background.js", "site_match.js", "content.js", "bridge.js", "popup.js")
ALL_RUNTIME_TEXT_FILES = RUNTIME_JS_FILES + ("popup.html", "popup.css")


def read_text(rel_path):
    with open(os.path.join(ROOT, rel_path), "r", encoding="utf-8") as f:
        return f.read()


def check_manifest():
    manifest = json.loads(read_text("manifest.json"))
    assert manifest.get("manifest_version") == 3, "manifest_version must be 3"
    assert not manifest.get("permissions"), "manifest.json must declare zero API permissions"
    assert "service_worker" not in manifest.get("background", {}), "background.service_worker must be omitted"
    assert manifest.get("background", {}).get("scripts") == [
        "site_match.js",
        "background.js",
    ], "background.scripts must load site_match.js before background.js"

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
    for directive in ("default-src 'none'", "script-src 'self'", "object-src 'none'"):
        assert directive in csp, f"Missing CSP directive: {directive}"

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
    assert len(base_keys) == 155, f"Expected 155 locale keys, got {len(base_keys)}"


def check_security_static(manifest_version):
    forbidden_sinks = (
        r"\.innerHTML\b",
        r"\.outerHTML\b",
        r"\.insertAdjacentHTML\s*\(",
        r"\bdocument\.write\s*\(",
        r"\beval\s*\(",
        r"\bfetch\s*\(",
        r"\bXMLHttpRequest\b",
        r"\bWebSocket\b",
    )
    for rel in ALL_RUNTIME_TEXT_FILES:
        src = read_text(rel)
        for pat in forbidden_sinks:
            assert not re.search(pat, src), f"Forbidden pattern {pat!r} found in {rel}"

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

    content_js = read_text("content.js")
    assert "renderPixelatedBox" in content_js and "redactModePixel" in content_js, "Pixelate mode missing in v1.3.2"
    assert "isInstanceSuperseded" not in content_js, "Legacy supersede state must not be present"
    assert "REDACT_WEIGHTS" in content_js and ":host{all:initial" in content_js, (
        "Closed shadow CSS reset or stroke weight table missing"
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
        f"(55 hosts, 0 API perms, 6 locales x 155 keys, 0 sinks, node_syntax={js_checked})."
    )


if __name__ == "__main__":
    main()
