"""Offline contract checks for the provenance-first research feed."""
import datetime as dt
import http.client
import json
import io
from contextlib import nullcontext
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
    def setUp(self):
        self.addCleanup(patch.stopall)
        patch.object(w, "NOW", dt.datetime(2026, 11, 5, tzinfo=dt.timezone.utc)).start()

    def test_stored_key_without_opt_in_only_discovers(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            row = {"id": "10.1234/test", "title": "A fictional candidate for testing",
                   "date": "2026-11-01", "agent_notes": {}}
            with patch.object(w, "OUT", target), \
                 patch.object(w, "API_KEY", "offline-test-key"), \
                 patch.object(w, "AI_ENABLED", False), \
                 patch.object(w.time, "sleep"), \
                 patch.object(w, "discover", return_value=[row]), \
                 patch.object(w, "discover_arxiv", return_value=[]), \
                 patch.object(w.urllib.request, "urlopen") as request:
                w.main()
                with self.assertRaises(RuntimeError):
                    w.call_agent("skeptic", row)
                request.assert_not_called()
            data = json.loads(target.read_text())
            self.assertFalse(data["agents_enabled"])
            self.assertEqual(data["items"], [row])

    def test_each_request_caps_generated_tokens(self):
        answer = {"question": "What was measured?", "limitation": "Metadata only"}
        response = {"choices": [{"finish_reason": "stop", "message": {"content": json.dumps(answer)}}]}
        with patch.object(w, "API_KEY", "offline-test-key"), \
             patch.object(w, "AI_ENABLED", True), \
             patch.object(w.urllib.request, "urlopen") as request:
            request.return_value.__enter__.return_value = io.StringIO(json.dumps(response))
            self.assertEqual(w.call_agent("methodologist", {}), answer)
            body = json.loads(request.call_args.args[0].data)
            self.assertEqual(body["max_completion_tokens"], 800)
            self.assertEqual(request.call_count, 1)

    def test_clean_removes_html(self):
        self.assertEqual(w.clean("Study <b>of</b> &amp; reality"), "Study of & reality")

    def _check_crossref_response_bytes(self, payload, rejected=False):
        reads = []
        class Response(io.BytesIO):
            def read(self, size=-1):
                reads.append(size)
                return super().read(size)
        with patch.object(w.urllib.request, "urlopen", return_value=Response(payload)), \
             patch.object(w.json, "loads", wraps=json.loads) as parse:
            if rejected:
                with self.assertRaisesRegex(ValueError, "Crossref response exceeds"):
                    w.get_json("https://api.crossref.org/works?rows=5")
                parse.assert_not_called()
            else:
                result = w.get_json("https://api.crossref.org/works?rows=5")
                self.assertEqual(result["message"]["items"], [])
                parse.assert_called_once_with(payload)
        self.assertEqual(reads, [1_000_001])

    def test_crossref_small_response_remains_parseable(self):
        self._check_crossref_response_bytes(b'{"message":{"items":[]}}')

    def test_crossref_exact_byte_limit_remains_parseable(self):
        payload = b'{"message":{"items":[]}}'
        self._check_crossref_response_bytes(payload + b' ' * (1_000_000 - len(payload)))

    def test_crossref_over_byte_limit_is_rejected_before_parsing(self):
        payload = b'{"message":{"items":[]}}'
        self._check_crossref_response_bytes(payload + b' ' * (1_000_001 - len(payload)), rejected=True)

    def test_crossref_limit_counts_utf8_bytes_not_characters(self):
        text = json.dumps({"message": {"items": []}, "ignored": "ä" * 500_000}, ensure_ascii=False)
        self.assertLess(len(text), 1_000_000)
        self.assertGreater(len(text.encode("utf-8")), 1_000_000)
        self._check_crossref_response_bytes(text.encode("utf-8"), rejected=True)

    def _check_oversized_crossref_in_main(self, arxiv_succeeds):
        payload = b'{"message":{"items":[]}}' + b' ' * 1_000_001
        old = {"id": "10.1000/retained", "title": "Synthetic retained candidate",
               "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
        def response(request, **kwargs):
            host = urllib.parse.urlsplit(request.full_url).hostname
            if host == "api.crossref.org":
                return io.BytesIO(payload)
            self.assertEqual(host, "export.arxiv.org")
            return io.BytesIO(ARXIV_FEED.encode() if arxiv_succeeds else b'<invalid>')
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            original = (json.dumps({"items": [old]}) + "\n").encode()
            target.write_bytes(original)
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                 patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                 patch.object(w, "TOPICS", {"synthetic": "query"}), \
                 patch.object(w, "ARXIV_QUERIES", {"kunst": "query"}), \
                 patch.object(w.urllib.request, "urlopen", side_effect=response) as transport, \
                 patch.object(w, "call_agent") as model:
                if arxiv_succeeds:
                    w.main()
                else:
                    with self.assertRaises(SystemExit):
                        w.main()
                self.assertEqual(transport.call_count, 2)
                model.assert_not_called()
            if arxiv_succeeds:
                data = json.loads(target.read_text())
                self.assertIn(old, data["items"])
                self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
                self.assertEqual(data["source_queries_succeeded"], 1)
                self.assertEqual(len(data["errors"]), 1)
                self.assertIn("Crossref response exceeds", data["errors"][0])
                self.assertIn("arxiv:2611.01234v2", [item["id"] for item in data["items"]])
            else:
                self.assertEqual(target.read_bytes(), original)

    def test_oversized_crossref_is_partial_failure_and_preserves_notes(self):
        self._check_oversized_crossref_in_main(arxiv_succeeds=True)

    def test_oversized_crossref_with_other_source_failure_keeps_file_unchanged(self):
        self._check_oversized_crossref_in_main(arxiv_succeeds=False)

    def _crossref_http_response(self, framing):
        body = b'{"message":{"items":[]}}'
        if framing in ("length", "incomplete_length"):
            length = len(body) + (10 if framing == "incomplete_length" else 0)
            wire = b'HTTP/1.1 200 OK\r\nContent-Length: ' + str(length).encode() + b'\r\n\r\n' + body
        else:
            complete = framing == "chunked"
            length = len(body) + (0 if complete else 10)
            wire = (b'HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n' +
                    f'{length:x}'.encode() + b'\r\n' + body + (b'\r\n0\r\n\r\n' if complete else b''))
        class FakeSocket:
            def makefile(self, mode):
                return io.BytesIO(wire)
        response = http.client.HTTPResponse(FakeSocket())
        response.begin()
        return response

    def test_complete_crossref_http_framing_remains_parseable(self):
        for framing in ("length", "chunked"):
            with self.subTest(framing=framing), \
                 patch.object(w.urllib.request, "urlopen", return_value=self._crossref_http_response(framing)):
                self.assertEqual(w.get_json("https://api.crossref.org/works?rows=5"), {"message": {"items": []}})

    def _check_incomplete_http_before_parser(self, framing):
        with patch.object(w.urllib.request, "urlopen", return_value=self._crossref_http_response(framing)), \
             patch.object(w.json, "loads") as parse:
            with self.assertRaisesRegex(ValueError, "Incomplete Crossref HTTP response"):
                w.get_json("https://api.crossref.org/works?rows=5")
            parse.assert_not_called()

    def test_incomplete_crossref_content_length_rejects_valid_json_prefix(self):
        self._check_incomplete_http_before_parser("incomplete_length")

    def test_incomplete_crossref_chunk_is_source_value_error(self):
        self._check_incomplete_http_before_parser("incomplete_chunked")

    def _check_incomplete_http_in_main(self, arxiv_succeeds):
        old = {"id": "10.1000/retained", "title": "Synthetic retained candidate",
               "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
        for framing in ("incomplete_length", "incomplete_chunked"):
            with self.subTest(framing=framing), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                original = (json.dumps({"items": [old]}) + "\n").encode()
                target.write_bytes(original)
                def response(request, **kwargs):
                    host = urllib.parse.urlsplit(request.full_url).hostname
                    if host == "api.crossref.org":
                        return self._crossref_http_response(framing)
                    self.assertEqual(host, "export.arxiv.org")
                    return io.BytesIO(ARXIV_FEED.encode() if arxiv_succeeds else b'<invalid>')
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                     patch.object(w, "TOPICS", {"synthetic": "query"}), \
                     patch.object(w, "ARXIV_QUERIES", {"kunst": "query"}), \
                     patch.object(w.urllib.request, "urlopen", side_effect=response) as transport, \
                     patch.object(w, "call_agent") as model:
                    if arxiv_succeeds:
                        w.main()
                    else:
                        with self.assertRaises(SystemExit):
                            w.main()
                    self.assertEqual(transport.call_count, 2)
                    model.assert_not_called()
                if arxiv_succeeds:
                    data = json.loads(target.read_text())
                    self.assertIn(old, data["items"])
                    self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
                    self.assertEqual(data["source_queries_succeeded"], 1)
                    self.assertEqual(len(data["errors"]), 1)
                    self.assertIn("Incomplete Crossref HTTP response", data["errors"][0])
                    self.assertIn("arxiv:2611.01234v2", [item["id"] for item in data["items"]])
                else:
                    self.assertEqual(target.read_bytes(), original)

    def test_incomplete_crossref_http_is_partial_failure_and_preserves_notes(self):
        self._check_incomplete_http_in_main(arxiv_succeeds=True)

    def test_incomplete_crossref_http_with_other_source_failure_keeps_file_unchanged(self):
        self._check_incomplete_http_in_main(arxiv_succeeds=False)

    def _arxiv_http_response(self, framing, body=None):
        if body is None:
            body = b'<feed xmlns="http://www.w3.org/2005/Atom"></feed>'
        if framing in ("length", "incomplete_length"):
            length = len(body) + (10 if framing == "incomplete_length" else 0)
            wire = b'HTTP/1.1 200 OK\r\nContent-Length: ' + str(length).encode() + b'\r\n\r\n' + body
        else:
            complete = framing == "chunked"
            length = len(body) + (0 if complete else 10)
            wire = (b'HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n' +
                    f'{length:x}'.encode() + b'\r\n' + body + (b'\r\n0\r\n\r\n' if complete else b''))
        class FakeSocket:
            def makefile(self, mode):
                return io.BytesIO(wire)
        response = http.client.HTTPResponse(FakeSocket())
        response.begin()
        return response

    def test_complete_arxiv_http_framing_and_records_remain_parseable(self):
        for framing in ("length", "chunked"):
            for body in (None, ARXIV_FEED.encode()):
                with self.subTest(framing=framing, has_record=body is not None), \
                     patch.object(w.urllib.request, "urlopen", return_value=self._arxiv_http_response(framing, body)):
                    rows = w.discover_arxiv("kunst", "synthetic query")
                    if body is None:
                        self.assertEqual(rows, [])
                    else:
                        self.assertEqual(len(rows), 1)
                        self.assertEqual(rows[0]["id"], "arxiv:2611.01234v2")
                        self.assertEqual(rows[0]["agent_notes"], {})

    def _check_incomplete_arxiv_before_parser(self, framing):
        with patch.object(w.urllib.request, "urlopen", return_value=self._arxiv_http_response(framing)), \
             patch.object(w, "parse_arxiv") as parse:
            with self.assertRaisesRegex(ValueError, "Incomplete arXiv HTTP response"):
                w.discover_arxiv("kunst", "synthetic query")
            parse.assert_not_called()

    def test_incomplete_arxiv_content_length_rejects_valid_atom_prefix(self):
        self._check_incomplete_arxiv_before_parser("incomplete_length")

    def test_incomplete_arxiv_chunk_is_source_value_error(self):
        self._check_incomplete_arxiv_before_parser("incomplete_chunked")

    def _check_incomplete_arxiv_in_main(self, crossref_succeeds):
        old = {"id": "10.1000/retained", "title": "Synthetic retained candidate",
               "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
        fresh = {"id": "10.1000/fresh", "title": "Synthetic fresh candidate",
                 "date": "2026-11-02", "agent_notes": {}}
        for framing in ("incomplete_length", "incomplete_chunked"):
            with self.subTest(framing=framing), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                original = (json.dumps({"items": [old]}) + "\n").encode()
                target.write_bytes(original)
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                     patch.object(w, "TOPICS", {"synthetic": "query"}), \
                     patch.object(w, "ARXIV_QUERIES", {"kunst": "query"}), \
                     patch.object(w, "discover", return_value=[fresh]) as crossref, \
                     patch.object(w.urllib.request, "urlopen", return_value=self._arxiv_http_response(framing)) as transport, \
                     patch.object(w, "call_agent") as model:
                    if crossref_succeeds:
                        w.main()
                    else:
                        crossref.side_effect = ValueError("Synthetic Crossref failure")
                        with self.assertRaises(SystemExit):
                            w.main()
                    self.assertEqual(transport.call_count, 1)
                    model.assert_not_called()
                if crossref_succeeds:
                    data = json.loads(target.read_text())
                    self.assertCountEqual(data["items"], [old, fresh])
                    self.assertEqual(data["source_queries"], {"Crossref": 1, "arXiv": 0})
                    self.assertEqual(data["source_queries_succeeded"], 1)
                    self.assertEqual(len(data["errors"]), 1)
                    self.assertIn("Incomplete arXiv HTTP response", data["errors"][0])
                else:
                    self.assertEqual(target.read_bytes(), original)

    def test_incomplete_arxiv_http_is_partial_failure_and_preserves_notes(self):
        self._check_incomplete_arxiv_in_main(crossref_succeeds=True)

    def test_incomplete_arxiv_http_with_other_source_failure_keeps_file_unchanged(self):
        self._check_incomplete_arxiv_in_main(crossref_succeeds=False)

    def _assert_existing_stream_load_rejected(self, original, exception, read_error=False):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            target.write_bytes(original)
            read_failure = patch.object(Path, "read_text", side_effect=OSError("Synthetic read failure")) if read_error else nullcontext()
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", "offline-test-key"), \
                 patch.object(w, "AI_ENABLED", True), patch.object(w, "discover") as discover, \
                 patch.object(w, "discover_arxiv") as arxiv, patch.object(w, "call_agent") as model, \
                 patch.object(w.urllib.request, "urlopen") as network, \
                 patch.object(Path, "write_text") as write, read_failure:
                with self.assertRaises(exception):
                    w.main()
                discover.assert_not_called()
                arxiv.assert_not_called()
                model.assert_not_called()
                network.assert_not_called()
                write.assert_not_called()
            self.assertEqual(target.read_bytes(), original)

    def test_existing_malformed_json_stops_before_discovery_and_keeps_bytes(self):
        self._assert_existing_stream_load_rejected(b'{"items":[', json.JSONDecodeError)

    def test_existing_invalid_utf8_stops_before_discovery_and_keeps_bytes(self):
        self._assert_existing_stream_load_rejected(b'{"items":[]}\xff', UnicodeDecodeError)

    def test_existing_wrong_stream_shape_stops_before_discovery_and_keeps_bytes(self):
        for value in ([], None, {}, {"items": None}, {"items": {"not": "a list"}}):
            with self.subTest(value=value):
                self._assert_existing_stream_load_rejected(json.dumps(value).encode("utf-8"), ValueError)

    def test_existing_read_error_stops_before_discovery_and_keeps_bytes(self):
        self._assert_existing_stream_load_rejected(b'{"items":[]}\n', OSError, read_error=True)

    def _run_stream_initialization_control(self, initial, mode=None):
        new = {"id": "10.1000/new", "title": "Synthetic new metadata",
               "date": "2026-11-02", "agent_notes": {}}
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            if initial is not None:
                target.write_text(json.dumps(initial, ensure_ascii=False), encoding="utf-8")
                if mode is not None:
                    target.chmod(mode)
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                 patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                 patch.object(w, "TOPICS", {"synthetic": "query"}), patch.object(w, "ARXIV_QUERIES", {}), \
                 patch.object(w, "discover", return_value=[new]) as discover, \
                 patch.object(w, "discover_arxiv") as arxiv, patch.object(w, "call_agent") as model, \
                 patch.object(w.urllib.request, "urlopen") as network:
                w.main()
                discover.assert_called_once()
                arxiv.assert_not_called()
                model.assert_not_called()
                network.assert_not_called()
            result = json.loads(target.read_text(encoding="utf-8"))
            if mode is not None:
                self.assertEqual(target.stat().st_mode & 0o777, mode)
            elif initial is None:
                self.assertEqual(target.stat().st_mode & 0o777, 0o600)
            self.assertEqual(result["source_queries_succeeded"], 1)
            self.assertEqual(result["errors"], [])
            by_id = {item["id"]: item for item in result["items"]}
            self.assertEqual(by_id[new["id"]], new)
            return by_id

    def test_missing_stream_can_initialize(self):
        self.assertEqual(len(self._run_stream_initialization_control(None)), 1)

    def test_valid_empty_stream_can_initialize(self):
        self.assertEqual(len(self._run_stream_initialization_control({"items": []})), 1)

    def test_existing_output_preserves_ordinary_permission_bits(self):
        for mode in (0o644, 0o640, 0o600):
            with self.subTest(mode=oct(mode)):
                self._run_stream_initialization_control({"items": []}, mode=mode)

    def _check_output_mode_failure(self, fault):
        original = b'{"items":[]}\n'
        original_stat = Path.stat
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            target.write_bytes(original)
            target.chmod(0o640)
            def stated(path, *args, **kwargs):
                if path == target:
                    raise OSError("Synthetic mode stat failure")
                return original_stat(path, *args, **kwargs)
            mode_failure = patch.object(Path, "stat", stated) if fault == "stat" else patch.object(Path, "chmod", side_effect=OSError("Synthetic chmod failure"))
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                 patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                 patch.object(w, "TOPICS", {"synthetic": "query"}), patch.object(w, "ARXIV_QUERIES", {}), \
                 patch.object(w, "discover", return_value=[]), patch.object(w, "call_agent") as model, \
                 patch.object(w.urllib.request, "urlopen") as network, \
                 patch.object(w.os, "replace") as replace, mode_failure:
                with self.assertRaises(OSError):
                    w.main()
                replace.assert_not_called()
                model.assert_not_called()
                network.assert_not_called()
            self.assertEqual(target.read_bytes(), original)
            self.assertEqual(target.stat().st_mode & 0o777, 0o640)
            self.assertEqual(list(Path(tmp).iterdir()), [target])

    def test_output_mode_stat_failure_keeps_original_and_cleans_temporary(self):
        self._check_output_mode_failure("stat")

    def test_output_chmod_failure_keeps_original_and_cleans_temporary(self):
        self._check_output_mode_failure("chmod")

    def test_valid_existing_stream_preserves_record_and_note(self):
        old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
               "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "  Keep\nä e\u0301  "}}}
        by_id = self._run_stream_initialization_control({"items": [old]})
        self.assertEqual(by_id[old["id"]], old)
        self.assertEqual(len(by_id), 2)

    def _check_output_failure(self, fault):
        original = b'{"items":[]}\n'
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
            def write(self, data):
                if fault == "partial":
                    self.handle.write(data[:len(data)//2])
                    self.handle.flush()
                    raise OSError("Synthetic partial write failure")
                return self.handle.write(data)
        def opened(file, mode="r", *args, **kwargs):
            if any(flag in mode for flag in "wax+"):
                if fault == "open":
                    raise OSError("Synthetic open failure")
                return FailingOutput(original_open(file, mode, *args, **kwargs))
            return original_open(file, mode, *args, **kwargs)
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            target.write_bytes(original)
            replace_failure = patch.object(w.os, "replace", side_effect=OSError("Synthetic replace failure")) if fault == "replace" else nullcontext()
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                 patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                 patch.object(w, "TOPICS", {"synthetic": "query"}), patch.object(w, "ARXIV_QUERIES", {}), \
                 patch.object(w, "discover", return_value=[]), patch.object(w, "call_agent") as model, \
                 patch.object(w.urllib.request, "urlopen") as network, \
                 patch.object(io, "open", opened), replace_failure:
                with self.assertRaises(OSError):
                    w.main()
                model.assert_not_called()
                network.assert_not_called()
            self.assertEqual(target.read_bytes(), original)
            self.assertEqual(list(Path(tmp).iterdir()), [target])

    def test_partial_output_write_keeps_original_and_cleans_temporary(self):
        self._check_output_failure("partial")

    def test_output_open_failure_keeps_original_and_cleans_temporary(self):
        self._check_output_failure("open")

    def test_output_close_failure_keeps_original_and_cleans_temporary(self):
        self._check_output_failure("close")

    def test_output_replace_failure_keeps_original_and_cleans_temporary(self):
        self._check_output_failure("replace")

    def test_crossref_rejects_consumed_truthy_non_list_titles(self):
        base = {"DOI": "10.1000/synthetic", "published": {"date-parts": [[2026, 11, 1]]}}
        for title in (True, 17, 1.5, "Synthetic standalone title", {"x": "Synthetic title"}):
            with self.subTest(title=title), patch.object(w, "get_json", return_value={"message": {"items": [{**base, "title": title}]}}):
                with self.assertRaises(ValueError):
                    w.discover("kunst", "synthetic")

    def test_crossref_title_compatibility_and_consumption_order(self):
        title = "Synthetic title container candidate"
        base = {"DOI": "10.1000/synthetic", "published": {"date-parts": [[2026, 11, 1]]}}
        cases = [({}, []), ({"title": [title]}, [title]),
                 ({"title": [" Synthetic <b>title</b> &amp;  study "]}, ["Synthetic title & study"]),
                 ({"title": ["X" * 251]}, ["X" * 250]),
                 ({"title": [title, "A different secondary title"]}, [title]),
                 ({"title": ["", title]}, []), ({"title": ["short", title]}, []),
                 ({"title": [17]}, []), ({"title": [{"x": title}]}, []),
                 ({"title": [title, None]}, [title]),
                 ({"DOI": "not-a-doi", "title": True}, [])]
        cases.extend(({"title": value}, []) for value in (None, [], {}, "", 0, False))
        for fields, expected in cases:
            with self.subTest(fields=fields), patch.object(w, "get_json", return_value={"message": {"items": [{**base, **fields}]}}):
                rows = w.discover("kunst", "synthetic")
                self.assertEqual([row["title"] for row in rows], expected)
                for row in rows:
                    self.assertEqual(row["status"], "unreviewed")
                    self.assertEqual(row["source_examined"], "metadata_only")

    def test_bad_title_container_preserves_notes_and_other_source(self):
        for title in (True, "Synthetic standalone title"):
            with self.subTest(title=title), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                       "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
                other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate candidate",
                         "date": "2026-11-02", "agent_notes": {}}
                row = {"DOI": "10.1000/synthetic", "title": title,
                       "published": {"date-parts": [[2026, 11, 1]]}}
                target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                     patch.object(w, "TOPICS", {"synthetic": "query"}), \
                     patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                     patch.object(w, "get_json", return_value={"message": {"items": [row]}}), \
                     patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                     patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                    w.main()
                    arxiv.assert_called_once()
                data = json.loads(target.read_text(encoding="utf-8"))
                self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
                self.assertEqual(data["source_queries_succeeded"], 1)
                self.assertCountEqual(data["items"], [old, other])
                self.assertEqual(len(data["errors"]), 1)
                self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

    def test_crossref_rejects_consumed_truthy_non_list_venues(self):
        base = {"DOI": "10.1000/synthetic", "title": ["Synthetic venue container candidate"],
                "published": {"date-parts": [[2026, 11, 1]]}}
        for venue in (True, 17, 1.5, "Synthetic Publication Name", {"x": "Synthetic Journal"}):
            with self.subTest(venue=venue), patch.object(w, "get_json", return_value={"message": {"items": [{**base, "container-title": venue}]}}):
                with self.assertRaises(ValueError):
                    w.discover("kunst", "synthetic")

    def test_crossref_venue_compatibility_and_consumption_order(self):
        venue = "Synthetic Publication Name"
        base = {"DOI": "10.1000/synthetic", "title": ["Synthetic venue container candidate"],
                "published": {"date-parts": [[2026, 11, 1]]}}
        cases = [({}, [""]), ({"container-title": [venue]}, [venue]),
                 ({"container-title": [" Synthetic <b>Journal</b> &amp;  Review "]}, ["Synthetic Journal & Review"]),
                 ({"container-title": ["X" * 151]}, ["X" * 150]),
                 ({"container-title": [venue, "Secondary name"]}, [venue]),
                 ({"container-title": ["", venue]}, [""]),
                 ({"container-title": ["short", venue]}, ["short"]),
                 ({"container-title": [17]}, [""]), ({"container-title": [{"x": venue}]}, [""]),
                 ({"container-title": [venue, None]}, [venue]),
                 ({"DOI": "not-a-doi", "container-title": True}, []),
                 ({"title": ["short"], "container-title": True}, []),
                 ({"published": {"date-parts": [[2027, 1, 1]]}, "container-title": True}, []),
                 ({"author": [{"given": "Synthetic", "family": "Person"}], "container-title": [venue]}, [venue])]
        cases.extend(({"container-title": value}, [""]) for value in (None, [], {}, "", 0, False))
        for fields, expected in cases:
            with self.subTest(fields=fields), patch.object(w, "get_json", return_value={"message": {"items": [{**base, **fields}]}}):
                rows = w.discover("kunst", "synthetic")
                self.assertEqual([row["venue"] for row in rows], expected)
                for row in rows:
                    self.assertEqual(row["status"], "unreviewed")
                    self.assertEqual(row["source_examined"], "metadata_only")
        with patch.object(w, "get_json", return_value={"message": {"items": [{**base, "author": None, "container-title": True}]}}):
            with self.assertRaisesRegex(ValueError, "Crossref authors"):
                w.discover("kunst", "synthetic")

    def test_bad_venue_container_preserves_notes_and_other_source(self):
        for venue in (True, "Synthetic Publication Name"):
            with self.subTest(venue=venue), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                       "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
                other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate candidate",
                         "date": "2026-11-02", "agent_notes": {}}
                row = {"DOI": "10.1000/synthetic", "title": ["Synthetic venue container candidate"],
                       "published": {"date-parts": [[2026, 11, 1]]}, "container-title": venue}
                target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                     patch.object(w, "TOPICS", {"synthetic": "query"}), \
                     patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                     patch.object(w, "get_json", return_value={"message": {"items": [row]}}), \
                     patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                     patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                    w.main()
                    arxiv.assert_called_once()
                data = json.loads(target.read_text(encoding="utf-8"))
                self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
                self.assertEqual(data["source_queries_succeeded"], 1)
                self.assertCountEqual(data["items"], [old, other])
                self.assertEqual(len(data["errors"]), 1)
                self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

    def test_date_precision_follows_the_selected_valid_source(self):
        def date(parts):
            return {"date-parts": [parts]}
        cases = [
            ({"published": date([2026])}, ("2026-01-01", "year")),
            ({"published": date([2026, 11])}, ("2026-11-01", "month")),
            ({"published": date([2026, 11, 1])}, ("2026-11-01", "day")),
            ({"published-online": date([2026]), "issued": date([2026, 11, 2])}, ("2026-01-01", "year")),
            ({"published-online": date([2026, 11]), "issued": date([2026, 10, 31])}, ("2026-11-01", "month")),
            ({"published-online": date([2026, 2, 30]), "issued": date([2026, 11, 2])}, ("2026-11-02", "day")),
            ({"published-online": date(["bad"]), "issued": date([2026])}, ("2026-01-01", "year")),
            ({"published": date([2026, 11, 1, True])}, ("2026-11-01", "day")),
            ({"published": date(["2026", "11"])}, ("2026-11-01", "month")),
            ({"published": date([2026.0, 11.0, 1.0])}, ("2026-11-01", "day")),
            ({"published": date([2026, 13, 1])}, ("", "unknown")),
            ({}, ("", "unknown")),
        ]
        for item, expected in cases:
            with self.subTest(item=item):
                self.assertEqual(w.pub_date_with_precision(item), expected)
                self.assertEqual(w.pub_date(item), expected[0])
        for parts in ([2026.9], [True]):
            with self.subTest(parts=parts), self.assertRaises(ValueError):
                w.pub_date_with_precision({"published-online": date(parts), "issued": date([2026, 11, 2])})

    def test_discovery_records_source_precision_without_changing_date_values(self):
        for parts, date, precision in [([2026], "2026-01-01", "year"), ([2026, 11], "2026-11-01", "month"), ([2026, 11, 1], "2026-11-01", "day")]:
            item = {"DOI": "10.1000/synthetic", "title": ["Synthetic publication precision"], "published": {"date-parts": [parts]}}
            with self.subTest(parts=parts), patch.object(w, "get_json", return_value={"message": {"items": [item]}}):
                records = w.discover("synthetic", "synthetic")
            self.assertEqual(len(records), 1)
            self.assertEqual((records[0]["date"], records[0]["date_precision"]), (date, precision))
            self.assertEqual(records[0]["status"], "unreviewed")
        arxiv = w.parse_arxiv(ARXIV_FEED, "synthetic")
        self.assertEqual(arxiv[0]["date"], "2026-11-01")
        self.assertEqual(arxiv[0]["date_precision"], "day")

    def test_new_precision_does_not_rewrite_legacy_records_or_notes(self):
        old = {"id": "10.1000/legacy", "title": "Synthetic legacy publication", "date": "2026-11-01", "agent_notes": {"skeptic": {"uncertainty": "Synthetic retained note"}}}
        incoming_same_id = {**old, "date_precision": "day", "agent_notes": {}}
        fresh = {"id": "10.1000/fresh", "title": "Synthetic fresh publication", "date": "2026-01-01", "date_precision": "year", "agent_notes": {}}
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
            with patch.object(w, "OUT", target), patch.object(w, "TOPICS", {"synthetic": "synthetic"}), patch.object(w, "ARXIV_QUERIES", {}), patch.object(w, "AI_ENABLED", False), patch.object(w, "API_KEY", ""), patch.object(w.time, "sleep"), patch.object(w, "discover", return_value=[incoming_same_id, fresh]), patch.object(w.urllib.request, "urlopen") as network:
                w.main()
                network.assert_not_called()
            rows = json.loads(target.read_text(encoding="utf-8"))["items"]
            self.assertEqual([row["id"] for row in rows], [old["id"], fresh["id"]])
            self.assertEqual(rows[0], old)
            self.assertNotIn("date_precision", rows[0])
            self.assertEqual(rows[1], fresh)

    def test_date_prefers_online(self):
        self.assertEqual(w.pub_date({"published-online":{"date-parts":[[2026,11,5]]}}),
                         "2026-11-05")

    def test_date_range_overflow_uses_existing_calendar_fallback(self):
        fallback = {"date-parts": [[2026, 11, 2]]}
        for field in ("published-online", "published-print", "published", "issued"):
            for position in range(3):
                for value in (10**30, -10**30):
                    ymd = [2026, 11, 1]
                    ymd[position] = value
                    with self.subTest(field=field, position=position, value=value):
                        self.assertEqual(w.pub_date({field: {"date-parts": [ymd]}}), "")
                        if field != "issued":
                            self.assertEqual(w.pub_date({field: {"date-parts": [ymd]},
                                                         "issued": fallback}), "2026-11-02")

    def test_date_range_controls_keep_bounds_and_unread_values(self):
        fallback = {"date-parts": [[2026, 11, 2]]}
        for ymd, expected in [([1, 1, 1], "0001-01-01"),
                              ([9999, 12, 31], "9999-12-31"),
                              ([2024, 2, 29], "2024-02-29"),
                              ([10000, 11, 1], "2026-11-02"),
                              ([2026, 13, 1], "2026-11-02"),
                              ([2026, 11, 32], "2026-11-02"),
                              ([None, 10**30, 1], "2026-11-02"),
                              (["bad", 10**30, 1], "2026-11-02"),
                              ([2026, 11, 1, 10**30], "2026-11-01")]:
            with self.subTest(ymd=ymd):
                self.assertEqual(w.pub_date({"published-online": {"date-parts": [ymd]},
                                             "issued": fallback}), expected)
        self.assertEqual(w.pub_date({"published-online": fallback,
                                     "issued": {"date-parts": [[10**30]]}}), "2026-11-02")
        self.assertEqual(w.pub_date({"published-online": {"date-parts": [[2026, 11, 1], [10**30]]}}),
                         "2026-11-01")

    def test_date_range_overflow_preserves_notes_and_other_source(self):
        for has_fallback in (True, False):
            with self.subTest(has_fallback=has_fallback), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                       "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
                other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate candidate",
                         "date": "2026-11-02", "agent_notes": {}}
                row = {"DOI": "10.1000/synthetic", "title": ["Synthetic date range candidate"],
                       "published-online": {"date-parts": [[10**30, 11, 1]]}}
                if has_fallback:
                    row["issued"] = {"date-parts": [[2026, 11, 2]]}
                target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                     patch.object(w, "TOPICS", {"synthetic": "query"}), \
                     patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                     patch.object(w, "get_json", return_value={"message": {"items": [row]}}), \
                     patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                     patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                    w.main()
                    arxiv.assert_called_once()
                data = json.loads(target.read_text(encoding="utf-8"))
                self.assertEqual(data["source_queries"], {"Crossref": 1, "arXiv": 1})
                self.assertEqual(data["source_queries_succeeded"], 2)
                self.assertEqual(data["errors"], [])
                self.assertIn(old, data["items"])
                self.assertIn(other, data["items"])
                candidate = [item for item in data["items"] if item["id"] == "10.1000/synthetic"]
                if has_fallback:
                    self.assertEqual(len(candidate), 1)
                    self.assertEqual(candidate[0]["date"], "2026-11-02")
                    self.assertEqual(candidate[0]["status"], "unreviewed")
                else:
                    self.assertEqual(candidate, [])

    def test_date_rejects_consumed_bool_and_fractional_components(self):
        for field in ("published-online", "published-print", "published", "issued"):
            for position in range(3):
                for value in ((2026.9, 11.9, 1.9)[position], True, False):
                    ymd = [2026, 11, 1]
                    ymd[position] = value
                    with self.subTest(field=field, position=position, value=value), self.assertRaises(ValueError):
                        w.pub_date({field: {"date-parts": [ymd]}})

    def test_date_component_compatibility_and_consumption_order(self):
        fallback = {"date-parts": [[2026, 11, 2]]}
        for ymd, expected in [([2026], "2026-01-01"), ([2026, 11], "2026-11-01"),
                              ([2026, 11, 1], "2026-11-01"),
                              ([2026.0, 11.0, 1.0], "2026-11-01"),
                              (["2026", "11", "1"], "2026-11-01"),
                              ([None, 11, 1], "2026-11-02"),
                              ([2026, None, 1], "2026-11-02"),
                              ([2026, 11, None], "2026-11-02"),
                              ([2026, 13, 1], "2026-11-02"),
                              ([None, 1.9, 1], "2026-11-02"),
                              (["bad", True, 1], "2026-11-02"),
                              ([2026, 11, 1, 3.9], "2026-11-01"),
                              ([2026, 11, 1, True], "2026-11-01")]:
            with self.subTest(ymd=ymd):
                self.assertEqual(w.pub_date({"published-online": {"date-parts": [ymd]},
                                             "issued": fallback}), expected)
        self.assertEqual(w.pub_date({"published-online": fallback,
                                     "issued": {"date-parts": [[2026.9]]}}), "2026-11-02")
        self.assertEqual(w.pub_date({"published-online": {"date-parts": [[2026, 11, 1], [True]]}}),
                         "2026-11-01")

    def test_bad_numeric_date_component_preserves_notes_and_other_source(self):
        for ymd in ([2026.9, 11, 1], [2026, True, 1]):
            with self.subTest(ymd=ymd), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                       "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
                other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate candidate",
                         "date": "2026-11-02", "agent_notes": {}}
                row = {"DOI": "10.1000/synthetic", "title": ["Synthetic numeric date candidate"],
                       "published-online": {"date-parts": [ymd]}}
                target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                     patch.object(w, "TOPICS", {"synthetic": "query"}), \
                     patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                     patch.object(w, "get_json", return_value={"message": {"items": [row]}}), \
                     patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                     patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                    w.main()
                    arxiv.assert_called_once()
                data = json.loads(target.read_text(encoding="utf-8"))
                self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
                self.assertEqual(data["source_queries_succeeded"], 1)
                self.assertCountEqual(data["items"], [old, other])
                self.assertEqual(len(data["errors"]), 1)
                self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

    def test_date_rejects_consumed_truthy_non_object_containers(self):
        for field in ("published-online", "published-print", "published", "issued"):
            for value in ("invalid", 17, [1], True):
                with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                    w.pub_date({field: value})

    def test_date_preserves_falsy_compatibility_and_priority(self):
        valid = {"date-parts": [[2026, 11, 1]]}
        self.assertEqual(w.pub_date({}), "")
        for field in ("published-online", "published-print", "published", "issued"):
            for value in (None, [], "", 0, False, {}):
                row = {field: value}
                if field != "issued":
                    row["issued"] = valid
                with self.subTest(field=field, value=value):
                    self.assertEqual(w.pub_date(row), "2026-11-01" if field != "issued" else "")
        self.assertEqual(w.pub_date({"published-online": valid, "published-print": "unread"}),
                         "2026-11-01")
        self.assertEqual(w.pub_date({"published-online": {}, "published-print": valid}),
                         "2026-11-01")

    def test_date_rejects_consumed_truthy_inner_non_lists(self):
        # Crossref date-parts is an array of arrays; only the first is read.
        for field in ("published-online", "published-print", "published", "issued"):
            for parts in (True, 17, "2026", {"x": [2026]},
                          [True], [17], ["111"], [{"x": 2026}]):
                with self.subTest(field=field, parts=parts), self.assertRaises(ValueError):
                    w.pub_date({field: {"date-parts": parts}})

    def test_date_inner_controls_keep_partial_dates_and_fallback(self):
        fallback = {"date-parts": [[2026, 11, 2]]}
        for parts, expected in [([[2026]], "2026-01-01"),
                                ([[2026, 11]], "2026-11-01"),
                                ([[2026, 11, 1]], "2026-11-01"),
                                ([[2026, 13, 1]], "2026-11-02"),
                                ([[2026, 11, 1], "unread"], "2026-11-01")]:
            with self.subTest(parts=parts):
                self.assertEqual(w.pub_date({"published-online": {"date-parts": parts},
                                             "issued": fallback}), expected)
        for empty in (None, [], "", 0, False, {}):
            for parts in (empty, [empty]):
                with self.subTest(parts=parts):
                    self.assertEqual(w.pub_date({"published-online": {"date-parts": parts},
                                                 "issued": fallback}), "2026-11-02")
        self.assertEqual(w.pub_date({"published-online": fallback,
                                     "issued": {"date-parts": True}}), "2026-11-02")

    def test_bad_inner_date_structure_preserves_notes_and_other_source(self):
        for parts in (True, "2026"):
            with self.subTest(parts=parts), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                       "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
                other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate candidate",
                         "date": "2026-11-02", "agent_notes": {}}
                row = {"DOI": "10.1000/synthetic", "title": ["Synthetic malformed inner date candidate"],
                       "published-online": {"date-parts": parts}}
                target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                     patch.object(w, "TOPICS", {"synthetic": "query"}), \
                     patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                     patch.object(w, "get_json", return_value={"message": {"items": [row]}}), \
                     patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                     patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                    w.main()
                    arxiv.assert_called_once()
                data = json.loads(target.read_text(encoding="utf-8"))
                self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
                self.assertEqual(data["source_queries_succeeded"], 1)
                self.assertEqual(data["new_items"], 1)
                self.assertCountEqual(data["items"], [old, other])
                self.assertEqual(len(data["errors"]), 1)
                self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

    def test_bad_date_container_allows_other_source_and_preserves_notes(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                   "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
            other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate candidate",
                     "date": "2026-11-02", "agent_notes": {}}
            row = {"DOI": "10.1000/synthetic", "title": ["Synthetic malformed date candidate"],
                   "published-online": "invalid"}
            target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                 patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                 patch.object(w, "TOPICS", {"synthetic": "query"}), \
                 patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                 patch.object(w, "get_json", return_value={"message": {"items": [row]}}), \
                 patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                 patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                w.main()
                arxiv.assert_called_once()
            data = json.loads(target.read_text(encoding="utf-8"))
            self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
            self.assertEqual(data["source_queries_succeeded"], 1)
            self.assertEqual(data["new_items"], 1)
            self.assertCountEqual(data["items"], [old, other])
            self.assertEqual(len(data["errors"]), 1)
            self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

    def test_crossref_metadata_is_never_marked_verified(self):
        payload = {"message":{"items":[
            {"DOI":"10.1234/ABC", "title":["A controlled investigation of attachment"],
             "author":[{"given":"A","family":"Researcher"}],
             "container-title":["Journal of Inquiry"],
             "published":{"date-parts":[[2026,11,1]]}},
            {"DOI":"not-a-doi", "title":["A fake invalid metadata record"]},
            {"DOI":"10.1234/FUTURE", "title":["Future candidate record"], "published":{"date-parts":[[2027,1,1]]}},
            {"DOI":"10.1234/UNKNOWN", "title":["Title Pending 1451"], "published":{"date-parts":[[2026,11,1]]}},
        ]}}
        with patch.object(w, "get_json", return_value=payload) as fetch:
            results = w.discover("liebe", "attachment")
        params = urllib.parse.parse_qs(urllib.parse.urlsplit(fetch.call_args.args[0]).query)
        self.assertIn("until-pub-date:2026-11-05", params["filter"][0])
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

    def test_crossref_requires_an_items_list_but_allows_empty_and_extensions(self):
        for payload in [{"message": {"items": []}},
                        {"extra": True, "message": {"items": [], "extra": True}}]:
            with self.subTest(valid=payload), patch.object(w, "get_json", return_value=payload):
                self.assertEqual(w.discover("kunst", "synthetic"), [])
        for payload in [None, [], {}, {"message": None}, {"message": []},
                        {"message": {}}, {"message": {"items": None}},
                        {"message": {"items": {}}}, {"message": {"items": ""}}]:
            with self.subTest(invalid=payload), patch.object(w, "get_json", return_value=payload):
                with self.assertRaises(ValueError):
                    w.discover("kunst", "synthetic")

    def test_wrong_crossref_container_is_not_counted_as_an_empty_success(self):
        for items in [{}, ""]:
            with self.subTest(items=items), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                       "date": "2026-11-01", "agent_notes": {}}
                target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
                with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                     patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                     patch.object(w, "TOPICS", {"synthetic": "query"}), \
                     patch.object(w, "ARXIV_QUERIES", {"empty": "query"}), \
                     patch.object(w, "get_json", return_value={"message": {"items": items}}), \
                     patch.object(w, "discover_arxiv", return_value=[]), \
                     patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                    w.main()
                data = json.loads(target.read_text(encoding="utf-8"))
                self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
                self.assertEqual(data["source_queries_succeeded"], 1)
                self.assertEqual(data["new_items"], 0)
                self.assertEqual(data["items"], [old])
                self.assertEqual(len(data["errors"]), 1)
                self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

    def test_crossref_rejects_non_object_records_as_source_format_errors(self):
        for item in [None, 17, "synthetic", [], True]:
            with self.subTest(item=item), patch.object(w, "get_json", return_value={"message": {"items": [item]}}):
                with self.assertRaises(ValueError):
                    w.discover("kunst", "synthetic")

    def test_bad_crossref_record_allows_other_source_and_preserves_existing_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                   "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
            other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate source candidate",
                     "date": "2026-11-02", "agent_notes": {}}
            valid = {"DOI": "10.1000/synthetic", "title": ["Synthetic Crossref candidate title"],
                     "published": {"date-parts": [[2026, 11, 1]]}}
            target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                 patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                 patch.object(w, "TOPICS", {"synthetic": "query"}), \
                 patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                 patch.object(w, "get_json", return_value={"message": {"items": [valid, None]}}), \
                 patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                 patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                w.main()
                arxiv.assert_called_once()
            data = json.loads(target.read_text(encoding="utf-8"))
            self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
            self.assertEqual(data["source_queries_succeeded"], 1)
            self.assertEqual(data["new_items"], 1)
            self.assertCountEqual(data["items"], [old, other])
            self.assertEqual(len(data["errors"]), 1)
            self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

    def test_crossref_author_types_fail_as_source_format_errors(self):
        valid = {"DOI": "10.1000/synthetic", "title": ["Synthetic author metadata candidate"],
                 "published": {"date-parts": [[2026, 11, 1]]}}
        for author in [None, {}, "", 17, True, [None], [17], ["bad"], [[]], [False]]:
            with self.subTest(author=author), patch.object(w, "get_json", return_value={"message": {"items": [{**valid, "author": author}]}}):
                with self.assertRaises(ValueError):
                    w.discover("kunst", "synthetic")

    def test_crossref_optional_and_bounded_author_objects_stay_allowed(self):
        valid = {"DOI": "10.1000/synthetic", "title": ["Synthetic author metadata candidate"],
                 "published": {"date-parts": [[2026, 11, 1]]}}
        person = {"given": "A", "family": "Researcher"}
        for fields, names in [({}, []), ({"author": []}, []),
                              ({"author": [person]}, ["A Researcher"]),
                              ({"author": [{"name": "Synthetic organisation"}]}, ["Synthetic organisation"]),
                              ({"author": [person] * 5 + [None]}, ["A Researcher"] * 5)]:
            with self.subTest(fields=fields), patch.object(w, "get_json", return_value={"message": {"items": [{**valid, **fields}]}}):
                rows = w.discover("kunst", "synthetic")
                self.assertEqual(len(rows), 1)
                self.assertEqual(rows[0]["authors"], names)

    def test_crossref_preserves_standalone_author_name(self):
        # Crossref REST Swagger Author also permits name without given/family.
        author = {"name": "Synthetic Organisation", "affiliation": [], "sequence": "first"}
        row = {"DOI": "10.1000/synthetic", "title": ["Synthetic standalone name candidate"],
               "published": {"date-parts": [[2026, 11, 1]]}, "author": [author]}
        with patch.object(w, "get_json", return_value={"message": {"items": [row]}}):
            result = w.discover("kunst", "synthetic")[0]
        self.assertEqual(result["authors"], ["Synthetic Organisation"])
        self.assertEqual(result["status"], "unreviewed")
        self.assertEqual(result["source_examined"], "metadata_only")
        self.assertEqual(result["agent_notes"], {})

    def test_crossref_keeps_author_order_and_existing_person_priority(self):
        organisation = {"name": "Synthetic Organisation", "affiliation": [], "sequence": "first"}
        person = {"given": "Synthetic", "family": "Person", "affiliation": [], "sequence": "additional"}
        base = {"DOI": "10.1000/synthetic", "title": ["Synthetic mixed authorship candidate"],
                "published": {"date-parts": [[2026, 11, 1]]}}
        for authors, expected in [([organisation, person], ["Synthetic Organisation", "Synthetic Person"]),
                                  ([person, organisation], ["Synthetic Person", "Synthetic Organisation"]),
                                  ([{**person, "name": "Alternative supplied name"}], ["Synthetic Person"]),
                                  ([{**person, "given": ""}], ["Person"]),
                                  ([organisation] * 5 + [{"name": "Ignored sixth"}], ["Synthetic Organisation"] * 5)]:
            with self.subTest(authors=authors), patch.object(w, "get_json", return_value={"message": {"items": [{**base, "author": authors}]}}):
                self.assertEqual(w.discover("kunst", "synthetic")[0]["authors"], expected)

    def test_crossref_standalone_name_uses_existing_cleaning_and_length_limit(self):
        base = {"DOI": "10.1000/synthetic", "title": ["Synthetic author name cleaning candidate"],
                "published": {"date-parts": [[2026, 11, 1]]}}
        for author, expected in [({"name": " <b>Synthetic</b>  &amp; Team "}, ["Synthetic & Team"]),
                                 ({"given": " <b> </b> ", "family": " ", "name": "Synthetic Team"}, ["Synthetic Team"]),
                                 ({"name": "x" * 101}, ["x" * 100]),
                                 ({"name": " \t "}, []), ({}, [])]:
            with self.subTest(author=author), patch.object(w, "get_json", return_value={"message": {"items": [{**base, "author": [author]}]}}):
                self.assertEqual(w.discover("kunst", "synthetic")[0]["authors"], expected)

    def test_crossref_consumed_person_name_values_require_strings(self):
        base = {"DOI": "10.1000/synthetic", "title": ["Synthetic name value candidate"],
                "published": {"date-parts": [[2026, 11, 1]]}}
        for field in ("given", "family"):
            for value in (None, 17, [], {}, False):
                author = {"given": "Synthetic", "family": "Person", field: value}
                with self.subTest(field=field, value=value), patch.object(w, "get_json", return_value={"message": {"items": [{**base, "author": [author]}]}}):
                    with self.assertRaises(ValueError):
                        w.discover("kunst", "synthetic")

    def test_crossref_person_name_strings_and_unread_sixth_stay_allowed(self):
        base = {"DOI": "10.1000/synthetic", "title": ["Synthetic optional name candidate"],
                "published": {"date-parts": [[2026, 11, 1]]}}
        person = {"given": "Synthetic", "family": "Person"}
        for authors, expected in [([{}], []), ([{"given": "", "family": ""}], []),
                                  ([{"given": "Synthetic"}], ["Synthetic"]),
                                  ([{"family": "Person"}], ["Person"]),
                                  ([{"name": "Synthetic Collective"}], ["Synthetic Collective"]),
                                  ([person] * 5 + [{"given": None}], ["Synthetic Person"] * 5)]:
            with self.subTest(authors=authors), patch.object(w, "get_json", return_value={"message": {"items": [{**base, "author": authors}]}}):
                row = w.discover("kunst", "synthetic")[0]
                self.assertEqual(row["authors"], expected)
                self.assertEqual(row["status"], "unreviewed")
                self.assertEqual(row["source_examined"], "metadata_only")

    def test_bad_person_name_allows_other_source_and_preserves_notes(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                   "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
            other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate candidate",
                     "date": "2026-11-02", "agent_notes": {}}
            row = {"DOI": "10.1000/synthetic", "title": ["Synthetic malformed person name candidate"],
                   "published": {"date-parts": [[2026, 11, 1]]}, "author": [{"given": None, "family": "Person"}]}
            target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                 patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                 patch.object(w, "TOPICS", {"synthetic": "query"}), \
                 patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                 patch.object(w, "get_json", return_value={"message": {"items": [row]}}), \
                 patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                 patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                w.main()
                arxiv.assert_called_once()
            data = json.loads(target.read_text(encoding="utf-8"))
            self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
            self.assertEqual(data["source_queries_succeeded"], 1)
            self.assertEqual(data["new_items"], 1)
            self.assertCountEqual(data["items"], [old, other])
            self.assertEqual(len(data["errors"]), 1)
            self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

    def test_bad_author_allows_other_source_and_preserves_existing_notes(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            old = {"id": "10.1000/retained", "title": "Synthetic retained metadata",
                   "date": "2026-11-01", "agent_notes": {"skeptic": {"test": "Keep"}}}
            other = {"id": "arxiv:2611.01234v1", "title": "Synthetic alternate source candidate",
                     "date": "2026-11-02", "agent_notes": {}}
            row = {"DOI": "10.1000/synthetic", "title": ["Synthetic author metadata candidate"],
                   "published": {"date-parts": [[2026, 11, 1]]}, "author": [None]}
            target.write_text(json.dumps({"items": [old]}), encoding="utf-8")
            with patch.object(w, "OUT", target), patch.object(w, "API_KEY", ""), \
                 patch.object(w, "AI_ENABLED", False), patch.object(w.time, "sleep"), \
                 patch.object(w, "TOPICS", {"synthetic": "query"}), \
                 patch.object(w, "ARXIV_QUERIES", {"other": "query"}), \
                 patch.object(w, "get_json", return_value={"message": {"items": [row]}}), \
                 patch.object(w, "discover_arxiv", return_value=[other]) as arxiv, \
                 patch.object(w.urllib.request, "urlopen", side_effect=AssertionError("No network")):
                w.main()
                arxiv.assert_called_once()
            data = json.loads(target.read_text(encoding="utf-8"))
            self.assertEqual(data["source_queries"], {"Crossref": 0, "arXiv": 1})
            self.assertEqual(data["source_queries_succeeded"], 1)
            self.assertEqual(data["new_items"], 1)
            self.assertCountEqual(data["items"], [old, other])
            self.assertEqual(len(data["errors"]), 1)
            self.assertIn("Crossref/synthetic: ValueError", data["errors"][0])

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
        future = ARXIV_FEED.replace("2026-11-01T", "2034-05-30T")
        self.assertEqual(w.parse_arxiv(future, "kunst"), [])
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
            urlopen.return_value.__enter__.return_value.length = None
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
                target.write_text(json.dumps({"items":[old, {"id":"bad", "title":"Title Pending 1451", "date":"2034-05-30"}]}), encoding="utf-8")
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
                    self.assertNotIn("bad", [row["id"] for row in result["items"]])
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


class AgentCompletionTest(unittest.TestCase):
    @staticmethod
    def response(reason):
        choice = {"message": {"content": json.dumps({
            "question": "Which check is missing?", "limitation": "Metadata only"})}}
        if reason is not None:
            choice["finish_reason"] = reason
        return io.BytesIO(json.dumps({"choices": [choice]}).encode())

    def test_only_explicit_stop_accepts_same_json(self):
        for reason in ("length", "content_filter", "error", "unknown", None):
            with self.subTest(reason=reason), \
                 patch.object(w, "AI_ENABLED", True), \
                 patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                 patch.object(w.urllib.request, "urlopen", return_value=self.response(reason)):
                with self.assertRaisesRegex(ValueError, "regular completion"):
                    w.call_agent("methodologist", {"title": "Synthetic metadata"})

    def test_stop_still_returns_unreviewed_note_content(self):
        with patch.object(w, "AI_ENABLED", True), \
             patch.object(w, "API_KEY", "synthetic-not-a-key"), \
             patch.object(w.urllib.request, "urlopen", return_value=self.response("stop")):
            self.assertEqual(w.call_agent("methodologist", {}), {
                "question": "Which check is missing?", "limitation": "Metadata only"})

    def test_rejected_completion_does_not_add_role_or_change_old_notes(self):
        for reason in ("length", "content_filter", "error", "unknown", None):
            with self.subTest(reason=reason), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old_notes = {"skeptic": {"test": "Keep exactly"},
                             "synthesizer": {"next_step": "Read source"}}
                target.write_text(json.dumps({"items": [{
                    "id": "10.1234/synthetic", "date": "2026-11-01",
                    "title": "Synthetic metadata candidate", "agent_notes": old_notes}]}))
                with patch.object(w, "OUT", target), \
                     patch.object(w, "NOW", dt.datetime(2026, 11, 5, tzinfo=dt.timezone.utc)), \
                     patch.object(w, "AI_ENABLED", True), \
                     patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                     patch.object(w, "MAX_ANALYSES", 1), \
                     patch.object(w.time, "sleep"), \
                     patch.object(w, "discover", return_value=[]), \
                     patch.object(w, "discover_arxiv", return_value=[]), \
                     patch.object(w.urllib.request, "urlopen", return_value=self.response(reason)) as request:
                    w.main()
                data = json.loads(target.read_text())
                self.assertEqual(data["items"][0]["agent_notes"], old_notes)
                self.assertNotIn("methodologist", data["items"][0]["agent_notes"])
                self.assertIn("methodologist: ValueError", data["errors"])
                self.assertEqual(request.call_count, 1)


class AgentRequiredFieldsTest(unittest.TestCase):
    @staticmethod
    def response(payload):
        return io.BytesIO(json.dumps({"choices": [{"finish_reason": "stop",
            "message": {"content": json.dumps(payload)}}]}).encode())

    def test_every_role_requires_each_cleaned_field(self):
        for role, (_, keys) in w.ROLES.items():
            valid = {key: "Aus Metadaten unbekannt; Originalquelle prüfen." for key in keys}
            cases = [{}]
            for key in keys:
                missing = valid.copy()
                del missing[key]
                cases.append(missing)
                for value in (None, 7, False, [], {}, "", " \n\t ", "<b></b> &nbsp;"):
                    cases.append({**valid, key: value})
            for payload in cases:
                with self.subTest(role=role, payload=payload), \
                     patch.object(w, "AI_ENABLED", True), \
                     patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                     patch.object(w.urllib.request, "urlopen", return_value=self.response(payload)):
                    with self.assertRaisesRegex(ValueError, "required field"):
                        w.call_agent(role, {})

    def test_explicit_uncertainty_and_bounded_clean_text_remain_valid(self):
        for role, (_, keys) in w.ROLES.items():
            payload = {key: "Aus Metadaten unbekannt; Originalquelle prüfen." for key in keys}
            for case in (payload, {key: "<b>" + "x" * 460 + "</b>" for key in keys}):
                with self.subTest(role=role), \
                     patch.object(w, "AI_ENABLED", True), \
                     patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                     patch.object(w.urllib.request, "urlopen", return_value=self.response(case)):
                    self.assertEqual(w.call_agent(role, {}), {key: w.clean(case[key], 450) for key in keys})

    def test_invalid_fields_do_not_store_role_or_replace_other_notes(self):
        for payload in ({}, {"question": "Unbekannt"},
                        {"question": 7, "limitation": "Quelle prüfen"},
                        {"question": "<b></b>&nbsp;", "limitation": "Quelle prüfen"}):
            with self.subTest(payload=payload), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                old_notes = {"skeptic": {"test": "Keep exactly"},
                             "synthesizer": {"next_step": "Read source"}}
                target.write_text(json.dumps({"items": [{
                    "id": "10.1234/synthetic", "date": "2026-11-01",
                    "title": "Synthetic metadata candidate", "agent_notes": old_notes}]}))
                with patch.object(w, "OUT", target), \
                     patch.object(w, "NOW", dt.datetime(2026, 11, 5, tzinfo=dt.timezone.utc)), \
                     patch.object(w, "AI_ENABLED", True), \
                     patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                     patch.object(w, "MAX_ANALYSES", 1), \
                     patch.object(w.time, "sleep"), \
                     patch.object(w, "discover", return_value=[]), \
                     patch.object(w, "discover_arxiv", return_value=[]), \
                     patch.object(w.urllib.request, "urlopen", return_value=self.response(payload)) as request:
                    w.main()
                data = json.loads(target.read_text())
                self.assertEqual(data["items"][0]["agent_notes"], old_notes)
                self.assertIn("methodologist: ValueError", data["errors"])
                self.assertEqual(request.call_count, 1)


class AgentEnvelopeTest(unittest.TestCase):
    def test_malformed_external_envelopes_raise_controlled_value_error(self):
        cases = [None, [], {}, {"choices": []}, {"choices": None},
                 {"choices": {}}, {"choices": [None]}, {"choices": [7]},
                 {"choices": [{"finish_reason": "stop", "message": None}]},
                 {"choices": [{"finish_reason": "stop", "message": {}}]},
                 {"choices": [{"finish_reason": "stop", "message": {"content": None}}]}]
        for envelope in cases:
            with self.subTest(envelope=envelope), \
                 patch.object(w, "AI_ENABLED", True), \
                 patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                 patch.object(w.urllib.request, "urlopen", return_value=io.BytesIO(json.dumps(envelope).encode())):
                with self.assertRaisesRegex(ValueError, "Unexpected agent response"):
                    w.call_agent("methodologist", {})

    def test_invalid_envelope_keeps_discovery_and_other_notes(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            old_notes = {"skeptic": {"test": "Keep exactly"},
                         "synthesizer": {"next_step": "Read source"}}
            old = {"id": "10.1234/old", "date": "2026-11-01",
                   "title": "Synthetic older candidate", "agent_notes": old_notes}
            fresh = {"id": "10.1234/new", "date": "2026-10-30",
                     "title": "Synthetic discovered candidate", "agent_notes": {}}
            target.write_text(json.dumps({"items": [old]}))
            with patch.object(w, "OUT", target), \
                 patch.object(w, "NOW", dt.datetime(2026, 11, 5, tzinfo=dt.timezone.utc)), \
                 patch.object(w, "AI_ENABLED", True), \
                 patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                 patch.object(w, "MAX_ANALYSES", 1), \
                 patch.object(w.time, "sleep"), \
                 patch.object(w, "discover", return_value=[fresh]), \
                 patch.object(w, "discover_arxiv", return_value=[]), \
                 patch.object(w.urllib.request, "urlopen", return_value=io.BytesIO(b'{"choices":[]}')) as request:
                w.main()
            data = json.loads(target.read_text())
            rows = {row["id"]: row for row in data["items"]}
            self.assertEqual(rows[old["id"]]["agent_notes"], old_notes)
            self.assertEqual(rows[fresh["id"]]["agent_notes"], {})
            self.assertEqual(data["new_items"], 1)
            self.assertIn("methodologist: ValueError", data["errors"])
            self.assertEqual(request.call_count, 1)

    def test_unrelated_programming_error_still_aborts(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            original = json.dumps({"items": [{"id": "10.1234/old", "date": "2026-11-01",
                "title": "Synthetic existing candidate", "agent_notes": {}}]})
            target.write_text(original)
            with patch.object(w, "OUT", target), \
                 patch.object(w, "NOW", dt.datetime(2026, 11, 5, tzinfo=dt.timezone.utc)), \
                 patch.object(w, "AI_ENABLED", True), \
                 patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                 patch.object(w, "MAX_ANALYSES", 1), \
                 patch.object(w.time, "sleep"), \
                 patch.object(w, "discover", return_value=[]), \
                 patch.object(w, "discover_arxiv", return_value=[]), \
                 patch.object(w, "call_agent", side_effect=RuntimeError("synthetic internal failure")):
                with self.assertRaisesRegex(RuntimeError, "internal failure"):
                    w.main()
            self.assertEqual(target.read_text(), original)


class AgentByteBudgetTest(unittest.TestCase):
    @staticmethod
    def payload(size, unicode=False):
        content = json.dumps({"question": "What remains open?", "limitation": "Metadata only"})
        envelope = {"choices": [{"finish_reason": "stop", "message": {"content": content}}], "padding": ""}
        raw = json.dumps(envelope, ensure_ascii=False).encode()
        spare = size - len(raw)
        envelope["padding"] = ("ä" * (spare // 2) + "x" * (spare % 2)) if unicode else "x" * spare
        raw = json.dumps(envelope, ensure_ascii=False).encode()
        assert len(raw) == size
        return raw

    def test_boundary_is_checked_in_bytes_before_json_parsing(self):
        class Response(io.BytesIO):
            def __init__(self, data):
                super().__init__(data)
                self.read_sizes = []
            def read(self, size=-1):
                self.read_sizes.append(size)
                return super().read(size)
        for size, unicode in ((999_999, False), (1_000_000, False),
                              (1_000_001, False), (1_000_001, True)):
            raw = self.payload(size, unicode)
            response = Response(raw)
            original_loads = json.loads
            with self.subTest(size=size, unicode=unicode), \
                 patch.object(w, "AI_ENABLED", True), \
                 patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                 patch.object(w.urllib.request, "urlopen", return_value=response), \
                 patch.object(w.json, "loads", wraps=original_loads) as parse:
                if size > 1_000_000:
                    with self.assertRaisesRegex(ValueError, "size limit"):
                        w.call_agent("methodologist", {})
                    parse.assert_not_called()
                else:
                    self.assertEqual(w.call_agent("methodologist", {}), {
                        "question": "What remains open?", "limitation": "Metadata only"})
                self.assertEqual(response.read_sizes, [1_000_001])

    def test_oversize_keeps_discovery_and_other_notes(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "stream.json"
            notes = {"skeptic": {"test": "Keep exactly"}, "synthesizer": {"next_step": "Read source"}}
            old = {"id": "10.1234/old", "date": "2026-11-01", "title": "Synthetic older candidate", "agent_notes": notes}
            fresh = {"id": "10.1234/new", "date": "2026-10-30", "title": "Synthetic discovered candidate", "agent_notes": {}}
            target.write_text(json.dumps({"items": [old]}))
            with patch.object(w, "OUT", target), \
                 patch.object(w, "NOW", dt.datetime(2026, 11, 5, tzinfo=dt.timezone.utc)), \
                 patch.object(w, "AI_ENABLED", True), \
                 patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                 patch.object(w, "MAX_ANALYSES", 1), \
                 patch.object(w.time, "sleep"), \
                 patch.object(w, "discover", return_value=[fresh]), \
                 patch.object(w, "discover_arxiv", return_value=[]), \
                 patch.object(w.urllib.request, "urlopen", return_value=io.BytesIO(self.payload(1_000_001))) as request:
                w.main()
            data = json.loads(target.read_text())
            rows = {row["id"]: row for row in data["items"]}
            self.assertEqual(rows[old["id"]]["agent_notes"], notes)
            self.assertEqual(rows[fresh["id"]]["agent_notes"], {})
            self.assertEqual(data["new_items"], 1)
            self.assertIn("methodologist: ValueError", data["errors"])
            self.assertEqual(request.call_count, 1)


class AgentHTTPCompletionTest(unittest.TestCase):
    @staticmethod
    def response(framing):
        body = json.dumps({"choices": [{"finish_reason": "stop", "message": {"content": json.dumps({
            "question": "What remains open?", "limitation": "Metadata only"})}}]}).encode()
        if framing in ("length", "incomplete_length"):
            length = len(body) + (17 if framing == "incomplete_length" else 0)
            wire = b'HTTP/1.1 200 OK\r\nContent-Length: ' + str(length).encode() + b'\r\n\r\n' + body
        elif framing == "unknown":
            wire = b'HTTP/1.1 200 OK\r\nConnection: close\r\n\r\n' + body
        else:
            wire = (b'HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n' +
                    f'{len(body):x}'.encode() + b'\r\n' + body + b'\r\n' +
                    (b'0\r\n\r\n' if framing == "chunked" else b''))
        class FakeSocket:
            def makefile(self, mode):
                return io.BytesIO(wire)
        response = http.client.HTTPResponse(FakeSocket())
        response.begin()
        return response

    def test_complete_and_unknown_length_controls_remain_usable(self):
        for framing in ("length", "chunked", "unknown"):
            with self.subTest(framing=framing), \
                 patch.object(w, "AI_ENABLED", True), \
                 patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                 patch.object(w.urllib.request, "urlopen", return_value=self.response(framing)):
                self.assertEqual(w.call_agent("methodologist", {}), {
                    "question": "What remains open?", "limitation": "Metadata only"})

    def test_known_incomplete_http_rejected_before_json_parser(self):
        for framing in ("incomplete_length", "incomplete_chunked"):
            with self.subTest(framing=framing), \
                 patch.object(w, "AI_ENABLED", True), \
                 patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                 patch.object(w.urllib.request, "urlopen", return_value=self.response(framing)), \
                 patch.object(w.json, "loads") as parse:
                with self.assertRaisesRegex(ValueError, "Incomplete agent HTTP response"):
                    w.call_agent("methodologist", {})
                parse.assert_not_called()

    def test_incomplete_response_preserves_discovery_and_other_notes(self):
        for framing in ("incomplete_length", "incomplete_chunked"):
            with self.subTest(framing=framing), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / "stream.json"
                notes = {"skeptic": {"test": "Keep exactly"}, "synthesizer": {"next_step": "Read source"}}
                old = {"id": "10.1234/old", "date": "2026-11-01", "title": "Synthetic older candidate", "agent_notes": notes}
                fresh = {"id": "10.1234/new", "date": "2026-10-30", "title": "Synthetic discovered candidate", "agent_notes": {}}
                target.write_text(json.dumps({"items": [old]}))
                with patch.object(w, "OUT", target), \
                     patch.object(w, "NOW", dt.datetime(2026, 11, 5, tzinfo=dt.timezone.utc)), \
                     patch.object(w, "AI_ENABLED", True), \
                     patch.object(w, "API_KEY", "synthetic-not-a-key"), \
                     patch.object(w, "MAX_ANALYSES", 1), \
                     patch.object(w.time, "sleep"), \
                     patch.object(w, "discover", return_value=[fresh]), \
                     patch.object(w, "discover_arxiv", return_value=[]), \
                     patch.object(w.urllib.request, "urlopen", return_value=self.response(framing)) as request:
                    w.main()
                data = json.loads(target.read_text())
                rows = {row["id"]: row for row in data["items"]}
                self.assertEqual(rows[old["id"]]["agent_notes"], notes)
                self.assertEqual(rows[fresh["id"]]["agent_notes"], {})
                self.assertEqual(data["new_items"], 1)
                self.assertIn("methodologist: ValueError", data["errors"])
                self.assertEqual(request.call_count, 1)


if __name__ == "__main__":
    unittest.main()
