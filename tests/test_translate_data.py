import json
import os
import tempfile
import unittest

from tools.translate_content import (
    LocalModelTranslator,
    TranslationContext,
    is_localized_dict,
    process_data_file,
    translate_json_node,
)


class DummyTestTranslator:
    name = "dummy"

    def translate(self, text: str, context: TranslationContext) -> str:
        if context.target_lang == "en":
            return f"[EN] {text}"
        if context.target_lang == "zh-Hans":
            return f"[CHS] {text}"
        return f"[{context.target_lang}] {text}"


class TestTranslateData(unittest.TestCase):
    def test_is_localized_dict(self):
        self.assertTrue(is_localized_dict({"zh-Hant": "測試", "en": "Test"}))
        self.assertTrue(is_localized_dict({"zh-Hant": "測試"}))
        self.assertFalse(is_localized_dict({"id": "git-linux", "level": "Proficient"}))
        self.assertFalse(is_localized_dict({"version": 1, "types": []}))

    def test_translate_json_node(self):
        data = {
            "id": "item-1",
            "number": 42,
            "title": {
                "zh-Hant": "單元測試標題",
            },
            "category": "tech",
        }
        stats = {"found": 0, "translated": 0}
        translator = DummyTestTranslator()
        updated = translate_json_node(
            data,
            target_langs=["en", "zh-Hans"],
            source_lang="zh-Hant",
            backend=translator,
            overwrite=False,
            dry_run=False,
            stats=stats,
        )

        self.assertEqual(stats["translated"], 2)
        self.assertEqual(updated["title"]["zh-Hant"], "單元測試標題")
        self.assertEqual(updated["title"]["en"], "[EN] 單元測試標題")
        self.assertEqual(updated["title"]["zh-Hans"], "[CHS] 單元測試標題")
        self.assertEqual(updated["id"], "item-1")
        self.assertEqual(updated["number"], 42)

    def test_process_data_file_inplace(self):
        sample_data = {
            "version": 1,
            "items": [
                {
                    "id": "skill-1",
                    "percentage": 100,
                    "name": {"zh-Hant": "繁體中文名稱"},
                }
            ],
        }

        with tempfile.NamedTemporaryFile("w+", suffix=".json", delete=False, encoding="utf-8") as tf:
            json.dump(sample_data, tf, ensure_ascii=False)
            temp_path = tf.name

        try:
            translator = DummyTestTranslator()
            stats = process_data_file(
                temp_path,
                target_langs=["en", "zh-Hans"],
                source_lang="zh-Hant",
                backend=translator,
                overwrite=False,
                dry_run=False,
            )

            self.assertEqual(stats["translated"], 2)
            with open(temp_path, "r", encoding="utf-8") as f:
                res = json.load(f)

            item = res["items"][0]
            self.assertEqual(item["id"], "skill-1")
            self.assertEqual(item["percentage"], 100)
            self.assertEqual(item["name"]["en"], "[EN] 繁體中文名稱")
            self.assertEqual(item["name"]["zh-Hans"], "[CHS] 繁體中文名稱")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)


if __name__ == "__main__":
    unittest.main()
