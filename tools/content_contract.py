from __future__ import annotations

import json
import math
import os
import re

_TAG_ONTOLOGY_CACHE: dict[str, object] | None = None
_TAG_ONTOLOGY_INDEX_CACHE: dict[str, object] | None = None


def resolve_repo_dir() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def collapse_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def normalize_tag_lang(value: str) -> str:
    raw = collapse_spaces(value) or "en"
    lowered = raw.lower()
    if lowered in {"zh-hans", "zh-cn", "zh-sg"}:
        return "zh-Hans"
    if lowered in {"zh-hant", "zh-tw", "zh-hk", "zh-mo"}:
        return "zh-Hant"
    if lowered.startswith("zh"):
        return "zh-Hant"
    if lowered in {"en-us", "en-gb"}:
        return "en"
    return raw


def tag_lookup_key(value: str) -> str:
    return collapse_spaces(value).casefold()


def load_tag_ontology() -> dict[str, object]:
    global _TAG_ONTOLOGY_CACHE
    if isinstance(_TAG_ONTOLOGY_CACHE, dict):
        return _TAG_ONTOLOGY_CACHE

    path = os.path.join(resolve_repo_dir(), "data", "Ontology", "tags-ontology.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            ontology = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        ontology = {}

    if not isinstance(ontology, dict):
        ontology = {}
    _TAG_ONTOLOGY_CACHE = ontology
    return ontology


def load_tag_ontology_index() -> dict[str, object]:
    global _TAG_ONTOLOGY_INDEX_CACHE
    if isinstance(_TAG_ONTOLOGY_INDEX_CACHE, dict):
        return _TAG_ONTOLOGY_INDEX_CACHE

    ontology = load_tag_ontology()
    concepts_by_id: dict[str, dict[str, object]] = {}
    alias_to_concept_id: dict[str, str] = {}

    concepts = ontology.get("concepts", [])
    if isinstance(concepts, list):
        for concept in concepts:
            if not isinstance(concept, dict):
                continue
            concept_id = collapse_spaces(concept.get("concept_id", ""))
            if not concept_id:
                continue
            labels_raw = concept.get("labels", {})
            normalized_labels: dict[str, str] = {}
            if isinstance(labels_raw, dict):
                for lang_key, label in labels_raw.items():
                    normalized_key = normalize_tag_lang(str(lang_key or ""))
                    normalized_label = collapse_spaces(label)
                    if normalized_key and normalized_label:
                        normalized_labels[normalized_key] = normalized_label
            concepts_by_id[concept_id] = {
                "concept_id": concept_id,
                "labels": normalized_labels,
            }
            for candidate in [*normalized_labels.values(), *(concept.get("aliases", []) or [])]:
                key = tag_lookup_key(str(candidate or ""))
                if key and key not in alias_to_concept_id:
                    alias_to_concept_id[key] = concept_id

    simple_rules = ontology.get("simple_rules", [])
    if isinstance(simple_rules, list):
        for rule in simple_rules:
            if not isinstance(rule, dict):
                continue
            concept_id = collapse_spaces(rule.get("map_to_concept_id", ""))
            if not concept_id:
                continue
            for candidate in rule.get("match_any", []) or []:
                key = tag_lookup_key(str(candidate or ""))
                if key:
                    alias_to_concept_id[key] = concept_id

    _TAG_ONTOLOGY_INDEX_CACHE = {
        "concepts_by_id": concepts_by_id,
        "alias_to_concept_id": alias_to_concept_id,
    }
    return _TAG_ONTOLOGY_INDEX_CACHE


def get_tag_labels_for_concept(concept_id: str) -> dict[str, str]:
    concepts_by_id = load_tag_ontology_index().get("concepts_by_id", {})
    if not isinstance(concepts_by_id, dict):
        return {}
    concept = concepts_by_id.get(collapse_spaces(concept_id), {})
    if not isinstance(concept, dict):
        return {}
    labels = concept.get("labels", {})
    if not isinstance(labels, dict):
        return {}
    return {str(k): str(v) for k, v in labels.items() if collapse_spaces(v)}


def resolve_tag_label_for_lang(concept_id: str, lang: str = "en") -> str:
    labels = get_tag_labels_for_concept(concept_id)
    if not labels:
        return ""
    normalized_lang = normalize_tag_lang(lang)
    fallback_chain = [normalized_lang]
    if normalized_lang == "zh-Hans":
        fallback_chain.extend(["zh-Hant", "en"])
    elif normalized_lang == "zh-Hant":
        fallback_chain.extend(["zh-Hans", "en"])
    else:
        fallback_chain.extend(["en", "zh-Hant", "zh-Hans"])
    return collapse_spaces(
        next((labels.get(key) for key in fallback_chain if labels.get(key)), "")
        or next(iter(labels.values()), "")
    )


def parse_tag_entries(raw: str, lang: str = "en") -> list[dict[str, object]]:
    normalized_lang = normalize_tag_lang(lang)
    ontology_index = load_tag_ontology_index()
    alias_to_concept_id = ontology_index.get("alias_to_concept_id", {})
    if not isinstance(alias_to_concept_id, dict):
        alias_to_concept_id = {}

    seen: set[str] = set()
    entries: list[dict[str, object]] = []
    for part in str(raw or "").split(","):
        candidate = collapse_spaces(part)
        if not candidate:
            continue
        concept_id = collapse_spaces(alias_to_concept_id.get(tag_lookup_key(candidate), ""))
        label = resolve_tag_label_for_lang(concept_id, normalized_lang) if concept_id else candidate
        identity = concept_id or tag_lookup_key(label)
        if not identity or identity in seen:
            continue
        seen.add(identity)
        entries.append(
            {
                "concept_id": concept_id,
                "label": label,
                "labels": get_tag_labels_for_concept(concept_id) if concept_id else {},
            }
        )
    return entries


def normalize_tags(raw: str, lang: str = "en") -> str:
    return ", ".join(str(entry.get("label", "")) for entry in parse_tag_entries(raw, lang=lang))


def extract_tag_concepts(raw: str, lang: str = "en") -> list[str]:
    return [str(entry.get("concept_id", "")) for entry in parse_tag_entries(raw, lang=lang)]


def extract_tag_label_map(raw: str, lang: str = "en") -> dict[str, dict[str, str]]:
    label_map: dict[str, dict[str, str]] = {}
    for entry in parse_tag_entries(raw, lang=lang):
        concept_id = collapse_spaces(entry.get("concept_id", ""))
        if not concept_id or concept_id in label_map:
            continue
        labels = entry.get("labels", {})
        if isinstance(labels, dict) and labels:
            label_map[concept_id] = {str(k): str(v) for k, v in labels.items() if collapse_spaces(v)}
    return label_map


def parse_bool(raw: str, default: bool = True) -> bool:
    if raw is None:
        return default
    v = str(raw).strip().lower()
    if v in ("0", "false", "no", "off"):
        return False
    if v in ("1", "true", "yes", "on"):
        return True
    return default


def extract_simple_block(source_text: str, tag: str) -> tuple[str, str]:
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


def strip_author_only_blocks(source_text: str) -> str:
    body = source_text or ""
    body, _ = extract_simple_block(body, "draft")
    return body


def extract_qaprompt(source_text: str) -> tuple[str, dict[str, str]]:
    def _parse_opening_tag_attrs(stripped: str) -> dict[str, str]:
        m = re.match(r"^<qprompt(?P<attrs>[^>]*)/?>$", stripped, flags=re.IGNORECASE)
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
        open_tag = re.match(r"^<(qprompt)(?:\s+[^>]*)?\s*/?>$", stripped, flags=re.IGNORECASE)
        if not in_block and open_tag:
            saw_qprompt_tag = True
            prompt.update(_parse_opening_tag_attrs(stripped))
            if stripped.endswith("/>"):
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


def downgrade_content_link_markup(source_text: str) -> str:
    text = source_text or ""

    def _parse_attrs(attrs_text: str) -> dict[str, str]:
        attrs: dict[str, str] = {}
        attr_pattern = re.compile(
            r"""([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\[[^\]]*\])|([^\s>]+))"""
        )
        for match in attr_pattern.finditer(attrs_text or ""):
            key = str(match.group(1) or "").strip().lower()
            value = next((g for g in match.groups()[1:] if g is not None), "")
            if key:
                attrs[key] = value.strip()
        return attrs

    def _replace_self_closing(match: re.Match[str]) -> str:
        attrs = _parse_attrs(match.group("attrs") or "")
        label = str(attrs.get("label") or attrs.get("title") or attrs.get("canonical") or "").strip()
        return label

    def _replace_wrapped(match: re.Match[str]) -> str:
        inner = str(match.group("inner") or "").strip()
        if inner:
            return inner
        attrs = _parse_attrs(match.group("attrs") or "")
        return str(attrs.get("label") or attrs.get("title") or attrs.get("canonical") or "").strip()

    text = re.sub(
        r"<content-link(?P<attrs>[^>]*)/\s*>",
        _replace_self_closing,
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    text = re.sub(
        r"<content-link(?P<attrs>[^>]*)>(?P<inner>.*?)</content-link>",
        _replace_wrapped,
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    return text


def extract_source_meta(source_text: str) -> tuple[dict[str, str], str]:
    lines = (source_text or "").splitlines()
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i >= len(lines) or lines[i].strip() != "<meta>":
        return {}, source_text or ""

    i += 1
    meta_lines: list[str] = []
    while i < len(lines) and lines[i].strip() != "</meta>":
        meta_lines.append(lines[i])
        i += 1
    if i >= len(lines):
        return {}, source_text or ""

    body_lines = lines[i + 1 :]
    meta: dict[str, str] = {}
    for raw in meta_lines:
        line = raw.strip()
        if not line:
            continue
        m = re.match(r"^([A-Za-z0-9_ -]+)\s*[:=]\s*(.*)$", line)
        if not m:
            continue
        key = m.group(1).strip().lower().replace(" ", "_").replace("-", "_")
        value = m.group(2).strip()
        if value:
            meta[key] = value

    body = "\n".join(body_lines).lstrip("\n")
    return meta, body


def extract_core_markdown(source_text: str) -> str:
    text = source_text or ""
    _, body = extract_source_meta(text)
    body = strip_author_only_blocks(body)
    body, _ = extract_simple_block(body, "anchors")
    body, _ = extract_qaprompt(body)
    body = downgrade_content_link_markup(body)

    def _format_takeaways(match: re.Match) -> str:
        content = match.group(1).strip()
        if not content:
            return ""
        return f"\n\n## Key Takeaways\n\n{content}\n\n"

    body = re.sub(r"<takeaways>\s*(.*?)\s*</takeaways>", _format_takeaways, body, flags=re.DOTALL | re.IGNORECASE)

    lines = body.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    kept: list[str] = []
    in_fence = False
    block_stack: list[str] = []
    ignored_blocks = {
        "section",
        "reviewkit",
        "qquiz",
        "qprompt",
        "callout",
        "block",
        "image",
        "rawhtml",
    }

    for line in lines:
        stripped = line.strip()
        if re.match(r"^```", stripped):
            if not block_stack:
                kept.append(line.rstrip())
            in_fence = not in_fence
            continue
        if in_fence:
            if not block_stack:
                kept.append(line.rstrip())
            continue

        open_match = re.match(r"^<([a-z][a-z0-9_-]*)(?:\s+[^>]*)?>$", stripped, flags=re.IGNORECASE)
        close_match = re.match(r"^</([a-z][a-z0-9_-]*)>$", stripped, flags=re.IGNORECASE)
        self_close_match = re.match(r"^<([a-z][a-z0-9_-]*)(?:\s+[^>]*)?/>$", stripped, flags=re.IGNORECASE)

        if self_close_match:
            tag = self_close_match.group(1).lower()
            if tag in ignored_blocks or tag == "qprompt":
                continue
        if open_match:
            tag = open_match.group(1).lower()
            if tag in ignored_blocks:
                block_stack.append(tag)
                continue
        if close_match:
            tag = close_match.group(1).lower()
            if block_stack and block_stack[-1] == tag:
                block_stack.pop()
                continue
            if tag in ignored_blocks:
                continue
        if block_stack:
            continue
        kept.append(line.rstrip())

    normalized: list[str] = []
    blank_count = 0
    for line in kept:
        if line.strip() == "":
            blank_count += 1
            if blank_count <= 1:
                normalized.append("")
            continue
        blank_count = 0
        normalized.append(line)
    while normalized and normalized[0] == "":
        normalized.pop(0)
    while normalized and normalized[-1] == "":
        normalized.pop()
    return "\n".join(normalized)


def estimate_reading_time_minutes(markdown: str) -> int:
    text = markdown or ""
    if not text.strip():
        return 0

    clean_text = re.sub(r"<script\b[^>]*>[\s\S]*?</script>", " ", text, flags=re.IGNORECASE)
    clean_text = re.sub(r"<style\b[^>]*>[\s\S]*?</style>", " ", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"<rawhtml\b[^>]*>[\s\S]*?</rawhtml>", " ", clean_text, flags=re.IGNORECASE)

    latin_words = len(re.findall(r"[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?", clean_text))
    cjk_chars = len(re.findall(r"[\u4E00-\u9FFF]", clean_text))
    table_rows = len(re.findall(r"(?m)^\s*\|.*\|\s*$", clean_text))
    fenced_blocks = len(re.findall(r"(?m)^```", clean_text)) // 2
    math_blocks = len(re.findall(r"(?m)^\$\$", clean_text)) // 2
    dense_block_penalty = table_rows * 0.08 + fenced_blocks * 0.5 + math_blocks * 0.3
    return max(1, int(math.ceil(latin_words / 170 + cjk_chars / 320 + dense_block_penalty)))


def normalize_repo_asset_href(
    repo_dir: str,
    raw: str,
    *,
    source_path: str = "",
    output_path: str = "",
) -> str:
    href = (raw or "").strip()
    if not href:
        return ""
    if re.match(r"^(https?:|data:|blob:|file:)", href, flags=re.IGNORECASE):
        return href
    if href.startswith("#"):
        return href

    repo_abs = os.path.abspath(repo_dir)
    if href.startswith("/"):
        abs_path = os.path.abspath(os.path.join(repo_abs, href.lstrip("/")))
    else:
        base_dir = os.path.dirname(source_path or output_path or repo_abs)
        abs_path = os.path.abspath(os.path.join(base_dir, href))

    repo_prefix = repo_abs + os.sep
    if abs_path == repo_abs:
        return ""
    if abs_path.startswith(repo_prefix):
        return os.path.relpath(abs_path, repo_abs).replace(os.sep, "/")
    return ""
