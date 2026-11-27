from pathlib import Path
import unittest


REPO_ROOT = Path(__file__).resolve().parents[1]
HANDOFF = REPO_ROOT / "HANDOFF.md"
ROOT_AGENTS = REPO_ROOT / "AGENTS.md"
HANDOFF_MAX_BYTES = 6 * 1024
AGENTS_MAX_BYTES = 12 * 1024


class TestHandoff(unittest.TestCase):
    def test_handoff_stays_small(self):
        content = HANDOFF.read_bytes()
        self.assertLessEqual(len(content), HANDOFF_MAX_BYTES, "HANDOFF.md must stay within 6 KiB")

    def test_root_agents_stays_small(self):
        content = ROOT_AGENTS.read_bytes()
        self.assertLessEqual(
            len(content),
            AGENTS_MAX_BYTES,
            "Root AGENTS.md must stay within 12 KiB; delegate subsystem rules to nested AGENTS.md or docs/rules/",
        )


if __name__ == "__main__":
    unittest.main()
