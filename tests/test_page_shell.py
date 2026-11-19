"""Guards for the shared page shell (theme / palette preload).

The theme bootstrap used to be copied inline into every page. It now lives in
`core/theme-preload.js`; these tests keep it from drifting back into copies and
keep its palette list aligned with `palette-tokens.css`.
"""

import json
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

    def test_metadata_uses_site_prefix(self):
        # `garden:*` is the legacy prefix; readers keep it only as a fallback for old pages.
        legacy = re.compile(r'<meta[^>]+name=["\']garden:')
        offenders = [str(rel) for rel, text in _site_pages() if legacy.search(text)]
        template = (REPO_ROOT / "tools" / "content_styles" / "_shared" / "base.html").read_text(encoding="utf-8")
        if legacy.search(template):
            offenders.append("tools/content_styles/_shared/base.html")
        self.assertEqual(offenders, [], "write content metadata as <meta name=\"site:...\">")

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

    def test_i18n_bundles_are_valid_json(self):
        # core/i18n.js swallows fetch/parse errors, so a broken bundle silently
        # leaves its page untranslated instead of failing loudly.
        broken = []
        for path in sorted((REPO_ROOT / "i18n").glob("*.json")):
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError as exc:
                broken.append(f"{path.name}: {exc}")
        self.assertEqual(broken, [])

    def test_title_bundle_lookup_matches_i18n_runtime(self):
        source = (REPO_ROOT / "core" / "i18n.js").read_text(encoding="utf-8")
        block = re.search(r"const pageFiles = \{([^}]*)\}", source)
        self.assertIsNotNone(block, "pageFiles map not found in core/i18n.js")
        runtime_files = dict(re.findall(r"(\w+):\s*'([^']+)'", block.group(1)))
        self.assertEqual(runtime_files, self.build_pages.I18N_PAGE_FILES)
        for key in self.build_pages.I18N_LANDING_PAGES:
            self.assertIn(f"page === '{key}'", source)

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


class TestSiteRuntime(unittest.TestCase):
    """The site runtime is core/site/NN-*.js, loaded in order through pages/_shared/runtime.html."""

    EXPECTED_GLOBALS = {
        "LudwigCipherMode", "LudwigCompanionSettings", "LudwigContentRuntime", "LudwigCopilotSettings",
        "LudwigLanguage", "LudwigSettings", "LudwigSettingsRuntime", "LudwigTheme",
    }

    @classmethod
    def setUpClass(cls):
        cls.modules = sorted(p.name for p in (REPO_ROOT / "core" / "site").glob("*.js"))
        runtime = (REPO_ROOT / "pages" / "_shared" / "runtime.html").read_text(encoding="utf-8")
        cls.listed = re.findall(r'core/site/([^"?]+\.js)', runtime)

    def test_runtime_partial_lists_every_module_in_order(self):
        self.assertTrue(all(re.match(r"^\d\d-[a-z0-9-]+\.js$", m) for m in self.modules), self.modules)
        self.assertEqual(self.listed, self.modules)
        self.assertFalse((REPO_ROOT / "core" / "script.js").exists(), "core/script.js was split into core/site/")

    def test_pages_load_the_whole_runtime_in_order(self):
        problems = []
        for path in REPO_ROOT.rglob("*.html"):
            rel = path.relative_to(REPO_ROOT)
            if SKIP_PARTS.intersection(rel.parts) or "content_styles" in rel.parts:
                continue
            text = path.read_text(encoding="utf-8")
            if "core/script.js" in text:
                problems.append(f"{rel}: still loads core/script.js")
            loaded = re.findall(r'<script src="[^"]*core/site/([^"?]+\.js)', text)
            if loaded and loaded != self.modules:
                problems.append(f"{rel}: runtime modules out of order or incomplete")
        self.assertEqual(problems, [])

    def test_runtime_loads_without_errors_in_node(self):
        import shutil
        import subprocess

        node = shutil.which("node")
        if not node:
            self.skipTest("node is not installed")
        files = [str(REPO_ROOT / "core" / "site" / m) for m in self.modules]
        harness = str(REPO_ROOT / "tests" / "js" / "runtime_smoke.cjs")
        for pathname in ("/index.html", "/notes/demo/demo.html", "/pages/settings.html", "/labs/grimoire/index.html"):
            out = subprocess.run([node, harness, pathname, *files], capture_output=True, text=True, check=True).stdout
            result = json.loads(out)
            self.assertEqual(result["errors"], [], pathname)
            self.assertEqual(set(result["globals"]), self.EXPECTED_GLOBALS, pathname)
