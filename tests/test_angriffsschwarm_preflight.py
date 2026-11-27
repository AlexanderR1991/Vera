"""Known local archive failures must precede role work; all roles are mocks."""
from contextlib import nullcontext, redirect_stdout
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts import angriffsschwarm as a


class ArchivePreflightTest(unittest.TestCase):
    def run_case(self, content, *, error=None, enabled=True):
        claim = {'id': 'synthetic', 'source': 'docs/methode.md', 'heading': 'Synthetic',
                 'excerpt': 'Synthetic', 'source_commit': 'a' * 40}
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / 'archive.json'
            if content is not None:
                target.write_bytes(content)
            read_failure = patch.object(Path, 'read_text', side_effect=error) if error else nullcontext()
            invalid = content is None or content != b'{"items":[]}' or error is not None
            with patch.object(a, 'OUTPUT', target), patch.object(a, 'AI_ENABLED', enabled), \
                 patch.object(a, 'API_KEY', 'synthetic-not-a-key'), patch.object(a, 'cases', return_value=[claim]), \
                 patch.object(a, 'api_call', return_value={'unverified': 'synthetic'}) as role, \
                 patch.object(a, 'open_response') as network, read_failure, redirect_stdout(io.StringIO()):
                if enabled and invalid:
                    with self.assertRaises((OSError, ValueError)):
                        a.main()
                else:
                    self.assertEqual(a.main(), 0)
                self.assertEqual(role.call_count, 3 if enabled and not invalid else 0)
                network.assert_not_called()
            if not enabled or invalid:
                self.assertEqual(target.read_bytes() if target.exists() else None, content)
                self.assertEqual(sorted(p.name for p in Path(tmp).iterdir()), ['archive.json'] if content is not None else [])
            else:
                archive = json.loads(target.read_text())
                self.assertEqual(archive['review_status'], 'unverified_ai_draft')
                self.assertEqual(len(archive['items']), 1)

    def test_malformed_json_and_shapes_stop_before_roles(self):
        for content in [b'{', b'[]', b'null', b'{}', b'{"items":{}}', b'{"items":null}', b'\xff']:
            with self.subTest(content=content):
                self.run_case(content)

    def test_missing_and_unreadable_archives_stop_before_roles(self):
        self.run_case(None)
        self.run_case(b'{"items":[]}', error=OSError('Synthetic read failure'))

    def test_disabled_run_does_not_read_archive_or_call_roles(self):
        self.run_case(None, error=AssertionError('Disabled path must not read archive'), enabled=False)

    def test_valid_archive_still_allows_three_roles(self):
        self.run_case(b'{"items":[]}')
