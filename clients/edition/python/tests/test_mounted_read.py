"""Read a released file through the same HTTP boundary used by a mounted client."""
import asyncio
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from threading import Thread
import unittest
from urllib.parse import parse_qs, urlsplit

from edition_vfs import ContentClient, SpaceProblem
from edition_vfs.tree import ResourceTree


class Reader(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.headers.get("Authorization") != "Bearer test-reader" or not self.server.readable:
            self.reply(403, {"code": "permission_denied", "traceId": "denied-read"})
            return
        url = urlsplit(self.path)
        endpoint = url.path.removeprefix("/api/content/spaces/docs/")
        query = parse_qs(url.query)
        if endpoint == "snapshot":
            self.reply(200, {"snapshot": "first-release"})
        elif query.get("snapshot") != ["first-release"]:
            self.reply(409, {"code": "snapshot_changed"})
        elif endpoint == "files":
            self.reply(200, {"snapshot": "first-release", "entries": [{"path": "/guide.md"}], "nextCursor": None})
        elif endpoint == "stat":
            row = {"kind": "directory"} if query["path"] == ["/"] else {"kind": "file", "sha256": self.server.digest}
            self.reply(200, row)
        elif endpoint == "content":
            etag = '"' + self.server.digest + '"'
            cached = self.headers.get("If-None-Match") == etag
            self.reply(304 if cached else 200, b"" if cached else self.server.body, etag)
        else:
            self.reply(404, {"code": "not_found"})

    def reply(self, status, value, etag=None):
        binary = isinstance(value, bytes)
        self.send_response(status)
        self.send_header("Content-Type", "application/octet-stream" if binary else "application/json")
        if etag:
            self.send_header("ETag", etag)
        self.end_headers()
        self.wfile.write(value if binary else json.dumps(value).encode())

    def log_message(self, *args):
        pass


class MountedReadTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Reader)
        self.server.body = b"released guide"
        self.server.digest = hashlib.sha256(self.server.body).hexdigest()
        self.server.readable = True
        thread = Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.01})
        thread.start()
        self.addCleanup(self.server.server_close)
        self.addCleanup(thread.join)
        self.addAsyncCleanup(asyncio.to_thread, self.server.shutdown)
        origin = f"http://127.0.0.1:{self.server.server_port}"
        self.tree = ResourceTree(ContentClient(origin, "reader.example", "docs", "test-reader"))
        self.addAsyncCleanup(self.tree.close)

    async def test_cached_file_stops_serving_bytes_after_permission_is_revoked(self):
        self.assertEqual(await self.tree.children("/"), ["guide.md"])
        file = await self.tree.open("/guide.md")
        self.assertEqual(await self.tree.read(file, 8, 0), b"released")
        self.assertEqual(await self.tree.read(file, 5, 9), b"guide")
        self.server.readable = False
        with self.assertRaises(SpaceProblem) as failure:
            await self.tree.read(file, 8, 0)
        self.assertEqual((failure.exception.http_status, failure.exception.code), (403, "permission_denied"))

    async def test_reader_rejects_bytes_that_do_not_match_the_opened_release(self):
        file = await self.tree.open("/guide.md")
        self.server.body = b"different revision"
        with self.assertRaises(SpaceProblem) as failure:
            await self.tree.read(file, 64, 0)
        self.assertEqual(failure.exception.code, "delivery_unavailable")
