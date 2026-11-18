#!/usr/bin/env python3
"""Assemble the shared shell (navbar, footer) into hand-written site pages.

Generated content pages (notes / writing / canvas articles) already get their
navbar from `pages/_shared/navbar.html` through tools/create_content.py. The
hand-written pages listed in HAND_WRITTEN_PAGES used to carry their own copies,
which drifted apart. Each of those pages now marks its shell regions:

    <!-- shell:navbar -->
    ...rendered from pages/_shared/navbar.html...
    <!-- /shell:navbar -->

and this tool rewrites the text between the markers. The output stays a plain
static HTML file that is committed and works under file://.

Usage:
    python3 tools/build_pages.py            # rewrite every marked region
    python3 tools/build_pages.py --check    # exit 1 if any region is stale
    python3 tools/build_pages.py --init     # one-off: wrap existing <nav>/<footer> in markers
"""

from __future__ import annotations

import argparse
import os
import re
import sys

REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHARED_DIR = os.path.join(REPO_DIR, "pages", "_shared")

# Hand-written pages that use the shared site shell. Prototype app entries
# (labs/*/index.html built by Vite) are deliberately not listed.
HAND_WRITTEN_PAGES = [
    "index.html",
    "pages/portfolio.html",
    "pages/projects.html",
    "pages/search.html",
    "pages/settings.html",
    "pages/more.html",
    "tag/index.html",
    "notes/index.html",
    "writing/index.html",
    "canvas/index.html",
    "labs/index.html",
    "labs/grimoire/index.html",
    "labs/question-bank/index.html",
    "labs/shooting-mode/index.html",
    "labs/cosmic-flow/page.html",
    "labs/massive-multiplayer-laser-tag/page.html",
]

SECTIONS = ("navbar", "footer", "runtime")

# The Outline / Metadata buttons only work on article pages, so hand-written
# pages get the navbar without them.
_NOTE_NAV_BUTTON = re.compile(
    r'[ \t]*<button\s+type="button"\s+class="mobile-note-nav-btn[^"]*"[\s\S]*?</button>[ \t]*\n(?:[ \t]*\n)?'
)

_INIT_PATTERNS = {
    "navbar": re.compile(r'(?P<indent>[ \t]*)<nav class="navbar[\s\S]*?</nav>'),
    "footer": re.compile(r'(?P<indent>[ \t]*)<footer\b[\s\S]*?</footer>'),
    "runtime": re.compile(r'(?P<indent>[ \t]*)<script src="[^"]*core/script\.js[^"]*"></script>'),
}


def _region(section: str) -> re.Pattern[str]:
    return re.compile(
        r'(?P<indent>[ \t]*)<!-- shell:' + section + r' -->\n[\s\S]*?<!-- /shell:' + section + r' -->'
    )


def repo_prefix(page: str) -> str:
    rel = os.path.relpath(REPO_DIR, os.path.dirname(os.path.join(REPO_DIR, page)))
    return "" if rel == "." else rel.replace(os.sep, "/") + "/"


def render_section(section: str, page: str) -> str:
    with open(os.path.join(SHARED_DIR, f"{section}.html"), encoding="utf-8") as f:
        text = f.read()
    if section == "navbar":
        text = _NOTE_NAV_BUTTON.sub("", text)
    return text.replace("{{REPO_PREFIX}}", repo_prefix(page)).strip("\n")


def _wrap(section: str, body: str, indent: str) -> str:
    lines = [f"{indent}<!-- shell:{section} -->"]
    lines += [(indent + line) if line.strip() else "" for line in body.split("\n")]
    lines.append(f"{indent}<!-- /shell:{section} -->")
    return "\n".join(lines)


def assemble(page: str, text: str) -> str:
    for section in SECTIONS:
        body = render_section(section, page)
        text = _region(section).sub(lambda m: _wrap(section, body, m.group("indent")), text)
    return text


def init_markers(page: str, text: str) -> str:
    for section in SECTIONS:
        if f"<!-- shell:{section} -->" in text:
            continue
        match = _INIT_PATTERNS[section].search(text)
        if match:
            text = text[: match.start()] + _wrap(section, "", match.group("indent")) + text[match.end():]
    return text


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="report stale pages without writing")
    mode.add_argument("--init", action="store_true", help="wrap existing <nav>/<footer> in shell markers first")
    args = parser.parse_args(argv)

    stale = []
    missing = []
    for page in HAND_WRITTEN_PAGES:
        path = os.path.join(REPO_DIR, page)
        with open(path, encoding="utf-8") as f:
            original = f.read()
        text = init_markers(page, original) if args.init else original
        if "<!-- shell:navbar -->" not in text:
            print(f"{page}: missing <!-- shell:navbar --> marker", file=sys.stderr)
            missing.append(page)
            continue
        updated = assemble(page, text)
        if updated == original:
            continue
        stale.append(page)
        if not args.check:
            with open(path, "w", encoding="utf-8") as f:
                f.write(updated)
            print(f"Updated: {page}")

    if missing:
        return 1
    if args.check and stale:
        print("Stale page shells (run `python3 cli.py build-pages`): " + ", ".join(stale), file=sys.stderr)
        return 1
    if args.check:
        print("All page shells are up to date.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
