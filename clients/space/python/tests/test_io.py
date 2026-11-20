import hashlib
import importlib.util
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

if importlib.util.find_spec("mirage") is not None:
    from mirage import ContentType, FileType
    from space_vfs.accessor import SpaceAccessor
    from space_vfs.cache import ByteCache
    from space_vfs.errors import SpaceProblem
    from space_vfs.io import _content_type, read_bytes, readdir, stat
else:
    ContentType = None
    FileType = None


def skip_without_mirage():
    return unittest.skipIf(FileType is None, "mirage-ai extra is not installed")


class _Path:
    def __init__(self, resource_path):
        self.resource_path = resource_path


class IoTest(unittest.IsolatedAsyncioTestCase):
    @skip_without_mirage()
    async def test_source_documents_are_text_files(self):
        for suffix in ("txt", "json", "xml"):
            self.assertEqual(_content_type(f"/example.{suffix}"), ContentType.TEXT)

    def setUp(self):
        if FileType is None:
            self.skipTest("mirage-ai extra is not installed")
        payload = b"hello vfs\n"
        digest = hashlib.sha256(payload).hexdigest()
        self.payload = payload
        self.digest = digest
        self.client = SimpleNamespace(
            identity="anon",
            snapshot=AsyncMock(return_value={"snapshot": "snap-1"}),
            children=AsyncMock(return_value=["page-0.md"]),
            stat=AsyncMock(),
            content=AsyncMock(),
        )
        self.accessor = SimpleNamespace(
            client=self.client,
            snapshot="snap-1",
            bytes=ByteCache(),
            mounted=lambda: True,
            current=AsyncMock(return_value="snap-1"),
            note=lambda error: None,
            invalidate=lambda: None,
        )

    @skip_without_mirage()
    async def test_readdir_uses_listing_not_toc(self):
        self.client.stat.return_value = {"kind": "directory", "path": "/"}
        names = await readdir(self.accessor, _Path("/"))
        self.assertEqual(names, ["page-0.md"])

    @skip_without_mirage()
    async def test_readdir_revalidates_policy_even_when_snapshot_is_unchanged(self):
        config = SimpleNamespace(token=None, origin="https://docs.test", host="docs.test",
                                 space="docs", tls_insecure=False, max_concurrent_reads=4)
        with patch("space_vfs.accessor.ContentClient", return_value=self.client):
            accessor = SpaceAccessor(config)
        self.client.stat.return_value = {"kind": "directory", "path": "/"}
        self.client.children.side_effect = [
            ["private", "public"],
            ["public"],
            SpaceProblem(503, "access_update_pending"),
        ]
        self.assertCountEqual(await readdir(accessor, _Path("/")), ["private", "public"])
        self.assertEqual(await readdir(accessor, _Path("/")), ["public"])
        with self.assertRaises(SpaceProblem):
            await readdir(accessor, _Path("/"))
        self.assertEqual(self.client.children.await_count, 3)
        self.client.snapshot.assert_awaited_once()

    @skip_without_mirage()
    async def test_missing_stat_does_not_scan_the_space(self):
        self.client.stat.side_effect = SpaceProblem(404, "file_not_found")
        with self.assertRaises(FileNotFoundError):
            await stat(self.accessor, _Path("/missing"))
        self.client.children.assert_not_awaited()

    @skip_without_mirage()
    async def test_stat_keeps_unknown_size(self):
        self.client.stat.return_value = {
            "kind": "file",
            "path": "/page-0/attachments/a.png",
            "size": None,
            "sha256": "a" * 64,
        }
        row = await stat(self.accessor, _Path("/page-0/attachments/a.png"))
        self.assertEqual(row.type, FileType.FILE)
        self.assertIsNone(row.size)
        self.assertEqual(row.fingerprint, "a" * 64)

    @skip_without_mirage()
    async def test_read_revalidates_and_drops_cache_on_revoke(self):
        self.client.stat.return_value = {
            "kind": "file",
            "sha256": self.digest,
            "size": len(self.payload),
        }
        self.client.content.return_value = SimpleNamespace(
            payload=self.payload, sha256=self.digest, not_modified=False, type="text/markdown"
        )
        first = await read_bytes(self.accessor, _Path("/page-0.md"))
        self.assertEqual(first, self.payload)
        self.client.content.return_value = SimpleNamespace(
            payload=None, sha256=self.digest, not_modified=True, type="text/markdown"
        )
        again = await read_bytes(self.accessor, _Path("/page-0.md"))
        self.assertEqual(again, self.payload)
        self.assertGreaterEqual(self.client.content.await_count, 2)
        dropped = []

        def note(error):
            dropped.append(error)
            self.accessor.bytes.drop_identity("anon")

        self.accessor.note = note
        self.client.content.side_effect = SpaceProblem(401, "invalid_token")
        with self.assertRaises(PermissionError):
            await read_bytes(self.accessor, _Path("/page-0.md"))
        self.assertIsNone(self.accessor.bytes.get("anon", "snap-1", "/page-0.md"))

    @skip_without_mirage()
    async def test_report_retains_snapshot_before_permission_invalidation(self):
        from space_vfs.report import RunReport
        self.accessor.report = RunReport(SimpleNamespace(command=None, words=["cat"]))
        self.accessor.bytes.put("anon", "snap-1", "/page-0.md", self.digest, self.payload)
        def invalidate_on_error(error):
            self.accessor.snapshot = None
            self.accessor.bytes.drop_identity("anon")
        self.accessor.note = invalidate_on_error
        self.client.content.side_effect = SpaceProblem(403, "read_forbidden", trace_id="fixture-trace")
        with self.assertRaises(PermissionError):
            await read_bytes(self.accessor, _Path("/page-0.md"))
        self.assertIsNone(self.accessor.snapshot)
        self.assertIsNone(self.accessor.bytes.get("anon", "snap-1", "/page-0.md"))
        error = self.accessor.report.document(1)["errors"][0]
        self.assertEqual(error["snapshot"], "snap-1")
        self.assertEqual(error["path"], "/page-0.md")
        self.assertEqual(error["trace_id"], "fixture-trace")


if __name__ == "__main__":
    unittest.main()
