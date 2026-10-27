import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class WorldDataContractTests(unittest.TestCase):
    def test_dialogue_pools_and_speakers_have_one_source(self):
        data = json.loads((ROOT / "labs/world/data/characters.json").read_text())
        self.assertEqual(set(data), {"characters", "npcDialogues"})
        characters = {char["id"]: char for char in data["characters"]}
        self.assertEqual(len(characters), len(data["characters"]))

        for char in characters.values():
            self.assertEqual(set(char["dialogues"]), {"user", "self"})
            for lang in ("zh-TW", "en"):
                user_pool = char["dialogues"]["user"][lang]
                self.assertTrue(user_pool, char["id"])
                self.assertTrue(all(sequence and all(line.strip() for line in sequence)
                                    for sequence in user_pool), char["id"])
                self_pool = char["dialogues"]["self"][lang]
                self.assertTrue(self_pool and all(line.strip() for line in self_pool), char["id"])

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
        world_css = (ROOT / "labs/world/world.css").read_text()
        shared_css = (ROOT / "assets/css/site/shared.css").read_text()
        tokens = (ROOT / "assets/css/site/palette-tokens.css").read_text()
        self.assertIn("@import url('./palette-tokens.css')", shared_css)
        self.assertIn("var(--palette-accent-dark", world_css)
        self.assertNotIn("html.palette-", world_css)
        for name in ("ember", "cedar", "abyss", "nebula", "galaxy", "sky",
                     "garden", "grove", "red", "yellow", "ash"):
            self.assertIn(f".palette-{name}", tokens)

    def test_dorm_exchange_is_npc_only(self):
        data = json.loads((ROOT / "labs/world/data/characters.json").read_text())
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


if __name__ == "__main__":
    unittest.main()
