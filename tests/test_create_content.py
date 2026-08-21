import subprocess
import sys
import tempfile
import unittest

from tools import create_content


class CreateContentTests(unittest.TestCase):
    def _sample_source(self) -> str:
        return (
            "<meta>\n"
            "Title: Self Test Note\n"
            "Tags: ml, system design\n"
            "Summary: Self test\n"
            "Slug: self-test\n"
            "Style: default\n"
            "EstimatedReadingTime: true\n"
            "Lang: zh-Hant\n"
            "TitleSuffix: true\n"
            "</meta>\n"
            "\n"
            "<anchors>\n"
            "h2: Types of Attributes -> attributes-types\n"
            "</anchors>\n"
            "\n"
            "# Self Test Note\n"
            "\n"
            "## Types of Attributes\n"
            "\n"
            "These attributes generally fall into two broad categories:\n"
            "\n"
            "1. Categorical (Qualitative) Attributes\n"
            "Categorical attributes describe traits.\n"
            "* Nominal values only allow testing for equality ($=$ or $\\\\neq$).\n"
            "* Ordinal values allow ($>$) or ($<$).\n"
            "\n"
            "<image>\n"
            "caption: Placeholder image\n"
            "</image>\n"
            "\n"
            "```plaintext\n"
            "code fence should not loop\n"
            "```\n"
            "\n"
            "<reviewkit>\n"
            "title: Review Kit\n"
            "id: summary-quiz\n"
            "toc: false\n"
            "<qquiz>\n"
            "<question>\n"
            "Question: Test?\n"
            "A: A1\n"
            "ResponseA: Incorrect.\n"
            "B: B1\n"
            "ResponseB: Correct.\n"
            "C: C1\n"
            "ResponseC: Incorrect.\n"
            "D: D1\n"
            "ResponseD: Incorrect.\n"
            "Answer: B\n"
            "Explanation: Because.\n"
            "</question>\n"
            "</qquiz>\n"
            "<qprompt>\n"
            "title: QA Generator Prompt\n"
            "prompt:\n"
            "You are given a set of notes.\n"
            "</qprompt>\n"
            "</reviewkit>\n"
        )

    def test_self_test_function(self) -> None:
        create_content._self_test()

    def test_self_test_cli(self) -> None:
        p = subprocess.run(
            [sys.executable, "tools/create_content.py", "--self-test"],
            cwd=create_content._resolve_repo_dir(),
            capture_output=True,
            text=True,
            check=True,
        )
        self.assertIn("OK: self-test passed", p.stdout)

    def test_extract_qprompt_and_reviewkit_rendering(self) -> None:
        meta, body = create_content._extract_source_meta(self._sample_source())
        self.assertEqual(meta.get("title"), "Self Test Note")
        self.assertEqual(meta.get("tags"), "ml, system design")
        self.assertEqual(meta.get("summary"), "Self test")

        body_without_anchors, anchors_block = create_content._extract_simple_block(body, "anchors")
        anchors_map, toc_overrides = create_content._parse_anchors(anchors_block)
        self.assertEqual(anchors_map.get("h2:Types of Attributes"), "attributes-types")
        self.assertEqual(toc_overrides, [])

        body_without_prompt, qaprompt = create_content._extract_qaprompt(body_without_anchors)
        self.assertEqual(qaprompt.get("title"), "QA Generator Prompt")
        self.assertEqual(qaprompt.get("append_core_markdown"), "1")
        self.assertIn("<qprompt/>", body_without_prompt)

        shorthand_body, shorthand_qaprompt = create_content._extract_qaprompt('<qprompt count=20 type=["mcq"]>\n</qprompt>\n')
        self.assertIn("<qprompt/>", shorthand_body)
        self.assertEqual(shorthand_qaprompt.get("append_core_markdown"), "1")
        self.assertIn("approximately 20 questions", shorthand_qaprompt.get("text") or "")
        self.assertIn('Requested question type(s): ["mcq"]', shorthand_qaprompt.get("text") or "")

        bare_body, bare_qaprompt = create_content._extract_qaprompt("<qprompt/>\n")
        self.assertIn("<qprompt/>", bare_body)
        self.assertEqual(bare_qaprompt.get("title"), "QA Generator Prompt")
        self.assertEqual(bare_qaprompt.get("append_core_markdown"), "1")
        self.assertIn("approximately 20 questions", bare_qaprompt.get("text") or "")
        self.assertIn('Requested question type(s): ["mcq"]', bare_qaprompt.get("text") or "")

        style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
        rendered, toc_links = create_content._markdown_to_html(
            body_without_prompt,
            style=style,
            doc_title=meta.get("title", ""),
            anchors=anchors_map,
            toc_overrides=toc_overrides,
            qaprompt=qaprompt,
            allow_raw_html=False,
        )
        self.assertIn('id="attributes-types"', rendered)
        self.assertIn('<p class="mb-3">Categorical attributes describe traits.</p>', rendered)
        self.assertNotIn("<strong>Categorical (Qualitative) Attributes</strong><br>\n  Categorical attributes describe traits.", rendered)
        self.assertIn("note-image-placeholder", rendered)
        self.assertIn("code fence should not loop", rendered)
        self.assertIn("note-qa-full", rendered)
        self.assertIn('id="summary-quiz"', rendered)
        self.assertIn("note-reviewkit-pane-quiz", rendered)
        self.assertIn("note-reviewkit-pane-prompt", rendered)
        self.assertTrue("$\\neq$" in rendered or "\\neq" in rendered)
        self.assertIn("note-toc-link", toc_links)

    def test_qprompt_can_render_standalone(self) -> None:
        style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
        source = "<qprompt/>\n"
        body_without_prompt, qaprompt = create_content._extract_qaprompt(source)
        rendered, _ = create_content._markdown_to_html(
            body_without_prompt,
            style=style,
            doc_title="Standalone QA",
            anchors={},
            toc_overrides=[],
            qaprompt=qaprompt,
            allow_raw_html=False,
        )
        self.assertIn("note-qa-section", rendered)
        self.assertIn("note-qa-full", rendered)
        self.assertRegex(rendered, r'<section id="qa-generator-prompt" class="note-section note-qa-section"')

    def test_extract_core_markdown_ignores_reviewkit_and_prompt(self) -> None:
        core_md = create_content._extract_core_markdown(self._sample_source())
        self.assertIn("# Self Test Note", core_md)
        self.assertIn("## Types of Attributes", core_md)
        self.assertIn("Categorical attributes describe traits.", core_md)
        self.assertIn("code fence should not loop", core_md)
        self.assertNotIn("<reviewkit>", core_md)
        self.assertNotIn("<qquiz>", core_md)
        self.assertNotIn("<qprompt>", core_md)
        self.assertNotIn("Placeholder image", core_md)

    def test_date_normalization_and_filesystem_fallback(self) -> None:
        self.assertEqual(create_content._normalize_date_value("2026-06-10"), "2026-06-10")
        self.assertEqual(create_content._normalize_date_value("2026-06-10T15:30:00+08:00"), "2026-06-10")

        with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False) as tmp:
            tmp.write("hello")
            tmp_path = tmp.name
        try:
            self.assertRegex(create_content._source_last_modified_date(tmp_path), r"^\d{4}-\d{2}-\d{2}$")
        finally:
            try:
                import os

                os.remove(tmp_path)
            except OSError:
                pass

    def test_tag_normalization_uses_ontology_labels(self) -> None:
        self.assertEqual(
            create_content._normalize_tags("ml, Data mining, machine learning, System Design", lang="en"),
            "Machine Learning, Data Mining, System Design",
        )

    def test_tag_normalization_uses_locale_labels(self) -> None:
        self.assertEqual(
            create_content._normalize_tags("ML, Data mining, Artificial Intelligence", lang="zh-Hant"),
            "機器學習, 資料探勘, 人工智慧",
        )

    def test_extract_tag_concepts_preserves_order(self) -> None:
        self.assertEqual(
            create_content._extract_tag_concepts("ML, System Design, Data mining", lang="zh-Hant"),
            ["concept.machine_learning", "concept.system_design", "concept.data_mining"],
        )

    def test_extract_leading_markdown_title(self) -> None:
        self.assertEqual(create_content._extract_leading_markdown_title("\n# Hello World\n\nBody"), "Hello World")
        self.assertEqual(create_content._extract_leading_markdown_title("\n\nNot a title\n# Later"), "")

    def test_nested_unordered_list_keeps_hierarchy(self) -> None:
        style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
        rendered, _ = create_content._markdown_to_html(
            "* Parent\n    * Child\n        * Grandchild\n* Sibling\n",
            style=style,
            doc_title="Nested List",
            anchors={},
            toc_overrides=[],
            qaprompt={},
            allow_raw_html=False,
        )
        self.assertIn("<ul class=\"note-list\">", rendered)
        self.assertGreaterEqual(rendered.count("<ul class=\"note-list\">"), 3)
        self.assertIn("Grandchild", rendered)

    def test_information_concept_renders_placeholder_tooltip(self) -> None:
        style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
        rendered, _ = create_content._markdown_to_html(
            '<information concept="concept.supervised_learning">Supervised Learning</information>\n',
            style=style,
            doc_title="Info Concept",
            anchors={},
            toc_overrides=[],
            qaprompt={},
            allow_raw_html=False,
            source_meta={"lang": "en"},
        )
        self.assertIn('data-information-concept="concept.supervised_learning"', rendered)
        self.assertIn('data-information-lang="en"', rendered)
        self.assertIn(">Supervised Learning<", rendered)
        self.assertIn('class="note-information-tooltip" aria-hidden="true"></span>', rendered)
        self.assertNotIn("Machine learning task", rendered)

    def test_information_self_closing_uses_localized_label(self) -> None:
        style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
        rendered, _ = create_content._markdown_to_html(
            '<information concept="concept.clustering"/>\n',
            style=style,
            doc_title="Info Label",
            anchors={},
            toc_overrides=[],
            qaprompt={},
            allow_raw_html=False,
            source_meta={"lang": "zh-Hant"},
        )
        self.assertIn("分群", rendered)
        self.assertIn('data-information-concept="concept.clustering"', rendered)

    def test_simple_ordered_list_does_not_wrap_whole_item_in_strong(self) -> None:
        style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
        rendered, _ = create_content._markdown_to_html(
            "1. **The Intuitive Reason:** Example body.\n2. **The Pragmatic Reason:** Another body.\n",
            style=style,
            doc_title="Ordered List",
            anchors={},
            toc_overrides=[],
            qaprompt={},
            allow_raw_html=False,
        )
        self.assertIn("<ol class=\"mb-3\">", rendered)
        self.assertIn("<li><strong>The Intuitive Reason:</strong> Example body.</li>", rendered)
        self.assertNotIn("<strong>The Intuitive Reason:</strong> Example body.</strong>", rendered)
        self.assertNotIn("<br>", rendered)

    def test_complex_ordered_list_keeps_title_and_continuation_structure(self) -> None:
        style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
        rendered, _ = create_content._markdown_to_html(
            "1. Title\n    Continuation paragraph.\n2. Another title\n    Another paragraph.\n",
            style=style,
            doc_title="Complex Ordered List",
            anchors={},
            toc_overrides=[],
            qaprompt={},
            allow_raw_html=False,
        )
        self.assertIn("<strong>Title</strong><br>", rendered)
        self.assertIn("Continuation paragraph.", rendered)
        self.assertIn("<strong>Another title</strong><br>", rendered)


if __name__ == "__main__":
    unittest.main()
