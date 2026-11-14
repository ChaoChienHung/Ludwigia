import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REALMS_DIR = ROOT / "portals" / "realms"


class MiscRealmsRegistryTests(unittest.TestCase):
    """Verify registry and fundamental structure of all realms under portals/realms/."""

    def test_realms_directory_structure(self):
        self.assertTrue(REALMS_DIR.is_dir(), f"{REALMS_DIR} must exist")
        realms = [d for d in REALMS_DIR.iterdir() if d.is_dir()]
        self.assertGreaterEqual(len(realms), 1, "There should be at least one realm registered")
        for realm in realms:
            index_file = realm / "index.html"
            self.assertTrue(index_file.exists(), f"Realm '{realm.name}' must have an index.html entry point")


def _load_realm_module_tests(test_file: Path) -> unittest.TestSuite:
    module_name = f"realm_test_{test_file.parent.parent.name}_{test_file.stem}"
    spec = importlib.util.spec_from_file_location(module_name, str(test_file))
    if spec is None or spec.loader is None:
        return unittest.TestSuite()
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return unittest.defaultTestLoader.loadTestsFromModule(mod)


def load_tests(loader, tests, pattern):
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(MiscRealmsRegistryTests))

    if REALMS_DIR.exists():
        for realm_dir in sorted(REALMS_DIR.iterdir()):
            if not realm_dir.is_dir():
                continue
            realm_tests_dir = realm_dir / "tests"
            if realm_tests_dir.is_dir():
                for test_file in sorted(realm_tests_dir.glob("test_*.py")):
                    suite.addTests(_load_realm_module_tests(test_file))
    return suite


if __name__ == "__main__":
    unittest.main()
