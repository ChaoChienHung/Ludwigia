from pathlib import Path
import unittest

from tools import content_contract


class ContentContractTests(unittest.TestCase):
    def test_normalize_tag_lang_supports_simplified_and_traditional_aliases(self) -> None:
        self.assertEqual(content_contract.normalize_tag_lang("zh-CN"), "zh-Hans")
        self.assertEqual(content_contract.normalize_tag_lang("zh-SG"), "zh-Hans")
        self.assertEqual(content_contract.normalize_tag_lang("zh-TW"), "zh-Hant")
        self.assertEqual(content_contract.normalize_tag_lang("zh-HK"), "zh-Hant")
        self.assertEqual(content_contract.normalize_tag_lang("en-US"), "en")

    def test_extract_source_meta_splits_meta_and_body(self) -> None:
        meta, body = content_contract.extract_source_meta(
            """
<meta>
Title: Example
Lang: zh-Hant
</meta>

# Heading
Body
""".strip()
        )
        self.assertEqual(meta["title"], "Example")
        self.assertEqual(meta["lang"], "zh-Hant")
        self.assertEqual(body, "# Heading\nBody")

    def test_extract_core_markdown_strips_author_only_and_custom_blocks(self) -> None:
        markdown = content_contract.extract_core_markdown(
            """
<meta>
Title: Demo
</meta>

<draft>
Hidden plan
</draft>

# Visible

<callout>
Hidden callout
</callout>

Paragraph
""".strip()
        )
        self.assertEqual(markdown, "# Visible\n\nParagraph")

    def test_tag_contract_normalizes_to_locale_label_and_concepts(self) -> None:
        self.assertEqual(
            content_contract.normalize_tags("ML, Artificial Intelligence", lang="zh-Hant"),
            "機器學習, 人工智慧",
        )
        self.assertEqual(
            content_contract.extract_tag_concepts("ML, Artificial Intelligence", lang="zh-Hant"),
            ["concept.machine_learning", "concept.artificial_intelligence"],
        )

    def test_tag_contract_supports_simplified_chinese_fallback(self) -> None:
        self.assertEqual(
            content_contract.normalize_tags("ML, Artificial Intelligence", lang="zh-Hans"),
            "机器学习, 人工智能",
        )

    def test_resolve_tag_label_for_lang_uses_cross_chinese_fallback_before_english(self) -> None:
        original = content_contract.load_tag_ontology_index

        def fake_index():
            return {
                "concepts_by_id": {
                    "concept.only_traditional": {
                        "concept_id": "concept.only_traditional",
                        "labels": {"zh-Hant": "僅繁體"},
                    },
                    "concept.only_simplified": {
                        "concept_id": "concept.only_simplified",
                        "labels": {"zh-Hans": "仅简体"},
                    },
                },
                "alias_to_concept_id": {},
            }

        try:
            content_contract._TAG_ONTOLOGY_INDEX_CACHE = None
            content_contract.load_tag_ontology_index = fake_index
            self.assertEqual(
                content_contract.resolve_tag_label_for_lang("concept.only_traditional", "zh-Hans"),
                "僅繁體",
            )
            self.assertEqual(
                content_contract.resolve_tag_label_for_lang("concept.only_simplified", "zh-Hant"),
                "仅简体",
            )
        finally:
            content_contract.load_tag_ontology_index = original
            content_contract._TAG_ONTOLOGY_INDEX_CACHE = None

    def test_extract_qaprompt_parses_self_closing_tag_and_attrs(self) -> None:
        stripped, prompt = content_contract.extract_qaprompt(
            """
Before
<qprompt title="Quiz Prompt" count="12" type='["mcq","free_response"]'/>
After
""".strip()
        )
        self.assertEqual(stripped, "Before\n<qprompt/>\nAfter")
        self.assertEqual(prompt["title"], "Quiz Prompt")
        self.assertEqual(prompt["append_core_markdown"], "1")
        self.assertIn('approximately 12 questions', prompt["text"])
        self.assertIn('["mcq","free_response"]', prompt["text"])

    def test_parse_bool_handles_case_and_unknown_values(self) -> None:
        self.assertTrue(content_contract.parse_bool("YES", default=False))
        self.assertFalse(content_contract.parse_bool("Off", default=True))
        self.assertTrue(content_contract.parse_bool("maybe", default=True))
        self.assertFalse(content_contract.parse_bool("maybe", default=False))

    def test_estimate_reading_time_minutes_handles_empty_and_dense_content(self) -> None:
        self.assertEqual(content_contract.estimate_reading_time_minutes(""), 0)
        dense = "\n".join(
            [
                "| a | b |",
                "| --- | --- |",
                "| 1 | 2 |",
                "```python",
                "print('x')",
                "```",
                "$$",
                "x = y + z",
                "$$",
            ]
        )
        self.assertGreaterEqual(content_contract.estimate_reading_time_minutes(dense), 1)

    def test_normalize_repo_asset_href_rewrites_only_repo_internal_assets(self) -> None:
        repo_dir = str(Path(__file__).resolve().parents[1])
        source_path = str(Path(repo_dir) / "notes" / "demo" / "demo.md")
        self.assertEqual(
            content_contract.normalize_repo_asset_href(
                repo_dir,
                "../../assets/img/cover.png",
                source_path=source_path,
            ),
            "assets/img/cover.png",
        )
        self.assertEqual(
            content_contract.normalize_repo_asset_href(repo_dir, "/assets/img/cover.png"),
            "assets/img/cover.png",
        )
        self.assertEqual(
            content_contract.normalize_repo_asset_href(repo_dir, "https://example.com/cover.png"),
            "https://example.com/cover.png",
        )
        self.assertEqual(
            content_contract.normalize_repo_asset_href(repo_dir, "../../../../etc/passwd", source_path=source_path),
            "",
        )

    def test_ontology_covers_all_source_tags_and_has_trilingual_labels(self) -> None:
        root = Path(__file__).resolve().parents[1]
        source_files = list(root.glob("notes/**/*.md")) + list(root.glob("writing/**/*.md")) + list(root.glob("canvas/**/*.md"))
        missing_tags = []
        for path in source_files:
            meta, _ = content_contract.extract_source_meta(path.read_text(encoding="utf-8"))
            raw_tags = meta.get("tags", "")
            if not raw_tags:
                continue
            for raw in [t.strip() for t in raw_tags.split(",") if t.strip()]:
                concepts = content_contract.extract_tag_concepts(raw, lang="en")
                if not concepts or not concepts[0]:
                    missing_tags.append((str(path.relative_to(root)), raw))
        self.assertEqual(missing_tags, [])

        ontology = content_contract.load_tag_ontology()
        incomplete = []
        for concept in ontology.get("concepts", []):
            labels = concept.get("labels", {})
            if not labels.get("en") or not labels.get("zh-Hant") or not labels.get("zh-Hans"):
                incomplete.append(concept.get("concept_id", ""))
        self.assertEqual(incomplete, [])


if __name__ == "__main__":
    unittest.main()
