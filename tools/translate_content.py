from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Iterable

# Markdown Content Translation Constants
TRANSLATABLE_META_KEYS = {"title", "summary"}
NON_TRANSLATABLE_META_KEYS = {
    "tags",
    "slug",
    "output",
    "status",
    "canonicalid",
    "canonical_id",
    "published",
    "lastmodified",
    "pinned",
    "priority",
    "cover",
}
TRANSLATABLE_INLINE_KEYS = {"title", "summary", "caption", "alt", "content", "text"}
PROTECTED_LINE_PATTERN = re.compile(r"^\s*</?[a-zA-Z][^>]*>\s*$")
KV_PATTERN = re.compile(r"^(\s*)([A-Za-z][A-Za-z0-9_-]*)(\s*:\s*)(.*)$")
FENCE_PATTERN = re.compile(r"^\s*```")

# JSON Data File Translation Constants
KNOWN_LANG_CODES = {"en", "zh-Hant", "zh-Hans", "ja", "de", "fr", "es"}
DEFAULT_DATA_FILES = [
    "data/Skills/skills.json",
    "data/Credentials/credentials.json",
    "data/Timeline/timeline.json",
]


def _read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as file:
        return file.read()


def _write_text(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        file.write(content)
        if not content.endswith("\n"):
            file.write("\n")


def _read_json(path: str) -> dict | list:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_json(path: str, data: dict | list) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def _iter_sources(path: str, recursive: bool) -> list[str]:
    if os.path.isfile(path):
        return [os.path.abspath(path)]
    out: list[str] = []
    if recursive:
        for root, _, files in os.walk(path):
            for name in files:
                if name.endswith(".md"):
                    out.append(os.path.join(root, name))
    else:
        for name in os.listdir(path):
            p = os.path.join(path, name)
            if os.path.isfile(p) and name.endswith(".md"):
                out.append(p)
    return sorted(os.path.abspath(p) for p in out)


def _target_output_path(source_path: str, target_lang: str, output_root: str) -> str:
    base = os.path.splitext(os.path.basename(source_path))[0]
    match = re.match(r"^(?P<stem>.+)-([a-z]{2}(?:-[A-Za-z0-9]+)?)$", base)
    stem = match.group("stem") if match else base
    target_name = f"{stem}-{target_lang}.md"
    if output_root:
        rel_parent = os.path.dirname(os.path.relpath(source_path, os.getcwd()))
        rel_parent = "" if rel_parent == "." else rel_parent
        return os.path.abspath(os.path.join(output_root, rel_parent, target_name))
    return os.path.abspath(os.path.join(os.path.dirname(source_path), target_name))


def _load_secret_file(secret_file: str) -> str:
    if not secret_file or not os.path.isfile(secret_file):
        return ""
    raw = _read_text(secret_file).strip()
    if not raw:
        return ""
    if "=" in raw:
        for line in raw.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, value = line.split("=", 1)
                if key.strip().upper() in {"GEMINI_API_KEY", "API_KEY"} and value.strip():
                    return value.strip()
    return raw.strip()


def _resolve_gemini_api_key(secret_file: str) -> str:
    # Priority: env vars -> secret file
    for key in ("GEMINI_API_KEY", "LUDWIGIA_GEMINI_API_KEY"):
        value = os.getenv(key, "").strip()
        if value:
            return value
    from_file = _load_secret_file(secret_file)
    if from_file:
        return from_file
    raise SystemExit(
        "Missing Gemini API key. Set GEMINI_API_KEY/LUDWIGIA_GEMINI_API_KEY or provide secret.txt."
    )


def _ensure_model_store(model_store: str) -> str:
    target = os.path.abspath(model_store or "models")
    os.makedirs(target, exist_ok=True)
    return target


@dataclass
class TranslationContext:
    source_lang: str
    target_lang: str


class TranslatorBackend:
    name = "base"

    def translate(self, text: str, context: TranslationContext) -> str:
        raise NotImplementedError


class LocalModelTranslator(TranslatorBackend):
    name = "local-model"

    def __init__(self, model_store: str = "models") -> None:
        self.model_store = model_store
        self.cache_dir = os.path.join(model_store, "local")
        os.makedirs(self.cache_dir, exist_ok=True)

    def translate(self, text: str, context: TranslationContext) -> str:
        return text


class PretrainedModelTranslator(TranslatorBackend):
    name = "pretrained-model"

    def __init__(self, model_store: str = "models") -> None:
        self.model_store = model_store
        self.cache_dir = os.path.join(model_store, "pretrain")
        os.makedirs(self.cache_dir, exist_ok=True)

    def translate(self, text: str, context: TranslationContext) -> str:
        return text


class GeminiApiTranslator(TranslatorBackend):
    name = "gemini-api"

    def __init__(self, api_key: str, model: str = "gemini-1.5-flash") -> None:
        self.api_key = api_key
        self.model = model

    def translate(self, text: str, context: TranslationContext) -> str:
        if not text.strip():
            return text
        prompt = (
            "Translate the input text from "
            f"{context.source_lang} to {context.target_lang}. "
            "Keep technical terms, markdown symbols, placeholders, links, tags, and punctuation unchanged. "
            "Return only translated text with no explanation.\n\n"
            f"Input:\n{text}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1},
        }
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?key={self.api_key}"
        )
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise SystemExit(f"Gemini API request failed: HTTP {exc.code} {detail}") from exc
        except urllib.error.URLError as exc:
            raise SystemExit(f"Gemini API request failed: {exc.reason}") from exc

        candidates = raw.get("candidates") or []
        if not candidates:
            raise SystemExit("Gemini API returned no candidates.")
        parts = candidates[0].get("content", {}).get("parts") or []
        text_out = "".join(str(part.get("text", "")) for part in parts).strip()
        if not text_out:
            raise SystemExit("Gemini API returned empty translation.")
        return text_out


def _build_backend(args: argparse.Namespace) -> TranslatorBackend:
    backend = args.backend.strip().lower()
    model_store = _ensure_model_store(getattr(args, "model_store", "data/models"))
    if backend == "local-model":
        return LocalModelTranslator(model_store=model_store)
    if backend == "pretrained-model":
        return PretrainedModelTranslator(model_store=model_store)
    if backend == "gemini-api":
        return GeminiApiTranslator(api_key=_resolve_gemini_api_key(args.secret_file), model=args.gemini_model)
    raise SystemExit(f"Unsupported backend: {args.backend}")


# --- Markdown Content Translation Functions ---

def _translate_segments(backend: TranslatorBackend, text: str, context: TranslationContext) -> str:
    if not text.strip():
        return text
    placeholders: dict[str, str] = {}
    protected = text

    def protect(pattern: str, source: str) -> str:
        def repl(match: re.Match[str]) -> str:
            token = f"__PH_{len(placeholders)}__"
            placeholders[token] = match.group(0)
            return token

        return re.sub(pattern, repl, source)

    protected = protect(r"`[^`]+`", protected)
    protected = protect(r"https?://\S+", protected)
    protected = protect(r"\[[^\]]+\]\([^)]+\)", protected)
    translated = backend.translate(protected, context)
    for token, raw in placeholders.items():
        translated = translated.replace(token, raw)
    return translated


def _translate_lines(lines: Iterable[str], backend: TranslatorBackend, context: TranslationContext) -> list[str]:
    out: list[str] = []
    in_meta = False
    in_fence = False
    for line in lines:
        stripped = line.strip()
        if stripped == "<meta>":
            in_meta = True
            out.append(line)
            continue
        if stripped == "</meta>":
            in_meta = False
            out.append(line)
            continue
        if FENCE_PATTERN.match(stripped):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
            continue
        if PROTECTED_LINE_PATTERN.match(stripped):
            out.append(line)
            continue

        kv = KV_PATTERN.match(line)
        if kv:
            prefix, key, sep, value = kv.groups()
            key_norm = key.strip().lower()
            if in_meta:
                if key_norm in NON_TRANSLATABLE_META_KEYS:
                    out.append(line)
                    continue
                if key_norm == "lang":
                    out.append(f"{prefix}{key}{sep}{context.target_lang}")
                    continue
                if key_norm in TRANSLATABLE_META_KEYS:
                    translated = _translate_segments(backend, value, context)
                    out.append(f"{prefix}{key}{sep}{translated}")
                    continue
                out.append(line)
                continue

            if key_norm in TRANSLATABLE_INLINE_KEYS:
                translated = _translate_segments(backend, value, context)
                out.append(f"{prefix}{key}{sep}{translated}")
            else:
                out.append(line)
            continue

        if stripped.startswith("#"):
            m = re.match(r"^(#+\s*)(.*)$", line)
            if m:
                out.append(f"{m.group(1)}{_translate_segments(backend, m.group(2), context)}")
                continue

        out.append(_translate_segments(backend, line, context))
    return out


def _translate_file(
    source_path: str,
    output_path: str,
    backend: TranslatorBackend,
    context: TranslationContext,
    dry_run: bool,
    overwrite: bool,
) -> None:
    if os.path.exists(output_path) and not overwrite:
        raise SystemExit(f"Output exists, use --overwrite: {output_path}")
    source = _read_text(source_path)
    translated_lines = _translate_lines(source.splitlines(), backend, context)
    output = "\n".join(translated_lines)
    if dry_run:
        print(f"[dry-run] {source_path} -> {output_path}")
        return
    _write_text(output_path, output)
    print(f"[translated] {source_path} -> {output_path}")


# --- JSON Data File Translation Functions ---

def is_localized_dict(node: dict) -> bool:
    if not node or not isinstance(node, dict):
        return False
    keys = set(node.keys())
    return bool(keys & KNOWN_LANG_CODES) and all(
        k in KNOWN_LANG_CODES for k in keys if isinstance(k, str)
    )


def translate_json_node(
    node: object,
    target_langs: list[str],
    source_lang: str,
    backend: TranslatorBackend,
    overwrite: bool,
    dry_run: bool,
    stats: dict[str, int],
) -> object:
    if isinstance(node, list):
        return [
            translate_json_node(
                item, target_langs, source_lang, backend, overwrite, dry_run, stats
            )
            for item in node
        ]

    if isinstance(node, dict):
        if is_localized_dict(node):
            source_text = node.get(source_lang, "")
            if not source_text:
                for k, v in node.items():
                    if isinstance(v, str) and v.strip():
                        source_text = v
                        break

            if source_text:
                for target_lang in target_langs:
                    existing = str(node.get(target_lang, "") or "").strip()
                    if not existing or overwrite:
                        stats["found"] += 1
                        if dry_run:
                            print(f"[dry-run] Translate '{source_text}' -> {target_lang}")
                            stats["translated"] += 1
                        else:
                            ctx = TranslationContext(
                                source_lang=source_lang, target_lang=target_lang
                            )
                            translated = backend.translate(source_text, ctx)
                            node[target_lang] = translated
                            stats["translated"] += 1
                            print(f"Translated [{target_lang}]: '{source_text}' -> '{translated}'")
            return node

        updated_dict = {}
        for key, val in node.items():
            updated_dict[key] = translate_json_node(
                val, target_langs, source_lang, backend, overwrite, dry_run, stats
            )
        return updated_dict

    return node


def process_data_file(
    file_path: str,
    target_langs: list[str],
    source_lang: str,
    backend: TranslatorBackend,
    overwrite: bool,
    dry_run: bool,
) -> dict[str, int]:
    if not os.path.isfile(file_path):
        print(f"Warning: File not found: {file_path}")
        return {"found": 0, "translated": 0}

    data = _read_json(file_path)
    stats = {"found": 0, "translated": 0}
    updated_data = translate_json_node(
        data, target_langs, source_lang, backend, overwrite, dry_run, stats
    )

    if not dry_run and stats["translated"] > 0:
        _write_json(file_path, updated_data)
        print(f"Updated JSON file: {file_path} ({stats['translated']} translations added/updated)")

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description="Translate Ludwigia source markdown or JSON data files.")
    parser.add_argument("--source", default="", help="Single source markdown or json path")
    parser.add_argument("--data-file", default="", help="Path to JSON file or 'all' for default data files")
    parser.add_argument("--batch-dir", default="", help="Batch directory containing markdown sources")
    parser.add_argument("--recursive", action="store_true", help="Recursive walk for --batch-dir")
    parser.add_argument("--target-lang", default="", help="Target language tag, e.g. zh-Hant/en")
    parser.add_argument("--target-langs", default="", help="Comma-separated target languages for JSON data mode")
    parser.add_argument("--source-lang", default="auto", help="Source language tag, default auto")
    parser.add_argument(
        "--backend",
        default="gemini-api",
        choices=["gemini-api", "local-model", "pretrained-model"],
        help="Translation backend",
    )
    parser.add_argument("--model-store", default="data/models", help="Unified model/cache store")
    parser.add_argument("--secret-file", default="secret.txt", help="Secret file path outside VCS")
    parser.add_argument("--gemini-model", default="gemini-1.5-flash", help="Gemini model name")
    parser.add_argument("--output-root", default="", help="Optional output root directory")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing translated files")
    parser.add_argument("--dry-run", action="store_true", help="Preview actions without writing")
    args = parser.parse_args()

    # Route 1: Handle JSON data file translation if --data-file is provided or --source ends with .json
    is_json_mode = bool(args.data_file) or (args.source and args.source.endswith(".json"))
    if is_json_mode:
        data_arg = args.data_file or args.source
        raw_targets = args.target_langs or args.target_lang or "en,zh-Hans"
        target_langs = [part.strip() for part in raw_targets.split(",") if part.strip()]
        source_lang = "zh-Hant" if args.source_lang == "auto" else args.source_lang

        files_to_process = DEFAULT_DATA_FILES if data_arg == "all" else [os.path.abspath(data_arg)]
        backend = _build_backend(args)

        total_stats = {"found": 0, "translated": 0}
        for file_path in files_to_process:
            print(f"\nProcessing data file: {file_path}...")
            stats = process_data_file(
                file_path, target_langs, source_lang, backend, args.overwrite, args.dry_run
            )
            total_stats["found"] += stats["found"]
            total_stats["translated"] += stats["translated"]

        print(
            f"\nDone! Found {total_stats['found']} target fields, {total_stats['translated']} translations processed."
        )
        return

    # Route 2: Handle Markdown content file translation
    if not args.source and not args.batch_dir:
        raise SystemExit("Provide --source, --data-file, or --batch-dir.")

    if not args.target_lang:
        raise SystemExit("Provide --target-lang for markdown content translation.")

    sources: list[str] = []
    if args.source:
        src = os.path.abspath(args.source)
        if not os.path.isfile(src):
            raise SystemExit(f"Source not found: {src}")
        sources.append(src)
    if args.batch_dir:
        batch_root = os.path.abspath(args.batch_dir)
        if not os.path.isdir(batch_root):
            raise SystemExit(f"Batch directory not found: {batch_root}")
        sources.extend(_iter_sources(batch_root, recursive=args.recursive))

    deduped = sorted(set(sources))
    if not deduped:
        raise SystemExit("No markdown sources found.")

    backend = _build_backend(args)
    context = TranslationContext(source_lang=args.source_lang, target_lang=args.target_lang)

    for source in deduped:
        output = _target_output_path(source, args.target_lang, args.output_root)
        _translate_file(
            source_path=source,
            output_path=output,
            backend=backend,
            context=context,
            dry_run=args.dry_run,
            overwrite=args.overwrite,
        )


if __name__ == "__main__":
    main()
