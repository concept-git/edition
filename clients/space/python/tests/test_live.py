import asyncio
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from datetime import datetime, timedelta, timezone

import httpx

from space_vfs import ContentClient, SpaceConfig, SpaceProblem
from space_vfs.paths import children

from live_support import BACKEND, live_enabled, provision

_world = None


def skip_unless_live():
    return unittest.skipUnless(live_enabled(), "set SPACE_VFS_LIVE=1 on the isolated topology")


async def world():
    global _world
    if _world is None:
        _world = await provision()
    else:
        _world.http = await asyncio.to_thread(httpx.AsyncClient, base_url=BACKEND, timeout=30.0)
    return _world


def client(site, token=None):
    return ContentClient(site.origin, site.host, "docs", token, tls_insecure=True)


class LiveTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        if not live_enabled():
            self.skipTest("set SPACE_VFS_LIVE=1 on the isolated topology")
        self.site = await world()
        self.addAsyncCleanup(self.site.http.aclose)

    @skip_unless_live()
    async def test_public_listing_matches_files_and_omits_restricted_and_draft(self):
        async with client(self.site) as reader:
            mount = await reader.snapshot()
            entries = await reader.list_all(mount["snapshot"])
            paths = [row["path"] for row in entries]
            self.assertIn("/page-0", paths)
            self.assertIn("/hidden", paths)
            self.assertIn("/note", paths)
            self.assertNotIn("/secret", paths)
            self.assertNotIn("/draft", paths)
            self.assertIn("note", children(entries, "/"))
            self.assertIn("page-0", children(entries, "/"))
            self.assertIn("hidden", children(entries, "/"))

    @skip_unless_live()
    async def test_bytes_match_content_api_not_site_html(self):
        async with client(self.site) as reader:
            mount = await reader.snapshot()
            entries = await reader.list_all(mount["snapshot"])
            markdown = await reader.content(mount["snapshot"], "/page-0")
            self.assertEqual(markdown.payload, b"hello vfs\n\nWebhook\n")
            html = await reader.content(mount["snapshot"], "/note")
            self.assertEqual(html.payload, b"<p>raw html</p>\n")
            reading = next(
                row.get("readingPath")
                for row in entries
                if row.get("path") == "/page-0"
            )
            page = await self._until_html(reader, reading or "/docs/page-0")
            self.assertIn(b"page-main", page.content)
            self.assertNotEqual(page.content, markdown.payload)
            attachment = next(
                row for row in entries if row["kind"] == "file" and row["path"].endswith(".png")
            )
            self.assertIsNone(attachment.get("size"))
            info = await reader.stat(mount["snapshot"], attachment["path"])
            self.assertEqual(info["size"], len(self.site.attachment))
            downloaded = await reader.content(mount["snapshot"], attachment["path"])
            self.assertEqual(downloaded.payload, self.site.attachment)

    @skip_unless_live()
    async def test_invalid_token_does_not_become_anonymous(self):
        await self.site.mutation(
            "DELETE", f"{self.site.base}/sites/{self.site.site}/permissions/grants/anonymous"
        )
        try:
            await self._private_token_flow()
        finally:
            await self.site.mutation(
                "PUT",
                f"{self.site.base}/sites/{self.site.site}/permissions/grants/anonymous",
                {"role": "reader"},
            )

    async def _private_token_flow(self):
        async with client(self.site, "invalid") as stolen:
            with self.assertRaises(SpaceProblem) as denied:
                await stolen.snapshot()
            self.assertEqual(denied.exception.status, 401)
        async with client(self.site) as anonymous:
            with self.assertRaises(SpaceProblem) as forbidden:
                await anonymous.snapshot()
            self.assertIn(forbidden.exception.status, (401, 403))
        issued = await self.site.mutation(
            "POST",
            f"{self.site.base}/tokens",
            {
                "name": "vfs-reader",
                "spaceId": self.site.space,
                "role": "reader",
                "scopes": ["read"],
                "expiry": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
            },
        )
        async with client(self.site, issued["secret"]) as reader:
            await self._until(lambda: reader.snapshot())
            mount = await reader.snapshot()
            paths = [row["path"] for row in await reader.list_all(mount["snapshot"])]
            self.assertIn("/page-0", paths)
            self.assertNotIn("/secret", paths)
            with self.assertRaises((SpaceProblem, ValueError)):
                await reader.stat(mount["snapshot"], "/pages/../other")
            posted = await reader._http.post(
                f"{self.site.origin}/api/content/spaces/docs/files",
                headers={"Host": self.site.host, "Authorization": f"Bearer {issued['secret']}"},
            )
            self.assertIn(posted.status_code, (403, 405))
            await self.site.mutation(
                "PATCH",
                f"{self.site.base}/sites/{self.site.site}",
                {"branding": {"primaryColor": "#234567"}},
            )
            await self._until_status(
                lambda: reader.content(mount["snapshot"], "/page-0"), 409
            )
            fresh = await reader.snapshot()
            again = await reader.content(fresh["snapshot"], "/page-0")
            self.assertEqual(again.payload, b"hello vfs\n\nWebhook\n")
            await self.site.mutation("DELETE", f"{self.site.base}/tokens/{issued['id']}")
            await self._until_status(
                lambda: reader.content(fresh["snapshot"], "/page-0", again.sha256),
                401,
            )

    async def _until_html(self, reader, path):
        deadline = time.monotonic() + 20
        last = None
        while time.monotonic() < deadline:
            page = await reader._http.get(
                path,
                headers={"Accept": "text/html", "Host": self.site.host},
                extensions={"sni_hostname": self.site.host},
            )
            last = page.status_code
            if page.status_code == 200 and b"page-main" in page.content:
                return page
            await asyncio.sleep(0.25)
        raise AssertionError(f"html {path} last {last}")

    async def _until(self, action):
        deadline = time.monotonic() + 15
        last = None
        while time.monotonic() < deadline:
            try:
                return await action()
            except SpaceProblem as error:
                last = error
                await asyncio.sleep(0.25)
        raise last

    async def _until_status(self, action, status):
        deadline = time.monotonic() + 15
        last = None
        while time.monotonic() < deadline:
            try:
                await action()
                last = "200"
            except SpaceProblem as error:
                last = error
                if error.status == status:
                    return error
            await asyncio.sleep(0.25)
        raise AssertionError(f"expected {status}, last {last}")


if importlib.util.find_spec("mirage") is not None:
    from mirage import ConsistencyPolicy, MountMode, Workspace
    from space_vfs import SpaceVFS
else:
    Workspace = None


class LiveWorkspaceTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        if not live_enabled() or Workspace is None:
            self.skipTest("live topology and mirage-ai extra required")
        self.site = await world()
        self.addAsyncCleanup(self.site.http.aclose)

    @skip_unless_live()
    async def test_both_cli_entries_return_live_reader_bytes_and_match_exit_codes(self):
        root = Path(__file__).resolve().parents[4]
        connection = ["--origin", self.site.origin, "--host", self.site.host,
                      "--space", "docs", "--tls-insecure"]
        env = dict(os.environ)
        env.pop("SPACE_TOKEN", None)
        async with client(self.site) as reader:
            snapshot = (await reader.snapshot())["snapshot"]
            entries = await reader.list_all(snapshot)
            attachment = next(row["path"] for row in entries if row["path"].endswith(".png"))
        for prefix in ([sys.executable, str(root / "clients/space/python/src/space_vfs/cli.py")],
                       [os.environ.get("SPACE_NODE", "node"), str(root / "infra/space.ts"), "vfs", "--python", sys.executable]):
            cases = [(["cat", "/space/page-0"], 0, b"hello vfs\n\nWebhook\n"),
                     (["cat", "/space" + attachment], 0, self.site.attachment),
                     (["grep", "never-match-this-fixture", "/space/page-0"], 1, b"")]
            for words, code, payload in cases:
                with self.subTest(entry=prefix[1], command=words[0]):
                    result = await asyncio.to_thread(subprocess.run, [*prefix, *connection, *words],
                                                     input=b"", capture_output=True, env=env, cwd=root, timeout=20)
                    self.assertEqual(result.returncode, code, result.stderr)
                    self.assertEqual(result.stdout, payload)
                    self.assertEqual(result.stderr, b"")

    @skip_unless_live()
    async def test_mount_preflight_checks_live_reader_without_fuse(self):
        env = dict(os.environ)
        env.pop("SPACE_TOKEN", None)
        with tempfile.TemporaryDirectory() as directory:
            result = await asyncio.to_thread(
                subprocess.run, [sys.executable, "-m", "space_vfs.mount", "--mountpoint", directory,
                                 "--origin", self.site.origin, "--host", self.site.host,
                                 "--space", "docs", "--tls-insecure", "--dry-run"],
                input=b"", capture_output=True, env=env, timeout=20)
        self.assertEqual(result.returncode, 0, result.stderr)
        plan = json.loads(result.stdout)
        self.assertEqual(plan["status"], "validated")
        self.assertEqual(plan["host"], self.site.host)
        self.assertTrue(plan["read_only"])
        self.assertEqual(result.stderr, b"")

    @skip_unless_live()
    async def test_metadata_on_both_cli_entries_matches_real_reader_results(self):
        root = Path(__file__).resolve().parents[4]
        connection = ["--origin", self.site.origin, "--host", self.site.host,
                      "--space", "docs", "--tls-insecure"]
        env = dict(os.environ)
        env.pop("SPACE_TOKEN", None)
        async with client(self.site) as reader:
            snapshot = (await reader.snapshot())["snapshot"]
            entries = await reader.list_all(snapshot)
            attachment = next(row["path"] for row in entries if row["path"].endswith(".png"))
            expected = await reader.content(snapshot, attachment)
        artifact_dir = Path(os.environ["E2E_RUNTIME_DIR"]) / "metadata-examples"
        artifact_dir.mkdir(parents=True, exist_ok=True)
        prefixes = [("client", [str(Path(sys.executable).with_name("space-vfs"))]),
                    ("launcher", [os.environ.get("SPACE_NODE", "node"), str(root / "infra/space.ts"), "vfs", "--python", sys.executable])]
        cases = [("success", ["cat", "/space" + attachment], 0, "success", expected.payload, None),
                 ("no-match", ["grep", "never-match-this-fixture", "/space/page-0"], 1, "no_match", b"", None),
                 ("missing", ["cat", "/space/absent-metadata-file"], 1, "error", b"", 404),
                 ("masked", ["--command", "cat /space/absent-metadata-file || true"], 0,
                  "completed_with_errors", b"", 404)]
        for name, prefix in prefixes:
            for case, words, code, outcome, payload, http_status in cases:
                with self.subTest(entry=name, case=case):
                    path = artifact_dir / f"{name}-{case}.json"
                    result = await asyncio.to_thread(subprocess.run,
                        [*prefix, *connection, "--metadata-file", str(path), *words],
                        input=b"", capture_output=True, env=env, cwd=root, timeout=20)
                    self.assertEqual(result.returncode, code, result.stderr)
                    self.assertEqual(result.stdout, payload)
                    doc = json.loads(path.read_text())
                    self.assertEqual(doc["outcome"], outcome)
                    self.assertEqual(doc["command_exit_code"], code)
                    self.assertEqual(doc["exit_code"], code)
                    self.assertEqual(doc["stdout"]["produced_sha256"], hashlib.sha256(payload).hexdigest())
                    if case == "success":
                        row = next(row for row in doc["resources"] if row["operation"] == "read")
                        self.assertEqual(row["snapshot"], snapshot)
                        self.assertEqual(row["reader_sha256"], expected.sha256)
                        self.assertEqual(row["size_bytes"], len(expected.payload))
                    if http_status is not None:
                        self.assertEqual(doc["errors"][0]["http_status"], http_status)
                        self.assertEqual(doc["errors"][0]["code"], "file_not_found")
        for name, prefix in prefixes:
            with self.subTest(entry=name, case="invalid-token"):
                path = artifact_dir / f"{name}-invalid-token.json"
                marker = "invalid-vfs-metadata-token"
                result = await asyncio.to_thread(subprocess.run,
                    [*prefix, *connection, "--metadata-file", str(path), "cat", "/space/page-0"],
                    input=b"", capture_output=True, env=dict(env, SPACE_TOKEN=marker), cwd=root, timeout=20)
                self.assertNotEqual(result.returncode, 0)
                doc = json.loads(path.read_text())
                self.assertEqual(doc["errors"][0]["http_status"], 401)
                self.assertEqual(doc["errors"][0]["code"], "invalid_token")
                self.assertFalse(doc["errors"][0]["retryable"])
                self.assertNotIn(marker, path.read_text())

    @skip_unless_live()
    async def test_ls_and_cat_and_writes_fail(self):
        vfs = SpaceVFS(
            SpaceConfig(
                origin=self.site.origin,
                host=self.site.host,
                space="docs",
                tls_insecure=True,
            )
        )
        ws = Workspace({"/space": vfs}, mode=MountMode.READ, consistency=ConsistencyPolicy.ALWAYS)
        try:
            listed = await ws.execute("ls /space")
            self.assertEqual(listed.exit_code, 0, await listed.stderr_str())
            names = (await listed.stdout_str()).split()
            self.assertIn("page-0", names)
            self.assertNotIn("secret", names)
            self.assertNotIn("draft", names)
            shown = await ws.execute("cat /space/page-0")
            self.assertEqual(await shown.stdout_str(), "hello vfs\n\nWebhook\n")
            written = await ws.execute("echo hacked > /space/page-0")
            self.assertNotEqual(written.exit_code, 0)
        finally:
            await ws.close()


if __name__ == "__main__":
    unittest.main()
