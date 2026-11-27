"""Local archive transaction checks; no paid requests or real network."""
from contextlib import nullcontext, redirect_stdout
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts import angriffsschwarm as a


class ArchiveTransactionTest(unittest.TestCase):
    def run_case(self, fault=None, mode=0o640):
        original = b'{"items":[{"id":"keep","generated_at":"2020-01-01"}]}\n'
        original_open = io.open

        class FailingOutput:
            def __init__(self, handle):
                self.handle = handle
            def __getattr__(self, name):
                return getattr(self.handle, name)
            def __enter__(self):
                return self
            def __exit__(self, *args):
                result = self.handle.__exit__(*args)
                if fault == "close":
                    raise OSError("Synthetic close failure")
                return result
            def write(self, text):
                if fault == "partial":
                    self.handle.write(text[:17])
                    self.handle.flush()
                    raise OSError("Synthetic partial write failure")
                return self.handle.write(text)

        def opened(file, open_mode="r", *args, **kwargs):
            if any(flag in open_mode for flag in "wax+"):
                if fault == "open":
                    raise OSError("Synthetic open failure")
                return FailingOutput(original_open(file, open_mode, *args, **kwargs))
            return original_open(file, open_mode, *args, **kwargs)

        claim = {"id": "synthetic", "source": "docs/methode.md", "heading": "Synthetic",
                 "excerpt": "Synthetic public text", "source_commit": "a" * 40}
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "archive.json"
            target.write_bytes(original)
            target.chmod(mode)
            replace_failure = patch.object(a.os, "replace", side_effect=OSError("Synthetic replace failure")) if fault == "replace" else nullcontext()
            chmod_failure = patch.object(Path, "chmod", side_effect=OSError("Synthetic chmod failure")) if fault == "chmod" else nullcontext()
            with patch.object(a, "OUTPUT", target), patch.object(a, "AI_ENABLED", True), \
                 patch.object(a, "API_KEY", "synthetic-not-a-key"), patch.object(a, "cases", return_value=[claim]), \
                 patch.object(a, "api_call", return_value={"unverified": "synthetic"}) as role, \
                 patch.object(a, "open_response") as network, \
                 patch.object(io, "open", opened), replace_failure, chmod_failure, redirect_stdout(io.StringIO()):
                if fault:
                    with self.assertRaises(OSError):
                        a.main()
                else:
                    self.assertEqual(a.main(), 0)
                self.assertEqual(role.call_count, 3)
                network.assert_not_called()
            self.assertEqual(target.stat().st_mode & 0o777, mode)
            self.assertEqual(list(Path(tmp).iterdir()), [target])
            if fault:
                self.assertEqual(target.read_bytes(), original)
            else:
                data = json.loads(target.read_text(encoding="utf-8"))
                self.assertEqual(data["review_status"], "unverified_ai_draft")
                self.assertEqual({row["id"] for row in data["items"]}, {"synthetic", "keep"})

    def test_partial_write_preserves_original(self):
        self.run_case("partial")

    def test_close_failure_preserves_original(self):
        self.run_case("close")

    def test_open_failure_preserves_original(self):
        self.run_case("open")

    def test_replace_failure_preserves_original(self):
        self.run_case("replace")

    def test_mode_failure_preserves_original(self):
        self.run_case("chmod")

    def test_success_keeps_records_and_permissions(self):
        for mode in (0o640, 0o644):
            with self.subTest(mode=oct(mode)):
                self.run_case(mode=mode)
