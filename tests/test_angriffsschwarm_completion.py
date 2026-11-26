"""Technical completion guards, with synthetic HTTP responses only."""
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from scripts import angriffsschwarm as a

MISSING = object()


def response(role, reason='stop'):
    fields = {name: 'Synthetic unverified text' for name in a.ROLE_FIELDS[role]}
    if role == 'assessor':
        fields['disposition'] = 'needs_evidence'
    choice = {'message': {'content': json.dumps(fields)}}
    if reason is not MISSING:
        choice['finish_reason'] = reason
    return io.StringIO(json.dumps({'choices': [choice]}))


class CompletionContractTest(unittest.TestCase):
    def setUp(self):
        self.enterContext(patch.object(a, 'API_KEY', 'synthetic-not-a-key'))
        self.enterContext(patch.object(a, 'AI_ENABLED', True))

    def test_explicit_stop_remains_supported_for_every_role(self):
        for role in a.ROLE_FIELDS:
            with self.subTest(role=role), patch.object(a, 'open_response', return_value=response(role)) as request:
                fields = a.api_call(role, {'claim': 'Synthetic'})
                self.assertEqual(set(fields), set(a.ROLE_FIELDS[role]))
                self.assertEqual(request.call_count, 1)

    def test_complete_json_does_not_override_nonregular_or_missing_finish_reason(self):
        for role in a.ROLE_FIELDS:
            for reason in ['length', 'content_filter', 'error', 'tool_calls', 'unexpected', None, MISSING]:
                with self.subTest(role=role, reason=str(reason)), patch.object(a, 'open_response', return_value=response(role, reason)) as request:
                    with self.assertRaises(ValueError):
                        a.api_call(role, {'claim': 'Synthetic'})
                    self.assertEqual(request.call_count, 1, 'No automatic retry')

    def test_incomplete_phase_stops_before_later_roles_and_preserves_archive(self):
        roles = list(a.ROLE_FIELDS)
        for phase in range(3):
            for reason in ['length', 'content_filter', MISSING]:
                with self.subTest(phase=phase, reason=str(reason)), tempfile.TemporaryDirectory() as tmp:
                    output = Path(tmp) / 'archive.json'
                    original = b'{"items":[{"id":"keep","generated_at":"2020-01-01"}]}'
                    output.write_bytes(original)
                    replies = [response(role, reason if i == phase else 'stop') for i, role in enumerate(roles)]
                    try:
                        with patch.object(a, 'OUTPUT', output), patch.object(a, 'open_response', side_effect=replies) as request:
                            with self.assertRaises(ValueError):
                                a.main()
                            self.assertEqual(request.call_count, phase + 1)
                            self.assertEqual(output.read_bytes(), original)
                    finally:
                        for reply in replies:
                            reply.close()

    def test_three_regular_roles_still_write_an_unverified_draft(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / 'archive.json'
            output.write_text('{"items":[]}', encoding='utf-8')
            replies = [response(role) for role in a.ROLE_FIELDS]
            with patch.object(a, 'OUTPUT', output), patch.object(a, 'open_response', side_effect=replies) as request:
                self.assertEqual(a.main(), 0)
            self.assertEqual(request.call_count, 3)
            archive = json.loads(output.read_text())
            self.assertEqual(archive['review_status'], 'unverified_ai_draft')
            self.assertEqual(archive['items'][0]['review_status'], 'unverified_ai_draft')
