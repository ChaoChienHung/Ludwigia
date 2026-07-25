from __future__ import annotations

import glob
import json
import os
import re
from typing import Any

from . import content_contract


_QUESTION_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_LANG_RE = re.compile(r"^questions(?:[._-](?P<lang>[A-Za-z0-9-]+))?\.json$", flags=re.IGNORECASE)
_FACET_ID_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*$")


def _normalize_lang(value: str) -> str:
    raw = (value or "").strip().lower()
    if raw in {"zh_tw", "zh-hant", "zh_hant"}:
        return "zh-Hant"
    if raw in {"zh_cn", "zh-hans", "zh_hans"}:
        return "zh-Hans"
    if raw == "en":
        return "en"
    return value.strip() or "en"


def _resolve_bank_path(note_source_path: str, bank_ref: str) -> str:
    source_dir = os.path.dirname(os.path.abspath(note_source_path))
    bank_path = os.path.abspath(os.path.join(source_dir, bank_ref))
    source_prefix = source_dir + os.sep
    if bank_path != source_dir and not bank_path.startswith(source_prefix):
        raise ValueError(f"Question bank path escapes note folder: {bank_ref}")
    return bank_path


def infer_bank_lang(bank_path: str) -> str:
    name = os.path.basename(bank_path)
    match = _LANG_RE.match(name)
    if not match:
        return ""
    return _normalize_lang(match.group("lang") or "")


def _normalize_facet_value(value: Any) -> str:
    return str(value or "").strip().lower()


def load_question_bank(bank_path: str) -> dict[str, Any]:
    with open(bank_path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError(f"Question bank must be a JSON object: {bank_path}")
    questions = payload.get("questions")
    if not isinstance(questions, list) or not questions:
        raise ValueError(f"Question bank must contain a non-empty questions array: {bank_path}")
    return payload


def _validate_choices(question_id: str, choices: Any) -> list[dict[str, str]]:
    if not isinstance(choices, list) or not choices:
        raise ValueError(f"Question {question_id} must define a non-empty choices array for mcq")
    if len(choices) > 4:
        raise ValueError(f"Question {question_id} exceeds the current 4-choice mcq renderer limit")

    normalized: list[dict[str, str]] = []
    for idx, raw_choice in enumerate(choices):
        if not isinstance(raw_choice, dict):
            raise ValueError(f"Question {question_id} choice #{idx + 1} must be an object")
        choice_id = str(raw_choice.get("id") or "").strip().upper() or chr(ord("A") + idx)
        choice_text = str(raw_choice.get("text") or "").strip()
        if choice_id not in {"A", "B", "C", "D"}:
            raise ValueError(f"Question {question_id} choice id must stay within A-D for the current renderer")
        if not choice_text:
            raise ValueError(f"Question {question_id} choice {choice_id} is missing text")
        choice: dict[str, str] = {"id": choice_id, "text": choice_text}
        response = str(raw_choice.get("response") or "").strip()
        if response:
            choice["response"] = response
        normalized.append(choice)
    return normalized


def _validate_question_entry(
    question: Any,
    *,
    canonical_id: str,
    note_tag_concepts: list[str],
    expected_lang: str,
    bank_path: str,
) -> dict[str, Any]:
    if not isinstance(question, dict):
        raise ValueError(f"Question bank entries must be JSON objects: {bank_path}")

    question_id = str(question.get("question_id") or "").strip()
    if not question_id or not _QUESTION_ID_RE.match(question_id):
        raise ValueError(f"Question bank entry is missing a valid question_id: {bank_path}")

    lang = _normalize_lang(str(question.get("lang") or "").strip())
    if not lang:
        raise ValueError(f"Question {question_id} is missing lang: {bank_path}")
    if expected_lang and lang != expected_lang:
        raise ValueError(
            f"Question {question_id} lang {lang} does not match filename language {expected_lang}: {bank_path}"
        )

    question_type = str(question.get("question_type") or "").strip().lower()
    if not question_type:
        raise ValueError(f"Question {question_id} is missing question_type: {bank_path}")
    if question_type != "mcq":
        raise ValueError(f"Question {question_id} uses unsupported question_type {question_type}; only mcq is enabled")

    prompt = str(question.get("prompt") or "").strip()
    if not prompt:
        raise ValueError(f"Question {question_id} is missing prompt: {bank_path}")

    answer_raw = question.get("answer")
    answer = str(answer_raw or "").strip().upper()
    if answer not in {"A", "B", "C", "D"}:
        raise ValueError(f"Question {question_id} answer must be one of A-D for mcq")

    difficulty = str(question.get("difficulty") or "").strip()
    if not difficulty:
        raise ValueError(f"Question {question_id} is missing difficulty: {bank_path}")

    question_focus = _normalize_facet_value(question.get("question_focus"))
    if not question_focus:
        raise ValueError(f"Question {question_id} is missing question_focus: {bank_path}")
    if not _FACET_ID_RE.match(question_focus):
        raise ValueError(
            f"Question {question_id} question_focus must use a lowercase id-like value: {bank_path}"
        )

    review_status = str(question.get("review_status") or "").strip()
    if not review_status:
        raise ValueError(f"Question {question_id} is missing review_status: {bank_path}")

    explanation = str(question.get("explanation") or "").strip()
    last_review_date = str(question.get("last_review_date") or "").strip()
    if last_review_date and not _DATE_RE.match(last_review_date):
        raise ValueError(f"Question {question_id} last_review_date must use YYYY-MM-DD: {bank_path}")

    raw_tag_concepts = question.get("tag_concepts")
    if raw_tag_concepts in (None, []):
        tag_concepts = list(note_tag_concepts)
    elif isinstance(raw_tag_concepts, list):
        tag_concepts = [str(item).strip() for item in raw_tag_concepts if str(item).strip()]
    else:
        raise ValueError(f"Question {question_id} tag_concepts must be an array: {bank_path}")
    if not tag_concepts:
        raise ValueError(f"Question {question_id} is missing tag_concepts and note tags could not fill them: {bank_path}")

    choices = _validate_choices(question_id, question.get("choices"))
    choice_ids = {choice["id"] for choice in choices}
    if answer not in choice_ids:
        raise ValueError(f"Question {question_id} answer {answer} does not exist in choices: {bank_path}")

    return {
        "question_id": question_id,
        "lang": lang,
        "question_type": question_type,
        "prompt": prompt,
        "choices": choices,
        "answer": answer,
        "explanation": explanation,
        "difficulty": difficulty,
        "question_focus": question_focus,
        "tag_concepts": tag_concepts,
        "review_status": review_status,
        "last_review_date": last_review_date,
        "canonical_id": canonical_id,
        "global_question_id": f"{canonical_id}::{question_id}",
    }


def load_questions_for_note(
    note_source_path: str,
    note_meta: dict[str, str],
    bank_ref: str,
    *,
    question_ids: list[str] | None = None,
) -> list[dict[str, Any]]:
    meta = note_meta or {}
    canonical_id = str(meta.get("canonical_id") or meta.get("canonicalid") or "").strip()
    if not canonical_id:
        raise ValueError(
            f"External question banks require CanonicalId in the note source: {os.path.basename(note_source_path)}"
        )

    note_lang = _normalize_lang(str(meta.get("lang") or "").strip())
    note_tags = str(meta.get("tags") or "").strip()
    note_tag_concepts = content_contract.extract_tag_concepts(note_tags, lang=note_lang or "en")

    bank_path = _resolve_bank_path(note_source_path, bank_ref)
    payload = load_question_bank(bank_path)
    expected_lang = infer_bank_lang(bank_path)
    selected = {item.strip() for item in (question_ids or []) if item.strip()}

    items: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for raw_question in payload.get("questions", []):
        item = _validate_question_entry(
            raw_question,
            canonical_id=canonical_id,
            note_tag_concepts=note_tag_concepts,
            expected_lang=expected_lang,
            bank_path=bank_path,
        )
        question_id = str(item["question_id"])
        if question_id in seen_ids:
            raise ValueError(f"Duplicate question_id {question_id} in {bank_path}")
        seen_ids.add(question_id)
        if selected and question_id not in selected:
            continue
        items.append(item)

    if selected:
        found = {str(item["question_id"]) for item in items}
        missing = [item for item in question_ids or [] if item not in found]
        if missing:
            raise ValueError(f"Question ids not found in {bank_path}: {', '.join(missing)}")
    return items


def convert_question_to_quiz_entry(question: dict[str, Any]) -> dict[str, str]:
    quiz_entry = {
        "question": str(question.get("prompt") or "").strip(),
        "answer": str(question.get("answer") or "").strip().upper(),
        "explanation": str(question.get("explanation") or "").strip(),
    }
    for choice in question.get("choices", []):
        choice_id = str(choice.get("id") or "").strip().upper()
        if choice_id not in {"A", "B", "C", "D"}:
            continue
        quiz_entry[choice_id.lower()] = str(choice.get("text") or "").strip()
        response = str(choice.get("response") or "").strip()
        if response:
            quiz_entry[f"response{choice_id.lower()}"] = response
    return quiz_entry


def _pick_note_source_for_bank(bank_path: str) -> tuple[str, dict[str, str]]:
    note_dir = os.path.dirname(bank_path)
    expected_lang = infer_bank_lang(bank_path)
    candidates = sorted(glob.glob(os.path.join(note_dir, "*.md")))
    for candidate in candidates:
        with open(candidate, "r", encoding="utf-8") as handle:
            source_text = handle.read()
        meta, _ = content_contract.extract_source_meta(source_text)
        if not meta:
            continue
        canonical_id = str(meta.get("canonical_id") or meta.get("canonicalid") or "").strip()
        source_lang = _normalize_lang(str(meta.get("lang") or "").strip())
        if not canonical_id:
            continue
        if expected_lang and source_lang != expected_lang:
            continue
        return candidate, meta
    raise ValueError(f"Could not find a sibling note source with CanonicalId for {bank_path}")


def collect_question_bank_entries(content_root: str) -> list[dict[str, Any]]:
    root = os.path.abspath(content_root)
    pattern = os.path.join(root, "**", "questions*.json")
    entries: list[dict[str, Any]] = []
    for bank_path in sorted(glob.glob(pattern, recursive=True)):
        note_source_path, note_meta = _pick_note_source_for_bank(bank_path)
        rel_ref = os.path.relpath(bank_path, os.path.dirname(note_source_path))
        loaded = load_questions_for_note(note_source_path, note_meta, rel_ref)
        for item in loaded:
            enriched = dict(item)
            enriched["bank_path"] = bank_path
            enriched["note_source_path"] = note_source_path
            entries.append(enriched)
    return entries
