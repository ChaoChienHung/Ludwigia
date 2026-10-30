#!/usr/bin/env python3
"""Build and bundle Ludwigia World modular characters and interactions data."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "labs" / "world" / "data"
CHARS_DIR = DATA_DIR / "characters"
INTERACTIONS_DIR = DATA_DIR / "interactions"
OUTPUT_FILE = DATA_DIR / "characters.json"

# Preferred order of character IDs for canonical presentation
DEFAULT_CHAR_ORDER = [
    "ludwig", "yully", "wuyen", "luena", "mochi",
    "happy", "kerry", "clark", "jerry", "billy",
    "ludwigia", "gemini", "claude", "chatgpt",
    "haolei", "baisen", "weihao", "chenxin",
    "bohan", "zhenyan", "willkane", "chunlong", "benny", "kunhong"
]

# Preferred order of interaction files for canonical presentation
DEFAULT_INTERACTION_ORDER = [
    "dorm.json", "market.json", "basketball.json", "ai.json", "school.json", "family.json", "douyin.json"
]


def load_characters() -> list[dict]:
    characters: list[dict] = []
    if not CHARS_DIR.exists():
        return characters

    order_map = {cid: idx for idx, cid in enumerate(DEFAULT_CHAR_ORDER)}

    for char_dir in sorted(CHARS_DIR.iterdir()):
        if not char_dir.is_dir():
            continue
        char_file = char_dir / "character.json"
        if not char_file.exists():
            continue
        try:
            char_data = json.loads(char_file.read_text(encoding="utf-8"))
            characters.append(char_data)
        except Exception as e:
            print(f"Error reading {char_file}: {e}", file=sys.stderr)
            raise

    # Sort characters: explicit 'order' field first, then DEFAULT_CHAR_ORDER, then alphabetically by id
    def sort_key(c: dict) -> tuple[int, int, str]:
        cid = c.get("id", "")
        explicit_order = c.get("order")
        if explicit_order is not None and isinstance(explicit_order, (int, float)):
            return (0, int(explicit_order), cid)
        return (1, order_map.get(cid, 999), cid)

    characters.sort(key=sort_key)
    return characters


def load_interactions() -> list[dict]:
    npc_dialogues: list[dict] = []
    if not INTERACTIONS_DIR.exists():
        return npc_dialogues

    file_order = {fname: idx for idx, fname in enumerate(DEFAULT_INTERACTION_ORDER)}
    json_files = sorted(INTERACTIONS_DIR.glob("*.json"),
                        key=lambda p: (file_order.get(p.name, 999), p.name))

    for json_file in json_files:
        try:
            content = json.loads(json_file.read_text(encoding="utf-8"))
            if isinstance(content, list):
                npc_dialogues.extend(content)
            elif isinstance(content, dict):
                # If wrapped in { "npcDialogues": [...] }
                items = content.get("npcDialogues") or content.get("dialogues") or []
                if isinstance(items, list):
                    npc_dialogues.extend(items)
        except Exception as e:
            print(f"Error reading interaction file {json_file}: {e}", file=sys.stderr)
            raise

    return npc_dialogues


def compile_world_data() -> str:
    characters = load_characters()
    npc_dialogues = load_interactions()

    bundle = {
        "characters": characters,
        "npcDialogues": npc_dialogues
    }
    return json.dumps(bundle, ensure_ascii=False, indent=2) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Compile modular character and interaction files into characters.json")
    parser.add_argument("--check", action="store_true", help="Check if characters.json is up to date without writing")
    parser.add_argument("--output", type=Path, default=OUTPUT_FILE, help="Custom output path")
    args = parser.parse_args()

    compiled = compile_world_data()

    if args.check:
        if not args.output.exists():
            print(f"Check failed: {args.output} does not exist.", file=sys.stderr)
            return 1
        current = args.output.read_text(encoding="utf-8")
        if current != compiled:
            print(f"Check failed: {args.output} is out of date. Run 'python3 tools/build_world_data.py' to update.", file=sys.stderr)
            return 1
        print("World data bundle is up to date.")
        return 0

    args.output.write_text(compiled, encoding="utf-8")
    print(f"Successfully compiled world data to {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
