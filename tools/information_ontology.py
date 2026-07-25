from __future__ import annotations

import json
import os
import re
from typing import Any

from tools import content_contract

_INFORMATION_ONTOLOGY_CACHE: dict[str, Any] | None = None


def resolve_repo_dir() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def collapse_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def normalize_lang(value: str) -> str:
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


def ontology_json_path(repo_dir: str | None = None) -> str:
    base = repo_dir or resolve_repo_dir()
    return os.path.join(base, "data", "Ontology", "information-ontology.json")


def ontology_js_path(repo_dir: str | None = None) -> str:
    base = repo_dir or resolve_repo_dir()
    return os.path.join(base, "data", "Ontology", "information-ontology.js")


def load_information_ontology(repo_dir: str | None = None) -> dict[str, Any]:
    global _INFORMATION_ONTOLOGY_CACHE
    if isinstance(_INFORMATION_ONTOLOGY_CACHE, dict) and repo_dir is None:
        return _INFORMATION_ONTOLOGY_CACHE

    path = ontology_json_path(repo_dir)
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        payload = {}

    if not isinstance(payload, dict):
        payload = {}
    if repo_dir is None:
        _INFORMATION_ONTOLOGY_CACHE = payload
    return payload


def get_concept_entry(concept_id: str, repo_dir: str | None = None) -> dict[str, Any]:
    concept_key = collapse_spaces(concept_id)
    if not concept_key:
        return {}
    payload = load_information_ontology(repo_dir)
    concepts = payload.get("concepts", [])
    if not isinstance(concepts, list):
        return {}
    for concept in concepts:
        if not isinstance(concept, dict):
            continue
        if collapse_spaces(concept.get("concept_id", "")) == concept_key:
            return concept
    return {}


def _pick_localized_text(values: Any, lang: str) -> str:
    if not isinstance(values, dict):
        return ""
    normalized_lang = normalize_lang(lang)
    fallbacks = (
        ["zh-Hans", "zh-Hant", "en"]
        if normalized_lang == "zh-Hans"
        else ["zh-Hant", "zh-Hans", "en"]
        if normalized_lang == "zh-Hant"
        else ["en", "zh-Hant", "zh-Hans"]
    )
    normalized_map = {
        normalize_lang(str(key or "")): collapse_spaces(value)
        for key, value in values.items()
        if collapse_spaces(value)
    }
    for key in fallbacks:
        candidate = normalized_map.get(key, "")
        if candidate:
            return candidate
    return next((value for value in normalized_map.values() if value), "")


def get_concept_label(concept_id: str, lang: str, repo_dir: str | None = None) -> str:
    concept = get_concept_entry(concept_id, repo_dir)
    return _pick_localized_text(concept.get("labels", {}), lang)


def get_concept_context(concept_id: str, lang: str, repo_dir: str | None = None) -> str:
    concept = get_concept_entry(concept_id, repo_dir)
    return _pick_localized_text(concept.get("contexts", {}), lang)


def build_information_ontology_js(repo_dir: str | None = None) -> str:
    payload = load_information_ontology(repo_dir)
    return f"window.LUDWIG_INFORMATION_ONTOLOGY={json.dumps(payload, ensure_ascii=False, separators=(',', ':'))};\n"


def sync_information_ontology_js(repo_dir: str | None = None) -> str:
    target_repo = repo_dir or resolve_repo_dir()
    js_path = ontology_js_path(target_repo)
    os.makedirs(os.path.dirname(js_path), exist_ok=True)
    content = build_information_ontology_js(target_repo)
    with open(js_path, "w", encoding="utf-8") as handle:
        handle.write(content)
    return js_path


def _lookup_key(value: str) -> str:
    return collapse_spaces(value).casefold()


def _parse_tag_attrs(attrs_text: str) -> dict[str, str]:
    attrs: dict[str, str] = {}
    for match in re.finditer(
        r"""([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""",
        attrs_text or "",
    ):
        key = match.group(1).strip().lower()
        value = next((group for group in match.groups()[1:] if group is not None), "")
        attrs[key] = value.strip()
    return attrs


def build_information_ontology_index(repo_dir: str | None = None) -> dict[str, Any]:
    payload = load_information_ontology(repo_dir)
    concepts = payload.get("concepts", [])
    concepts_by_id: dict[str, dict[str, Any]] = {}
    term_entries: list[dict[str, str]] = []

    if not isinstance(concepts, list):
        concepts = []

    for concept in concepts:
        if not isinstance(concept, dict):
            continue
        concept_id = collapse_spaces(concept.get("concept_id", ""))
        if not concept_id:
            continue
        concepts_by_id[concept_id] = concept

        labels = concept.get("labels", {})
        aliases = concept.get("aliases", [])

        variants: list[str] = []
        if isinstance(labels, dict):
            variants.extend(str(value) for value in labels.values() if collapse_spaces(value))
        if isinstance(aliases, list):
            variants.extend(str(value) for value in aliases if collapse_spaces(value))

        seen_variants: set[str] = set()
        for variant in variants:
            normalized_variant = collapse_spaces(variant)
            if not normalized_variant:
                continue
            key = _lookup_key(normalized_variant)
            if key in seen_variants:
                continue
            seen_variants.add(key)
            term_entries.append(
                {
                    "concept_id": concept_id,
                    "term": normalized_variant,
                    "lookup_key": key,
                }
            )

    term_entries.sort(key=lambda entry: (-len(entry["term"]), entry["term"]))
    return {
        "concepts_by_id": concepts_by_id,
        "term_entries": term_entries,
    }


def _compile_information_term_pattern(term: str) -> re.Pattern[str]:
    escaped = re.escape(term)
    if re.search(r"[A-Za-z0-9]", term):
        return re.compile(rf"(?<![A-Za-z0-9]){escaped}(?![A-Za-z0-9])", re.IGNORECASE)
    return re.compile(escaped)


def _replace_information_markup_with_text(body: str, *, lang: str, repo_dir: str | None = None) -> tuple[str, list[dict[str, Any]]]:
    text = body or ""
    plain_parts: list[str] = []
    annotations: list[dict[str, Any]] = []
    plain_length = 0
    i = 0

    while i < len(text):
        if not text.startswith("<information", i):
            plain_parts.append(text[i])
            plain_length += 1
            i += 1
            continue

        self_closing = re.match(r"<information(?P<attrs>[^>]*)/\s*>", text[i:], flags=re.IGNORECASE | re.DOTALL)
        if self_closing:
            attrs = _parse_tag_attrs(self_closing.group("attrs") or "")
            concept_id = collapse_spaces(attrs.get("concept", ""))
            label = collapse_spaces(attrs.get("label", ""))
            if concept_id and not label:
                label = get_concept_label(concept_id, lang, repo_dir)
            start = plain_length
            plain_parts.append(label)
            plain_length += len(label)
            annotations.append(
                {
                    "label": label,
                    "concept_id": concept_id,
                    "start": start,
                    "end": plain_length,
                }
            )
            i += len(self_closing.group(0))
            continue

        opening = re.match(r"<information(?P<attrs>[^>]*)>", text[i:], flags=re.IGNORECASE | re.DOTALL)
        if not opening:
            plain_parts.append(text[i])
            plain_length += 1
            i += 1
            continue

        attrs = _parse_tag_attrs(opening.group("attrs") or "")
        close_tag = "</information>"
        start_inner = i + len(opening.group(0))
        close_idx = text.lower().find(close_tag, start_inner)
        if close_idx == -1:
            plain_parts.append(text[i])
            plain_length += 1
            i += 1
            continue

        inner = text[start_inner:close_idx]
        label = collapse_spaces(inner)
        concept_id = collapse_spaces(attrs.get("concept", ""))
        if concept_id and not label:
            label = get_concept_label(concept_id, lang, repo_dir)
        start = plain_length
        plain_parts.append(label)
        plain_length += len(label)
        annotations.append(
            {
                "label": label,
                "concept_id": concept_id,
                "start": start,
                "end": plain_length,
            }
        )
        i = close_idx + len(close_tag)

    return "".join(plain_parts), annotations


def _strip_scan_noise(text: str) -> str:
    stripped = text or ""
    stripped = re.sub(r"```[\s\S]*?```", "", stripped)
    stripped = re.sub(r"`[^`\n]+`", "", stripped)
    return stripped


def _line_number_for_offset(text: str, offset: int) -> int:
    return text[: max(0, offset)].count("\n") + 1


def _collect_heading_ranges(text: str) -> list[tuple[int, int]]:
    ranges: list[tuple[int, int]] = []
    cursor = 0
    for line in text.splitlines(keepends=True):
        line_start = cursor
        line_end = cursor + len(line)
        if re.match(r"^\s{0,3}#{1,6}\s+", line):
            ranges.append((line_start, line_end))
        cursor = line_end
    return ranges


def _is_in_ranges(start: int, end: int, ranges: list[tuple[int, int]]) -> bool:
    return any(range_start <= start and end <= range_end for range_start, range_end in ranges)


def _find_first_visible_match(plain_text: str, term: str, *, excluded_ranges: list[tuple[int, int]]) -> re.Match[str] | None:
    pattern = _compile_information_term_pattern(term)
    for match in pattern.finditer(plain_text):
        start, end = match.span()
        if _is_in_ranges(start, end, excluded_ranges):
            continue
        return match
    return None


def scan_information_candidates(source_path: str, repo_dir: str | None = None) -> dict[str, Any]:
    abs_source = os.path.abspath(source_path)
    target_repo = repo_dir or resolve_repo_dir()
    with open(abs_source, "r", encoding="utf-8") as handle:
        source_text = handle.read()

    meta, body = content_contract.extract_source_meta(source_text)
    lang = normalize_lang(str(meta.get("lang", "") or "en"))
    body = content_contract.strip_author_only_blocks(body)
    body = _strip_scan_noise(body)

    plain_text, annotations = _replace_information_markup_with_text(body, lang=lang, repo_dir=target_repo)
    excluded_ranges = _collect_heading_ranges(plain_text)
    index = build_information_ontology_index(target_repo)
    concepts_by_id = index["concepts_by_id"]
    term_entries = index["term_entries"]

    matches_by_concept: dict[str, dict[str, Any]] = {}
    for entry in term_entries:
        concept_id = entry["concept_id"]
        match = _find_first_visible_match(plain_text, entry["term"], excluded_ranges=excluded_ranges)
        if not match:
            continue
        start, end = match.span()
        existing = matches_by_concept.get(concept_id)
        if existing and existing["start"] <= start:
            continue
        is_annotated = any(annotation["start"] <= start and end <= annotation["end"] for annotation in annotations)
        concept = concepts_by_id.get(concept_id, {})
        label = _pick_localized_text(concept.get("labels", {}), lang) or entry["term"]
        matches_by_concept[concept_id] = {
            "concept_id": concept_id,
            "label": label,
            "matched_text": match.group(0),
            "term_variant": entry["term"],
            "start": start,
            "end": end,
            "line": _line_number_for_offset(plain_text, start),
            "annotated": is_annotated,
        }

    matched_terms = sorted(matches_by_concept.values(), key=lambda item: (item["line"], item["start"], item["label"]))
    annotated_terms = [item for item in matched_terms if item["annotated"]]
    candidate_terms = [item for item in matched_terms if not item["annotated"]]

    return {
        "source_path": abs_source,
        "lang": lang,
        "matched_terms": matched_terms,
        "annotated_terms": annotated_terms,
        "candidate_terms": candidate_terms,
        "annotation_count": len(annotations),
    }
