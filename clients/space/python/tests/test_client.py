import hashlib
import http.server
import json
import threading
import unittest
from unittest.mock import AsyncMock, patch
from urllib.parse import parse_qs, urlparse, unquote

from space_vfs.cache import ByteCache
from space_vfs.client import ContentClient
from space_vfs.config import SpaceConfig
from space_vfs.errors import SpaceProblem
from space_vfs.identity import FAMILY, client_header, user_agent


class FakeReader(http.server.BaseHTTPRequestHandler):
    snapshot = "snap-1"
    token = "spc_ok"
    invalid_token = "bad"
    seen = []
    pages = {
        "/page-0.md": {
            "kind": "file",
            "size": None,
            "sha256": None,
            "text": "hello vfs\n",
        },
        "/hidden.md": {
            "kind": "file",
            "size": None,
            "sha256": None,
            "text": "unlisted\n",
        },
        "/secret.md": {
            "kind": "file",
            "size": None,
            "sha256": None,
            "text": "restricted\n",
            "hidden": True,
        },
    }

    def log_message(self, *_args):
        return

    def do_GET(self):
        parsed = urlparse(self.path)
        route = parsed.path
        query = {key: unquote(values[0]) for key, values in parse_qs(parsed.query).items()}
        FakeReader.seen.append(
            {
                "path": route,
                "user_agent": self.headers.get("User-Agent"),
                "space_client": self.headers.get("X-Space-Client"),
            }
        )
        auth = self.headers.get("Authorization")
        if auth == "Bearer " + self.invalid_token:
            return self._problem(401, "invalid_token")
        visible = self._visible(auth)
        if route.endswith("/snapshot"):
            return self._json({"snapshot": self.snapshot, "slug": "docs", "maxConcurrentReads": 4})
        if route.endswith("/files"):
            if query.get("snapshot") != self.snapshot:
                return self._problem(409, "snapshot_changed")
            entries = [{"path": path, "kind": "directory"} for path in sorted(self._directories(visible))]
            entries.extend(self._entry(path, row) for path, row in visible.items())
            return self._json({"snapshot": self.snapshot, "entries": entries, "nextCursor": None})
        if route.endswith("/stat"):
            if query.get("snapshot") != self.snapshot:
                return self._problem(409, "snapshot_changed")
            path = query.get("path")
            if path in self._directories(visible):
                return self._json({"path": path, "kind": "directory", "size": None, "sha256": None})
            row = visible.get(path)
            if row is None:
                hidden = self.pages.get(path)
                if hidden and hidden.get("hidden") and auth == "Bearer " + self.token:
                    return self._problem(403, "read_forbidden")
                return self._problem(404, "file_not_found")
            return self._json(self._entry(path, row))
        if route.endswith("/content"):
            if query.get("snapshot") != self.snapshot:
                return self._problem(409, "snapshot_changed")
            path = query.get("path")
            row = visible.get(path)
            if row is None:
                return self._problem(404, "file_not_found")
            payload = row["text"].encode()
            digest = hashlib.sha256(payload).hexdigest()
            incoming = (self.headers.get("If-None-Match") or "").strip('"')
            if incoming == digest:
                self.send_response(304)
                self.send_header("ETag", f'"{digest}"')
                self.end_headers()
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/markdown;charset=UTF-8")
            self.send_header("ETag", f'"{digest}"')
            self.end_headers()
            self.wfile.write(payload)
            return
        if self.command != "GET":
            return self._problem(405, "method_not_allowed")
        return self._problem(404, "file_not_found")

    def do_POST(self):
        self._problem(403, "method_not_allowed")

    def _directories(self, visible):
        found = {"/"}
        for path in visible:
            parts = path.strip("/").split("/")
            prefix = ""
            for part in parts[:-1]:
                prefix += "/" + part
                found.add(prefix)
        return found

    def _visible(self, auth):
        allowed = {}
        for path, row in self.pages.items():
            if row.get("hidden"):
                continue
            allowed[path] = row
        return allowed

    def _entry(self, path, row):
        payload = row["text"].encode()
        return {
            "path": path,
            "kind": "file",
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        }

    def _json(self, body):
        data = json.dumps(body).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(data)

    def _problem(self, status, code):
        data = json.dumps({"status": status, "code": code, "traceId": "t"}).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/problem+json")
        self.end_headers()
        self.wfile.write(data)


class ClientTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        FakeReader.seen = []
        self.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FakeReader)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True)
        self.thread.start()
        origin = f"http://127.0.0.1:{self.server.server_port}"
        self.client = ContentClient(origin, "docs.acme.test", "docs")

    async def asyncTearDown(self):
        await self.client.aclose()
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    async def test_identifies_space_vfs_on_every_request(self):
        mount = await self.client.snapshot()
        await self.client.list_all(mount["snapshot"])
        await self.client.stat("snap-1", "/page-0.md")
        await self.client.content("snap-1", "/page-0.md")
        self.assertGreaterEqual(len(FakeReader.seen), 4)
        expected_ua = user_agent()
        expected_client = client_header()
        self.assertTrue(expected_ua.startswith(f"{FAMILY}/"))
        self.assertIn("python/", expected_ua)
        for row in FakeReader.seen:
            self.assertEqual(row["user_agent"], expected_ua)
            self.assertEqual(row["space_client"], expected_client)

    async def test_lists_unlisted_and_omits_restricted(self):
        mount = await self.client.snapshot()
        entries = await self.client.list_all(mount["snapshot"])
        paths = [row["path"] for row in entries]
        self.assertIn("/page-0.md", paths)
        self.assertIn("/hidden.md", paths)
        self.assertNotIn("/secret.md", paths)

    async def test_child_listing_keeps_only_direct_names(self):
        names = await self.client.children("snap-1", "/")
        self.assertCountEqual(names, ["page-0.md", "hidden.md"])

    async def test_child_listing_keeps_scanning_after_empty_page(self):
        pages = [
            {"snapshot": "snap-1", "entries": [], "nextCursor": "next"},
            {"snapshot": "snap-1", "entries": [{"path": "/later.md"}], "nextCursor": None},
        ]
        with patch.object(self.client, "_json", new=AsyncMock(side_effect=pages)) as request:
            self.assertEqual(await self.client.children("snap-1", "/"), ["later.md"])
        self.assertEqual(request.await_count, 2)

    async def test_transport_failure_exhausts_as_unavailable(self):
        import httpx

        with patch.object(self.client, "_request", new=AsyncMock(side_effect=httpx.ConnectError("down"))):
            with patch("space_vfs.client.asyncio.sleep", new=AsyncMock()):
                with self.assertRaises(SpaceProblem) as failure:
                    await self.client.snapshot()
        self.assertEqual((failure.exception.status, failure.exception.code), (503, "delivery_unavailable"))

    async def test_content_bytes_and_304(self):
        path = "/page-0.md"
        first = await self.client.content("snap-1", path)
        self.assertEqual(first.payload, b"hello vfs\n")
        self.assertFalse(first.not_modified)
        again = await self.client.content("snap-1", path, first.sha256)
        self.assertTrue(again.not_modified)
        self.assertIsNone(again.payload)

    async def test_wrong_snapshot_and_bad_token(self):
        with self.assertRaises(SpaceProblem) as changed:
            await self.client.content("old", "/page-0.md")
        self.assertEqual(changed.exception.code, "snapshot_changed")
        bad = ContentClient(
            f"http://127.0.0.1:{self.server.server_port}", "docs.acme.test", "docs", "bad"
        )
        try:
            with self.assertRaises(SpaceProblem) as denied:
                await bad.snapshot()
            self.assertEqual(denied.exception.status, 401)
            self.assertEqual(denied.exception.code, "invalid_token")
        finally:
            await bad.aclose()

    async def test_cache_drops_on_forbidden(self):
        cache = ByteCache()
        cache.put("anon", "snap-1", "/page-0.md", "abc", b"hello vfs\n")
        cache.drop_identity("anon")
        self.assertIsNone(cache.get("anon", "snap-1", "/page-0.md"))

    async def test_cache_evicts_least_recent_bytes(self):
        cache = ByteCache(max_bytes=5)
        cache.put("anon", "snap-1", "/a", "a", b"aa")
        cache.put("anon", "snap-1", "/b", "b", b"bb")
        cache.get("anon", "snap-1", "/a")
        cache.put("anon", "snap-1", "/c", "c", b"cc")
        self.assertIsNone(cache.get("anon", "snap-1", "/b"))
        self.assertEqual(cache.get("anon", "snap-1", "/a")[1], b"aa")

    async def test_cache_also_bounds_empty_files(self):
        cache = ByteCache(max_entries=1)
        cache.put("anon", "s", "/a", "a", b"")
        cache.put("anon", "s", "/b", "b", b"")
        self.assertIsNone(cache.get("anon", "s", "/a"))
        self.assertEqual(cache.get("anon", "s", "/b")[1], b"")

    async def test_config_rejects_insecure_remote_origin_and_unknown_keys(self):
        from pydantic import ValidationError

        for options in (
            {"origin": "http://docs.example.com"},
            {"origin": "https://docs.example.com", "tls_insecure": True},
            {"origin": "https://docs.example.com", "max_concurent_reads": 2},
            {"origin": "https://docs.example.com", "space": "../other"},
        ):
            with self.subTest(options=options), self.assertRaises(ValidationError):
                SpaceConfig(host="docs.example.com", **({"space": "docs"} | options))


if __name__ == "__main__":
    unittest.main()
