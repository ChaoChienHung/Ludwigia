import argparse
import html
import json
import math
import os
import re
import sys
import time
import urllib.parse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from tools import content_contract


def _read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _strip_tags(html: str) -> str:
    html = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.IGNORECASE)
    html = re.sub(r"<style[\s\S]*?</style>", " ", html, flags=re.IGNORECASE)
    html = re.sub(r"<[^>]+>", " ", html)
    html = re.sub(r"\s+", " ", html).strip()
    return html


def _prune_layout_blocks(raw_html: str) -> str:
    raw_html = re.sub(
        r"<nav[^>]*class=[\"'][^\"']*\bnavbar\b[^\"']*[\"'][\s\S]*?</nav>",
        " ",
        raw_html,
        flags=re.IGNORECASE,
    )
    raw_html = re.sub(r"<footer[\s\S]*?</footer>", " ", raw_html, flags=re.IGNORECASE)
    return raw_html


def _summary_fallback_from_content(text: str, max_len: int = 140) -> str:
    t = re.sub(r"\s+", " ", (text or "")).strip()
    if not t:
        return ""
    t = t.replace("— Ludwig", "").strip()
    return (t[:max_len].rstrip() + "…") if len(t) > max_len else t


def _excerpt_markdown(markdown: str, limit: int = 520) -> str:
    text = (markdown or "").replace("\r\n", "\n").replace("\r", "\n")
    lines = text.split("\n")
    kept: list[str] = []
    total = 0
    for line in lines:
        stripped = line.strip()
        if not stripped and (not kept or kept[-1] == ""):
            continue
        line_len = len(line)
        if kept and total + line_len > limit:
            break
        kept.append(line.rstrip())
        total += line_len + 1
    while kept and kept[-1] == "":
        kept.pop()
    return "\n".join(kept).strip()


def _extract_title(raw_html: str) -> str:
    m = re.search(r"<title>(.*?)</title>", raw_html, flags=re.IGNORECASE | re.DOTALL)
    if not m:
        return ""
    title = re.sub(r"\s+", " ", m.group(1)).strip()
    title = html.unescape(title)
    return title.replace(" — Ludwig", "").strip()


def _extract_meta(raw_html: str, name: str) -> str:
    pattern = rf'<meta[^>]+name=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']*)["\'][^>]*>'
    m = re.search(pattern, raw_html, flags=re.IGNORECASE)
    if m and m.group(1).strip():
        return html.unescape(m.group(1)).strip()
    if name.startswith("site:"):
        fallback_name = "garden:" + name[5:]
        pattern_fb = rf'<meta[^>]+name=["\']{re.escape(fallback_name)}["\'][^>]+content=["\']([^"\']*)["\'][^>]*>'
        m_fb = re.search(pattern_fb, raw_html, flags=re.IGNORECASE)
        if m_fb:
            return html.unescape(m_fb.group(1)).strip()
    return ""


def _extract_tags(html: str) -> list[str]:
    raw = _extract_meta(html, "site:tags")
    if not raw:
        return []
    lang = _normalize_lang(_extract_meta(html, "site:lang"))
    normalized = content_contract.normalize_tags(raw, lang=lang)
    return [t.strip() for t in normalized.split(",") if t.strip()]


def _extract_tag_concepts(html: str, tags: list[str], lang: str) -> list[str]:
    raw = _extract_meta(html, "site:tag_concepts")
    if raw:
        concepts = [content_contract.collapse_spaces(part) for part in raw.split(",")]
    else:
        concepts = content_contract.extract_tag_concepts(", ".join(tags), lang=lang)
    if len(concepts) < len(tags):
        concepts.extend([""] * (len(tags) - len(concepts)))
    return concepts[: len(tags)]


def _build_tag_label_map(tag_concepts: list[str]) -> dict[str, dict[str, str]]:
    label_map: dict[str, dict[str, str]] = {}
    for concept_id in tag_concepts:
        normalized = content_contract.collapse_spaces(concept_id)
        if not normalized or normalized in label_map:
            continue
        labels = content_contract.get_tag_labels_for_concept(normalized)
        if labels:
            label_map[normalized] = labels
    return label_map


def _parse_bool_flag(raw: str) -> bool:
    value = str(raw or "").strip().lower()
    if not value:
        return False
    return value in {"1", "true", "yes", "on", "pinned", "featured"}


def _parse_priority(raw: str) -> float:
    value = str(raw or "").strip()
    if not value:
        return 0.0
    try:
        return float(value)
    except ValueError:
        return 0.0


def _file_date(path: str) -> str:
    try:
        return time.strftime("%Y-%m-%d", time.localtime(os.path.getmtime(path)))
    except Exception:
        return ""


def _normalize_lang(value: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return "en"
    lowered = raw.lower()
    if lowered.startswith("zh"):
        return "zh-Hant"
    if lowered == "en-us" or lowered == "en-gb":
        return "en"
    return raw


def _markdownish_to_text(markdown: str) -> str:
    text = markdown or ""
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"^\s{0,3}#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*>\s?", "", text, flags=re.MULTILINE)
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _resolve_path(base_dir: str, path: str) -> str:
    if os.path.isabs(path):
        return path
    return os.path.abspath(os.path.join(base_dir, path))


def _tokenize(value: str) -> list[str]:
    text = str(value or "").lower()
    tokens: list[str] = []

    tokens.extend(re.findall(r"[a-z0-9]+", text))

    for ch in text:
        code = ord(ch)
        is_cjk = (0x4E00 <= code <= 0x9FFF) or (0x3400 <= code <= 0x4DBF) or (0xF900 <= code <= 0xFAFF)
        if is_cjk:
            tokens.append(ch)

    return tokens


def _attach_related(items: list[dict], top_k: int = 6) -> None:
    title_w = 1.0
    summary_w = 1.0
    tag_w = 0.9

    tf: list[dict[str, float]] = []
    df: dict[str, int] = {}

    for item in items:
        vec: dict[str, float] = {}

        for t in _tokenize(str(item.get("title", ""))):
            vec[t] = vec.get(t, 0.0) + title_w
        for t in _tokenize(str(item.get("summary", ""))):
            vec[t] = vec.get(t, 0.0) + summary_w

        tags = item.get("tags", [])
        if isinstance(tags, list):
            for raw in tags:
                for t in _tokenize(str(raw or "")):
                    vec[t] = vec.get(t, 0.0) + tag_w

        tf.append(vec)
        for token in set(vec.keys()):
            df[token] = df.get(token, 0) + 1

    n_docs = len(items)
    if n_docs == 0:
        return

    idf: dict[str, float] = {}
    for token, n in df.items():
        idf[token] = math.log((n_docs + 1) / (n + 1)) + 1.0

    tfidf: list[dict[str, float]] = []
    norms: list[float] = []
    inverted: dict[str, list[tuple[int, float]]] = {}

    for i, vec in enumerate(tf):
        out: dict[str, float] = {}
        sumsq = 0.0
        for token, tf_w in vec.items():
            v = tf_w * idf.get(token, 1.0)
            out[token] = v
            sumsq += v * v
        n = math.sqrt(sumsq)
        tfidf.append(out)
        norms.append(n)
        for token, v in out.items():
            inverted.setdefault(token, []).append((i, v))

    for i in range(n_docs):
        items[i]["related"] = []
        ni = norms[i]
        if ni <= 0:
            continue

        scores: dict[int, float] = {}
        for token, vi in tfidf[i].items():
            for j, vj in inverted.get(token, []):
                if j == i:
                    continue
                scores[j] = scores.get(j, 0.0) + vi * vj

        ranked: list[tuple[float, int]] = []
        for j, dot in scores.items():
            nj = norms[j]
            if nj <= 0:
                continue
            sim = dot / (ni * nj)
            if sim > 0:
                ranked.append((sim, j))

        ranked.sort(key=lambda x: (-x[0], str(items[x[1]].get("title", ""))))
        top = ranked[: max(0, int(top_k))]
        items[i]["related"] = [
            {
                "url": items[j]["url"],
                "path": str(items[j].get("path") or ""),
                "score": round(sim, 6),
            }
            for sim, j in top
        ]



def build_index(content_dirs: list[tuple[str, str]], site_pages: list[str]) -> list[dict]:
    items: list[dict] = []
    repo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    html_paths: list[str] = []
    for _, content_dir in content_dirs:
        for root, _, files in os.walk(content_dir):
            for name in files:
                if not name.endswith(".html"):
                    continue
                if name == "index.html":
                    continue
                path = os.path.join(root, name)
                if os.path.isfile(path):
                    html_paths.append(path)

    prefix_by_abs: dict[str, str] = {}
    for name, content_dir in content_dirs:
        prefix_by_abs[os.path.abspath(content_dir)] = name

    def _sort_key(p: str) -> str:
        for _, content_dir in content_dirs:
            content_dir_abs = os.path.abspath(content_dir)
            if os.path.abspath(p).startswith(content_dir_abs + os.sep):
                rel = os.path.relpath(p, content_dir_abs).replace(os.sep, "/")
                return f"{os.path.basename(content_dir_abs)}/{rel}"
        return os.path.relpath(p, os.path.dirname(p)).replace(os.sep, "/")

    for path in sorted(html_paths, key=_sort_key):
        found_prefix = ""
        rel_path = ""
        for name, content_dir in content_dirs:
            content_dir_abs = os.path.abspath(content_dir)
            if os.path.abspath(path).startswith(content_dir_abs + os.sep):
                found_prefix = prefix_by_abs.get(content_dir_abs, name)
                rel_path = os.path.relpath(path, content_dir_abs).replace(os.sep, "/")
                break
        if not found_prefix or not rel_path:
            continue
        url_path = urllib.parse.quote(rel_path, safe="/")

        html = _read_text(path)
        title = _extract_title(html) or os.path.basename(rel_path)
        tags = _extract_tags(html)
        summary = _extract_meta(html, "site:summary")
        source_rel = _extract_meta(html, "site:source")
        cover = _extract_meta(html, "site:cover")
        reading_time_minutes = int(_extract_meta(html, "site:reading_time_minutes") or "0" or 0)
        lang = _normalize_lang(_extract_meta(html, "site:lang"))
        tag_concepts = _extract_tag_concepts(html, tags, lang)
        tag_labels = _build_tag_label_map(tag_concepts)
        canonical_id = _extract_meta(html, "site:canonical_id")
        status = (_extract_meta(html, "site:status") or "published").strip().lower()
        pinned = _parse_bool_flag(_extract_meta(html, "site:pinned"))
        priority = _parse_priority(_extract_meta(html, "site:priority"))
        published_at = _extract_meta(html, "site:published_at")
        last_modified_at = _extract_meta(html, "site:last_modified_at")
        source_content = ""
        core_markdown = ""
        preview_markdown = ""
        preview_markdown = ""
        source_meta: dict[str, str] = {}
        if source_rel:
            source_path = _resolve_path(repo_dir, source_rel)
            if os.path.isfile(source_path):
                try:
                    source_meta, _ = content_contract.extract_source_meta(_read_text(source_path))
                    core_markdown = content_contract.extract_core_markdown(_read_text(source_path))
                    source_content = _markdownish_to_text(core_markdown)
                    preview_markdown = _excerpt_markdown(core_markdown)
                except Exception:
                    source_content = ""
                    core_markdown = ""
                    preview_markdown = ""
                    source_meta = {}
        if source_meta:
            if not canonical_id:
                canonical_id = (
                    source_meta.get("canonical_id")
                    or source_meta.get("canonicalid")
                    or source_meta.get("translation_group")
                    or source_meta.get("translationgroup")
                    or ""
                ).strip()
            if not lang or lang == "en":
                lang = _normalize_lang(source_meta.get("lang") or source_meta.get("html_lang") or lang)
            if status == "published":
                raw_status = (
                    source_meta.get("status")
                    or source_meta.get("publish_status")
                    or source_meta.get("publishstatus")
                    or ""
                ).strip()
                if raw_status:
                    status = raw_status.lower()
            if not pinned:
                raw_pinned = (
                    source_meta.get("pinned")
                    or source_meta.get("pin")
                    or source_meta.get("featured")
                    or ""
                ).strip()
                pinned = _parse_bool_flag(raw_pinned)
            if priority == 0.0:
                priority = _parse_priority(
                    source_meta.get("priority")
                    or source_meta.get("pinned_priority")
                    or source_meta.get("pinnedpriority")
                    or ""
                )
            estimated_reading_time_enabled = content_contract.parse_bool(
                source_meta.get("estimated_reading_time")
                or source_meta.get("estimatedreadingtime")
                or ""
            )
            if estimated_reading_time_enabled and reading_time_minutes <= 0:
                reading_time_minutes = content_contract.estimate_reading_time_minutes(core_markdown)
            if not published_at:
                published_at = (
                    source_meta.get("published")
                    or source_meta.get("publish_date")
                    or source_meta.get("publishdate")
                    or ""
                ).strip()
            if not last_modified_at:
                last_modified_at = (
                    source_meta.get("lastmodified")
                    or source_meta.get("last_modified")
                    or source_meta.get("last-modified")
                    or ""
                ).strip()
        if status == "drafting":
            continue
        if status not in {"published", "drafting"}:
            status = "published"
        if not cover and source_meta:
            cover = content_contract.normalize_repo_asset_href(
                repo_dir,
                source_meta.get("cover")
                or source_meta.get("garden_cover")
                or source_meta.get("gardencover")
                or "",
                source_path=source_path if source_rel else "",
                output_path=path,
            )
        if not last_modified_at:
            last_modified_at = _file_date(source_path or path)
        canonical_id = canonical_id.strip() or f"{found_prefix}:{rel_path}"
        content = source_content or _strip_tags(_prune_layout_blocks(html))
        if not summary:
            summary = _summary_fallback_from_content(content)

        items.append(
            {
                "title": title,
                "url": f"../{found_prefix}/{url_path}",
                "path": f"{found_prefix}/{rel_path}",
                "section": found_prefix,
                "tags": tags,
                "tag_concepts": tag_concepts,
                "tag_labels": tag_labels,
                "summary": summary,
                "content": content,
                "content_markdown": core_markdown,
                "preview_markdown": preview_markdown,
                "reading_time_minutes": reading_time_minutes,
                "published_at": published_at,
                "last_modified_at": last_modified_at,
                "cover": cover,
                "lang": lang,
                "canonical_id": canonical_id,
                "status": status,
                "pinned": pinned,
                "priority": priority,
                "kind": "content",
            }
        )

    for raw in site_pages:
        if not raw:
            continue
        page_path = os.path.abspath(raw)
        if not os.path.isfile(page_path):
            continue
        basename = os.path.basename(page_path)
        html = _read_text(page_path)
        title = _extract_title(html) or basename
        lang = _normalize_lang(_extract_meta(html, "site:lang"))
        tags = _extract_tags(html)
        tag_concepts = _extract_tag_concepts(html, tags, lang)
        tag_labels = _build_tag_label_map(tag_concepts)
        summary = _extract_meta(html, "site:summary")
        cover = _extract_meta(html, "site:cover")
        published_at = _extract_meta(html, "site:published_at")
        last_modified_at = _extract_meta(html, "site:last_modified_at")
        content = _strip_tags(_prune_layout_blocks(html))
        if not summary:
            summary = _summary_fallback_from_content(content)
        items.append(
            {
                "title": title,
                "url": f"../{urllib.parse.quote(basename)}",
                "path": basename,
                "section": "page",
                "tags": tags,
                "tag_concepts": tag_concepts,
                "tag_labels": tag_labels,
                "summary": summary,
                "content": content,
                "content_markdown": "",
                "preview_markdown": "",
                "reading_time_minutes": 0,
                "published_at": published_at,
                "last_modified_at": last_modified_at,
                "cover": cover,
                "lang": lang,
                "canonical_id": _extract_meta(html, "site:canonical_id") or basename,
                "status": (_extract_meta(html, "site:status") or "published").strip().lower() or "published",
                "pinned": _parse_bool_flag(_extract_meta(html, "site:pinned")),
                "priority": _parse_priority(_extract_meta(html, "site:priority")),
                "kind": "page",
                "related": [],
            }
        )
    return items


def write_outputs(items: list[dict], out_json: str, out_js: str) -> None:
    os.makedirs(os.path.dirname(out_json), exist_ok=True)

    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        f.write("\n")

    payload = json.dumps(items, ensure_ascii=False, separators=(",", ":"))
    js = f"window.SITE_SEARCH_INDEX={payload};\n"
    with open(out_js, "w", encoding="utf-8") as f:
        f.write(js)


def snapshot_mtimes(content_dirs: list[tuple[str, str]], site_pages: list[str]) -> dict[str, float]:
    mtimes: dict[str, float] = {}
    for _, content_dir in content_dirs:
        for root, _, files in os.walk(content_dir):
            for name in files:
                if not name.endswith(".html"):
                    continue
                if name == "index.html":
                    continue
                path = os.path.join(root, name)
                if os.path.isfile(path):
                    mtimes[path] = os.path.getmtime(path)
    for raw in site_pages:
        if not raw:
            continue
        path = os.path.abspath(raw)
        if os.path.isfile(path):
            mtimes[path] = os.path.getmtime(path)
    return mtimes


def run_once(content_dirs: list[tuple[str, str]], site_pages: list[str], out_json: str, out_js: str) -> None:
    items = build_index(content_dirs, site_pages)
    content_items = [it for it in items if str(it.get("kind") or "") == "content"]
    _attach_related(content_items)
    for it in items:
        if "related" not in it:
            it["related"] = []
    write_outputs(items, out_json, out_js)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--content-dirs", default="notes,writing,canvas")
    parser.add_argument("--site-pages", default="")
    parser.add_argument("--out-json", default="search/search-index.json")
    parser.add_argument("--out-js", default="search/search-index.js")
    parser.add_argument("--watch", action="store_true")
    parser.add_argument("--interval", type=float, default=1.0)
    args = parser.parse_args()

    repo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    raw_dirs = [p.strip() for p in str(args.content_dirs or "").split(",") if p.strip()]
    content_dirs: list[tuple[str, str]] = []
    for raw in raw_dirs:
        abs_dir = _resolve_path(repo_dir, raw)
        if not os.path.isdir(abs_dir):
            continue
        name = os.path.basename(abs_dir.rstrip(os.sep)) or raw
        content_dirs.append((name, abs_dir))
    if not content_dirs:
        raise SystemExit(f"No valid content dirs from --content-dirs: {args.content_dirs}")
    raw_pages = [p.strip() for p in str(args.site_pages or "").split(",") if p.strip()]
    site_pages: list[str] = []
    for raw in raw_pages:
        abs_path = _resolve_path(repo_dir, raw)
        if os.path.isfile(abs_path):
            site_pages.append(abs_path)
    out_json = _resolve_path(repo_dir, args.out_json)
    out_js = _resolve_path(repo_dir, args.out_js)

    if args.watch:
        prev = snapshot_mtimes(content_dirs, site_pages)
        run_once(content_dirs, site_pages, out_json, out_js)
        while True:
            time.sleep(max(0.1, float(args.interval)))
            cur = snapshot_mtimes(content_dirs, site_pages)
            if cur != prev:
                run_once(content_dirs, site_pages, out_json, out_js)
                prev = cur
    else:
        run_once(content_dirs, site_pages, out_json, out_js)


if __name__ == "__main__":
    main()
