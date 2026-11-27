"""Bounded synthetic HTTP bodies; no network or paid model calls."""
from contextlib import redirect_stdout
import http.client
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts import angriffsschwarm as a

BUDGET = 1_000_000


def payload(role, size=None, metadata=''):
    fields = {key: 'Synthetic text' for key in a.ROLE_FIELDS[role]}
    if role == 'assessor':
        fields['disposition'] = 'needs_evidence'
    data = json.dumps({'choices': [{'finish_reason': 'stop', 'message': {
        'content': json.dumps(fields)}}], 'metadata': metadata}, ensure_ascii=False).encode('utf-8')
    return data if size is None else data + b' ' * (size - len(data))


class RecordingBody(io.BytesIO):
    def __init__(self, data):
        super().__init__(data)
        self.sizes = []
        self.consumed = 0
    def read(self, size=-1):
        self.sizes.append(size)
        data = super().read(size)
        self.consumed += len(data)
        return data


def http_response(data, extra=0):
    class Socket:
        def makefile(self, *args):
            return io.BytesIO(b'HTTP/1.1 200 OK\r\nContent-Length: ' +
                              str(len(data) + extra).encode() + b'\r\n\r\n' + data)
    response = http.client.HTTPResponse(Socket())
    response.begin()
    return response


class ResponseBudgetTest(unittest.TestCase):
    def setUp(self):
        self.enterContext(patch.object(a, 'AI_ENABLED', True))
        self.enterContext(patch.object(a, 'API_KEY', 'synthetic-not-a-key'))

    def test_boundary_for_each_role(self):
        original_loads = json.loads
        for role in a.ROLE_FIELDS:
            for size in [BUDGET - 1, BUDGET, BUDGET + 1, 2 * BUDGET]:
                with self.subTest(role=role, size=size):
                    body = RecordingBody(payload(role, size))
                    with patch.object(a, 'open_response', return_value=body), \
                         patch.object(a.json, 'loads', wraps=original_loads) as parse:
                        if size > BUDGET:
                            with self.assertRaises(ValueError):
                                a.api_call(role, {'claim': 'Synthetic'})
                            parse.assert_not_called()
                        else:
                            self.assertEqual(set(a.api_call(role, {})), set(a.ROLE_FIELDS[role]))
                    self.assertEqual(body.sizes, [BUDGET + 1])
                    self.assertLessEqual(body.consumed, BUDGET + 1)

    def test_multibyte_body_is_limited_in_bytes(self):
        data = payload('adversary', metadata='ü' * (BUDGET // 2))
        self.assertLess(len(data.decode('utf-8')), BUDGET)
        self.assertGreater(len(data), BUDGET)
        body = RecordingBody(data)
        with patch.object(a, 'open_response', return_value=body):
            with self.assertRaises(ValueError):
                a.api_call('adversary', {})
        self.assertLessEqual(body.consumed, BUDGET + 1)

    def test_oversized_phase_stops_later_roles_and_keeps_archive(self):
        roles = list(a.ROLE_FIELDS)
        claim = {'id': 'synthetic', 'source': 'docs/methode.md', 'heading': 'Synthetic',
                 'excerpt': 'Synthetic text', 'source_commit': 'a' * 40}
        for phase in range(3):
            with self.subTest(phase=phase), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / 'archive.json'
                original = b'{"items":[]}'
                target.write_bytes(original)
                responses = [RecordingBody(payload(role, 2 * BUDGET if i == phase else None))
                             for i, role in enumerate(roles)]
                with patch.object(a, 'OUTPUT', target), patch.object(a, 'cases', return_value=[claim]), \
                     patch.object(a, 'open_response', side_effect=responses) as request, redirect_stdout(io.StringIO()):
                    with self.assertRaises(ValueError):
                        a.main()
                    self.assertEqual(request.call_count, phase + 1)
                self.assertEqual(target.read_bytes(), original)
                self.assertEqual(list(Path(tmp).iterdir()), [target])
                for body in responses:
                    body.close()

    def test_incomplete_read_is_reported_as_validation_error(self):
        body = io.BytesIO()
        with patch.object(a, 'open_response', return_value=body), \
             patch.object(body, 'read', side_effect=http.client.IncompleteRead(b'{}', 5)):
            with self.assertRaises(ValueError):
                a.api_call('adversary', {})

    def test_valid_json_with_declared_remaining_bytes_is_rejected(self):
        response = http_response(payload('adversary'), extra=10)
        with patch.object(a, 'open_response', return_value=response):
            with self.assertRaises(ValueError):
                a.api_call('adversary', {})

    def test_complete_declared_http_response_still_works(self):
        response = http_response(payload('adversary'))
        with patch.object(a, 'open_response', return_value=response):
            self.assertEqual(set(a.api_call('adversary', {})), set(a.ROLE_FIELDS['adversary']))
