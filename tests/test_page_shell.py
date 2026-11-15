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


class TestHandWrittenPageShell(unittest.TestCase):
    """Hand-written pages take their navbar/footer from pages/_shared via tools/build_pages.py."""

    @classmethod
    def setUpClass(cls):
        import importlib.util

        spec = importlib.util.spec_from_file_location("build_pages", REPO_ROOT / "tools" / "build_pages.py")
        cls.build_pages = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.build_pages)

    def test_shell_regions_are_up_to_date(self):
        stale = []
        for page in self.build_pages.HAND_WRITTEN_PAGES:
            text = (REPO_ROOT / page).read_text(encoding="utf-8")
            if self.build_pages.assemble(page, text) != text:
                stale.append(page)
        self.assertEqual(stale, [], "run `python3 cli.py build-pages`")

    def test_each_page_has_exactly_one_marked_navbar(self):
        problems = []
        for page in self.build_pages.HAND_WRITTEN_PAGES:
            text = (REPO_ROOT / page).read_text(encoding="utf-8")
            if text.count("<!-- shell:navbar -->") != 1 or text.count("<!-- /shell:navbar -->") != 1:
                problems.append(f"{page}: needs exactly one navbar region")
            if len(re.findall(r'<nav class="navbar', text)) != 1:
                problems.append(f"{page}: expected one site navbar")
        self.assertEqual(problems, [])

    def test_navbar_markup_is_balanced_and_links_resolve(self):
        problems = []
        for page in self.build_pages.HAND_WRITTEN_PAGES:
            body = self.build_pages.render_section("navbar", page)
            for tag in ("div", "ul", "li", "a", "nav", "button"):
                opened = len(re.findall(rf"<{tag}[\s>]", body))
                closed = body.count(f"</{tag}>")
                if opened != closed:
                    problems.append(f"{page}: <{tag}> {opened} opened vs {closed} closed")
            for href in re.findall(r'(?:href|src)="([^"#?]+)', body):
                if href.startswith(("http:", "https:", "mailto:")):
                    continue
                target = os.path.normpath(os.path.join(REPO_ROOT, os.path.dirname(page), href))
                if not os.path.exists(target):
                    problems.append(f"{page}: {href} does not resolve")
            if "mobile-note-nav-btn" in body:
                problems.append(f"{page}: article-only Outline/Metadata buttons leaked into a hand-written page")
        self.assertEqual(problems, [])


class TestGeneratedPageNavbar(unittest.TestCase):
    """Generated article pages must carry the current pages/_shared/navbar.html.

    If this fails after editing the partial, regenerate the listed pages with
    tools/create_content.py (or `python3 cli.py build-all`).
    """

    def test_article_navbars_match_shared_partial(self):
        partial = (REPO_ROOT / "pages" / "_shared" / "navbar.html").read_text(encoding="utf-8").strip()
        squash = lambda s: re.sub(r"\s+", " ", s).strip()
        stale = []
        for section in ("notes", "writing", "canvas"):
            for path in (REPO_ROOT / section).rglob("*.html"):
                if path.name == "index.html" or not path.with_suffix(".md").is_file():
                    continue
                text = path.read_text(encoding="utf-8")
                match = re.search(r'<nav class="navbar[\s\S]*?</nav>', text)
                rel = os.path.relpath(REPO_ROOT, path.parent).replace(os.sep, "/") + "/"
                expected = squash(partial.replace("{{REPO_PREFIX}}", rel))
                if not match or squash(match.group(0)) != expected:
                    stale.append(str(path.relative_to(REPO_ROOT)))
        self.assertEqual(stale, [], "regenerate these pages so their navbar matches pages/_shared/navbar.html")
