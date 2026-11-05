"""Offline, network-free contract checks for the public adversarial review."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts import angriffsschwarm as a


class AdversarialContractTest(unittest.TestCase):
    def test_public_targets_and_scope(self):
        cases = a.cases()
        self.assertEqual(len(cases), 15)
        self.assertEqual(len({c["id"] for c in cases}), len(cases))
        for case in cases:
            self.assertTrue(case["excerpt"].startswith("## "))
            self.assertLessEqual(len(case["excerpt"]), 3600)
            self.assertTrue(case["source"].startswith("docs/"))
        self.assertRaises(ValueError, a.source_text, "../../.git/config")
        self.assertRaises(ValueError, a.source_text, ".github/workflows/pages.yml")

    def test_without_key_does_not_touch_existing_archive(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "angriffe.json"
            output.write_text('{"items":[{"id":"keep"}]}', encoding="utf-8")
            with patch.object(a, "API_KEY", ""), patch.object(a, "OUTPUT", output):
                self.assertEqual(a.main(), 0)
            self.assertEqual(output.read_text(encoding="utf-8"),
                             '{"items":[{"id":"keep"}]}')

    def test_roles_produce_unverified_record_only(self):
        responses = {
            "adversary": {
                "steelman": "Faire Lesart",
                "objection": "Denkbarer Gegenfall",
                "counterexample": "hypothetisch",
                "test": "Unabhängige Prüfung",
                "uncertainty": "ungeklärt",
            },
            "defender": {
                "response": "Erwiderung", "concessions": "Grenzen",
                "revision": "Eingrenzung",
            },
            "assessor": {
                "disposition": "needs_evidence",
                "reason": "Keine Primärquelle gelesen",
                "unresolved": "Evidenzlage",
                "next_check": "Quellen prüfen",
            },
        }
        calls = []

        def fake_call(role, payload):
            calls.append(role)
            return responses[role]

        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "angriffe.json"
            output.write_text('{"items":[]}', encoding="utf-8")
            with patch.object(a, "API_KEY", "offline-test-key"), \
                 patch.object(a, "OUTPUT", output), \
                 patch.object(a, "api_call", side_effect=fake_call):
                self.assertEqual(a.main(), 0)
            obj = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(calls, ["adversary", "defender", "assessor"])
            self.assertEqual(obj["review_status"], "unverified_ai_draft")
            self.assertEqual(len(obj["items"]), 1)
            row = obj["items"][0]
            self.assertEqual(row["review_status"], "unverified_ai_draft")
            self.assertEqual(row["assessor"]["disposition"], "needs_evidence")
            self.assertNotIn("validated", row)
            self.assertIn("same_model", row["independence"])


if __name__ == "__main__":
    unittest.main()
