import json
import os
import re
import unittest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class TestSkillsCredentialsData(unittest.TestCase):

    def test_skills_json_structure(self):
        path = os.path.join(REPO_ROOT, "data", "Skills", "skills.json")
        self.assertTrue(os.path.isfile(path), f"Missing file: {path}")

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertIn("version", data)
        self.assertEqual(data["version"], 1)
        self.assertIn("categories", data)
        self.assertIsInstance(data["categories"], list)
        self.assertGreater(len(data["categories"]), 0)

        for cat in data["categories"]:
            self.assertIn("id", cat)
            self.assertIn("title", cat)
            self.assertIsInstance(cat["title"], dict)
            self.assertIn("en", cat["title"])
            self.assertIn("zh-Hant", cat["title"])
            self.assertIn("items", cat)
            self.assertIsInstance(cat["items"], list)
            self.assertGreater(len(cat["items"]), 0)

            for item in cat["items"]:
                self.assertIn("id", item)
                self.assertIn("name", item)
                self.assertIn("percentage", item)
                self.assertIsInstance(item["percentage"], (int, float))
                self.assertTrue(0 <= item["percentage"] <= 100)
                self.assertIn("desc", item)
                self.assertIn("en", item["desc"])
                self.assertIn("zh-Hant", item["desc"])

    def test_credentials_json_structure(self):
        path = os.path.join(REPO_ROOT, "data", "Credentials", "credentials.json")
        self.assertTrue(os.path.isfile(path), f"Missing file: {path}")

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertIn("version", data)
        self.assertEqual(data["version"], 1)
        self.assertIn("types", data)
        self.assertIn("categories", data)
        self.assertIn("items", data)

        valid_types = {t["id"] for t in data["types"]}
        valid_categories = {c["id"] for c in data["categories"]}

        self.assertIn("all", valid_types)
        self.assertIn("all", valid_categories)
        self.assertGreater(len(data["items"]), 0)

        date_pattern = re.compile(r"^\d{4}-\d{2}$")

        for item in data["items"]:
            self.assertIn("id", item)
            self.assertIn("title", item)
            self.assertIn("type", item)
            self.assertIn("category", item)
            self.assertIn("date", item)
            self.assertTrue(date_pattern.match(item["date"]), f"Invalid date format: {item['date']}")

            self.assertIn(item["type"], valid_types)
            self.assertIn(item["category"], valid_categories)

            self.assertIn("issuer", item)
            self.assertIn("summary", item)
            self.assertIn("en", item["title"])
            self.assertIn("zh-Hant", item["title"])
            self.assertIn("en", item["summary"])
            self.assertIn("zh-Hant", item["summary"])


if __name__ == "__main__":
    unittest.main()
