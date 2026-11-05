"""Offline contract checks for the provenance-first research feed."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts import wahrheitsschwarm as w


class ResearchContractTest(unittest.TestCase):
    def test_clean_removes_html(self):
        self.assertEqual(w.clean("Study <b>of</b> &amp; reality"), "Study of & reality")

    def test_date_prefers_online(self):
        self.assertEqual(w.pub_date({"published-online":{"date-parts":[[2026,11,5]]}}),
                         "2026-11-05")

    def test_crossref_metadata_is_never_marked_verified(self):
        payload = {"message":{"items":[
            {"DOI":"10.1234/ABC", "title":["A controlled investigation of attachment"],
             "author":[{"given":"A","family":"Researcher"}],
             "container-title":["Journal of Inquiry"],
             "published":{"date-parts":[[2026,11,1]]}},
            {"DOI":"not-a-doi", "title":["A fake invalid metadata record"]},
        ]}}
        with patch.object(w, "get_json", return_value=payload):
            results = w.discover("liebe", "attachment")
        self.assertEqual(len(results), 1)
        row = results[0]
        self.assertEqual(row["url"], "https://doi.org/10.1234/abc")
        self.assertEqual(row["status"], "unreviewed")
        self.assertEqual(row["source_examined"], "metadata_only")
        self.assertEqual(row["agent_notes"], {})
        self.assertNotIn("findings", row)

    def test_old_data_loaded_without_network(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            target.write_text(json.dumps({"items":[{"id":"10.1000/test"}]}), encoding="utf-8")
            with patch.object(w, "OUT", target):
                self.assertEqual(w.load_old()["items"][0]["id"], "10.1000/test")


if __name__ == "__main__":
    unittest.main()
