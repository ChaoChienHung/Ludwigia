"""Guards for the shared page shell (theme / palette preload).

The theme bootstrap used to be copied inline into every page. It now lives in
`core/theme-preload.js`; these tests keep it from drifting back into copies and
keep its palette list aligned with `palette-tokens.css`.
"""

import os
import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PRELOAD = REPO_ROOT / "core" / "theme-preload.js"
SKIP_PARTS = {"node_modules", ".git", "portals", "temp"}


def _site_pages():
    for path in REPO_ROOT.rglob("*.html"):
        rel = path.relative_to(REPO_ROOT)
        if SKIP_PARTS.intersection(rel.parts):
            continue
        yield rel, path.read_text(encoding="utf-8")


class TestPageShell(unittest.TestCase):

    def test_no_inline_theme_bootstrap_copies(self):
        offenders = [str(rel) for rel, text in _site_pages() if "site_palette_v1" in text]
        self.assertEqual(offenders, [], "use core/theme-preload.js instead of an inline theme script")

    def test_preload_is_resolvable_and_runs_before_styles(self):
        problems = []
        for rel, text in _site_pages():
            head = text.split("</head>", 1)[0]
            match = re.search(r'<script src="([^"?]*core/theme-preload\.js)[^"]*"></script>', head)
            if not match:
                continue
            src = match.group(1)
            if "{{REPO_PREFIX}}" not in src:
                target = os.path.normpath(os.path.join(REPO_ROOT, os.path.dirname(rel), src))
                if not os.path.isfile(target):
                    problems.append(f"{rel}: {src} does not resolve")
            first_style = head.find('rel="stylesheet"')
            if first_style != -1 and first_style < match.start():
                problems.append(f"{rel}: theme preload must come before the first stylesheet")
        self.assertEqual(problems, [])

    def test_pages_using_site_styles_load_the_preload(self):
        missing = []
        for rel, text in _site_pages():
            head = text.split("</head>", 1)[0]
            uses_site_css = "assets/css/style.css" in head or "assets/css/content-page/shared.css" in head
            if uses_site_css and "core/theme-preload.js" not in head:
                missing.append(str(rel))
        self.assertEqual(missing, [])

    def test_preload_palettes_match_palette_tokens(self):
        tokens = (REPO_ROOT / "assets" / "css" / "site" / "palette-tokens.css").read_text(encoding="utf-8")
        token_palettes = set(re.findall(r"\.palette-([a-z][a-z0-9-]*)", tokens))
        preload = PRELOAD.read_text(encoding="utf-8")
        block = re.search(r"PALETTES = new Set\(\[(.*?)\]\)", preload, re.S)
        self.assertIsNotNone(block)
        preload_palettes = set(re.findall(r'"([a-z0-9-]+)"', block.group(1)))
        self.assertEqual(preload_palettes, token_palettes)

    def test_preload_keeps_legacy_theme_alias(self):
        preload = PRELOAD.read_text(encoding="utf-8")
        self.assertIn('["galaxy-night", "deep-sea-theme"]', preload)


if __name__ == "__main__":
    unittest.main()
