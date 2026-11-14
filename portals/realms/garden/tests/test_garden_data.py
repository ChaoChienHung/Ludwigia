import unittest
from pathlib import Path

REALM_DIR = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parents[4]


class GardenDataContractTests(unittest.TestCase):
    def test_garden_entry_and_assets_exist(self):
        index_file = REALM_DIR / "index.html"
        self.assertTrue(index_file.exists(), "Garden entry index.html must exist")
        html_content = index_file.read_text(encoding="utf-8")
        self.assertIn("floral-assets", html_content)
        self.assertIn("search-index.js", html_content)

        floral_assets_dir = REALM_DIR / "floral-assets"
        self.assertTrue(floral_assets_dir.is_dir(), "floral-assets/ directory must exist in garden realm")
        assets = list(floral_assets_dir.iterdir())
        self.assertTrue(any(f.name.endswith(".js") for f in assets), "floral-assets must contain JS bundle")
        self.assertTrue(any(f.name.endswith(".css") for f in assets), "floral-assets must contain CSS bundle")


if __name__ == "__main__":
    unittest.main()
