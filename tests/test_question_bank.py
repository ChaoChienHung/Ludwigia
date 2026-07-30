import json
import os
import tempfile
import unittest

from tools import create_content, question_bank


class QuestionBankTests(unittest.TestCase):
    def _repo_path(self, *parts: str) -> str:
        return os.path.join(create_content._resolve_repo_dir(), *parts)

    def _write_sample_note_dir(self, root_dir: str) -> tuple[str, str]:
        note_dir = os.path.join(root_dir, "notes", "sample-note")
        os.makedirs(note_dir, exist_ok=True)

        note_path = os.path.join(note_dir, "sample-note-en.md")
        bank_path = os.path.join(note_dir, "questions.en.json")

        note_source = (
            "<meta>\n"
            "Title: Sample Note\n"
            "CanonicalId: sample-note\n"
            "Tags: Machine Learning, Data Mining\n"
            "Summary: Sample summary\n"
            "Slug: sample-note-en\n"
            "Output: notes/sample-note/sample-note-en.html\n"
            "Style: default\n"
            "Lang: en\n"
            "</meta>\n"
            "\n"
            "# Sample Note\n"
            "\n"
            "<qquiz src=\"questions.en.json\" ids=\"sample-quiz\" title=\"Bank Quiz\"/>\n"
        )
        bank_payload = {
            "questions": [
                {
                    "question_id": "sample-quiz",
                    "lang": "en",
                    "question_type": "mcq",
                    "prompt": "What does the sample quiz verify?",
                    "choices": [
                        {"id": "A", "text": "External question bank rendering", "response": "Correct."},
                        {"id": "B", "text": "Only inline qquiz parsing", "response": "Incorrect."},
                    ],
                    "answer": "A",
                    "explanation": "The sample focuses on external question bank rendering.",
                    "difficulty": "beginner",
                    "question_focus": "concept_understanding",
                    "tag_concepts": ["concept.machine_learning"],
                    "review_status": "reviewed",
                    "last_review_date": "2026-06-14",
                }
            ]
        }

        with open(note_path, "w", encoding="utf-8") as handle:
            handle.write(note_source)
        with open(bank_path, "w", encoding="utf-8") as handle:
            json.dump(bank_payload, handle, ensure_ascii=False, indent=2)

        return note_path, bank_path

    def test_load_questions_for_note_and_collect_entries(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            note_path, _ = self._write_sample_note_dir(tmpdir)
            with open(note_path, "r", encoding="utf-8") as handle:
                note_source = handle.read()
            meta, _ = create_content._extract_source_meta(note_source)

            loaded = question_bank.load_questions_for_note(note_path, meta, "questions.en.json")
            self.assertEqual(len(loaded), 1)
            self.assertEqual(loaded[0]["canonical_id"], "sample-note")
            self.assertEqual(loaded[0]["global_question_id"], "sample-note::sample-quiz")
            self.assertEqual(loaded[0]["question_focus"], "concept_understanding")

            collected = question_bank.collect_question_bank_entries(os.path.join(tmpdir, "notes"))
            self.assertEqual(len(collected), 1)
            self.assertEqual(collected[0]["question_id"], "sample-quiz")
            self.assertEqual(collected[0]["tag_concepts"], ["concept.machine_learning"])
            self.assertEqual(collected[0]["question_focus"], "concept_understanding")

    def test_markdown_to_html_renders_external_question_bank_quiz(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            note_path, _ = self._write_sample_note_dir(tmpdir)
            with open(note_path, "r", encoding="utf-8") as handle:
                note_source = handle.read()
            meta, body = create_content._extract_source_meta(note_source)

            style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
            rendered, _ = create_content._markdown_to_html(
                body,
                style=style,
                doc_title=meta.get("title", ""),
                anchors={},
                toc_overrides=[],
                qaprompt={},
                allow_raw_html=False,
                source_path=note_path,
                source_meta=meta,
            )
            self.assertIn("Bank Quiz", rendered)
            self.assertIn("What does the sample quiz verify?", rendered)
            self.assertIn("note-quiz-option", rendered)

    def test_repo_external_question_bank_notes_render(self) -> None:
        style, _, _ = create_content._load_style(create_content._resolve_repo_dir(), "default")
        note_paths = [
            self._repo_path(
                "notes",
                "brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods",
                "brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods-en.md",
            ),
            self._repo_path(
                "notes",
                "understanding-data-for-data-mining",
                "understanding-data-for-data-mining-en.md",
            ),
            self._repo_path(
                "notes",
                "from-raw-data-to-knowledge-a-practical-introduction-to-data-mining",
                "from-raw-data-to-knowledge-a-practical-introduction-to-data-mining-en.md",
            ),
            self._repo_path(
                "notes",
                "discovering-hidden-structures-what-clustering-really-does",
                "discovering-hidden-structures-what-clustering-really-does-en.md",
            ),
        ]

        for note_path in note_paths:
            with self.subTest(note_path=note_path):
                with open(note_path, "r", encoding="utf-8") as handle:
                    note_source = handle.read()
                meta, body = create_content._extract_source_meta(note_source)
                rendered, _ = create_content._markdown_to_html(
                    body,
                    style=style,
                    doc_title=meta.get("title", ""),
                    anchors={},
                    toc_overrides=[],
                    qaprompt={},
                    allow_raw_html=False,
                    source_path=note_path,
                    source_meta=meta,
                )
                self.assertIn("note-quiz-option", rendered)

    def test_question_focus_is_required(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            note_path, bank_path = self._write_sample_note_dir(tmpdir)
            with open(note_path, "r", encoding="utf-8") as handle:
                note_source = handle.read()
            meta, _ = create_content._extract_source_meta(note_source)
            with open(bank_path, "r", encoding="utf-8") as handle:
                payload = json.load(handle)

            payload["questions"][0].pop("question_focus", None)
            with open(bank_path, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=2)

            with self.assertRaisesRegex(ValueError, "question_focus"):
                question_bank.load_questions_for_note(note_path, meta, "questions.en.json")


if __name__ == "__main__":
    unittest.main()
