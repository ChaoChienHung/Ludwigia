"""Keep published article plans consistent with the authoring style guide."""

from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class PublishedDraftScaffoldTests(unittest.TestCase):
    def test_explicitly_published_sources_have_a_readable_draft(self):
        for section in ("notes", "writing", "canvas"):
            for path in (ROOT / section).rglob("*.md"):
                source = path.read_text(encoding="utf-8")
                meta = re.search(r"<meta>(.*?)</meta>", source, re.S | re.I)
                if not meta or not re.search(
                    r"^Status:\s*published\s*$", meta.group(1), re.M | re.I
                ):
                    continue
                with self.subTest(source=str(path.relative_to(ROOT))):
                    draft = re.search(r"<draft>\n(.*?)\n</draft>", source, re.S | re.I)
                    self.assertIsNotNone(draft)
                    if draft is None:
                        continue
                    lines = draft.group(1).splitlines()
                    self.assertGreaterEqual(len(lines), 5)
                    for offset, name in enumerate(("TLDR", "NarrativeArc", "Scope")):
                        self.assertRegex(lines[offset], rf"^- {name}：\S")
                    self.assertNotRegex(draft.group(1), r"(?im)^-?\s*(MainFlow|OutOfScope)\s*[:：]")
                    first_section = 3
                    if lines[first_section].startswith("- FollowUps："):
                        first_section += 1
                    self.assertEqual(lines[first_section], "")
                    sections = [line for line in lines[first_section + 1:] if line.startswith("- ")]
                    self.assertGreaterEqual(len(sections), 2)
                    for before, after in zip(lines, lines[1:]):
                        if after.startswith("- ") and re.match(r"^ {4,}[-*+0-9]", before):
                            self.fail("Nested bullets need a blank line before the next section")


if __name__ == "__main__":
    unittest.main()
