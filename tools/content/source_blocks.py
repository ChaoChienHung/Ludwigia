"""Extraction of author-syntax blocks from the source: anchors, qprompt, draft, core markdown, reading time.

Split out of tools/create_content.py; behaviour is unchanged."""

from __future__ import annotations

import html
import math
import re

from tools import content_contract


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

    clean_html = re.sub(r"<script\b[^>]*>[\s\S]*?</script>", " ", raw_html, flags=re.IGNORECASE)
    clean_html = re.sub(r"<style\b[^>]*>[\s\S]*?</style>", " ", clean_html, flags=re.IGNORECASE)

    text = html.unescape(re.sub(r"<[^>]+>", " ", clean_html))
    text = re.sub(r"\s+", " ", text).strip()
    latin_words = len(re.findall(r"[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?", text))
    cjk_chars = len(re.findall(r"[\u4E00-\u9FFF]", text))
    table_count = len(re.findall(r"<table\b", clean_html))
    pre_count = len(re.findall(r"<pre\b", clean_html))
    callout_count = len(re.findall(r'class="[^"]*(?:note-callout|note-block)[^"]*"', clean_html))
    dense_block_penalty = table_count * 0.4 + pre_count * 0.5 + callout_count * 0.2
    return max(1, int(math.ceil(latin_words / 170 + cjk_chars / 320 + dense_block_penalty)))
