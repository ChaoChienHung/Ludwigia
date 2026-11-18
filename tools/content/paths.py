"""Output paths and safe href / asset path helpers.

Split out of tools/create_content.py; behaviour is unchanged."""

from __future__ import annotations

import os
import re

from tools import content_contract
from tools.content.common import _slugify


def _safe_link_href(raw: str) -> str:
    href = (raw or "").strip()
    if not href:
        return ""
    allowed_prefixes = ("http://", "https://", "mailto:", "/", "#", "./", "../")
    if href.startswith(allowed_prefixes):
        return href
    return ""


def _default_card_cover_href(section_like: str = "") -> str:
    normalized = str(section_like or "").strip().lower()
    if normalized == "writing":
        return "assets/images/defaults/Writing.png"
    return "assets/images/defaults/Notes.png"


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


def _rel_url_prefix(from_dir: str, to_dir: str) -> str:
    rel = os.path.relpath(to_dir, from_dir).replace(os.sep, "/")
    if rel == ".":
        return ""
    if not rel.endswith("/"):
        rel += "/"
    return rel
