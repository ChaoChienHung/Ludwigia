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
                    outline = [line for line in lines[first_section + 1:] if line.strip()]
                    for line in outline:
                        item = re.match(r"^( *)(- |[1-9]\d*\. )", line)
                        self.assertIsNotNone(item)
                        if item is None:
                            continue
                        depth = len(item.group(1))
                        self.assertEqual(depth % 4, 0)
                        self.assertNotRegex(line, r"^\s*- (?:-|\d+\.) ")
                    sections = [line for line in outline if re.match(r"^(?:- |[1-9]\d*\. )", line)]
                    self.assertGreaterEqual(len(sections), 2)
                    appendix = bool(re.match(r"^- (?:References|參考文獻)｜", sections[-1]))
                    narrative = sections[:-1] if appendix else sections
                    for section_line in sections:
                        self.assertRegex(section_line, r"^- (?!\d+\. ).+｜.+：.+")
                    markers = []
                    for line in lines[first_section + 1:]:
                        if line.startswith("- "):
                            markers.append([])
                        elif markers and line.startswith("    - "):
                            markers[-1].append(line[6:].split("：", 1)[0])
                    opening, previous, next_step, closing = (
                        ("Opening", "BuildsOn", "Next", "Closing")
                        if path.name.endswith("-en.md")
                        else ("開頭", "承先", "啟後", "結尾")
                    )
                    for index, section_line in enumerate(narrative):
                        section_markers = markers[index]
                        self.assertIn(opening if index == 0 else previous, section_markers)
                        self.assertIn(closing if index == len(narrative) - 1 else next_step, section_markers)
                    for before, after in zip(lines, lines[1:]):
                        if re.match(r"^(?:- |[1-9]\d*\. )", after) and re.match(r"^ {4,}(?:- |[1-9]\d*\. )", before):
                            self.fail("Nested bullets need a blank line before the next section")


if __name__ == "__main__":
    unittest.main()
