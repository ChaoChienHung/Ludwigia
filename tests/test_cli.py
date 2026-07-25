import io
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import cli


class CliTests(unittest.TestCase):
    def test_build_tag_ontology_report_detects_missing_tags_and_incomplete_labels(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp)
            source = repo / "notes" / "demo.md"
            source.parent.mkdir(parents=True, exist_ok=True)
            source.write_text("placeholder", encoding="utf-8")

            def fake_extract_tag_concepts(raw, lang="en"):
                _ = lang
                return ["concept.foo"] if raw == "Foo" else [""]

            with (
                patch.object(cli, "_repo_dir", return_value=str(repo)),
                patch.object(cli, "_iter_content_sources", return_value=[str(source)]),
                patch.object(cli.content_contract, "extract_source_meta", return_value=({"tags": "Foo, Bar"}, "")),
                patch.object(
                    cli.content_contract,
                    "extract_tag_concepts",
                    side_effect=fake_extract_tag_concepts,
                ),
                patch.object(
                    cli.content_contract,
                    "load_tag_ontology",
                    return_value={
                        "concepts": [
                            {
                                "concept_id": "concept.foo",
                                "labels": {
                                    "en": "Foo",
                                    "zh-Hant": "富",
                                },
                            }
                        ]
                    },
                ),
            ):
                report = cli._build_tag_ontology_report("all")

        self.assertEqual(report["source_count"], 1)
        self.assertEqual(report["missing_tags"], [("notes/demo.md", "Bar")])
        self.assertEqual(report["incomplete_concepts"], [("concept.foo", ["zh-Hans"])])

    def test_cmd_check_tags_prints_ok_when_report_is_clean(self) -> None:
        with patch.object(
            cli,
            "_build_tag_ontology_report",
            return_value={"source_count": 3, "missing_tags": [], "incomplete_concepts": []},
        ):
            buf = io.StringIO()
            with redirect_stdout(buf):
                cli.cmd_check_tags(SimpleNamespace(content_dir="all"))
        self.assertIn("OK: ontology covers all source tags", buf.getvalue())

    def test_cmd_check_tags_exits_nonzero_when_report_has_gaps(self) -> None:
        with patch.object(
            cli,
            "_build_tag_ontology_report",
            return_value={
                "source_count": 1,
                "missing_tags": [("notes/demo.md", "Bar")],
                "incomplete_concepts": [("concept.foo", ["zh-Hans"])],
            },
        ):
            buf = io.StringIO()
            with redirect_stdout(buf):
                with self.assertRaises(SystemExit) as exc:
                    cli.cmd_check_tags(SimpleNamespace(content_dir="all"))
        self.assertEqual(exc.exception.code, 1)
        output = buf.getvalue()
        self.assertIn("Missing ontology mappings:", output)
        self.assertIn("Incomplete ontology labels:", output)

    def test_cmd_test_runs_check_tags_after_existing_checks(self) -> None:
        calls = []

        def fake_run(argv):
            calls.append(tuple(argv))

        with patch.object(cli, "_run", side_effect=fake_run), patch.object(cli, "cmd_check_tags") as mock_check:
            cli.cmd_test(SimpleNamespace())

        self.assertEqual(
            calls,
            [
                (cli.sys.executable, "tools/create_content.py", "--self-test"),
                (cli.sys.executable, "-m", "unittest"),
                (cli.sys.executable, "-m", "py_compile", "search/indexer.py"),
            ],
        )
        mock_check.assert_called_once()
        args = mock_check.call_args.args[0]
        self.assertEqual(args.content_dir, "all")

    def test_cmd_scan_information_prints_sections(self) -> None:
        fake_report = {
            "source_path": "/repo/writing/demo.md",
            "lang": "zh-Hant",
            "matched_terms": [
                {
                    "line": 12,
                    "matched_text": "監督式學習",
                    "concept_id": "concept.supervised_learning",
                    "annotated": False,
                },
                {
                    "line": 20,
                    "matched_text": "反向工程",
                    "concept_id": "concept.reverse_engineering",
                    "annotated": True,
                },
            ],
            "annotated_terms": [
                {
                    "line": 20,
                    "matched_text": "反向工程",
                    "concept_id": "concept.reverse_engineering",
                }
            ],
            "candidate_terms": [
                {
                    "line": 12,
                    "matched_text": "監督式學習",
                    "concept_id": "concept.supervised_learning",
                }
            ],
        }

        with (
            patch.object(cli, "_repo_dir", return_value="/repo"),
            patch.object(cli, "_abs_path", return_value="/repo/writing/demo.md"),
            patch.object(cli.information_ontology, "scan_information_candidates", return_value=fake_report),
        ):
            buf = io.StringIO()
            with redirect_stdout(buf):
                cli.cmd_scan_information(SimpleNamespace(source="writing/demo.md"))

        output = buf.getvalue()
        self.assertIn("Scanned: writing/demo.md (zh-Hant)", output)
        self.assertIn("Matched ontology terms:", output)
        self.assertIn("Already annotated with <information>:", output)
        self.assertIn("First-occurrence candidates:", output)
        self.assertIn("監督式學習 [concept.supervised_learning] (candidate)", output)
        self.assertIn("反向工程 [concept.reverse_engineering] (annotated)", output)

    def test_cmd_scan_information_supports_json_output(self) -> None:
        fake_report = {
            "source_path": "/repo/writing/demo.md",
            "lang": "zh-Hant",
            "matched_terms": [],
            "annotated_terms": [],
            "candidate_terms": [],
        }

        with (
            patch.object(cli, "_repo_dir", return_value="/repo"),
            patch.object(cli, "_abs_path", return_value="/repo/writing/demo.md"),
            patch.object(cli.information_ontology, "scan_information_candidates", return_value=fake_report),
        ):
            buf = io.StringIO()
            with redirect_stdout(buf):
                cli.cmd_scan_information(SimpleNamespace(source="writing/demo.md", json=True))

        output = buf.getvalue()
        self.assertIn('"source_path": "/repo/writing/demo.md"', output)
        self.assertIn('"lang": "zh-Hant"', output)


if __name__ == "__main__":
    unittest.main()
