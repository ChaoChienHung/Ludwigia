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

_ACTIVE_INFORMATION_LANG = "en"
_ACTIVE_CONTENT_LINK_REGISTRY: dict[str, list[dict[str, str]]] = {}
_ACTIVE_CONTENT_LINK_OUTPUT_PATH = ""
_ACTIVE_CONTENT_LINK_LANG = "en"


def _read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _write_text(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        if not content.endswith("\n"):
            f.write("\n")


def _sync_information_ontology_assets(repo_dir: str) -> None:
    information_ontology.sync_information_ontology_js(repo_dir)


def _slugify(value: str) -> str:
    v = value.strip().lower()
    v = re.sub(r"['’]", "", v)
    v = re.sub(r"[^a-z0-9]+", "-", v)
    v = re.sub(r"-{2,}", "-", v).strip("-")
    return v


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
            label = information_ontology.get_concept_label(normalized_concept, _ACTIVE_INFORMATION_LANG)
        if not context:
            context = information_ontology.get_concept_context(normalized_concept, _ACTIVE_INFORMATION_LANG)
        if not context:
            raise ValueError(
                f"Information ontology concept is missing localized context: {normalized_concept} ({_ACTIVE_INFORMATION_LANG})"
            )
    return label.strip(), context.strip()


def _render_information_span(label_html: str, context: str, *, concept_id: str = "") -> str:
    attrs = ['class="note-information"', 'tabindex="0"']
    if concept_id:
        attrs.append(f'data-information-concept="{_escape_attr(concept_id)}"')
        attrs.append(f'data-information-lang="{_escape_attr(_ACTIVE_INFORMATION_LANG)}"')
    if context:
        attrs.append(f'aria-label="{_escape_attr(context)}"')
    return (
        f"<span {' '.join(attrs)}>"
        f'{label_html}<span class="note-information-tooltip" aria-hidden="true">{_escape_text(context)}</span></span>'
    )


_TAG_ALIAS_MAP_CACHE: dict[str, dict[str, str]] = {}
_TAG_ONTOLOGY_CACHE: dict[str, object] | None = None
_TAG_ONTOLOGY_INDEX_CACHE: dict[str, object] | None = None


def _collapse_spaces(value: str) -> str:
    return content_contract.collapse_spaces(value)


def _normalize_tag_lang(value: str) -> str:
    return content_contract.normalize_tag_lang(value)


def _tag_lookup_key(value: str) -> str:
    return content_contract.tag_lookup_key(value)


def _load_tag_ontology() -> dict[str, object]:
    return content_contract.load_tag_ontology()


def _load_tag_ontology_index() -> dict[str, object]:
    return content_contract.load_tag_ontology_index()


def _get_tag_labels_for_concept(concept_id: str) -> dict[str, str]:
    return content_contract.get_tag_labels_for_concept(concept_id)


def _resolve_tag_label_for_lang(concept_id: str, lang: str = "en") -> str:
    return content_contract.resolve_tag_label_for_lang(concept_id, lang=lang)


def _parse_tag_entries(raw: str, lang: str = "en") -> list[dict[str, object]]:
    return content_contract.parse_tag_entries(raw, lang=lang)


def _load_tag_alias_map(lang: str = "en") -> dict[str, str]:
    normalized_lang = _normalize_tag_lang(lang)
    cached = _TAG_ALIAS_MAP_CACHE.get(normalized_lang)
    if cached is not None:
        return cached

    alias_map: dict[str, str] = {}
    ontology_index = _load_tag_ontology_index()
    concepts_by_id = ontology_index.get("concepts_by_id", {})
    alias_to_concept_id = ontology_index.get("alias_to_concept_id", {})
    if isinstance(concepts_by_id, dict) and isinstance(alias_to_concept_id, dict):
        for key, concept_id in alias_to_concept_id.items():
            if not key:
                continue
            canonical = _resolve_tag_label_for_lang(str(concept_id or ""), normalized_lang)
            if canonical:
                alias_map[key] = canonical

    _TAG_ALIAS_MAP_CACHE[normalized_lang] = alias_map
    return alias_map


def _normalize_tags(raw: str, lang: str = "en") -> str:
    return content_contract.normalize_tags(raw, lang=lang)


def _extract_tag_concepts(raw: str, lang: str = "en") -> list[str]:
    return content_contract.extract_tag_concepts(raw, lang=lang)


def _extract_tag_label_map(raw: str, lang: str = "en") -> dict[str, dict[str, str]]:
    return content_contract.extract_tag_label_map(raw, lang=lang)


def _parse_bool(raw: str, default: bool = True) -> bool:
    return content_contract.parse_bool(raw, default=default)


def _normalize_date_value(raw: str) -> str:
    value = str(raw or "").strip()
    if not value:
        return ""
    try:
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            return value
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.date().isoformat()
    except ValueError as exc:
        raise SystemExit(f"Invalid date value: {raw}. Expected YYYY-MM-DD or ISO8601") from exc


def _normalize_priority_value(raw: str) -> str:
    value = str(raw or "").strip()
    if not value:
        return ""
    try:
        number = float(value)
    except ValueError as exc:
        raise SystemExit(f"Invalid Priority: {raw}. Expected a numeric value") from exc
    if number.is_integer():
        return str(int(number))
    return str(number)


def _source_last_modified_date(path: str) -> str:
    try:
        stamp = os.path.getmtime(path)
    except OSError:
        return ""
    return dt.datetime.fromtimestamp(stamp).date().isoformat()


def _extract_leading_markdown_title(markdown: str) -> str:
    for line in (markdown or "").splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        m = re.match(r"^#\s+(.*)$", stripped)
        return m.group(1).strip() if m else ""
    return ""


def _extract_simple_block(source_text: str, tag: str) -> tuple[str, str]:
    lines = (source_text or "").splitlines()
    out: list[str] = []
    block_lines: list[str] = []
    in_block = False
    open_tag = f"<{tag}>"
    close_tag = f"</{tag}>"
    for line in lines:
        stripped = line.strip()
        if not in_block and stripped == open_tag:
            in_block = True
            continue
        if in_block and stripped == close_tag:
            in_block = False
            continue
        if in_block:
            block_lines.append(line)
        else:
            out.append(line)
    return "\n".join(out), "\n".join(block_lines)


def _strip_author_only_blocks(source_text: str) -> str:
    body = source_text or ""
    body, _ = _extract_simple_block(body, "draft")
    return body


def _parse_anchors(block_text: str) -> tuple[dict[str, str], list[tuple[int, str, str]]]:
    anchors: dict[str, str] = {}
    toc_entries: list[tuple[int, str, str]] = []

    for raw in (block_text or "").splitlines():
        line = raw.strip()
        if not line:
            continue
        m = re.match(r"^([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*->\s*(.*)$", line)
        if not m:
            continue
        key = m.group(1).strip().lower()
        left = m.group(2).strip()
        right = m.group(3).strip()

        if key.startswith("toc"):
            m_level = re.match(r"^toc(\d+)$", key)
            if not m_level:
                continue
            level = int(m_level.group(1))
            toc_entries.append((level, left, right))
            continue

        anchors[f"{key}:{left}"] = right

    return anchors, toc_entries


def _parse_opening_tag_attrs(stripped: str, tag_name: str) -> dict[str, str]:
    m = re.match(rf"^<{re.escape(tag_name)}(?P<attrs>[^>]*)/?>$", stripped, flags=re.IGNORECASE)
    if not m:
        return {}
    attrs_text = (m.group("attrs") or "").strip()
    if not attrs_text:
        return {}
    attrs: dict[str, str] = {}
    attr_pattern = re.compile(
        r"""([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\[[^\]]*\])|([^\s>]+))"""
    )
    for match in attr_pattern.finditer(attrs_text):
        key = match.group(1).strip().lower()
        value = next((g for g in match.groups()[1:] if g is not None), "")
        attrs[key] = value.strip()
    return attrs


def _extract_qaprompt(source_text: str) -> tuple[str, dict[str, str]]:
    def _build_shared_qaprompt(question_count: int, prompt_type_spec: str) -> str:
        type_spec = (prompt_type_spec or "").strip() or '["mcq"]'
        return (
            "You are given a set of notes or an article.\n"
            f"Read and understand the content, then generate approximately {question_count} questions.\n"
            f"Requested question type(s): {type_spec}\n"
            "Most questions should be drawn directly from the material, focusing on key concepts, definitions,\n"
            "and core ideas, while a smaller portion can be creative or application-based,\n"
            "extending the material into real-world or novel scenarios but staying conceptually grounded.\n"
            "Include a mix of difficulty levels—beginner, intermediate, advanced, and professional.\n"
            "For each question, provide the question number, type (conceptual, application, analytical),\n"
            "difficulty, topic, the correct answer, and a brief explanation.\n"
            "If the requested question format requires options (for example MCQ), include the necessary answer choices.\n"
            "Focus on clarity, relevance, and meaningful application, avoiding trivial or overly obscure details.\n"
        )


    lines = (source_text or "").splitlines()
    out: list[str] = []
    in_block = False
    prompt: dict[str, str] = {}
    current_key = ""
    text_lines: list[str] = []
    prompt_placeholder = "<qprompt/>"
    closing_tag = ""
    saw_qprompt_tag = False

    def _finalize_prompt() -> None:
        nonlocal text_lines
        if text_lines:
            prompt["text"] = "\n".join(text_lines).rstrip() + "\n"
            prompt["append_core_markdown"] = "1"
        elif prompt or saw_qprompt_tag:
            question_count = int((prompt.get("count") or prompt.get("question") or prompt.get("questions") or "20").strip() or "20")
            prompt_type_spec = prompt.get("type", "")
            prompt.setdefault("title", "QA Generator Prompt")
            prompt["text"] = _build_shared_qaprompt(question_count, prompt_type_spec)
            prompt["append_core_markdown"] = "1"
        text_lines = []

    for line in lines:
        stripped = line.strip()
        open_tag = re.match(r"^<(qprompt)(?:\s+[^>]*)?\s*(/?)>$", stripped, flags=re.IGNORECASE)
        if not in_block and open_tag:
            saw_qprompt_tag = True
            prompt.update(_parse_opening_tag_attrs(stripped, "qprompt"))
            if open_tag.group(2) == "/":
                _finalize_prompt()
                out.append(prompt_placeholder)
                continue
            in_block = True
            closing_tag = f"</{open_tag.group(1).lower()}>"
            current_key = ""
            text_lines = []
            continue

        if in_block and stripped.lower() == closing_tag:
            _finalize_prompt()
            out.append(prompt_placeholder)
            in_block = False
            closing_tag = ""
            current_key = ""
            continue
        if not in_block:
            out.append(line)
            continue

        m = re.match(r"^(title|prompt)\s*:\s*(.*)$", stripped, flags=re.IGNORECASE)
        if m:
            current_key = m.group(1).strip().lower()
            value = m.group(2)
            if current_key == "title":
                prompt["title"] = value.strip()
            else:
                current_key = "prompt"
                if value.strip():
                    text_lines.append(value)
            continue

        if current_key == "prompt":
            text_lines.append(line.rstrip("\n"))

    return "\n".join(out), prompt


def _extract_core_markdown(source_text: str) -> str:
    return content_contract.extract_core_markdown(source_text)


def _estimate_reading_time_minutes(markdown: str) -> int:
    return content_contract.estimate_reading_time_minutes(markdown)


def _estimate_note_reading_time_minutes(rendered_html: str) -> int:
    raw_html = rendered_html or ""
    if not raw_html.strip():
        return 0

    text = html.unescape(re.sub(r"<[^>]+>", " ", raw_html))
    text = re.sub(r"\s+", " ", text).strip()
    latin_words = len(re.findall(r"[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?", text))
    cjk_chars = len(re.findall(r"[\u4E00-\u9FFF]", text))
    table_count = len(re.findall(r"<table\b", raw_html))
    pre_count = len(re.findall(r"<pre\b", raw_html))
    callout_count = len(re.findall(r'class="[^"]*(?:note-callout|note-block)[^"]*"', raw_html))
    dense_block_penalty = table_count * 0.4 + pre_count * 0.5 + callout_count * 0.2
    return max(1, int(math.ceil(latin_words / 170 + cjk_chars / 320 + dense_block_penalty)))


def _resolve_repo_dir() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _escape_text(text: str) -> str:
    return html.escape(text or "", quote=False)


def _escape_attr(text: str) -> str:
    return html.escape(text or "", quote=True)


def _render_note_quiz_html(title_text: str, questions: list[dict[str, str]], *, extra_classes: str = " mt-4") -> str:
    total = len(questions)
    if total <= 0:
        return ""

    items_html: list[str] = []
    for idx, q in enumerate(questions, start=1):
        q_text = (q.get("question") or "").strip()
        exp = (q.get("explanation") or "").strip()
        exp_one_line = re.sub(r"\s+", " ", exp).strip()
        correct = (q.get("answer") or "").strip().upper()

        options_html: list[str] = []
        for letter in ("A", "B", "C", "D"):
            opt = (q.get(letter.lower()) or "").strip()
            if not opt:
                continue
            response = (q.get(f"response{letter.lower()}") or "").strip() or "Incorrect."
            correct_attr = ""
            if letter == correct:
                response = response if response != "Incorrect." else (f"Correct. {exp_one_line}" if exp_one_line else "Correct.")
                correct_attr = ' data-correct="1"'
            response_attr = _escape_attr(response)
            label_html = _escape_text(f"{letter}. {opt}")
            options_html.append(
                f'<button type="button" class="note-quiz-option"{correct_attr} data-response="{response_attr}">{label_html}</button>'
            )

        options_joined = "\n".join(options_html)
        q_title_html = _escape_text(q_text)
        active_class = " active" if idx == 1 else ""
        items_html.append(
            f'<div class="carousel-item{active_class}">\n'
            f'  <div class="note-quiz-question" data-question="{idx}">\n'
            f'    <div class="note-quiz-question-title">{q_title_html}</div>\n'
            f'    <div class="note-quiz-options">\n{options_joined}\n    </div>\n'
            f'    <div class="note-quiz-response" aria-live="polite"></div>\n'
            f"  </div>\n"
            f"</div>"
        )

    items_joined = "\n".join(items_html)
    return (
        f'<div class="note-quiz{extra_classes}">\n'
        '  <div class="note-quiz-header">\n'
        f'    <div class="note-quiz-title"><i class="fa-regular fa-circle-check me-2"></i>{_escape_text(title_text)}</div>\n'
        '    <div class="note-quiz-controls">\n'
        f'      <div class="note-quiz-progress" aria-live="polite">1 / {total}</div>\n'
        '      <button type="button" class="note-quiz-reset">Reset</button>\n'
        "    </div>\n"
        "  </div>\n"
        '  <div class="carousel slide note-quiz-carousel" data-bs-ride="false" data-bs-interval="false" data-bs-touch="true">\n'
        '    <div class="carousel-inner">\n'
        f"{items_joined}\n"
        "    </div>\n"
        "  </div>\n"
        "</div>"
    )


def _render_qaprompt_block_html(qaprompt: dict[str, str], *, block_id: str) -> str:
    prompt_text = (qaprompt.get("text") or "").strip()
    if not prompt_text:
        return ""
    prompt_title = (qaprompt.get("title") or "QA Generator Prompt").strip()
    prompt_text_escaped = _escape_text(prompt_text)
    full_id = f"{block_id}--full"
    append_core_attr = ' data-qa-append-core="1"' if qaprompt.get("append_core_markdown") == "1" else ""
    return (
        f'<div class="note-qa" data-qa-block="{_escape_attr(block_id)}">\n'
        '  <div class="note-qa-header">\n'
        f'    <h3 class="mb-0"><i class="fa-regular fa-circle-question me-2"></i>{_escape_text(prompt_title)}</h3>\n'
        f'    <button type="button" class="note-qa-copy" data-qa-source="#{_escape_attr(full_id)}"{append_core_attr}>\n'
        '      <i class="fa-regular fa-copy me-2"></i>Copy\n'
        '    </button>\n'
        '  </div>\n'
        '  <div class="note-markdown-block">\n'
        f'    <pre class="mb-0"><code class="note-qa-preview">{prompt_text_escaped}</code></pre>\n'
        '  </div>\n'
        f'  <pre class="d-none"><code id="{_escape_attr(full_id)}" class="note-qa-full">{prompt_text_escaped}</code></pre>\n'
        '</div>'
    )


def _render_qaprompt_section_html(qaprompt: dict[str, str], *, section_id: str) -> str:
    qa_html = _render_qaprompt_block_html(qaprompt, block_id=section_id)
    if not qa_html:
        return ""
    return (
        f'<section id="{_escape_attr(section_id)}" class="note-section note-qa-section" data-md-exclude="1" data-aos="fade-up" data-aos-delay="120">\n'
        '  <div class="note-callout">\n'
        f'{qa_html}\n'
        '  </div>\n'
        '</section>'
    )


def _render_reviewkit_html(
    summary_title: str,
    summary_id: str,
    takeaways_html: str,
    primary_html: str,
    prompt_html: str,
) -> str:
    takeaways_html = (takeaways_html or "").strip()
    primary_html = (primary_html or "").strip()
    prompt_html = (prompt_html or "").strip()
    panes: list[tuple[str, str, str, bool]] = []
    if takeaways_html:
        panes.append(("takeaways", "Key Takeaways", takeaways_html, False))
    if primary_html:
        panes.append(("quiz", "Quick Quiz", primary_html, False))
    if prompt_html:
        panes.append(("prompt", "Quiz Generator Prompt", prompt_html, True))

    if not panes:
        return ""

    body_html = ""
    if len(panes) == 1:
        _, _, pane_html, _ = panes[0]
        body_html = f'    <div class="note-reviewkit-body">\n{pane_html}\n    </div>\n'
    else:
        tab_base = _slugify(summary_id or summary_title or "reviewkit") or "reviewkit"
        tab_items: list[str] = []
        pane_items: list[str] = []
        for idx, (pane_key, pane_label, pane_html, exclude_from_md) in enumerate(panes):
            is_active = idx == 0
            tab_id = f"{tab_base}--{pane_key}-tab"
            pane_id = f"{tab_base}--{pane_key}-pane"
            tab_items.append(
                '      <li class="nav-item" role="presentation">\n'
                f'        <button class="nav-link{" active" if is_active else ""}" id="{_escape_attr(tab_id)}" data-bs-toggle="tab" data-bs-target="#{_escape_attr(pane_id)}" type="button" role="tab" aria-controls="{_escape_attr(pane_id)}" aria-selected="{"true" if is_active else "false"}">{_escape_text(pane_label)}</button>\n'
                '      </li>\n'
            )
            extra_attrs = ' data-md-exclude="1"' if exclude_from_md else ""
            pane_items.append(
                f'      <div class="tab-pane fade{" show active" if is_active else ""} note-reviewkit-pane note-reviewkit-pane-{_escape_attr(pane_key)}" id="{_escape_attr(pane_id)}" role="tabpanel" aria-labelledby="{_escape_attr(tab_id)}" tabindex="0"{extra_attrs}>\n'
                f'{pane_html}\n'
                '      </div>\n'
            )
        body_html = (
            '    <div class="note-reviewkit-body">\n'
            '      <ul class="nav nav-tabs mb-3 note-reviewkit-tabs" role="tablist">\n'
            f'{"".join(tab_items)}'
            '      </ul>\n'
            '      <div class="tab-content note-reviewkit-content">\n'
            f'{"".join(pane_items)}'
            '      </div>\n'
            '    </div>\n'
        )
    if not body_html.strip():
        return ""

    return (
        f'<section id="{_escape_attr(summary_id)}" class="note-section note-reviewkit note-summary-kit" data-md-exclude="1" data-aos="fade-up" data-aos-delay="120">\n'
        '  <div class="note-callout note-summary-kit-shell">\n'
        '    <div class="note-summary-kit-header">\n'
        f'      <h3 class="mb-0">{_escape_text(summary_title)}</h3>\n'
        '    </div>\n'
        f'{body_html}'
        '  </div>\n'
        '</section>'
    )


def _safe_link_href(raw: str) -> str:
    href = (raw or "").strip()
    if not href:
        return ""
    allowed_prefixes = ("http://", "https://", "mailto:", "/", "#", "./", "../")
    if href.startswith(allowed_prefixes):
        return href
    return ""


def _default_card_cover_href(section_like: str = "") -> str:
    base = "https://copilot-sg-og.byteintl.net/api/ide/v1/text_to_image"
    normalized = str(section_like or "").strip().lower()
    if normalized == "writing":
        prompt = "Minimalist editorial photo of a modern desk with a printed magazine and a pen, soft studio lighting, shallow depth of field, high contrast, no text, professional, realistic"
    elif normalized == "canvas":
        prompt = "Minimalist gallery wall with pinned photographs, sketchbook pages and soft natural light, clean composition, high contrast, no text, professional, realistic"
    else:
        prompt = "Minimalist editorial photo of a notebook and pen on a dark desk, soft studio lighting, shallow depth of field, high contrast, no text, professional, realistic"
    query = urllib.parse.urlencode(
        {
            "prompt": prompt,
            "image_size": "landscape_4_3",
        }
    )
    return f"{base}?{query}"


def _normalize_repo_asset_href(
    repo_dir: str,
    raw: str,
    *,
    source_path: str = "",
    output_path: str = "",
) -> str:
    return content_contract.normalize_repo_asset_href(
        repo_dir,
        raw,
        source_path=source_path,
        output_path=output_path,
    )


def _safe_path_fragment(raw: str) -> str:
    s = (raw or "").strip()
    s = s.replace("/", "-").replace("\\", "-")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _extract_source_meta(source_text: str) -> tuple[dict[str, str], str]:
    return content_contract.extract_source_meta(source_text)


def _substitute_path_template(template: str, title: str, slug: str) -> str:
    title_fragment = _safe_path_fragment(title)
    title_slug = _slugify(title) or slug
    mapping = {
        "title": title_fragment,
        "slug": slug,
        "titleslug": title_slug,
        "title_slug": title_slug,
    }

    def repl(m: re.Match[str]) -> str:
        key = (m.group(1) or "").strip().lower()
        return mapping.get(key, m.group(0))

    return re.sub(r"\{([A-Za-z0-9_]+)\}", repl, template or "")


def _resolve_output_path(repo_dir: str, out_spec: str, title: str, slug: str) -> str:
    rel = _substitute_path_template(out_spec, title=title, slug=slug).strip()
    rel = rel.replace("\\", "/")
    if not rel or rel.startswith("/"):
        raise SystemExit(f"Invalid output path in <meta>: {out_spec}")
    norm = os.path.normpath(rel)
    if norm == ".." or norm.startswith(".." + os.sep):
        raise SystemExit(f"Invalid output path in <meta>: {out_spec}")
    abs_path = os.path.abspath(os.path.join(repo_dir, norm))
    repo_prefix = os.path.abspath(repo_dir) + os.sep
    if not abs_path.startswith(repo_prefix):
        raise SystemExit(f"Invalid output path in <meta>: {out_spec}")
    return abs_path


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
    entries = _ACTIVE_CONTENT_LINK_REGISTRY.get(normalized_canonical, [])
    if not entries:
        return None

    active_lang = _normalize_tag_lang(preferred_lang or _ACTIVE_CONTENT_LINK_LANG or "en")
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
        cover_src = _default_card_cover_href(content_kind)
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
    current_output_path = _ACTIVE_CONTENT_LINK_OUTPUT_PATH
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
        next_link = s.find("[", i)
        next_bold = s.find("**", i)
        next_italic = s.find("*", i)

        candidates = [p for p in (next_information, next_content_link, next_link, next_bold, next_italic) if p != -1]
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

        if s.startswith("**", i):
            k = s.find("**", i + 2)
            if k == -1:
                out.append(_escape_text(s[i:]))
                break
            inner = s[i + 2 : k]
            out.append(f"<strong>{_escape_text(inner)}</strong>")
            i = k + 2
            continue

        if s[i] == "*" and not s.startswith("**", i):
            k = s.find("*", i + 1)
            if k == -1:
                out.append(_escape_text(s[i:]))
                break
            inner = s[i + 1 : k]
            if inner.strip():
                out.append(f"<em>{_escape_text(inner)}</em>")
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
                f'<a href="{_escape_attr(href)}" target="_blank" rel="noopener noreferrer">{label_html}</a>'
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


def _rel_url_prefix(from_dir: str, to_dir: str) -> str:
    rel = os.path.relpath(to_dir, from_dir).replace(os.sep, "/")
    if rel == ".":
        return ""
    if not rel.endswith("/"):
        rel += "/"
    return rel


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


def _load_page_shared_partial(repo_dir: str, name: str) -> Optional[str]:
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

    style_css_path = os.path.join(style_dir, "style.css") if style_dir else ""
    shared_style_css_path = os.path.join(repo_dir, "assets", "css", "content-page", style_name, "style.css")
    if os.path.exists(shared_style_css_path):
        style_css = f'<link rel="stylesheet" href="{repo_prefix}assets/css/content-page/{style_name}/style.css?v=2026-06-20-1">'
    elif style_css_path and os.path.exists(style_css_path):
        style_css = f'<link rel="stylesheet" href="{repo_prefix}assets/css/content-page/{style_name}/style.css?v=2026-06-20-1">'
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
        source_meta = f'<meta name="garden:source" content="{_escape_attr(source_rel_path.replace(os.sep, "/"))}">'

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


def _markdown_to_html(
    markdown: str,
    style,
    doc_title: str = "",
    wrap_sections: bool = True,
    anchors: dict[str, str] | None = None,
    toc_overrides: list[tuple[int, str, str]] | None = None,
    qaprompt: dict[str, str] | None = None,
    allow_raw_html: bool = False,
    source_path: str = "",
    source_meta: dict[str, str] | None = None,
) -> tuple[str, str]:
    global _ACTIVE_CONTENT_LINK_LANG, _ACTIVE_INFORMATION_LANG
    lines = (markdown or "").splitlines()
    blocks: list[str] = []
    paragraph_lines: list[str] = []

    in_code = False
    code_lang = ""
    code_lines: list[str] = []

    list_kind: str | None = None
    list_items: list[str] = []

    toc_entries: list[tuple[int, str, str]] = []
    used_heading_ids: dict[str, int] = {}
    current_section_lines: list[str] = []
    current_section_id = ""
    current_section_delay = 120

    anchors = anchors or {}
    toc_overrides = toc_overrides or []
    qaprompt = qaprompt or {}
    source_meta = source_meta or {}
    _ACTIVE_INFORMATION_LANG = str(source_meta.get("lang") or "").strip() or "en"
    _ACTIVE_CONTENT_LINK_LANG = _ACTIVE_INFORMATION_LANG

    def _anchor_lookup(prefix: str, title: str) -> str:
        return anchors.get(f"{prefix}:{title}", "").strip()

    def _unique_heading_id(raw: str) -> str:
        base = _slugify(raw) or "section"
        n = used_heading_ids.get(base, 0)
        used_heading_ids[base] = n + 1
        return base if n == 0 else f"{base}-{n+1}"

    def flush_section() -> None:
        nonlocal current_section_lines, current_section_id, current_section_delay
        if not current_section_lines:
            return
        inner = "\n\n".join([b for b in current_section_lines if b])
        if wrap_sections:
            attrs = ""
            if current_section_id:
                attrs = f' id="{_escape_attr(current_section_id)}"'
            blocks.append(
                f'<section{attrs} class="note-section" data-aos="fade-up" data-aos-delay="{current_section_delay}">\n{inner}\n</section>'
            )
        else:
            blocks.append(inner)
        current_section_lines = []
        current_section_id = ""
        current_section_delay = 120

    def _normalize_block_content_html(raw_html: str) -> str:
        s = (raw_html or "").strip()
        if not s:
            return ""
        s = re.sub(r'^<p class="mb-3">', '<p class="mb-2">', s)
        s = re.sub(r'<p class="mb-3">([^<]*)</p>\s*$', r'<p class="mb-0">\1</p>', s)
        return s

    def render_block(title: str, content_html: str, block_id: str) -> str:
        title_text = title.strip()
        title_html = _render_inline(title_text) if title_text else ""
        header_html = f'<p class="mb-2"><strong>{title_html}</strong></p>' if title_html else ""
        attrs = f' id="{_escape_attr(block_id)}"' if block_id else ""
        content_norm = _normalize_block_content_html(content_html)
        return f'<div{attrs} class="note-callout mb-3">{header_html}{content_norm}</div>'

    def render_takeaways(content_html: str) -> str:
        content_norm = _normalize_block_content_html(content_html)
        title_html = (
            '<div class="note-takeaways-header">'
            '  <div class="note-takeaways-icon" aria-hidden="true"><i class="fa-regular fa-lightbulb"></i></div>'
            '  <div class="note-takeaways-heading-group">'
            '    <h3 class="note-takeaways-title">Key Takeaways</h3>'
            '  </div>'
            '</div>'
        )
        return f'<div class="note-callout note-takeaways mb-3">{title_html}{content_norm}</div>'

    def render_callout(
        icon: str,
        icon_style: str,
        title: str,
        content_html: str,
        callout_id: str,
        variant: str,
        size: str,
        first_in_section: bool,
    ) -> str:
        icon_name = (icon or "").strip()
        icon_style_norm = (icon_style or "").strip().lower() or "solid"
        fa_prefix = "fa-solid"
        if icon_style_norm in ("regular", "far"):
            fa_prefix = "fa-regular"
        icon_class = f"{fa_prefix} fa-{_slugify(icon_name)}"

        title_html = _render_inline(title.strip())
        header_html = f'<h4 class="mb-2"><i class="{_escape_attr(icon_class)} me-2"></i>{title_html}</h4>' if title_html else ""
        attrs: list[str] = []
        if callout_id:
            attrs.append(f'id="{_escape_attr(callout_id)}"')
        attrs_text = (" " + " ".join(attrs)) if attrs else ""
        extra_attrs = ""
        if first_in_section:
            extra_attrs = ' data-aos="fade-up" data-aos-delay="80"'
        mb_class = "" if first_in_section else " mb-3"
        return f'<div{attrs_text} class="note-callout{mb_class}"{extra_attrs}>{header_html}{content_html}</div>'

    def build_toc_links() -> str:
        out: list[str] = []
        if toc_overrides:
            for lvl, hid, text in toc_overrides:
                css_level = "level-1" if lvl == 1 else "level-2"
                out.append(
                    f'<a class="note-toc-link {css_level}" href="#{_escape_attr(hid)}">{_escape_text(text)}</a>'
                )
            return "\n".join(out)

        for level, hid, text in toc_entries:
            css_level = "level-1" if level == 2 else "level-2"
            out.append(
                f'<a class="note-toc-link {css_level}" href="#{_escape_attr(hid)}">{_escape_text(text)}</a>'
            )
        return "\n".join(out)

    def flush_paragraph() -> None:
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        text = " ".join([ln.strip() for ln in paragraph_lines if ln.strip()])
        if text:
            current_section_lines.append(style.paragraph(_render_inline(text)))
        paragraph_lines = []

    def flush_list() -> None:
        nonlocal list_kind, list_items
        if not list_kind or not list_items:
            list_kind = None
            list_items = []
            return
        rendered_items = [_render_inline(item) for item in list_items]
        if list_kind == "ul":
            current_section_lines.append(style.ul(rendered_items))
        else:
            current_section_lines.append(style.ol(rendered_items))
        list_kind = None
        list_items = []

    def _maybe_bold_term(text: str) -> str:
        s = (text or "").strip()
        m_term = re.match(r"^([A-Z][A-Za-z0-9_-]*)\s+(values|data)\b(.*)$", s)
        if not m_term:
            return s
        return f"**{m_term.group(1)}** {m_term.group(2)}{m_term.group(3)}"

    def _render_ul(items_md: list[str], class_attr: str) -> str:
        items_html = "\n".join([f"<li>{_render_inline(_maybe_bold_term(item))}</li>" for item in items_md])
        return f'<ul class="{_escape_attr(class_attr)}">\n{items_html}\n</ul>'

    def _count_indent(raw_line: str) -> int:
        expanded = raw_line.expandtabs(4)
        return len(expanded) - len(expanded.lstrip(" "))

    def _render_nested_ul_tree(nodes: list[dict[str, object]]) -> str:
        items_html: list[str] = []
        for node in nodes:
            text = _render_inline(_maybe_bold_term(str(node.get("text") or "")))
            paras = node.get("paras") or []
            children = node.get("children") or []

            para_html = ""
            if paras:
                rendered_paras = [_render_inline(p) for p in paras if isinstance(p, str) and p.strip()]
                para_html = "\n" + "\n".join(f'<p class="mb-2">{p}</p>' for p in rendered_paras)

            nested_html = ("\n" + _render_nested_ul_tree(children)) if children else ""
            items_html.append(f"<li>{text}{para_html}{nested_html}</li>")
        return f'<ul class="note-list">\n' + "\n".join(items_html) + "\n</ul>"

    def _parse_nested_ul(start_idx: int) -> tuple[str, int]:
        root: list[dict[str, object]] = []
        stack: list[tuple[int, list[dict[str, object]], dict[str, object] | None]] = [(-1, root, None)]
        i_local = start_idx
        while i_local < len(lines):
            raw_line = lines[i_local].rstrip("\n")
            stripped_local = raw_line.strip()

            if not stripped_local:
                next_i = i_local + 1
                while next_i < len(lines) and not lines[next_i].strip():
                    next_i += 1
                if next_i >= len(lines):
                    i_local = next_i
                    break
                next_raw = lines[next_i].rstrip("\n")
                next_st = next_raw.strip()
                next_indent = _count_indent(next_raw)

                m_next_bullet = re.match(r"^(\s*)([*+-])\s+(.*)$", next_raw)
                if m_next_bullet or next_indent >= 4:
                    if re.match(r"^(#{1,6})\s+", next_st) or (next_st.startswith("<") and next_st.endswith(">") and next_st not in ("<br>", "<br/>")):
                        i_local = next_i
                        break
                    if not m_next_bullet and next_indent < 4:
                        i_local = next_i
                        break
                    i_local = next_i
                    continue
                else:
                    i_local = next_i
                    break

            m_item = re.match(r"^(\s*)([*+-])\s+(.*)$", raw_line)
            if m_item:
                indent = _count_indent(raw_line)
                text = m_item.group(3).strip()
                while len(stack) > 1 and indent <= stack[-1][0]:
                    stack.pop()
                node: dict[str, object] = {"text": text, "paras": [], "children": []}
                stack[-1][1].append(node)
                stack.append((indent, node["children"], node))  # type: ignore[index]
                i_local += 1
            else:
                indent = _count_indent(raw_line)
                if indent >= 4 and len(stack) > 1:
                    if re.match(r"^(#{1,6})\s+", stripped_local) or (stripped_local.startswith("<") and stripped_local.endswith(">") and stripped_local not in ("<br>", "<br/>")):
                        break
                    curr_node = stack[-1][2]
                    if curr_node is not None:
                        curr_node["paras"].append(stripped_local)  # type: ignore[index]
                    i_local += 1
                else:
                    break
        return _render_nested_ul_tree(root), i_local

    def _render_complex_ol(items: list[tuple[str, list[str], list[str]]]) -> str:
        li_html: list[str] = []
        for idx, (title, paras, subitems) in enumerate(items):
            title_html = f"<strong>{_render_inline(title)}</strong><br>"
            para_html = ""
            if paras:
                para_html = _render_inline(" ".join([p.strip() for p in paras if p.strip()]))
            nested_html = ""
            if subitems:
                nested_html = _render_ul(subitems, "mb-0 mt-2")
            cls = ' class="mb-2"' if idx == 0 else ""
            li_html.append(f"<li{cls}>\n  {title_html}\n  {para_html}\n  {nested_html}\n</li>")
        return "<ol class=\"mb-3\">\n" + "\n".join(li_html) + "\n</ol>"

    def _should_render_complex_ol(items: list[tuple[str, list[str], list[str]]]) -> bool:
        return any(paras or subitems for _, paras, subitems in items)

    def _split_table_row(row_text: str) -> list[str]:
        row = row_text.strip()
        if row.startswith("|"):
            row = row[1:]
        if row.endswith("|"):
            row = row[:-1]
        return [cell.strip() for cell in row.split("|")]

    def _is_table_divider(row_text: str) -> bool:
        cells = _split_table_row(row_text)
        if not cells:
            return False
        for cell in cells:
            normalized = cell.replace(":", "").replace("-", "").replace(" ", "")
            if normalized:
                return False
            if "-" not in cell:
                return False
        return True

    def _looks_like_table_header(idx: int) -> bool:
        if idx + 1 >= len(lines):
            return False
        header = lines[idx].strip()
        divider = lines[idx + 1].strip()
        if "|" not in header or "|" not in divider:
            return False
        if not _is_table_divider(divider):
            return False
        header_cells = _split_table_row(header)
        divider_cells = _split_table_row(divider)
        return len(header_cells) >= 2 and len(header_cells) == len(divider_cells)

    def _parse_table(start_idx: int) -> tuple[str, int]:
        headers = [_render_inline(cell) for cell in _split_table_row(lines[start_idx].strip())]
        rows: list[list[str]] = []
        i_local = start_idx + 2
        while i_local < len(lines):
            row_text = lines[i_local].rstrip("\n")
            stripped_row = row_text.strip()
            if not stripped_row:
                break
            if "|" not in stripped_row:
                break
            cells = _split_table_row(stripped_row)
            if len(cells) != len(headers):
                break
            rows.append([_render_inline(cell) for cell in cells])
            i_local += 1
        return style.table(headers, rows), i_local

    i = 0
    while i < len(lines):
        raw_line = lines[i]
        line = raw_line.rstrip("\n")
        stripped = line.strip()

        if in_code:
            if stripped.startswith("```"):
                current_section_lines.append(style.codeblock("\n".join(code_lines), code_lang))
                in_code = False
                code_lang = ""
                code_lines = []
            else:
                code_lines.append(line)
            i += 1
            continue

        if stripped.startswith("```"):
            flush_paragraph()
            flush_list()
            in_code = True
            code_lang = stripped[3:].strip()
            code_lines = []
            i += 1
            continue

        if stripped == "<callout>":
            flush_paragraph()
            flush_list()
            i += 1
            callout_id = ""
            icon = ""
            icon_style = ""
            title = ""
            variant = ""
            size = ""
            toc_label = ""
            content_lines: list[str] = []
            in_content = False
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</callout>":
                    break
                if not in_content:
                    m_kv = re.match(
                        r"^(id|icon|style|title|variant|size|toc|content)\s*:\s*(.*)$",
                        inner_stripped,
                        flags=re.IGNORECASE,
                    )
                    if m_kv:
                        key = m_kv.group(1).strip().lower()
                        value = m_kv.group(2).strip()
                        if key == "id":
                            callout_id = value
                        elif key == "icon":
                            icon = value
                        elif key == "style":
                            icon_style = value
                        elif key == "title":
                            title = value
                        elif key == "variant":
                            variant = value
                        elif key == "size":
                            size = value
                        elif key == "toc":
                            toc_label = value
                        else:
                            in_content = True
                            if value:
                                content_lines.append(value)
                    elif inner_stripped:
                        content_lines.append(inner_stripped)
                else:
                    content_lines.append(inner)
                i += 1
            content_md = "\n".join(content_lines).strip()
            inner_html, _ = _markdown_to_html(
                content_md,
                style=style,
                doc_title="",
                wrap_sections=False,
                anchors={},
                toc_overrides=[],
                qaprompt={},
                allow_raw_html=allow_raw_html,
                source_path=source_path,
                source_meta=source_meta,
            )
            if not callout_id:
                callout_id = _anchor_lookup("callout", title) or (_slugify(title) if title else "")
            first_in_section = len(current_section_lines) == 0
            callout_html = render_callout(
                icon=icon,
                icon_style=icon_style,
                title=title,
                content_html=inner_html,
                callout_id=callout_id,
                variant=variant,
                size=size,
                first_in_section=first_in_section,
            )
            current_section_lines.append(callout_html)
            if toc_label and callout_id:
                toc_entries.append((3, callout_id, toc_label))
            while i < len(lines) and lines[i].strip() != "</callout>":
                i += 1
            i += 1
            continue

        quiz_tag = re.match(r"^<(qquiz)(?:\s+[^>]*)?\s*(/?)>$", stripped, flags=re.IGNORECASE)
        if quiz_tag:
            flush_paragraph()
            flush_list()
            quiz_attrs = _parse_opening_tag_attrs(stripped, "qquiz")
            quiz_title = ""
            questions: list[dict[str, str]] = []
            external_quiz = bool(quiz_attrs.get("src") or quiz_attrs.get("bank"))
            if external_quiz:
                bank_ref = (quiz_attrs.get("src") or quiz_attrs.get("bank") or "").strip()
                raw_ids = (quiz_attrs.get("ids") or quiz_attrs.get("questions") or "").strip()
                requested_ids = [item.strip() for item in raw_ids.split(",") if item.strip()]
                loaded_questions = question_bank.load_questions_for_note(
                    source_path,
                    source_meta,
                    bank_ref,
                    question_ids=requested_ids,
                )
                questions = [question_bank.convert_question_to_quiz_entry(item) for item in loaded_questions]
                quiz_title = (quiz_attrs.get("title") or "").strip()
                if quiz_tag.group(2) == "/":
                    title_text = quiz_title.strip() or "Quick Quiz"
                    quiz_html = _render_note_quiz_html(title_text, questions, extra_classes=" mt-4")
                    if quiz_html:
                        current_section_lines.append(quiz_html)
                    i += 1
                    continue
            i += 1

            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</qquiz>":
                    break

                m_title = re.match(r"^title\s*:\s*(.*)$", inner_stripped, flags=re.IGNORECASE)
                if m_title and not questions:
                    quiz_title = m_title.group(1).strip()
                    i += 1
                    continue

                if inner_stripped == "<question>":
                    i += 1
                    q: dict[str, str] = {}
                    current_key = ""
                    while i < len(lines):
                        qline = lines[i].rstrip("\n")
                        qstripped = qline.strip()
                        if qstripped == "</question>":
                            break
                        m_kv = re.match(
                            r"^(question|a|b|c|d|answer|explanation|responsea|responseb|responsec|responsed)\s*:\s*(.*)$",
                            qstripped,
                            flags=re.IGNORECASE,
                        )
                        if m_kv:
                            current_key = m_kv.group(1).strip().lower()
                            q[current_key] = m_kv.group(2).strip()
                        elif current_key in ("explanation", "question") and qstripped:
                            q[current_key] = (q.get(current_key, "") + "\n" + qline).strip()
                        i += 1
                    if q:
                        questions.append(q)
                    while i < len(lines) and lines[i].strip() != "</question>":
                        i += 1
                    i += 1
                    continue

                i += 1

            title_text = quiz_title.strip() or "Quick Quiz"
            quiz_html = _render_note_quiz_html(title_text, questions, extra_classes=" mt-4")
            if quiz_html:
                current_section_lines.append(quiz_html)

            while i < len(lines) and lines[i].strip() != "</qquiz>":
                i += 1
            i += 1
            continue

        if stripped == "<reviewkit>":
            flush_paragraph()
            flush_list()
            flush_section()
            i += 1
            summary_title = "Review Kit"
            summary_id = ""
            summary_toc = ""
            quiz_lines: list[str] = []
            parsing_reviewkit_meta = True
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</reviewkit>":
                    break
                m_kv = re.match(r"^(title|id|toc)\s*:\s*(.*)$", inner_stripped, flags=re.IGNORECASE)
                if parsing_reviewkit_meta and m_kv:
                    key = m_kv.group(1).strip().lower()
                    value = m_kv.group(2).strip()
                    if key == "title":
                        summary_title = value or summary_title
                    elif key == "id":
                        summary_id = value
                    else:
                        summary_toc = value
                    i += 1
                    continue
                if inner_stripped:
                    parsing_reviewkit_meta = False
                quiz_lines.append(inner)
                i += 1

            if not summary_id:
                summary_id = _anchor_lookup("section", summary_title) or _slugify(summary_title)

            has_prompt_placeholder = False
            takeaways_lines: list[str] = []
            reviewkit_lines: list[str] = []
            rk_i = 0
            while rk_i < len(quiz_lines):
                line = quiz_lines[rk_i]
                line_stripped = line.strip()
                if line_stripped == "<qprompt/>":
                    has_prompt_placeholder = True
                    rk_i += 1
                    continue
                if line_stripped == "<takeaways>":
                    takeaways_lines.append(line)
                    rk_i += 1
                    while rk_i < len(quiz_lines):
                        takeaways_lines.append(quiz_lines[rk_i])
                        if quiz_lines[rk_i].strip() == "</takeaways>":
                            rk_i += 1
                            break
                        rk_i += 1
                    continue
                reviewkit_lines.append(line)
                rk_i += 1

            takeaways_md = "\n".join(takeaways_lines).strip()
            takeaways_html = ""
            if takeaways_md:
                takeaways_html, _ = _markdown_to_html(
                    takeaways_md,
                    style=style,
                    doc_title="",
                    wrap_sections=False,
                    anchors=anchors,
                    toc_overrides=[],
                    qaprompt={},
                    allow_raw_html=allow_raw_html,
                    source_path=source_path,
                    source_meta=source_meta,
                )
                takeaways_html = takeaways_html.strip().replace(
                    'class="note-callout note-takeaways mb-3"',
                    'class="note-callout note-takeaways note-takeaways-embedded mb-0"',
                )
            reviewkit_md = "\n".join(reviewkit_lines)
            reviewkit_primary_html, _ = _markdown_to_html(
                reviewkit_md,
                style=style,
                doc_title="",
                wrap_sections=False,
                anchors=anchors,
                toc_overrides=[],
                qaprompt={},
                allow_raw_html=allow_raw_html,
                source_path=source_path,
                source_meta=source_meta,
            )
            reviewkit_primary_html = (
                reviewkit_primary_html.strip().replace('class="note-quiz mt-4"', 'class="note-quiz"')
            )
            prompt_html = _render_qaprompt_block_html(qaprompt, block_id=f"{summary_id}--prompt") if has_prompt_placeholder else ""
            summary_html = _render_reviewkit_html(
                summary_title,
                summary_id,
                takeaways_html,
                reviewkit_primary_html,
                prompt_html,
            )

            if summary_html:
                blocks.append(summary_html)
            if _parse_bool(summary_toc, default=False) and summary_id:
                toc_entries.append((2, summary_id, summary_title))

            while i < len(lines) and lines[i].strip() != "</reviewkit>":
                i += 1
            i += 1
            continue

        if stripped == "<qprompt/>":
            flush_paragraph()
            flush_list()
            flush_section()
            prompt_section_id = _slugify((qaprompt.get("title") or "qa-prompt").strip()) or "qa-prompt"
            qa_html = _render_qaprompt_section_html(qaprompt, section_id=prompt_section_id)
            if qa_html:
                blocks.append(qa_html)
            i += 1
            continue

        if stripped == "<block>":
            flush_paragraph()
            flush_list()
            i += 1
            block_id = ""
            title = ""
            content_lines: list[str] = []
            in_content = False
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</block>":
                    break
                if not in_content:
                    m_kv = re.match(r"^(id|title|content)\s*:\s*(.*)$", inner_stripped, flags=re.IGNORECASE)
                    if m_kv:
                        key = m_kv.group(1).strip().lower()
                        value = m_kv.group(2).strip()
                        if key == "id":
                            block_id = value
                        elif key == "title":
                            title = value
                        else:
                            in_content = True
                            if value:
                                content_lines.append(value)
                    elif inner_stripped:
                        content_lines.append(inner_stripped)
                else:
                    content_lines.append(inner)
                i += 1

            content_md = "\n".join(content_lines).strip()
            if title.strip() or content_md.strip():
                inner_html, _ = _markdown_to_html(
                    content_md,
                    style=style,
                    doc_title="",
                    wrap_sections=False,
                    source_path=source_path,
                    source_meta=source_meta,
                )
                if not block_id:
                    block_id = _anchor_lookup("block", title) or ""
                current_section_lines.append(render_block(title=title, content_html=inner_html, block_id=block_id))
            while i < len(lines) and lines[i].strip() != "</block>":
                i += 1
            i += 1
            continue

        if stripped == "<takeaways>":
            flush_paragraph()
            flush_list()
            i += 1
            takeaway_lines: list[str] = []
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</takeaways>":
                    break
                takeaway_lines.append(inner)
                i += 1

            takeaways_md = "\n".join(takeaway_lines).strip()
            if takeaways_md:
                inner_html, _ = _markdown_to_html(
                    takeaways_md,
                    style=style,
                    doc_title="",
                    wrap_sections=False,
                    anchors={},
                    toc_overrides=[],
                    qaprompt={},
                    allow_raw_html=allow_raw_html,
                    source_path=source_path,
                    source_meta=source_meta,
                )
                current_section_lines.append(render_takeaways(inner_html))
            while i < len(lines) and lines[i].strip() != "</takeaways>":
                i += 1
            i += 1
            continue

        if stripped == "<image>":
            flush_paragraph()
            flush_list()
            i += 1
            image_id = ""
            src = ""
            alt = ""
            caption = ""
            width = ""
            align = ""
            link = ""
            lazy = True
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</image>":
                    break
                m_kv = re.match(
                    r"^(id|src|alt|caption|width|align|link|lazy)\s*:\s*(.*)$",
                    inner_stripped,
                    flags=re.IGNORECASE,
                )
                if m_kv:
                    key = m_kv.group(1).strip().lower()
                    value = m_kv.group(2).strip()
                    if key == "id":
                        image_id = value
                    elif key == "src":
                        src = value
                    elif key == "alt":
                        alt = value
                    elif key == "caption":
                        caption = value
                    elif key == "width":
                        width = value
                    elif key == "align":
                        align = value
                    elif key == "link":
                        link = value
                    elif key == "lazy":
                        lazy = _parse_bool(value, default=True)
                i += 1

            safe_src = _safe_link_href(src)
            safe_link = _safe_link_href(link)
            safe_width = ""
            if width and re.fullmatch(r"[0-9.]+(%|px|rem|em|vw|vh)", width.strip()):
                safe_width = width.strip()
            align_norm = (align or "").strip().lower()
            if align_norm not in ("left", "center", "right"):
                align_norm = ""
            style_attr = f' style="max-width: {safe_width};"' if safe_width else ""
            id_attr = f' id="{_escape_attr(image_id)}"' if image_id else ""
            figure_class = "note-image" + (f" align-{align_norm}" if align_norm else "")
            caption_html = (
                f'<figcaption class="note-image-caption">{_render_inline(caption)}</figcaption>'
                if caption.strip()
                else ""
            )
            if safe_src:
                loading_attr = ' loading="lazy"' if lazy else ""
                img_html = f'<img src="{_escape_attr(safe_src)}" alt="{_escape_attr(alt)}"{loading_attr}>'
                if safe_link:
                    img_html = f'<a class="note-image-link" href="{_escape_attr(safe_link)}">{img_html}</a>'
                current_section_lines.append(
                    f'<figure{id_attr} class="{figure_class}"{style_attr}>{img_html}{caption_html}</figure>'
                )
            else:
                placeholder_text = _render_inline(caption.strip() or "Image")
                current_section_lines.append(
                    f'<div{id_attr} class="note-image-placeholder"{style_attr}>{placeholder_text}</div>'
                )

            while i < len(lines) and lines[i].strip() != "</image>":
                i += 1
            i += 1
            continue

        if stripped in ("<br>", "<br/>"):
            flush_paragraph()
            flush_list()
            current_section_lines.append("<br>")
            i += 1
            continue

        if stripped == "<rawhtml>":
            if not allow_raw_html:
                raise SystemExit("<rawhtml> is disabled. Set AllowRawHtml: true in <meta> to enable.")
            flush_paragraph()
            flush_list()
            i += 1
            raw_lines: list[str] = []
            while i < len(lines) and lines[i].strip() != "</rawhtml>":
                raw_lines.append(lines[i])
                i += 1
            current_section_lines.append("\n".join(raw_lines))
            while i < len(lines) and lines[i].strip() != "</rawhtml>":
                i += 1
            i += 1
            continue

        if not stripped:
            flush_paragraph()
            flush_list()
            i += 1
            continue

        if re.fullmatch(r"(-{3,}|\*{3,}|_{3,})", stripped):
            flush_paragraph()
            flush_list()
            current_section_lines.append(style.hr())
            i += 1
            continue

        if _looks_like_table_header(i):
            flush_paragraph()
            flush_list()
            table_html, next_i = _parse_table(i)
            current_section_lines.append(table_html)
            i = next_i
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            flush_paragraph()
            flush_list()
            level = len(m.group(1))
            title = m.group(2).strip()
            if level == 1 and not blocks and not current_section_lines:
                if doc_title and _slugify(title) == _slugify(doc_title):
                    i += 1
                    continue

            anchor_hid = _anchor_lookup(f"h{level}", title) if level in (2, 3) else ""
            hid = anchor_hid or _unique_heading_id(title)
            if level in (2, 3) and not toc_overrides:
                toc_entries.append((level, hid, title))

            if level == 2:
                flush_section()
                current_section_id = hid
                current_section_lines.append(f'<h3 class="mb-3">{_render_inline(title)}</h3>')
            elif level == 3:
                current_section_lines.append(f'<h4 id="{_escape_attr(hid)}" class="mb-2">{_render_inline(title)}</h4>')
            else:
                current_section_lines.append(style.heading(level, _render_inline(title)))
            i += 1
            continue

        if stripped.startswith("> "):
            flush_paragraph()
            flush_list()
            quote = stripped[2:].strip()
            current_section_lines.append(style.blockquote(_render_inline(quote)))
            i += 1
            continue

        m_ul = re.match(r"^(\*|-|\+)\s+(.*)$", stripped)
        m_ol = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m_ul:
            flush_paragraph()
            flush_list()
            nested_ul_html, next_i = _parse_nested_ul(i)
            current_section_lines.append(nested_ul_html)
            i = next_i
            continue
        if m_ol:
            flush_paragraph()
            flush_list()
            items: list[tuple[str, list[str], list[str]]] = []
            while i < len(lines):
                first = lines[i].strip()
                m_item = re.match(r"^(\d+)\.\s+(.*)$", first)
                if not m_item:
                    break
                title = m_item.group(2).strip()
                i += 1
                paras: list[str] = []
                subitems: list[str] = []
                while i < len(lines):
                    raw_inner = lines[i].rstrip("\n")
                    st = raw_inner.strip()
                    if not st:
                        next_i = i + 1
                        while next_i < len(lines) and not lines[next_i].strip():
                            next_i += 1
                        if next_i >= len(lines):
                            i = next_i
                            break
                        next_raw = lines[next_i].rstrip("\n")
                        next_st = next_raw.strip()
                        next_indent = _count_indent(next_raw)
                        if re.match(r"^(\d+)\.\s+", next_st):
                            i = next_i
                            break
                        if re.match(r"^(#{1,6})\s+", next_st):
                            i = next_i
                            break
                        if next_st.startswith("<") and next_st.endswith(">") and next_st not in ("<br>", "<br/>"):
                            i = next_i
                            break
                        if next_indent < 4:
                            i = next_i
                            break
                        i = next_i
                        continue
                    if re.match(r"^(\d+)\.\s+", st):
                        break
                    if re.match(r"^(#{1,6})\s+", st):
                        break
                    if st.startswith("<") and st.endswith(">") and st not in ("<br>", "<br/>"):
                        break
                    if _count_indent(raw_inner) < 4:
                        break
                    m_sub = re.match(r"^(\*|-|\+)\s+(.*)$", st)
                    if m_sub:
                        subitems.append(m_sub.group(2).strip())
                    else:
                        paras.append(st)
                    i += 1
                items.append((title, paras, subitems))
            if items:
                if _should_render_complex_ol(items):
                    current_section_lines.append(_render_complex_ol(items))
                else:
                    current_section_lines.append(style.ol([_render_inline(title) for title, _, _ in items]))
            continue

        if list_kind:
            flush_list()

        paragraph_lines.append(stripped)
        i += 1

    if in_code:
        current_section_lines.append(style.codeblock("\n".join(code_lines), code_lang))

    flush_paragraph()
    flush_list()
    flush_section()
    blocks.extend(style.after_document() or [])

    rendered = "\n\n".join([b for b in blocks if b is not None and b != ""]).strip()
    return rendered, build_toc_links()


def _self_test() -> None:
    global _ACTIVE_CONTENT_LINK_LANG, _ACTIVE_CONTENT_LINK_OUTPUT_PATH, _ACTIVE_CONTENT_LINK_REGISTRY
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
        "TLDR: Draft-only planning note.\n"
        "MainFlow: Keep this out of rendered HTML and extracted markdown.\n"
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
    _ACTIVE_CONTENT_LINK_REGISTRY = {
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
    _ACTIVE_CONTENT_LINK_OUTPUT_PATH = os.path.join(repo_dir, "notes", "self-test.html")
    _ACTIVE_CONTENT_LINK_LANG = "zh-Hant"
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
    assert 'class="note-content-link"' in html
    assert "note-content-link-preview" in html
    assert "note-content-link-preview-thumb" in html
    assert "copilot-sg-og.byteintl.net/api/ide/v1/text_to_image" in html
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
    global _ACTIVE_CONTENT_LINK_LANG, _ACTIVE_CONTENT_LINK_OUTPUT_PATH, _ACTIVE_CONTENT_LINK_REGISTRY
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
        f'<meta name="garden:lang" content="{_escape_attr(html_lang or "en")}">',
        f'<meta name="garden:status" content="{_escape_attr(status)}">',
    ]
    if any(tag_concepts):
        content_meta_parts.append(
            f'<meta name="garden:tag_concepts" content="{_escape_attr(",".join(tag_concepts))}">'
        )
    if tag_label_map:
        content_meta_parts.append(
            f'<meta name="garden:tag_labels" content="{_escape_attr(json.dumps(tag_label_map, ensure_ascii=False, separators=(",", ":")))}">'
        )
    if canonical_id:
        content_meta_parts.append(f'<meta name="garden:canonical_id" content="{_escape_attr(canonical_id)}">')
    if pinned:
        content_meta_parts.append('<meta name="garden:pinned" content="1">')
    if priority:
        content_meta_parts.append(f'<meta name="garden:priority" content="{_escape_attr(priority)}">')
    if published_at:
        content_meta_parts.append(f'<meta name="garden:published_at" content="{_escape_attr(published_at)}">')
    if last_modified_at:
        content_meta_parts.append(f'<meta name="garden:last_modified_at" content="{_escape_attr(last_modified_at)}">')
    if cover_href:
        content_meta_parts.append(f'<meta name="garden:cover" content="{_escape_attr(cover_href)}">')
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
        _ACTIVE_CONTENT_LINK_REGISTRY = _collect_content_link_registry(repo_dir)
        _ACTIVE_CONTENT_LINK_OUTPUT_PATH = out_path
        _ACTIVE_CONTENT_LINK_LANG = html_lang
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
        content_meta_parts.append(f'<meta name="garden:reading_time_minutes" content="{reading_time_minutes}">')
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
