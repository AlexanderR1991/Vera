"""Synthetic Git fixtures; no model or network requests."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from scripts import angriffsschwarm as a


class SourceBindingTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.git('init', '--quiet')
        docs = {'docs/grundtext.md': '\n\n'.join(
            f'## These {n:02}: Synthetic claim\nCOMMITTED synthetic source.' for n in range(1, 10))}
        for _, path, heading in a.PROGRAM_SECTIONS:
            docs[path] = docs.get(path, '') + f'\n\n## {heading}\nCOMMITTED synthetic source.\n'
        for name, text in docs.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding='utf-8')
        self.git('add', 'docs')
        self.commit = self.save_commit()
        self.output = self.root / 'output.json'
        self.original = b'{"items":[]}'
        self.output.write_bytes(self.original)
        self.enterContext(patch.object(a, 'ROOT', self.root))
        self.enterContext(patch.object(a, 'OUTPUT', self.output))
        self.enterContext(patch.object(a, 'AI_ENABLED', True))
        self.enterContext(patch.object(a, 'API_KEY', 'synthetic-not-a-key'))
        self.enterContext(patch.dict(os.environ, {'GITHUB_SHA': self.commit}))
        self.network = self.enterContext(patch.object(a, 'open_response', side_effect=AssertionError('No network')))

    def git(self, *args):
        return subprocess.check_output(['git', '-C', str(self.root), *args], stderr=subprocess.DEVNULL).decode().strip()

    def save_commit(self):
        self.git('-c', 'user.name=Synthetic', '-c', 'user.email=test@example.invalid',
                 '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Synthetic sources')
        return self.git('rev-parse', 'HEAD')

    @staticmethod
    def fake_call(role, payload):
        answer = {field: 'Synthetic unverified reply' for field in a.ROLE_FIELDS[role]}
        if role == 'assessor':
            answer['disposition'] = 'needs_evidence'
        return answer

    def test_working_tree_changes_and_symlinks_never_supply_model_payloads(self):
        for kind in ['edited', 'symlink']:
            with self.subTest(kind=kind):
                for name in {'docs/grundtext.md', *(row[1] for row in a.PROGRAM_SECTIONS)}:
                    path = self.root / name
                    if path.is_symlink():
                        path.unlink()
                    text = self.git('show', self.commit + ':' + name).replace('COMMITTED', 'UNCOMMITTED')
                    if kind == 'symlink':
                        target = self.root / ('synthetic-target-' + path.name)
                        target.write_text(text, encoding='utf-8')
                        path.unlink()
                        path.symlink_to(target)
                    else:
                        path.write_text(text, encoding='utf-8')
                captured = []
                def call(role, payload):
                    captured.append(payload['claim']['excerpt'])
                    return self.fake_call(role, payload)
                with patch.object(a, 'api_call', side_effect=call):
                    self.assertEqual(a.main(), 0)
                self.assertEqual(len(captured), 3)
                self.assertTrue(all('COMMITTED synthetic source.' in text and 'UNCOMMITTED' not in text for text in captured))
                self.assertEqual(json.loads(self.output.read_text())['items'][0]['source_commit'], self.commit)
                self.network.assert_not_called()

    def test_record_commit_is_the_one_captured_before_role_calls(self):
        def call(role, payload):
            os.environ['GITHUB_SHA'] = 'f' * 40
            return self.fake_call(role, payload)
        with patch.object(a, 'api_call', side_effect=call):
            self.assertEqual(a.main(), 0)
        self.assertEqual(json.loads(self.output.read_text())['items'][0]['source_commit'], self.commit)

    def test_invalid_missing_and_noncommit_objects_stop_before_roles(self):
        for ref in ['not-a-commit', '0' * 40, self.git('rev-parse', 'HEAD^{tree}')]:
            with self.subTest(ref=ref), patch.dict(os.environ, {'GITHUB_SHA': ref}), patch.object(a, 'api_call') as call:
                with self.assertRaises(ValueError):
                    a.main()
                call.assert_not_called()
                self.assertEqual(self.output.read_bytes(), self.original)
                self.network.assert_not_called()

    def test_committed_symlink_is_not_a_regular_source_blob(self):
        path = self.root / 'docs/grundtext.md'
        path.unlink()
        path.symlink_to('../synthetic-target')
        self.git('add', 'docs/grundtext.md')
        commit = self.save_commit()
        with patch.dict(os.environ, {'GITHUB_SHA': commit}), patch.object(a, 'api_call') as call:
            with self.assertRaises(ValueError):
                a.main()
            call.assert_not_called()
        self.assertEqual(self.output.read_bytes(), self.original)

    def test_local_run_without_github_sha_records_exact_head(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(a, 'api_call', side_effect=self.fake_call):
            self.assertEqual(a.main(), 0)
        row = json.loads(self.output.read_text())['items'][0]
        self.assertEqual(row['source_commit'], self.commit)
        self.assertIn('COMMITTED', row['excerpt'])
