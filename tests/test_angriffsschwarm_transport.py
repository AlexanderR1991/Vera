"""Real urllib routing and HTTP parsing over local fake sockets only."""
import http.client
import importlib.util
import io
from pathlib import Path
import ssl
import unittest
from unittest.mock import patch
import urllib.error
import urllib.request

spec = importlib.util.spec_from_file_location('attack_transport', Path(__file__).parents[1] / 'scripts/angriffsschwarm.py')
a = importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)


class CountingFile(io.BytesIO):
    def __init__(self, data):
        super().__init__(data)
        self.reads = []

    def read(self, n=-1):
        result = super().read(n)
        self.reads.append((n, len(result)))
        return result


class FakeSocket:
    def __init__(self, stream):
        self.stream = stream

    def makefile(self, mode):
        assert mode == 'rb'
        return self.stream

    def sendall(self, data):
        pass

    def close(self):
        pass


def frame(body, framing='chunked', status=200):
    header = f'HTTP/1.1 {status} Synthetic\r\n'.encode()
    if status != 200:
        header += b'Location: https://unvisited.invalid/\r\n'
    if framing == 'chunked':
        size = format(len(body), 'x').encode()
        return header + b'Transfer-Encoding: chunked\r\n\r\n' + size + b'\r\n' + body + b'\r\n0\r\n\r\n'
    if framing == 'length':
        return header + b'Content-Length: ' + str(len(body)).encode() + b'\r\n\r\n' + body
    return header + b'Connection: close\r\n\r\n' + body


class TransportTests(unittest.TestCase):
    def setUp(self):
        self.frames = []
        self.streams = []
        self.requests = []
        owner = self

        class FakeMixin:
            def request(self, method, url, body=None, headers=None, *, encode_chunked=False):
                owner.requests.append((self.__class__.__name__, method, url))
                return super().request(method, url, body, headers or {}, encode_chunked=encode_chunked)

            def connect(self):
                stream = CountingFile(owner.frames.pop(0))
                owner.streams.append(stream)
                self.sock = FakeSocket(stream)

        class LocalHTTP(FakeMixin, a.StrictHTTPConnection):
            pass

        class LocalHTTPS(FakeMixin, a.StrictHTTPSConnection):
            pass

        self.enterContext(patch.object(a, 'StrictHTTPConnection', LocalHTTP))
        self.enterContext(patch.object(a, 'StrictHTTPSConnection', LocalHTTPS))
        self.enterContext(patch.object(urllib.request, 'getproxies', return_value={}))

    def test_negative_parsed_chunk_size_is_rejected(self):
        for connection in (a.StrictHTTPConnection, a.StrictHTTPSConnection):
            with self.subTest(connection=connection.__name__):
                stream = CountingFile(b'')
                with connection.response_class(FakeSocket(stream)) as response:
                    with patch.object(http.client.HTTPResponse, '_read_next_chunk_size', return_value=-1):
                        with self.assertRaisesRegex(ValueError, 'Negative HTTP chunk size'):
                            response._read_next_chunk_size()
                self.assertEqual(stream.reads, [])

    def test_normal_framing_and_body_boundaries(self):
        for scheme in ('http', 'https'):
            for framing in ('length', 'chunked', 'eof'):
                for size in (13, a.MAX_RESPONSE_BYTES-1, a.MAX_RESPONSE_BYTES, a.MAX_RESPONSE_BYTES+1):
                    with self.subTest(scheme=scheme, framing=framing, size=size):
                        self.frames.append(frame(b'x' * size, framing))
                        with a.open_response(scheme + '://synthetic.invalid/') as response:
                            self.assertEqual(len(response.read(a.MAX_RESPONSE_BYTES + 1)), size)

    def test_redirects_refused_without_body_reads_or_followup(self):
        for scheme in ('http', 'https'):
            for code in (301, 302, 303, 307, 308):
                for method in ('GET', 'POST'):
                    with self.subTest(scheme=scheme, code=code, method=method):
                        count = len(self.requests)
                        self.frames.append(frame(b'x' * (a.MAX_RESPONSE_BYTES + 123), status=code))
                        req = urllib.request.Request(scheme + '://synthetic.invalid/', method=method)
                        with self.assertRaises(urllib.error.HTTPError) as raised:
                            a.open_response(req)
                        self.assertEqual(raised.exception.code, code)
                        self.assertEqual(len(self.requests), count + 1)
                        self.assertEqual(self.streams[-1].reads, [])
                        self.assertTrue(self.streams[-1].closed)

    def test_error_bodies_also_closed_unread(self):
        self.frames.append(frame(b'x' * (a.MAX_RESPONSE_BYTES + 123), status=500))
        with self.assertRaises(urllib.error.HTTPError):
            a.open_response('https://synthetic.invalid/')
        self.assertEqual(self.streams[-1].reads, [])
        self.assertTrue(self.streams[-1].closed)

    def test_https_handler_preserves_default_and_explicit_context(self):
        handler = a.StrictHTTPSHandler()
        req = urllib.request.Request('https://synthetic.invalid/')
        with patch.object(handler, 'do_open', return_value='synthetic') as do_open:
            self.assertEqual(handler.https_open(req), 'synthetic')
            self.assertIs(do_open.call_args.kwargs['context'], handler._context)
        context = ssl.create_default_context()
        self.assertTrue(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)
        handler = a.StrictHTTPSHandler(context=context)
        with patch.object(handler, 'do_open') as do_open:
            handler.https_open(req)
            self.assertIs(do_open.call_args.kwargs['context'], context)

    def test_connections_use_strict_response_without_global_opener(self):
        self.assertIs(a.StrictHTTPConnection.response_class, a.StrictHTTPResponse)
        self.assertIs(a.StrictHTTPSConnection.response_class, a.StrictHTTPResponse)
        self.frames.append(frame(b'normal'))
        with patch.object(urllib.request, 'install_opener', side_effect=AssertionError('global opener mutation')):
            with a.open_response('https://synthetic.invalid/') as response:
                self.assertIsInstance(response, a.StrictHTTPResponse)
                self.assertEqual(response.read(20), b'normal')


if __name__ == '__main__':
    unittest.main()
