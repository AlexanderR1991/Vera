"""Offline contract checks for the provenance-first research feed."""
import json
from pathlib import Path
import tempfile
import unittest
import urllib.error
import urllib.parse
import xml.etree.ElementTree as ET
from unittest.mock import patch

from scripts import wahrheitsschwarm as w

ARXIV_FEED = '''<feed xmlns="http://www.w3.org/2005/Atom" xmlns:arxiv="http://arxiv.org/schemas/atom">
<entry><id>http://arxiv.org/abs/2611.01234v2</id><title>Computational creativity and interpretation</title>
<published>2026-11-01T12:00:00Z</published><author><name>A Researcher</name></author>
<arxiv:doi>10.1234/ABC</arxiv:doi><summary>This abstract must not become a claimed finding.</summary></entry>
</feed>'''


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

    def test_arxiv_preserves_exact_version_and_unreviewed_provenance(self):
        rows = w.parse_arxiv(ARXIV_FEED, "kunst")
        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row["id"], "arxiv:2611.01234v2")
        self.assertEqual(row["url"], "https://arxiv.org/abs/2611.01234v2")
        self.assertEqual(row["related_doi"], "10.1234/abc")
        self.assertEqual(row["peer_review"], "not_verified")
        self.assertEqual(row["status"], "unreviewed")
        self.assertEqual(row["source_examined"], "metadata_only")
        self.assertNotIn("findings", row)
        self.assertNotIn("summary", row)
        legacy = ARXIV_FEED.replace("2611.01234v2", "cs/9901001v1")
        self.assertEqual(w.parse_arxiv(legacy, "ki")[0]["id"], "arxiv:cs/9901001v1")

    def test_arxiv_rejects_unsafe_or_unversioned_links(self):
        for unsafe in ["https://arxiv.org.evil.test/abs/2611.01234v2",
                       "https://user@arxiv.org/abs/2611.01234v2",
                       "https://arxiv.org/abs/2611.01234",
                       "https://arxiv.org/abs/2611.01234v2?redirect=bad",
                       "javascript:alert(1)"]:
            with self.subTest(unsafe=unsafe):
                feed = ARXIV_FEED.replace("http://arxiv.org/abs/2611.01234v2", unsafe)
                self.assertEqual(w.parse_arxiv(feed, "kunst"), [])

    def test_arxiv_error_feed_and_malformed_xml_fail(self):
        with self.assertRaises(ValueError):
            w.parse_arxiv(ARXIV_FEED.replace("/abs/2611.01234v2", "/api/errors#bad_query"), "kunst")
        with self.assertRaises(ValueError):
            w.parse_arxiv("<html>Not a feed</html>", "kunst")
        with self.assertRaises(ET.ParseError):
            w.parse_arxiv("<feed>", "kunst")

    def test_arxiv_request_is_bounded_and_uses_date_filter(self):
        with patch.object(w.urllib.request, "urlopen") as urlopen:
            urlopen.return_value.__enter__.return_value.read.return_value = ARXIV_FEED.encode()
            rows = w.discover_arxiv("kunst", 'all:"computational creativity"')
            req = urlopen.call_args.args[0]
            params = urllib.parse.parse_qs(urllib.parse.urlsplit(req.full_url).query)
            self.assertEqual(params["max_results"], ["5"])
            self.assertIn("submittedDate:[", params["search_query"][0])
            self.assertEqual(len(rows), 1)

    def test_partial_source_failure_preserves_old_records_and_notes(self):
        for failed_source in ["Crossref", "arXiv"]:
            with self.subTest(failed_source=failed_source), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old = {"id":"10.1000/test", "date":"2026-10-30", "agent_notes":{"skeptic":{"test":"Keep me"}}}
                target.write_text(json.dumps({"items":[old]}), encoding="utf-8")
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w.time, "sleep") as sleep, \
                     patch.object(w, "discover") as crossref, patch.object(w, "discover_arxiv") as arxiv:
                    if failed_source == "Crossref":
                        crossref.side_effect = urllib.error.URLError("unavailable")
                        arxiv.side_effect = lambda topic, query: w.parse_arxiv(ARXIV_FEED, topic)
                    else:
                        crossref.return_value = [old]
                        arxiv.side_effect = ET.ParseError("malformed")
                    w.main()
                    result = json.loads(target.read_text())
                    self.assertIn(old, result["items"])
                    self.assertEqual(result["source_queries"][failed_source], 0)
                    self.assertTrue(result["errors"])
                    self.assertEqual(sum(c.args == (3.1,) for c in sleep.call_args_list), len(w.ARXIV_QUERIES))
                    ids = [p["id"] for p in result["items"]]
                    self.assertEqual(len(ids), len(set(ids)))

    def test_total_source_failure_keeps_file_unchanged(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            original = '{"items":[{"id":"10.1000/retained"}]}\n'
            target.write_text(original, encoding="utf-8")
            with patch.object(w, "OUT", target), patch.object(w.time, "sleep"), \
                 patch.object(w, "discover", side_effect=urllib.error.URLError("offline")), \
                 patch.object(w, "discover_arxiv", side_effect=ET.ParseError("malformed")):
                with self.assertRaises(SystemExit):
                    w.main()
            self.assertEqual(target.read_text(), original)


if __name__ == "__main__":
    unittest.main()
