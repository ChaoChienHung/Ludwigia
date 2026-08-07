import argparse
import json
import os
import shutil
import subprocess
import sys

from tools import content_contract, information_ontology


def _repo_dir() -> str:
    return os.path.abspath(os.path.dirname(__file__))


def _abs_path(path: str) -> str:
    p = path.strip()
    if not p:
        raise SystemExit("Empty path")
    if os.path.isabs(p):
        return p
    return os.path.abspath(os.path.join(_repo_dir(), p))


def _run(argv: list[str]) -> None:
    subprocess.run(argv, cwd=_repo_dir(), check=True)


def _iter_note_sources(content_dir: str) -> list[str]:
    out: list[str] = []
    for root, _, files in os.walk(content_dir):
        for name in files:
            if not name.endswith(".md"):
                continue
            out.append(os.path.join(root, name))
    return sorted(out)


def _resolve_content_dirs(spec: str) -> list[str]:
    raw = (spec or "").strip()
    if not raw:
        raw = "notes"
    if raw in {"all", "*"}:
        return ["notes", "writing", "canvas"]
    dirs = [part.strip() for part in raw.split(",") if part.strip()]
    if not dirs:
        raise SystemExit("Empty --content-dir")
    return dirs


def _iter_content_sources(spec: str) -> list[str]:
    content_dirs = [_abs_path(content_dir) for content_dir in _resolve_content_dirs(spec)]
    sources: list[str] = []
    for content_dir in content_dirs:
        sources.extend(_iter_note_sources(content_dir))
    sources = sorted(set(sources))
    if not sources:
        joined = ", ".join(content_dirs)
        raise SystemExit(f"No .md found under: {joined}")
    return sources


def _build_tag_ontology_report(spec: str) -> dict[str, object]:
    sources = _iter_content_sources(spec)
    missing_tags: list[tuple[str, str]] = []
    for source in sources:
        rel_path = os.path.relpath(source, _repo_dir()).replace(os.sep, "/")
        with open(source, "r", encoding="utf-8") as f:
            meta, _ = content_contract.extract_source_meta(f.read())
        raw_tags = str(meta.get("tags", "") or "").strip()
        if not raw_tags:
            continue
        for raw_tag in [part.strip() for part in raw_tags.split(",") if part.strip()]:
            concepts = content_contract.extract_tag_concepts(raw_tag, lang="en")
            if not concepts or not concepts[0]:
                missing_tags.append((rel_path, raw_tag))

    incomplete_concepts: list[tuple[str, list[str]]] = []
    ontology = content_contract.load_tag_ontology()
    for concept in ontology.get("concepts", []):
        if not isinstance(concept, dict):
            continue
        labels = concept.get("labels", {})
        if not isinstance(labels, dict):
            labels = {}
        missing_langs = [lang for lang in ("en", "zh-Hant", "zh-Hans") if not str(labels.get(lang, "") or "").strip()]
        if missing_langs:
            incomplete_concepts.append((str(concept.get("concept_id", "")), missing_langs))

    return {
        "source_count": len(sources),
        "missing_tags": missing_tags,
        "incomplete_concepts": incomplete_concepts,
    }


def cmd_clean(_: argparse.Namespace) -> None:
    repo = _repo_dir()
    targets = [
        os.path.join(repo, "notes", "_generated"),
        os.path.join(repo, "__pycache__"),
        os.path.join(repo, ".pytest_cache"),
    ]
    for t in targets:
        if os.path.isdir(t):
            shutil.rmtree(t)

    for root, dirs, files in os.walk(repo):
        if "__pycache__" in dirs:
            shutil.rmtree(os.path.join(root, "__pycache__"))
            dirs.remove("__pycache__")
        for name in files:
            if name.endswith(".pyc"):
                try:
                    os.remove(os.path.join(root, name))
                except OSError:
                    pass


def cmd_index(_: argparse.Namespace) -> None:
    _run([sys.executable, os.path.join("search", "indexer.py")])


def cmd_test(_: argparse.Namespace) -> None:
    _run([sys.executable, "tools/create_content.py", "--self-test"])
    _run([sys.executable, "-m", "unittest"])
    _run([sys.executable, "-m", "py_compile", os.path.join("search", "indexer.py")])
    cmd_check_tags(argparse.Namespace(content_dir="all"))


def cmd_install_hooks(_: argparse.Namespace) -> None:
    hooks_dir = os.path.join(_repo_dir(), ".githooks")
    if not os.path.isdir(hooks_dir):
        raise SystemExit(f"Missing hooks directory: {hooks_dir}")
    for name in ("pre-commit", "pre-push"):
        path = os.path.join(hooks_dir, name)
        if os.path.isfile(path):
            os.chmod(path, 0o755)
    subprocess.run(["git", "config", "core.hooksPath", hooks_dir], cwd=_repo_dir(), check=True)
    print(f"Installed git hooks from {hooks_dir}")


def cmd_serve(args: argparse.Namespace) -> None:
    port = int(args.port)
    _run([sys.executable, "-m", "http.server", str(port), "--directory", "."])


def cmd_build(args: argparse.Namespace) -> None:
    source = _abs_path(args.source)
    argv = [sys.executable, "tools/create_content.py", "--source", source, "--force"]
    if args.no_index:
        argv.append("--no-index")
    if args.output_root:
        argv.extend(["--output-root", args.output_root])
    _run(argv)


def cmd_build_all(args: argparse.Namespace) -> None:
    sources = _iter_content_sources(args.content_dir)

    for src in sources:
        argv = [sys.executable, "tools/create_content.py", "--source", src, "--force", "--no-index"]
        if args.output_root:
            argv.extend(["--output-root", args.output_root])
        _run(argv)

    if not args.no_index:
        cmd_index(args)


def cmd_translate(args: argparse.Namespace) -> None:
    argv = [sys.executable, "tools/translate_content.py", "--target-lang", args.target_lang, "--backend", args.backend]
    if args.source:
        argv.extend(["--source", _abs_path(args.source)])
    if args.batch_dir:
        argv.extend(["--batch-dir", _abs_path(args.batch_dir)])
    if args.recursive:
        argv.append("--recursive")
    if args.source_lang:
        argv.extend(["--source-lang", args.source_lang])
    if args.output_root:
        argv.extend(["--output-root", _abs_path(args.output_root)])
    if args.model_store:
        argv.extend(["--model-store", _abs_path(args.model_store)])
    if args.secret_file:
        argv.extend(["--secret-file", args.secret_file if os.path.isabs(args.secret_file) else _abs_path(args.secret_file)])
    if args.gemini_model:
        argv.extend(["--gemini-model", args.gemini_model])
    if args.overwrite:
        argv.append("--overwrite")
    if args.dry_run:
        argv.append("--dry-run")
    _run(argv)


def cmd_check_tags(args: argparse.Namespace) -> None:
    report = _build_tag_ontology_report(args.content_dir)
    missing_tags = report["missing_tags"]
    incomplete_concepts = report["incomplete_concepts"]

    if not missing_tags and not incomplete_concepts:
        print(
            f"OK: ontology covers all source tags across {report['source_count']} files "
            "and every concept has en / zh-Hant / zh-Hans labels."
        )
        return

    if missing_tags:
        print("Missing ontology mappings:")
        for rel_path, tag in missing_tags:
            print(f"  - {rel_path}: {tag}")
    if incomplete_concepts:
        print("Incomplete ontology labels:")
        for concept_id, langs in incomplete_concepts:
            joined = ", ".join(langs)
            print(f"  - {concept_id}: missing {joined}")
    raise SystemExit(1)


def cmd_scan_information(args: argparse.Namespace) -> None:
    report = information_ontology.scan_information_candidates(_abs_path(args.source), _repo_dir())
    if getattr(args, "json", False):
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return

    rel_path = os.path.relpath(report["source_path"], _repo_dir()).replace(os.sep, "/")
    matched_terms = report["matched_terms"]
    annotated_terms = report["annotated_terms"]
    candidate_terms = report["candidate_terms"]

    print(f"Scanned: {rel_path} ({report['lang']})")

    print("\nMatched ontology terms:")
    if not matched_terms:
        print("  - None")
    for item in matched_terms:
        status = "annotated" if item["annotated"] else "candidate"
        print(
            f"  - line {item['line']}: {item['matched_text']} "
            f"[{item['concept_id']}] ({status})"
        )

    print("\nAlready annotated with <information>:")
    if not annotated_terms:
        print("  - None")
    for item in annotated_terms:
        print(f"  - line {item['line']}: {item['matched_text']} [{item['concept_id']}]")

    print("\nFirst-occurrence candidates:")
    if not candidate_terms:
        print("  - None")
    for item in candidate_terms:
        print(f"  - line {item['line']}: {item['matched_text']} [{item['concept_id']}]")


def main() -> None:
    parser = argparse.ArgumentParser(prog="ludwigia-cli")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_clean = sub.add_parser("clean")
    p_clean.set_defaults(func=cmd_clean)

    p_index = sub.add_parser("index")
    p_index.set_defaults(func=cmd_index)

    p_test = sub.add_parser("test")
    p_test.set_defaults(func=cmd_test)

    p_hooks = sub.add_parser("install-hooks")
    p_hooks.set_defaults(func=cmd_install_hooks)

    p_serve = sub.add_parser("serve")
    p_serve.add_argument("--port", default="8000")
    p_serve.set_defaults(func=cmd_serve)

    p_build = sub.add_parser("build")
    p_build.add_argument("source")
    p_build.add_argument("--no-index", action="store_true")
    p_build.add_argument("--output-root", default="")
    p_build.set_defaults(func=cmd_build)

    p_build_all = sub.add_parser("build-all")
    p_build_all.add_argument("--content-dir", default="all")
    p_build_all.add_argument("--no-index", action="store_true")
    p_build_all.add_argument("--output-root", default="")
    p_build_all.set_defaults(func=cmd_build_all)

    p_translate = sub.add_parser("translate")
    p_translate.add_argument("--source", default="")
    p_translate.add_argument("--batch-dir", default="")
    p_translate.add_argument("--recursive", action="store_true")
    p_translate.add_argument("--target-lang", required=True)
    p_translate.add_argument("--source-lang", default="auto")
    p_translate.add_argument("--backend", default="gemini-api")
    p_translate.add_argument("--output-root", default="")
    p_translate.add_argument("--model-store", default="data/models")
    p_translate.add_argument("--secret-file", default="secret.txt")
    p_translate.add_argument("--gemini-model", default="gemini-1.5-flash")
    p_translate.add_argument("--overwrite", action="store_true")
    p_translate.add_argument("--dry-run", action="store_true")
    p_translate.set_defaults(func=cmd_translate)

    p_check_tags = sub.add_parser("check-tags")
    p_check_tags.add_argument("--content-dir", default="all")
    p_check_tags.set_defaults(func=cmd_check_tags)

    p_scan_information = sub.add_parser("scan-information")
    p_scan_information.add_argument("source")
    p_scan_information.add_argument("--json", action="store_true")
    p_scan_information.set_defaults(func=cmd_scan_information)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
