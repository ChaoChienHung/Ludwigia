from __future__ import annotations

import argparse
import datetime as dt
import glob
import html
import importlib.util
import json
import math
import os
import re
import subprocess
import sys
import urllib.parse

REPO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if REPO_DIR not in sys.path:
    sys.path.insert(0, REPO_DIR)

from tools import content_contract, information_ontology, question_bank
from tools.content import render_state
from tools.content.common import (  # noqa: F401  re-exported for callers and tests
    _read_text,
    _write_text,
    _slugify,
    _collapse_spaces,
    _parse_bool,
    _resolve_repo_dir,
    _escape_text,
    _escape_attr,
)
from tools.content.metadata import (  # noqa: F401  re-exported for callers and tests
    _normalize_tag_lang,
    _tag_lookup_key,
    _load_tag_ontology,
    _load_tag_ontology_index,
    _get_tag_labels_for_concept,
    _resolve_tag_label_for_lang,
    _parse_tag_entries,
    _load_tag_alias_map,
    _normalize_tags,
    _extract_tag_concepts,
    _extract_tag_label_map,
    _normalize_date_value,
    _normalize_priority_value,
    _source_last_modified_date,
    _extract_leading_markdown_title,
    _extract_source_meta,
)
from tools.content.source_blocks import (  # noqa: F401  re-exported for callers and tests
    _extract_simple_block,
    _strip_author_only_blocks,
    _parse_anchors,
    _parse_opening_tag_attrs,
    _extract_qaprompt,
    _extract_core_markdown,
    _estimate_reading_time_minutes,
    _estimate_note_reading_time_minutes,
)
from tools.content.paths import (  # noqa: F401  re-exported for callers and tests
    _safe_link_href,
    _default_card_cover_href,
    _normalize_repo_asset_href,
    _safe_path_fragment,
    _substitute_path_template,
    _resolve_output_path,
    _rel_url_prefix,
)
from tools.content.inline import (  # noqa: F401  re-exported for callers and tests
    _sync_information_ontology_assets,
    _resolve_information_text,
    _render_information_span,
    _collect_content_link_registry,
    _resolve_content_link_entry,
    _estimate_preview_tag_units,
    _collapse_preview_tags_single_row,
    _render_content_link_preview,
    _render_content_link,
    _resolve_content_link_html,
    _render_inline_no_code,
    _render_inline,
)
from tools.content.review_widgets import (  # noqa: F401  re-exported for callers and tests
    _render_note_quiz_html,
    _render_qaprompt_block_html,
    _render_qaprompt_section_html,
    _render_reviewkit_html,
)
from tools.content.templates import (  # noqa: F401  re-exported for callers and tests
    _resolve_style_name,
    _load_style,
    _load_partial,
    _load_page_shared_partial,
    _build_style_template,
)
from tools.content.markdown import (  # noqa: F401  re-exported for callers and tests
    _markdown_to_html,
)


def _self_test() -> None:
    repo_dir = _resolve_repo_dir()
    style, _, _ = _load_style(repo_dir, "default")

    source_text = (
        "<meta>\n"
        "Title: Self Test Note\n"
        "Tags: ml, system design\n"
        "Summary: Self test\n"
        "Slug: self-test\n"
        "Style: default\n"
        "EstimatedReadingTime: true\n"
        "Lang: zh-Hant\n"
        "TitleSuffix: true\n"
        "</meta>\n"
        "\n"
        "<draft>\n"
        "- TLDR：Draft-only planning note.\n"
        "- NarrativeArc：Keep this out of rendered HTML and extracted markdown.\n"
        "- Scope：Self-test planning scaffold.\n"
        "</draft>\n"
        "\n"
        "<anchors>\n"
        "h2: Types of Attributes -> attributes-types\n"
        "</anchors>\n"
        "\n"
        "# Self Test Note\n"
        "\n"
        "## Types of Attributes\n"
        "\n"
        "These attributes generally fall into two broad categories:\n"
        "\n"
        "1. Categorical (Qualitative) Attributes\n"
        "Categorical attributes describe traits.\n"
        "* Nominal values only allow testing for equality ($=$ or $\\\\neq$).\n"
        "* Ordinal values allow ($>$) or ($<$).\n"
        "\n"
        "1. First ordered item\n"
        "2. Second ordered item\n"
        "\n"
        "This paragraph should not be merged into the ordered list.\n"
        "\n"
        "<image>\n"
        "caption: Placeholder image\n"
        "</image>\n"
        "\n"
        "```plaintext\n"
        "code fence should not loop\n"
        "```\n"
        "\n"
        "We can add <information context=\"Extra explanation for a phrase.\">inline explanation</information> in a paragraph.\n"
        "We can also link to <content-link canonical=\"k-means-clustering-around-centers\">K-Means</content-link>.\n"
        "\n"
        "| Method | Strength |\n"
        "| --- | --- |\n"
        "| K-Means | Fast |\n"
        "| DBSCAN | Handles noise |\n"
        "\n"
        "<callout>\n"
        "title: Callout Test\n"
        "icon: dice\n"
        "content:\n"
        "**Bold <information context=\"Test context\">test information</information>**\n"
        "\n"
        "| Header <br> Sub | Cell |\n"
        "| --- | --- |\n"
        "| A | B |\n"
        "</callout>\n"
        "\n"
        "<reviewkit>\n"
        "title: Review Kit\n"
        "id: summary-quiz\n"
        "toc: false\n"
        "<takeaways>\n"
        "- Keep the main idea clear.\n"
        "- End with portable conclusions.\n"
        "</takeaways>\n"
        "<qquiz>\n"
        "<question>\n"
        "Question: Test?\n"
        "A: A1\n"
        "ResponseA: Incorrect.\n"
        "B: B1\n"
        "ResponseB: Correct.\n"
        "C: C1\n"
        "ResponseC: Incorrect.\n"
        "D: D1\n"
        "ResponseD: Incorrect.\n"
        "Answer: B\n"
        "Explanation: Because.\n"
        "</question>\n"
        "</qquiz>\n"
        "<qprompt>\n"
        "title: QA Generator Prompt\n"
        "prompt:\n"
        "You are given a set of notes.\n"
        "</qprompt>\n"
        "</reviewkit>\n"
    )

    meta, body = _extract_source_meta(source_text)
    body_without_draft = _strip_author_only_blocks(body)
    body_without_anchors, anchors_block = _extract_simple_block(body_without_draft, "anchors")
    anchors_map, toc_overrides = _parse_anchors(anchors_block)
    body_without_prompt, qaprompt = _extract_qaprompt(body_without_anchors)
    render_state.CONTENT_LINK_REGISTRY = {
        "k-means-clustering-around-centers": [
            {
                "canonical_id": "k-means-clustering-around-centers",
                "lang": "zh-Hant",
                "title": "K-Means: Clustering Around Centers",
                "summary": "An intuition-first note on K-Means and center-based compactness.",
                "tags": "Data Mining, Clustering, K-Means",
                "cover_href": "",
                "status": "published",
                "content_kind": "notes",
                "output_path": os.path.join(repo_dir, "notes", "k-means-clustering-around-centers", "k-means-clustering-around-centers.html"),
                "source_path": "",
            }
        ]
    }
    render_state.CONTENT_LINK_OUTPUT_PATH = os.path.join(repo_dir, "notes", "self-test.html")
    render_state.CONTENT_LINK_LANG = "zh-Hant"
    html, _ = _markdown_to_html(
        body_without_prompt,
        style=style,
        doc_title=meta.get("title", ""),
        anchors=anchors_map,
        toc_overrides=toc_overrides,
        qaprompt=qaprompt,
        allow_raw_html=False,
    )
    assert "note-information" in html
    assert "note-information-tooltip" in html
    assert "<strong>Bold <span class=\"note-information\"" in html
    assert "Header <br> Sub" in html
    assert 'class="note-content-link"' in html
    assert "note-content-link-preview" in html
    assert "note-content-link-preview-thumb" in html
    assert "assets/images/defaults/Notes.png" in html
    assert "An intuition-first note on K-Means and center-based compactness." in html
    assert 'href="k-means-clustering-around-centers/k-means-clustering-around-centers.html"' in html
    assert "note-table" in html
    assert "note-takeaways" in html
    assert "Review Kit" in html
    assert '<p class="mb-3">This paragraph should not be merged into the ordered list.</p>' in html
    assert "<strong>Second ordered item</strong><br>\n  This paragraph should not be merged into the ordered list." not in html
    assert "<ol class=\"mb-3\">\n<li>First ordered item</li>\n<li>Second ordered item</li>\n</ol>" in html
    assert "Draft-only planning note." not in html
    assert "Keep this out of rendered HTML and extracted markdown." not in _extract_core_markdown(source_text)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", default="")
    parser.add_argument("--tags", default="", help='Comma-separated tags, e.g. "ml, system design"')
    parser.add_argument("--summary", default="")
    parser.add_argument("--source", default="", help='Path to a Markdown-like file (use "-" for stdin)')
    parser.add_argument("--style", default="", help='Style name (overrides <meta> Style), e.g. "plain" or "cards"')
    parser.add_argument("--slug", default="", help='Filename slug without ".html", kebab-case recommended')
    parser.add_argument(
        "--content-dir",
        default="notes",
        help='Target section directory, e.g. "notes", "writing", or "canvas".',
    )
    parser.add_argument(
        "--output-root",
        default="",
        help='Override output base directory (relative to repo). Example: "notes/_generated".',
    )
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--no-index", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        _self_test()
        print("OK: self-test passed")
        return

    repo_dir = _resolve_repo_dir()
    _sync_information_ontology_assets(repo_dir)
    content_dir_set_by_cli = "--content-dir" in sys.argv

    source_meta: dict[str, str] = {}
    source_body = ""
    core_markdown = ""
    source_rel_path = ""
    source_path = ""
    if args.source:
        if args.source == "-":
            source_text = sys.stdin.read()
        else:
            source_path = args.source
            if not os.path.isabs(source_path):
                source_path = os.path.join(repo_dir, source_path)
            source_path_abs = os.path.abspath(source_path)
            source_text = _read_text(source_path_abs)
            repo_abs = os.path.abspath(repo_dir)
            if source_path_abs.startswith(repo_abs + os.sep):
                source_rel_path = os.path.relpath(source_path_abs, repo_dir)
        source_meta, source_body = _extract_source_meta(source_text)
        core_markdown = _extract_core_markdown(source_text)

    title = str(args.title).strip() or source_meta.get("title", "").strip()
    summary = str(args.summary).strip() or source_meta.get("summary", "").strip()
    html_lang = (source_meta.get("lang") or source_meta.get("html_lang") or "").strip() or "en"
    tags_raw = (str(args.tags).strip() or source_meta.get("tags", "").strip())
    tags = _normalize_tags(tags_raw, lang=html_lang)
    tag_concepts = _extract_tag_concepts(tags_raw, lang=html_lang)
    tag_label_map = _extract_tag_label_map(tags_raw, lang=html_lang)

    content_dir_value = args.content_dir if content_dir_set_by_cli else source_meta.get("content_dir", args.content_dir)
    content_dir = os.path.abspath(os.path.join(repo_dir, content_dir_value))

    if not title:
        raise SystemExit("--title is required (or provide Title in <meta> when using --source)")
    if not summary:
        raise SystemExit("--summary is required (or provide Summary in <meta> when using --source)")
    if not tags:
        raise SystemExit("--tags must contain at least one tag (or provide Tags in <meta> when using --source)")

    slug_from_meta = source_meta.get("slug", "").strip()
    slug = _slugify(args.slug) if args.slug else (_slugify(slug_from_meta) if slug_from_meta else _slugify(title))
    if not slug:
        slug = "note-" + dt.datetime.now().strftime("%Y%m%d-%H%M%S")

    out_spec = source_meta.get("output", "").strip() or source_meta.get("path", "").strip()
    if out_spec:
        out_path = _resolve_output_path(repo_dir, out_spec, title=title, slug=slug)
    else:
        filename = f"{slug}.html"
        out_path = os.path.join(content_dir, filename)

    output_root_raw = str(args.output_root or "").strip()
    if output_root_raw:
        output_root = output_root_raw.replace("\\", "/").lstrip("/").strip()
        output_root_abs = os.path.abspath(os.path.join(repo_dir, output_root))
        if not output_root_abs.startswith(os.path.abspath(repo_dir) + os.sep):
            raise SystemExit(f"Invalid --output-root (must be inside repo): {args.output_root}")
        out_rel = os.path.relpath(out_path, repo_dir)
        content_dir_rel = os.path.relpath(content_dir, repo_dir)
        prefix = content_dir_rel + os.sep
        if out_rel.startswith(prefix):
            out_rel = out_rel[len(prefix) :]
        out_path = os.path.join(output_root_abs, out_rel)

    if os.path.exists(out_path) and not args.force:
        raise SystemExit(f"File already exists: {out_path}. Use --force to overwrite.")

    estimated_reading_time_enabled = _parse_bool(
        source_meta.get("estimated_reading_time") or source_meta.get("estimatedreadingtime") or "",
        default=True,
    )
    reading_time_minutes = 0
    markdown_actions_enabled = bool(args.source)
    allow_raw_html = _parse_bool(
        source_meta.get("allow_raw_html") or source_meta.get("allowrawhtml") or "",
        default=False,
    )
    title_suffix_enabled = _parse_bool(
        source_meta.get("title_suffix") or source_meta.get("titlesuffix") or "",
        default=True,
    )
    page_title = title
    full_title = title + (" — Ludwig" if title_suffix_enabled and title else "")
    canonical_id = (
        source_meta.get("canonical_id")
        or source_meta.get("canonicalid")
        or source_meta.get("translation_group")
        or source_meta.get("translationgroup")
        or ""
    ).strip()
    raw_status = (
        source_meta.get("status")
        or source_meta.get("publish_status")
        or source_meta.get("publishstatus")
        or ""
    ).strip()
    status = raw_status.lower() if raw_status else "published"
    if status not in {"published", "drafting"}:
        raise SystemExit(f"Invalid Status: {raw_status}. Expected published|drafting")
    raw_pinned = (
        source_meta.get("pinned")
        or source_meta.get("pin")
        or source_meta.get("featured")
        or ""
    ).strip()
    pinned = _parse_bool(raw_pinned, default=False) if raw_pinned else False
    priority = _normalize_priority_value(
        source_meta.get("priority")
        or source_meta.get("pinned_priority")
        or source_meta.get("pinnedpriority")
        or ""
    )
    published_at = _normalize_date_value(
        source_meta.get("published")
        or source_meta.get("published_at")
        or source_meta.get("publishedat")
        or source_meta.get("publish_date")
        or source_meta.get("publishdate")
        or ""
    )
    last_modified_at = _normalize_date_value(
        source_meta.get("last_modified")
        or source_meta.get("lastmodified")
        or source_meta.get("last_modified_at")
        or source_meta.get("lastmodifiedat")
        or source_meta.get("updated")
        or source_meta.get("updated_at")
        or source_meta.get("updatedat")
        or ""
    ) or _source_last_modified_date(source_path)
    cover_href = _normalize_repo_asset_href(
        repo_dir,
        source_meta.get("cover")
        or source_meta.get("garden_cover")
        or source_meta.get("gardencover")
        or "",
        source_path=source_path,
        output_path=out_path,
    )
    content_meta_parts = [
        f'<meta name="site:lang" content="{_escape_attr(html_lang or "en")}">',
        f'<meta name="site:status" content="{_escape_attr(status)}">',
    ]
    if any(tag_concepts):
        content_meta_parts.append(
            f'<meta name="site:tag_concepts" content="{_escape_attr(",".join(tag_concepts))}">'
        )
    if tag_label_map:
        content_meta_parts.append(
            f'<meta name="site:tag_labels" content="{_escape_attr(json.dumps(tag_label_map, ensure_ascii=False, separators=(",", ":")))}">'
        )
    if canonical_id:
        content_meta_parts.append(f'<meta name="site:canonical_id" content="{_escape_attr(canonical_id)}">')
    if pinned:
        content_meta_parts.append('<meta name="site:pinned" content="1">')
    if priority:
        content_meta_parts.append(f'<meta name="site:priority" content="{_escape_attr(priority)}">')
    if published_at:
        content_meta_parts.append(f'<meta name="site:published_at" content="{_escape_attr(published_at)}">')
    if last_modified_at:
        content_meta_parts.append(f'<meta name="site:last_modified_at" content="{_escape_attr(last_modified_at)}">')
    if cover_href:
        content_meta_parts.append(f'<meta name="site:cover" content="{_escape_attr(cover_href)}">')
    meta_date_attrs: list[str] = []
    if last_modified_at:
        meta_date_attrs.append(
            f'data-last-modified-at="{_escape_attr(last_modified_at)}"'
        )
    if published_at:
        meta_date_attrs.append(
            f'data-published-at="{_escape_attr(published_at)}"'
        )
    if last_modified_at or published_at:
        default_date_label = "Last Modified" if last_modified_at else "Published"
        default_date_value = last_modified_at or published_at or ""
        default_date_icon = "fa-regular fa-pen-to-square" if last_modified_at else "fa-regular fa-calendar"
        attrs = " ".join(meta_date_attrs)
        meta_dates_html = (
            f'<div class="note-date-menu-shell" {attrs}>'
            '<div class="note-meta-item">'
            f'<i class="{default_date_icon}"></i>'
            f"<span>{default_date_label}: {_escape_text(default_date_value)}</span>"
            "</div>"
            "</div>"
        )
    else:
        meta_dates_html = ""

    if args.source:
        style_name = (args.style or "").strip() or source_meta.get("style", "").strip() or "default"
        style, style_dir, shared_dir = _load_style(repo_dir, style_name)
        source_body = _strip_author_only_blocks(source_body)
        body_without_anchors, anchors_block = _extract_simple_block(source_body, "anchors")
        anchors_map, toc_overrides = _parse_anchors(anchors_block)
        body_without_prompt, qaprompt = _extract_qaprompt(body_without_anchors)
        leading_markdown_title = _extract_leading_markdown_title(body_without_prompt)
        page_title = leading_markdown_title or title
        if not full_title:
            full_title = page_title + (" — Ludwig" if title_suffix_enabled and page_title else "")
        render_state.CONTENT_LINK_REGISTRY = _collect_content_link_registry(repo_dir)
        render_state.CONTENT_LINK_OUTPUT_PATH = out_path
        render_state.CONTENT_LINK_LANG = html_lang
        rendered, toc_links = _markdown_to_html(
            body_without_prompt,
            style=style,
            doc_title=page_title,
            anchors=anchors_map,
            toc_overrides=toc_overrides,
            qaprompt=qaprompt,
            allow_raw_html=allow_raw_html,
            source_path=source_path,
            source_meta=source_meta,
        )
        if not rendered.strip():
            rendered = '<p class="mb-3"></p>'
        content_section = source_rel_path.split(os.sep, 1)[0] if source_rel_path else ""
        if estimated_reading_time_enabled:
            if content_section == "notes":
                reading_time_minutes = _estimate_note_reading_time_minutes(rendered)
            else:
                reading_time_minutes = _estimate_reading_time_minutes(core_markdown)
    else:
        style_name = (args.style or "").strip() or source_meta.get("style", "").strip() or "default"
        style, style_dir, shared_dir = _load_style(repo_dir, style_name)
        rendered = (
            '<p class="page-text" data-aos="fade-up" data-aos-delay="150">\n'
            "  Write your note here.\n"
            "</p>"
        )
        toc_links = ""

    if reading_time_minutes > 0:
        content_meta_parts.append(f'<meta name="site:reading_time_minutes" content="{reading_time_minutes}">')
    content_meta_html = "\n  ".join(content_meta_parts)

    style_name = _resolve_style_name(style_name)
    html_doc = _build_style_template(
        repo_dir=repo_dir,
        style_name=style_name,
        out_path=out_path,
        title=page_title,
        full_title=full_title,
        tags=tags,
        summary=summary,
        content_html=rendered,
        toc_links_html=toc_links,
        html_lang=html_lang,
        estimated_reading_time_enabled=estimated_reading_time_enabled,
        markdown_actions_enabled=markdown_actions_enabled,
        meta_dates_html=meta_dates_html,
        source_rel_path=source_rel_path,
        content_meta_html=content_meta_html,
        style_dir=style_dir,
        shared_dir=shared_dir,
    )

    _write_text(out_path, html_doc)
    print(f"Created: {os.path.relpath(out_path, repo_dir)}")

    if args.no_index:
        return

    indexer = os.path.join(repo_dir, "search", "indexer.py")
    subprocess.run([sys.executable, indexer], cwd=repo_dir, check=True)
    print("Updated: search/search-index.{json,js}")


if __name__ == "__main__":
    main()
