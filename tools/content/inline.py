"""Inline markdown rendering, including <information> tooltips and <content-link> cross references.

Split out of tools/create_content.py; behaviour is unchanged."""

from __future__ import annotations

import glob
import os
import re

from tools import information_ontology
from tools.content import render_state
from tools.content.common import _escape_attr, _escape_text, _read_text, _resolve_repo_dir, _slugify
from tools.content.metadata import _extract_source_meta, _normalize_tag_lang, _normalize_tags
from tools.content.paths import _default_card_cover_href, _normalize_repo_asset_href, _resolve_output_path, _safe_link_href
from tools.content.source_blocks import _parse_opening_tag_attrs


def _sync_information_ontology_assets(repo_dir: str) -> None:
    information_ontology.sync_information_ontology_js(repo_dir)


def _resolve_information_text(
    concept_id: str,
    *,
    explicit_context: str = "",
    explicit_label: str = "",
) -> tuple[str, str]:
    label = (explicit_label or "").strip()
    context = (explicit_context or "").strip()
    normalized_concept = str(concept_id or "").strip()
    if normalized_concept:
        if not label:
            label = information_ontology.get_concept_label(normalized_concept, render_state.INFORMATION_LANG)
        if not context:
            context = information_ontology.get_concept_context(normalized_concept, render_state.INFORMATION_LANG)
        if not context:
            raise ValueError(
                f"Information ontology concept is missing localized context: {normalized_concept} ({render_state.INFORMATION_LANG})"
            )
    return label.strip(), context.strip()


def _render_information_span(label_html: str, context: str, *, concept_id: str = "") -> str:
    attrs = ['class="note-information"', 'tabindex="0"']
    if concept_id:
        attrs.append(f'data-information-concept="{_escape_attr(concept_id)}"')
        attrs.append(f'data-information-lang="{_escape_attr(render_state.INFORMATION_LANG)}"')
    if context:
        attrs.append(f'aria-label="{_escape_attr(context)}"')
    return (
        f"<span {' '.join(attrs)}>"
        f'{label_html}<span class="note-information-tooltip" aria-hidden="true">{_escape_text(context)}</span></span>'
    )


def _collect_content_link_registry(repo_dir: str) -> dict[str, list[dict[str, str]]]:
    repo_abs = os.path.abspath(repo_dir)
    registry: dict[str, list[dict[str, str]]] = {}
    content_roots = ("notes", "writing", "canvas")

    for root_name in content_roots:
        root_dir = os.path.join(repo_abs, root_name)
        if not os.path.isdir(root_dir):
            continue
        for source_path in sorted(glob.glob(os.path.join(root_dir, "**", "*.md"), recursive=True)):
            try:
                source_text = _read_text(source_path)
            except OSError:
                continue
            meta, _ = _extract_source_meta(source_text)
            canonical_id = (
                meta.get("canonical_id")
                or meta.get("canonicalid")
                or meta.get("translation_group")
                or meta.get("translationgroup")
                or ""
            ).strip()
            if not canonical_id:
                continue

            title = str(meta.get("title") or "").strip()
            if not title:
                continue

            slug_from_meta = str(meta.get("slug") or "").strip()
            slug = _slugify(slug_from_meta) if slug_from_meta else _slugify(title)
            if not slug:
                continue

            out_spec = str(meta.get("output") or meta.get("path") or "").strip()
            if out_spec:
                try:
                    output_path = _resolve_output_path(repo_abs, out_spec, title=title, slug=slug)
                except SystemExit:
                    continue
            else:
                output_path = os.path.join(repo_abs, root_name, f"{slug}.html")

            raw_status = (
                meta.get("status")
                or meta.get("publish_status")
                or meta.get("publishstatus")
                or ""
            ).strip()
            status = raw_status.lower() if raw_status else "published"
            if status not in {"published", "drafting"}:
                status = "published"

            lang = str(meta.get("lang") or "").strip() or "en"
            tags_raw = str(meta.get("tags") or "").strip()
            tags = _normalize_tags(tags_raw, lang=lang)
            summary = str(meta.get("summary") or "").strip()
            cover_href = _normalize_repo_asset_href(
                repo_abs,
                str(meta.get("cover") or meta.get("garden_cover") or meta.get("gardencover") or "").strip(),
                source_path=os.path.abspath(source_path),
                output_path=os.path.abspath(output_path),
            )
            registry.setdefault(canonical_id, []).append(
                {
                    "canonical_id": canonical_id,
                    "lang": _normalize_tag_lang(lang),
                    "title": title,
                    "summary": summary,
                    "tags": tags,
                    "cover_href": cover_href,
                    "status": status,
                    "content_kind": root_name,
                    "output_path": os.path.abspath(output_path),
                    "source_path": os.path.abspath(source_path),
                }
            )

    return registry


def _resolve_content_link_entry(
    canonical_id: str,
    *,
    preferred_lang: str = "",
) -> dict[str, str] | None:
    normalized_canonical = str(canonical_id or "").strip()
    if not normalized_canonical:
        return None
    entries = render_state.CONTENT_LINK_REGISTRY.get(normalized_canonical, [])
    if not entries:
        return None

    active_lang = _normalize_tag_lang(preferred_lang or render_state.CONTENT_LINK_LANG or "en")
    published_entries = [entry for entry in entries if str(entry.get("status") or "") == "published"]
    candidates = published_entries or entries

    def _pick_for_lang(pool: list[dict[str, str]], lang: str) -> dict[str, str] | None:
        for entry in pool:
            if str(entry.get("lang") or "") == lang:
                return entry
        return None

    chosen = _pick_for_lang(candidates, active_lang)
    if chosen:
        return chosen

    if active_lang != "en":
        chosen = _pick_for_lang(candidates, "en")
        if chosen:
            return chosen

    return candidates[0] if candidates else None


def _estimate_preview_tag_units(tag: str) -> int:
    """Approximate chip width so preview tags stay on one row.

    ASCII characters count as 1 unit, non-ASCII characters as 2 units, plus a
    small constant for pill padding/border/gap.
    """

    text_units = 0
    for ch in str(tag or ""):
        text_units += 1 if ord(ch) < 128 else 2
    return text_units + 4


def _collapse_preview_tags_single_row(
    tags: list[str],
    *,
    max_tags: int = 3,
    max_units: int = 40,
) -> list[str]:
    if not tags:
        return []

    ellipsis = "..."
    ellipsis_units = _estimate_preview_tag_units(ellipsis)
    pool = [str(tag).strip() for tag in tags[:max_tags] if str(tag).strip()]
    if not pool:
        return []

    visible: list[str] = []
    used_units = 0

    for idx, tag in enumerate(pool):
        tag_units = _estimate_preview_tag_units(tag)
        remaining_hidden = (len(pool) - (idx + 1)) + max(0, len(tags) - max_tags)
        reserve_units = ellipsis_units if remaining_hidden > 0 else 0

        if visible and (used_units + tag_units + reserve_units) > max_units:
            break

        visible.append(tag)
        used_units += tag_units

    if not visible:
        visible = [pool[0]]
        used_units = _estimate_preview_tag_units(pool[0])

    hidden_exists = len(tags) > len(visible)
    if not hidden_exists:
        return visible

    while visible and (used_units + ellipsis_units) > max_units:
        removed = visible.pop()
        used_units -= _estimate_preview_tag_units(removed)

    if not visible:
        return [ellipsis]

    return visible + [ellipsis]


def _render_content_link_preview(entry: dict[str, str], *, current_output_path: str = "") -> str:
    title = str(entry.get("title") or "").strip()
    summary = str(entry.get("summary") or "").strip()
    tags_raw = str(entry.get("tags") or "").strip()
    content_kind = str(entry.get("content_kind") or "").strip()
    kind_label = content_kind.title() if content_kind else "Content"
    cover_href = str(entry.get("cover_href") or "").strip()
    cover_html = ""
    cover_src = ""
    if cover_href and current_output_path:
        current_dir = os.path.dirname(current_output_path)
        cover_abs_path = os.path.abspath(os.path.join(_resolve_repo_dir(), cover_href))
        cover_src = os.path.relpath(cover_abs_path, current_dir).replace(os.sep, "/")
    elif not cover_href:
        default_rel = _default_card_cover_href(content_kind)
        if current_output_path:
            current_dir = os.path.dirname(current_output_path)
            cover_abs_path = os.path.abspath(os.path.join(_resolve_repo_dir(), default_rel))
            cover_src = os.path.relpath(cover_abs_path, current_dir).replace(os.sep, "/")
        else:
            cover_src = default_rel
    if cover_src:
        cover_html = (
            '<span class="note-content-link-preview-thumb">'
            f'<img src="{_escape_attr(cover_src)}" alt="" loading="lazy" decoding="async">'
            "</span>"
        )
    tag_html = ""
    tag_list = [part.strip() for part in tags_raw.split(",") if part.strip()]
    if tag_list:
        collapsed_tags = _collapse_preview_tags_single_row(tag_list)
        tag_html = "".join(
            f'<span class="note-content-link-preview-tag">{_escape_text(tag)}</span>'
            for tag in collapsed_tags
        )
        tag_html = f'<span class="note-content-link-preview-meta">{tag_html}</span>'
    summary_html = (
        f'<span class="note-content-link-preview-summary">{_escape_text(summary)}</span>' if summary else ""
    )
    body_html = (
        '<span class="note-content-link-preview-body">'
        f'<span class="note-content-link-preview-kind">{_escape_text(kind_label)}</span>'
        f'<span class="note-content-link-preview-title">{_escape_text(title)}</span>'
        f"{tag_html}"
        f"{summary_html}"
        "</span>"
    )
    return (
        '<span class="note-content-link-preview" aria-hidden="true">'
        f"{cover_html}"
        f"{body_html}"
        "</span>"
    )


def _render_content_link(label_html: str, href: str, *, canonical_id: str = "", preview_html: str = "") -> str:
    attrs = ['class="note-content-link"']
    if canonical_id:
        attrs.append(f'data-canonical-id="{_escape_attr(canonical_id)}"')
    return f'<a {" ".join(attrs)} href="{_escape_attr(href)}">{label_html}{preview_html}</a>'


def _resolve_content_link_html(attrs: dict[str, str], inner_text: str = "") -> str:
    canonical_id = str(attrs.get("canonical") or attrs.get("canonical_id") or attrs.get("canonicalid") or "").strip()
    if not canonical_id:
        fallback_text = str(inner_text or attrs.get("label") or attrs.get("title") or "").strip()
        return _render_inline(fallback_text) if fallback_text else ""

    preferred_lang = str(attrs.get("lang") or "").strip()
    target = _resolve_content_link_entry(canonical_id, preferred_lang=preferred_lang)
    fallback_text = (
        str(inner_text or "").strip()
        or str(attrs.get("label") or "").strip()
        or (str(target.get("title") or "").strip() if target else "")
        or canonical_id
    )
    label_html = _render_inline(fallback_text) if fallback_text else _escape_text(canonical_id)
    if not target:
        return label_html

    target_output_path = str(target.get("output_path") or "").strip()
    current_output_path = render_state.CONTENT_LINK_OUTPUT_PATH
    if not target_output_path or not current_output_path:
        return label_html

    current_dir = os.path.dirname(current_output_path)
    href = os.path.relpath(target_output_path, current_dir).replace(os.sep, "/")
    preview_html = _render_content_link_preview(target, current_output_path=current_output_path)
    return _render_content_link(label_html, href, canonical_id=canonical_id, preview_html=preview_html)


def _render_inline_no_code(raw: str) -> str:
    s = raw or ""
    out: list[str] = []
    i = 0
    while i < len(s):
        next_information = s.find("<information", i)
        next_content_link = s.find("<content-link", i)
        next_br = s.lower().find("<br", i)
        next_link = s.find("[", i)
        next_bold = s.find("**", i)
        next_italic = s.find("*", i)

        candidates = [p for p in (next_information, next_content_link, next_br, next_link, next_bold, next_italic) if p != -1]
        if not candidates:
            out.append(_escape_text(s[i:]))
            break

        j = min(candidates)
        if j > i:
            out.append(_escape_text(s[i:j]))
            i = j

        if s.startswith("<information", i):
            m_self = re.match(r"<information(?P<attrs>[^>]*)/\s*>", s[i:], flags=re.IGNORECASE | re.DOTALL)
            if m_self:
                tag_text = m_self.group(0)
                attrs = _parse_opening_tag_attrs(tag_text, "information")
                concept_id = str(attrs.get("concept") or "").strip()
                label = str(attrs.get("label") or "").strip()
                context = str(attrs.get("context") or "").strip()
                resolved_label, resolved_context = _resolve_information_text(
                    concept_id,
                    explicit_context=context,
                    explicit_label=label,
                )
                if resolved_label and resolved_context:
                    out.append(
                        _render_information_span(
                            _render_inline(resolved_label),
                            resolved_context if not concept_id else "",
                            concept_id=concept_id,
                        )
                    )
                else:
                    out.append(_escape_text(tag_text))
                i += len(tag_text)
                continue

            m_open = re.match(r"<information(?P<attrs>[^>]*)>", s[i:], flags=re.IGNORECASE | re.DOTALL)
            if not m_open:
                out.append(_escape_text(s[i]))
                i += 1
                continue
            open_text = m_open.group(0)
            attrs = _parse_opening_tag_attrs(open_text, "information")
            concept_id = str(attrs.get("concept") or "").strip()
            context = str(attrs.get("context") or "").strip()
            close_tag = "</information>"
            close_idx = s.find(close_tag, i + len(open_text))
            if close_idx == -1:
                out.append(_escape_text(s[i:]))
                break
            inner = s[i + len(open_text) : close_idx]
            inner_text = inner.strip()
            resolved_label, resolved_context = _resolve_information_text(
                concept_id,
                explicit_context=context,
                explicit_label=inner_text,
            )
            label_html = _render_inline(resolved_label)
            if label_html and resolved_context:
                out.append(
                    _render_information_span(
                        label_html,
                        resolved_context if not concept_id else "",
                        concept_id=concept_id,
                    )
                )
            else:
                out.append(_escape_text(s[i : close_idx + len(close_tag)]))
            i = close_idx + len(close_tag)
            continue

        if s.startswith("<content-link", i):
            m_self = re.match(r"<content-link(?P<attrs>[^>]*)/\s*>", s[i:], flags=re.IGNORECASE | re.DOTALL)
            if m_self:
                tag_text = m_self.group(0)
                attrs = _parse_opening_tag_attrs(tag_text, "content-link")
                rendered_link = _resolve_content_link_html(attrs)
                out.append(rendered_link or _escape_text(tag_text))
                i += len(tag_text)
                continue

            m_open = re.match(r"<content-link(?P<attrs>[^>]*)>", s[i:], flags=re.IGNORECASE | re.DOTALL)
            if not m_open:
                out.append(_escape_text(s[i]))
                i += 1
                continue
            open_text = m_open.group(0)
            attrs = _parse_opening_tag_attrs(open_text, "content-link")
            close_tag = "</content-link>"
            close_idx = s.find(close_tag, i + len(open_text))
            if close_idx == -1:
                out.append(_escape_text(s[i:]))
                break
            inner = s[i + len(open_text) : close_idx]
            rendered_link = _resolve_content_link_html(attrs, inner)
            out.append(rendered_link or _escape_text(inner))
            i = close_idx + len(close_tag)
            continue

        if s.lower().startswith("<br", i):
            m_br = re.match(r"^<br\s*/?>", s[i:], flags=re.IGNORECASE)
            if m_br:
                tag_text = m_br.group(0)
                out.append("<br>")
                i += len(tag_text)
                continue

        if s.startswith("**", i):
            k = s.find("**", i + 2)
            if k == -1:
                out.append(_escape_text(s[i:]))
                break
            inner = s[i + 2 : k]
            out.append(f"<strong>{_render_inline(inner)}</strong>")
            i = k + 2
            continue

        if s[i] == "*" and not s.startswith("**", i):
            k = s.find("*", i + 1)
            if k == -1:
                out.append(_escape_text(s[i:]))
                break
            inner = s[i + 1 : k]
            if inner.strip():
                out.append(f"<em>{_render_inline(inner)}</em>")
            else:
                out.append(_escape_text(s[i : k + 1]))
            i = k + 1
            continue

        if s[i] == "[":
            close_bracket = s.find("]", i + 1)
            if close_bracket == -1 or close_bracket + 1 >= len(s) or s[close_bracket + 1] != "(":
                out.append(_escape_text(s[i]))
                i += 1
                continue
            close_paren = s.find(")", close_bracket + 2)
            if close_paren == -1:
                out.append(_escape_text(s[i:]))
                break
            label_raw = s[i + 1 : close_bracket]
            href_raw = s[close_bracket + 2 : close_paren]
            href = _safe_link_href(href_raw)
            if not href:
                out.append(_escape_text(s[i : close_paren + 1]))
                i = close_paren + 1
                continue
            label_html = _render_inline(label_raw)
            out.append(
                f'<a class="note-inline-link" href="{_escape_attr(href)}" target="_blank" rel="noopener noreferrer">{label_html}</a>'
            )
            i = close_paren + 1
            continue

        out.append(_escape_text(s[i]))
        i += 1

    return "".join(out)


def _render_inline(raw: str) -> str:
    s = raw or ""
    out: list[str] = []
    i = 0
    while i < len(s):
        tick = s.find("`", i)
        if tick == -1:
            out.append(_render_inline_no_code(s[i:]))
            break
        if tick > i:
            out.append(_render_inline_no_code(s[i:tick]))
        end = s.find("`", tick + 1)
        if end == -1:
            out.append(_render_inline_no_code(s[tick:]))
            break
        code_raw = s[tick + 1 : end]
        out.append(f"<code>{_escape_text(code_raw)}</code>")
        i = end + 1
    return "".join(out)
