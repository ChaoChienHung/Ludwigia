import json
import os
import re
import unittest
from urllib.parse import urlparse

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TOOLKIT_PATH = os.path.join(REPO_ROOT, "data", "Toolkit", "toolkit.json")
LANGS = ("en", "zh-Hant", "zh-Hans")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class TestToolkitData(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        with open(TOOLKIT_PATH, "r", encoding="utf-8") as f:
            cls.data = json.load(f)

    def test_top_level_shape(self):
        self.assertEqual(self.data.get("version"), 1)
        self.assertIsInstance(self.data.get("stale_after_days"), int)
        self.assertGreater(self.data["stale_after_days"], 0)
        self.assertIsInstance(self.data.get("categories"), list)
        self.assertIsInstance(self.data.get("items"), list)
        self.assertGreater(len(self.data["items"]), 0)

    def test_categories_are_localized_and_unique(self):
        ids = [c["id"] for c in self.data["categories"]]
        self.assertEqual(len(ids), len(set(ids)))
        for cat in self.data["categories"]:
            for lang in LANGS:
                self.assertTrue(cat["title"].get(lang), f"{cat['id']} missing title.{lang}")

    def test_items_contract(self):
        category_ids = {c["id"] for c in self.data["categories"]}
        item_ids = [item["id"] for item in self.data["items"]]
        self.assertEqual(len(item_ids), len(set(item_ids)), "duplicate toolkit item ids")

        for item in self.data["items"]:
            label = item["id"]
            self.assertRegex(label, r"^[a-z0-9]+(?:-[a-z0-9]+)*$", "ids are used as DOM ids and download names")
            self.assertIn(item.get("kind"), {"prompt", "skill", "template", "guide"}, label)
            self.assertIn(item.get("category"), category_ids, label)
            self.assertIn(item.get("status"), {"active", "deprecated"}, label)
            for field in ("title", "summary"):
                for lang in LANGS:
                    self.assertTrue(item[field].get(lang), f"{label} missing {field}.{lang}")

            reference = item.get("reference")
            self.assertIsInstance(reference, str, f"{label}: reference must be present")
            self.assertTrue(reference, f"{label}: reference must not be empty")
            if reference != "Ludwig":
                parsed = urlparse(reference)
                self.assertEqual(parsed.scheme, "https", f"{label}: reference must use HTTPS")
                self.assertTrue(parsed.netloc, f"{label}: reference needs a host")

            # verified_with / verified_at go together; the freshness seal is derived from verified_at at runtime.
            verified_at = item.get("verified_at")
            verified_with = item.get("verified_with")
            self.assertEqual(verified_at is None, verified_with is None, f"{label}: set verified_with and verified_at together")
            if verified_at is not None:
                self.assertRegex(verified_at, DATE_RE, label)

            replaced_by = item.get("replaced_by")
            if replaced_by is not None:
                self.assertIn(replaced_by, item_ids, f"{label}: replaced_by points to unknown item")
                self.assertNotEqual(replaced_by, label)

    def test_sources_exist_and_skills_are_not_copied(self):
        for item in self.data["items"]:
            source = item.get("source", "")
            self.assertTrue(source and not source.startswith("/") and ".." not in source, item["id"])
            self.assertTrue(os.path.isfile(os.path.join(REPO_ROOT, source)), f"{item['id']}: missing {source}")
            if item["kind"] == "skill":
                # Skills can be local implementations in skills/<name>/SKILL.md or curated entries in data/Toolkit/
                if source.startswith("skills/"):
                    self.assertRegex(source, r"^skills/[^/]+/SKILL\.md$", item["id"])
                else:
                    self.assertTrue(source.startswith("data/Toolkit/"), item["id"])
            elif item["kind"] == "prompt":
                self.assertTrue(source.startswith("data/Toolkit/prompts/"), item["id"])
            else:
                self.assertTrue(source.startswith("data/Toolkit/resources/"), item["id"])

            if "files" in item:
                self.assertIsInstance(item["files"], list, f"{item['id']}: files must be a list")
                self.assertGreater(len(item["files"]), 0, f"{item['id']}: files must not be empty")
                item_dir = os.path.dirname(source)
                for f_entry in item["files"]:
                    rel_path = f_entry["path"] if isinstance(f_entry, dict) else f_entry
                    target_path = rel_path if rel_path.startswith(("skills/", "data/")) else os.path.join(item_dir, rel_path)
                    self.assertTrue(os.path.isfile(os.path.join(REPO_ROOT, target_path)), f"{item['id']}: missing file {target_path}")

    def test_type_and_purpose_are_independent_facets(self):
        pairs = {(item["kind"], item["category"]) for item in self.data["items"]}
        self.assertIn(("skill", "writing"), pairs)
        self.assertIn(("prompt", "writing"), pairs)
        self.assertIn(("template", "site-building"), pairs)
        self.assertIn(("guide", "workflow"), pairs)


if __name__ == "__main__":
    unittest.main()
