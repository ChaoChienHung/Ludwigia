import unittest
from pathlib import Path
import tempfile

from tools import information_ontology


class InformationOntologyTests(unittest.TestCase):
    def test_localized_lookup(self) -> None:
        self.assertEqual(information_ontology.get_concept_label("concept.eda", "en"), "Exploratory Data Analysis (EDA)")
        self.assertEqual(information_ontology.get_concept_label("concept.eda", "zh-Hant"), "探索式資料分析（EDA）")
        self.assertIn("early stage", information_ontology.get_concept_context("concept.eda", "en"))

    def test_generated_js_contains_window_assignment(self) -> None:
        js = information_ontology.build_information_ontology_js()
        self.assertTrue(js.startswith("window.LUDWIG_INFORMATION_ONTOLOGY="))
        self.assertIn("concept.eda", js)

    def test_scan_information_candidates_reports_annotated_and_unannotated_first_occurrences(self) -> None:
        sample = """
<meta>
Title: Demo
Lang: zh-Hant
</meta>

## 反向工程

這裡先提到監督式學習，但還沒有標註。

稍後再提到<information concept="concept.reverse_engineering">反向工程</information>。

最後也會提到擾動。
""".strip()

        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "demo.md"
            source.write_text(sample, encoding="utf-8")
            report = information_ontology.scan_information_candidates(str(source))

        matched_ids = [item["concept_id"] for item in report["matched_terms"]]
        annotated_ids = [item["concept_id"] for item in report["annotated_terms"]]
        candidate_ids = [item["concept_id"] for item in report["candidate_terms"]]

        self.assertIn("concept.supervised_learning", matched_ids)
        self.assertIn("concept.reverse_engineering", matched_ids)
        self.assertIn("concept.noise", matched_ids)
        self.assertIn("concept.reverse_engineering", annotated_ids)
        self.assertIn("concept.supervised_learning", candidate_ids)
        self.assertIn("concept.noise", candidate_ids)
        self.assertNotIn("concept.reverse_engineering", candidate_ids)


if __name__ == "__main__":
    unittest.main()
