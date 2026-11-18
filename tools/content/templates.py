"""Content styles, shared partials and the page template.

Split out of tools/create_content.py; behaviour is unchanged."""

from __future__ import annotations

import importlib.util
import os
import re
from tools.content.common import _escape_attr, _escape_text, _read_text
from tools.content.paths import _rel_url_prefix


def _resolve_style_name(raw: str) -> str:
    name = (raw or "").strip().lower() or "plain"
    if not re.fullmatch(r"[a-z0-9_]+", name):
        return "plain"
    return name


def _load_style(repo_dir: str, style_name: str):
    name = _resolve_style_name(style_name)
    styles_root = os.path.join(repo_dir, "tools", "content_styles")
    style_dir = os.path.join(styles_root, name)
    shared_dir = os.path.join(styles_root, "_shared")
    legacy_style_path = os.path.join(styles_root, f"{name}.py")
    legacy_plain_path = os.path.join(styles_root, "plain.py")

    if os.path.isdir(style_dir):
        style_path = os.path.join(style_dir, "style.py")
        if not os.path.exists(style_path):
            raise SystemExit(f"Style is missing style.py: {style_dir}")
    else:
        style_path = legacy_style_path if os.path.exists(legacy_style_path) else legacy_plain_path

    spec = importlib.util.spec_from_file_location(f"note_style_{name}", style_path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Failed to load style: {name}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    create = getattr(mod, "create", None)
    if not callable(create):
        raise SystemExit(f"Invalid style module (missing create()): {style_path}")
    style = create()

    required_methods = [
        "before_heading",
        "after_document",
        "heading",
        "paragraph",
        "ul",
        "ol",
        "blockquote",
        "hr",
        "codeblock",
    ]
    for method_name in required_methods:
        if not callable(getattr(style, method_name, None)):
            raise SystemExit(f"Invalid style object (missing {method_name}): {style_path}")

    return style, style_dir, shared_dir


def _load_partial(shared_dir: str, style_dir: str, name: str) -> str:
    if not re.fullmatch(r"[a-z0-9_]+", name):
        raise SystemExit(f"Invalid partial name: {name}")
    shared_path = os.path.join(shared_dir, "partials", f"{name}.html")
    style_path = os.path.join(style_dir, "partials", f"{name}.html")
    if style_dir and os.path.exists(style_path):
        return _read_text(style_path).strip()
    if os.path.exists(shared_path):
        return _read_text(shared_path).strip()
    raise SystemExit(f"Missing shared partial: {shared_path}")


def _load_page_shared_partial(repo_dir: str, name: str) -> str | None:
    if not re.fullmatch(r"[a-z0-9_]+", name):
        raise SystemExit(f"Invalid shared page partial name: {name}")
    shared_path = os.path.join(repo_dir, "pages", "_shared", f"{name}.html")
    if os.path.exists(shared_path):
        return _read_text(shared_path).strip()
    return None


def _build_style_template(
    repo_dir: str,
    style_name: str,
    out_path: str,
    title: str,
    full_title: str,
    tags: str,
    summary: str,
    content_html: str,
    toc_links_html: str,
    html_lang: str,
    estimated_reading_time_enabled: bool,
    markdown_actions_enabled: bool,
    meta_dates_html: str,
    source_rel_path: str,
    content_meta_html: str,
    style_dir: str,
    shared_dir: str,
) -> str:
    base_path = os.path.join(shared_dir, "base.html")
    base = _read_text(base_path)

    out_dir = os.path.dirname(out_path)
    repo_prefix = _rel_url_prefix(out_dir, repo_dir)

    head_links = _load_partial(shared_dir, style_dir, "head_links")
    navbar = _load_page_shared_partial(repo_dir, "navbar") or _load_partial(shared_dir, style_dir, "navbar")
    main = _load_partial(shared_dir, style_dir, "main")
    footer = _load_partial(shared_dir, style_dir, "footer")
    scripts = _load_partial(shared_dir, style_dir, "scripts")
    # The site runtime (core/site/*.js, in order) comes from the site shell SSOT.
    scripts = scripts.replace("{{SITE_RUNTIME}}", _load_page_shared_partial(repo_dir, "runtime"))

    style_css_path = os.path.join(style_dir, "style.css") if style_dir else ""
    shared_style_css_path = os.path.join(repo_dir, "assets", "css", "content-page", style_name, "style.css")
    if os.path.exists(shared_style_css_path):
        style_css = f'<link rel="stylesheet" href="{repo_prefix}assets/css/content-page/{style_name}/style.css?v=2026-09-25-1">'
    elif style_css_path and os.path.exists(style_css_path):
        style_css = f'<link rel="stylesheet" href="{repo_prefix}assets/css/content-page/{style_name}/style.css?v=2026-09-25-1">'
    else:
        style_css = ""

    main = main.replace("{{TOC_LINKS}}", toc_links_html or "")
    main = main.replace("{{READING_TIME_CLASS}}", "" if estimated_reading_time_enabled else " d-none")
    main = main.replace("{{MARKDOWN_ACTIONS_CLASS}}", "" if markdown_actions_enabled else " d-none")
    main = main.replace("{{META_DATES_CLASS}}", "" if meta_dates_html else " d-none")
    main = main.replace("{{META_DATES_HTML}}", meta_dates_html or "")

    body_class = f"note-page note-style-{style_name}"
    source_meta = ""
    if source_rel_path:
        source_meta = f'<meta name="site:source" content="{_escape_attr(source_rel_path.replace(os.sep, "/"))}">'

    html_doc = base
    html_doc = html_doc.replace("{{CONTENT_META}}", content_meta_html or "")
    html_doc = html_doc.replace("{{SOURCE_META}}", source_meta)
    html_doc = html_doc.replace("{{HEAD_LINKS}}", head_links)
    html_doc = html_doc.replace("{{STYLE_CSS}}", style_css)
    html_doc = html_doc.replace("{{NAVBAR}}", navbar)
    html_doc = html_doc.replace("{{MAIN}}", main)
    html_doc = html_doc.replace("{{FOOTER}}", footer)
    html_doc = html_doc.replace("{{SCRIPTS}}", scripts)

    html_doc = html_doc.replace("{{REPO_PREFIX}}", repo_prefix)
    html_doc = html_doc.replace("{{BODY_CLASS}}", _escape_attr(body_class))
    html_doc = html_doc.replace("{{HTML_LANG}}", _escape_attr(html_lang or "en"))
    html_doc = html_doc.replace("{{TITLE}}", _escape_text(title))
    html_doc = html_doc.replace("{{FULL_TITLE}}", _escape_text(full_title))
    html_doc = html_doc.replace("{{TAGS}}", _escape_attr(tags))
    html_doc = html_doc.replace("{{SUMMARY}}", _escape_attr(summary))
    html_doc = html_doc.replace("{{CONTENT}}", content_html)

    if any(
        tok in html_doc
        for tok in (
            "{{SOURCE_META}}",
            "{{CONTENT_META}}",
            "{{HEAD_LINKS}}",
            "{{STYLE_CSS}}",
            "{{NAVBAR}}",
            "{{MAIN}}",
            "{{FOOTER}}",
            "{{SCRIPTS}}",
            "{{REPO_PREFIX}}",
            "{{BODY_CLASS}}",
            "{{HTML_LANG}}",
            "{{TITLE}}",
            "{{FULL_TITLE}}",
            "{{TAGS}}",
            "{{SUMMARY}}",
            "{{CONTENT}}",
        )
    ):
        raise SystemExit(f"Template placeholders not fully resolved for style: {style_name}")

    return html_doc
