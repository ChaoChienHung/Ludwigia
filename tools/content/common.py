"""Small shared helpers: file IO, escaping, slugs, booleans, repo root.

Split out of tools/create_content.py; behaviour is unchanged."""

from __future__ import annotations

import html
import os
import re

from tools import content_contract


def _read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _write_text(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        if not content.endswith("\n"):
            f.write("\n")


def _slugify(value: str) -> str:
    v = value.strip().lower()
    v = re.sub(r"['’]", "", v)
    v = re.sub(r"[^a-z0-9]+", "-", v)
    v = re.sub(r"-{2,}", "-", v).strip("-")
    return v


def _collapse_spaces(value: str) -> str:
    return content_contract.collapse_spaces(value)


def _parse_bool(raw: str, default: bool = True) -> bool:
    return content_contract.parse_bool(raw, default=default)


def _resolve_repo_dir() -> str:
    # tools/content/common.py -> repo root is two levels up.
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _escape_text(text: str) -> str:
    return html.escape(text or "", quote=False)


def _escape_attr(text: str) -> str:
    return html.escape(text or "", quote=True)
