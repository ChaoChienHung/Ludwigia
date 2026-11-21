import json
import unittest
from pathlib import Path


REALM_DIR = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parents[4]


class PensieveDataContractTests(unittest.TestCase):
    def test_dialogue_pools_and_speakers_have_one_source(self):
        data = json.loads((REALM_DIR / "data/characters.json").read_text(encoding="utf-8"))
        self.assertEqual(set(data), {"characters", "npcDialogues"})
        characters = {char["id"]: char for char in data["characters"]}
        self.assertEqual(len(characters), len(data["characters"]))

        for char in characters.values():
            self.assertEqual(set(char["dialogues"]), {"user", "self"})
            for lang in ("zh-TW", "en"):
                user_pool = char["dialogues"]["user"][lang]
                self.assertTrue(all(sequence and all(line.strip() for line in sequence)
                                    for sequence in user_pool), char["id"])
                self_pool = char["dialogues"]["self"][lang]
                self.assertTrue(all(line.strip() for line in self_pool), char["id"])

        for pair in data["npcDialogues"]:
            participants = pair["participants"]
            self.assertGreaterEqual(len(participants), 2)
            for p in participants:
                self.assertIn(p, characters)
            p0_zones = {characters[participants[0]]["zone"], *characters[participants[0]].get("visitedZones", [])}
            for p in participants[1:]:
                p_zones = {characters[p]["zone"], *characters[p].get("visitedZones", [])}
                self.assertTrue(bool(p0_zones & p_zones),
                                f"{participants[0]} and {p} must share at least one zone to converse")
            for lang in ("zh-TW", "en"):
                lines = pair["dialogues"][lang]
                self.assertTrue(lines)
                self.assertTrue(all(line["speaker"] in participants and line["text"].strip()
                                    for line in lines))

    def test_world_uses_shared_palette_tokens(self):
        world_css = (REALM_DIR / "world.css").read_text(encoding="utf-8")
        shared_css = (ROOT / "assets/css/site/shared.css").read_text(encoding="utf-8")
        tokens = (ROOT / "assets/css/site/palette-tokens.css").read_text(encoding="utf-8")
        self.assertIn("@import url('./palette-tokens.css')", shared_css)
        self.assertIn("var(--palette-accent-dark", world_css)
        self.assertNotIn("html.palette-", world_css)
        for name in ("ember", "cedar", "abyss", "nebula", "galaxy", "sky",
                     "garden", "grove", "red", "yellow", "ash"):
            self.assertIn(f".palette-{name}", tokens)

    def test_dorm_exchange_is_npc_only(self):
        data = json.loads((REALM_DIR / "data/characters.json").read_text(encoding="utf-8"))
        characters = {char["id"]: char for char in data["characters"]}
        exchange = next(pair for pair in data["npcDialogues"]
                        if [line["text"] for line in pair["dialogues"]["zh-TW"]]
                        == ["你們先去吃吧，我不餓。", "你是水蛭喔？"])
        self.assertEqual(exchange["participants"], ["bohan", "jerry"])
        self.assertEqual([line["speaker"] for line in exchange["dialogues"]["zh-TW"]],
                         ["bohan", "jerry"])
        for char_id, phrase in (("bohan", "你們先去吃吧，我不餓。"),
                                ("jerry", "你是水蛭喔？")):
            user_lines = characters[char_id]["dialogues"]["user"]["zh-TW"]
            self.assertNotIn(phrase, [line for sequence in user_lines for line in sequence])

    def test_pensieve_data_bundle_is_up_to_date(self):
        from tools.build_pensieve_data import compile_pensieve_data
        compiled = compile_pensieve_data()
        current = (REALM_DIR / "data/characters.json").read_text(encoding="utf-8")
        self.assertEqual(compiled, current,
                         "characters.json is out of date with characters/ and interactions/. Run 'python3 cli.py build-pensieve'")


if __name__ == "__main__":
    unittest.main()
