from pathlib import Path
import unittest


HANDOFF = Path(__file__).resolve().parents[1] / "HANDOFF.md"
MAX_BYTES = 6 * 1024


class TestHandoff(unittest.TestCase):
    def test_handoff_stays_small(self):
        content = HANDOFF.read_bytes()
        self.assertLessEqual(len(content), MAX_BYTES, "HANDOFF.md must stay within 6 KiB")


if __name__ == "__main__":
    unittest.main()
