"""Source <meta> parsing: tags and tag ontology, dates, priority, leading title.

Split out of tools/create_content.py; behaviour is unchanged."""

from __future__ import annotations

import datetime as dt
import os
import re

from tools import content_contract


_TAG_ALIAS_MAP_CACHE: dict[str, dict[str, str]] = {}


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


def _extract_source_meta(source_text: str) -> tuple[dict[str, str], str]:
    return content_contract.extract_source_meta(source_text)
