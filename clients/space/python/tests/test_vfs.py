import http.server
import importlib.util
import os
import threading
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from test_client import FakeReader

if importlib.util.find_spec("mirage") is not None:
    from mirage import ConsistencyPolicy, MountMode, Workspace
    from mirage.server.workspace_config import build_workspace_from_config
    from space_vfs import SpaceConfig, SpaceVFS
else:
    Workspace = None


class VfsTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        if Workspace is None:
            self.skipTest("mirage-ai extra is not installed")
        self.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FakeReader)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True)
        self.thread.start()
        self.vfs = SpaceVFS(
            SpaceConfig(
                origin=f"http://127.0.0.1:{self.server.server_port}",
                host="docs.acme.test",
                space="docs",
                token="spc_ok",
            )
        )
        self.ws = Workspace(
            {"/space": self.vfs}, mode=MountMode.READ, consistency=ConsistencyPolicy.ALWAYS
        )

    async def asyncTearDown(self):
        if getattr(self, "ws", None) is not None:
            await self.ws.close()
        if getattr(self, "server", None) is not None:
            self.server.shutdown()
            self.server.server_close()
            self.thread.join()

    async def test_ls_cat_and_write_fail(self):
        listed = await self.ws.execute("ls /space")
        self.assertEqual(listed.exit_code, 0)
        names = (await listed.stdout_str()).split()
        self.assertIn("page-0.md", names)
        self.assertIn("hidden.md", names)
        self.assertNotIn("secret.md", names)
        shown = await self.ws.execute("cat /space/page-0.md")
        self.assertEqual(await shown.stdout_str(), "hello vfs\n")
        written = await self.ws.execute("echo hacked > /space/page-0.md")
        self.assertNotEqual(written.exit_code, 0)

    async def test_cold_cat_fetches_content_once(self):
        FakeReader.seen = []
        result = await self.ws.execute("cat /space/page-0.md")
        self.assertEqual(result.exit_code, 0, await result.stderr_str())
        self.assertEqual(await result.stdout_str(), "hello vfs\n")
        downloads = [row for row in FakeReader.seen if row["path"].endswith("/content")]
        self.assertEqual(len(downloads), 1)

    async def test_warm_workspace_does_not_serve_revoked_bytes(self):
        first = await self.ws.execute("cat /space/page-0.md")
        self.assertEqual(await first.stdout_str(), "hello vfs\n")
        with patch.object(FakeReader, "invalid_token", "spc_ok"):
            denied = await self.ws.execute("cat /space/page-0.md")
            self.assertNotEqual(denied.exit_code, 0)
            self.assertNotIn("hello vfs", await denied.stdout_str())
        self.assertIsNone(self.vfs.accessor.bytes.get(
            self.vfs.accessor.client.identity, "snap-1", "/page-0.md"
        ))

    async def test_warm_listing_does_not_retain_hidden_names(self):
        first = await self.ws.execute("ls /space")
        self.assertIn("hidden.md", await first.stdout_str())
        pages = {key: value for key, value in FakeReader.pages.items() if key != "/hidden.md"}
        with patch.object(FakeReader, "pages", pages):
            current = await self.ws.execute("ls /space")
            self.assertEqual(current.exit_code, 0, await current.stderr_str())
            self.assertNotIn("hidden.md", await current.stdout_str())

    async def test_documented_yaml_builds_a_real_workspace(self):
        example = Path(__file__).resolve().parents[2] / "examples/workspace.yaml"
        text = example.read_text().replace(
            "https://docs.example.com", f"http://127.0.0.1:{self.server.server_port}"
        )
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {"SPACE_TOKEN": "spc_ok"}):
            path = Path(directory) / "workspace.yaml"
            path.write_text(text)
            workspace = await build_workspace_from_config(path)
            try:
                result = await workspace.execute("cat /space/page-0.md")
                self.assertEqual(result.exit_code, 0, await result.stderr_str())
                self.assertEqual(await result.stdout_str(), "hello vfs\n")
            finally:
                await workspace.close()


if __name__ == "__main__":
    unittest.main()
