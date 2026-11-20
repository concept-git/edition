import asyncio
import contextlib
import errno
import http.server
import os
import io
import tempfile
import threading
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from space_vfs.client import ContentClient
from space_vfs.errors import SpaceProblem
from space_vfs.mount import LoopRunner, ReadOnlyMount, main
from space_vfs.tree import ResourceTree
from test_client import FakeReader


SKILL = b"---\nname: quality\ndescription: Review documentation\n---\n\nSee references/rules.md.\n"


class MountedTreeTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.previous_pages = FakeReader.pages
        self.previous_snapshot = FakeReader.snapshot
        FakeReader.snapshot = "skills-1"
        FakeReader.pages = {
            "/quality/SKILL.md": {"text": SKILL.decode()},
            "/quality/references/rules.md": {"text": "# Rules\n\nKeep source evidence.\n"},
            "/actions/SKILL.md": {"text": "---\nname: actions\ndescription: Extract actions\n---\n"},
        }
        self.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FakeReader)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True)
        self.thread.start()
        self.tree = ResourceTree(ContentClient(f"http://127.0.0.1:{self.server.server_port}", "docs.localhost", "docs"))

    async def asyncTearDown(self):
        await self.tree.close()
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        FakeReader.pages = self.previous_pages
        FakeReader.snapshot = self.previous_snapshot

    async def test_preserves_skill_bytes_paths_and_relative_references(self):
        self.assertCountEqual(await self.tree.children("/"), ["quality", "actions"])
        self.assertCountEqual(await self.tree.children("/quality"), ["SKILL.md", "references"])
        handle = await self.tree.open("/quality/SKILL.md")
        self.assertEqual(await self.tree.read(handle, 4096, 0), SKILL)
        ref = await self.tree.open("/quality/references/rules.md")
        self.assertIn(b"Keep source evidence", await self.tree.read(ref, 4096, 0))

    async def test_chunked_and_concurrent_reads_share_online_checked_bytes(self):
        first = await self.tree.open("/quality/SKILL.md")
        second = await self.tree.open("/actions/SKILL.md")
        a, b = await asyncio.gather(self.tree.read(first, 4096, 0), self.tree.read(second, 4096, 0))
        self.assertEqual(a, SKILL)
        self.assertIn(b"name: actions", b)
        self.assertEqual(await self.tree.read(first, 5, 7), SKILL[7:12])

    async def test_revocation_rechecks_warm_cache_and_directory(self):
        handle = await self.tree.open("/quality/SKILL.md")
        await self.tree.read(handle, 4096, 0)
        FakeReader.pages[handle.path]["hidden"] = True
        with self.assertRaises(SpaceProblem):
            await self.tree.read(handle, 4096, 0)
        self.assertIsNone(self.tree.cache.get(self.tree.client.identity, handle.snapshot, handle.path))
        self.assertNotIn("SKILL.md", await self.tree.children("/quality"))

    async def test_existing_handle_fails_after_version_change_and_new_open_succeeds(self):
        handle = await self.tree.open("/quality/SKILL.md")
        await self.tree.read(handle, 4096, 0)
        FakeReader.snapshot = "skills-2"
        with self.assertRaises(SpaceProblem) as changed:
            await self.tree.read(handle, 4096, 1)
        self.assertEqual(changed.exception.status, 409)
        fresh = await self.tree.open(handle.path)
        self.assertEqual(await self.tree.read(fresh, 4096, 0), SKILL)

    async def test_corrupted_bytes_fail_without_returning_cached_content(self):
        handle = await self.tree.open("/quality/SKILL.md")
        FakeReader.pages[handle.path]["text"] += "tampered"
        with self.assertRaises(SpaceProblem):
            await self.tree.read(handle, 4096, 0)

    async def test_directory_open_and_file_listing_are_type_errors(self):
        with self.assertRaises(IsADirectoryError):
            await self.tree.open("/quality")
        with self.assertRaises(NotADirectoryError):
            await self.tree.children("/quality/SKILL.md")


class MountCallbacksTest(unittest.TestCase):
    def test_read_handles_attributes_and_readonly_access_keep_callback_contracts(self):
        class Tree:
            async def stat(self, path):
                return {'kind': 'directory' if path == '/' else 'file', 'size': 6}
            async def children(self, path):
                return ['readme.md']
            async def open(self, path):
                return path
            async def read(self, handle, size, offset):
                return b'abcdef'[offset:offset + size]
        runner = LoopRunner()
        try:
            mount = ReadOnlyMount(Tree(), runner)
            self.assertEqual(mount('getattr', '/')['st_nlink'], 2)
            self.assertEqual(mount('getattr', '/readme.md')['st_nlink'], 1)
            self.assertEqual(mount('readdir', '/', None), ['.', '..', 'readme.md'])
            handle = mount('open', '/readme.md', os.O_RDONLY)
            self.assertEqual(mount('read', '/readme.md', 3, 2, handle), b'cde')
            self.assertEqual(mount('access', '/', os.X_OK), 0)
            self.assertEqual(mount('access', '/readme.md', os.R_OK), 0)
            for path, mode, code in [('/readme.md', os.X_OK, errno.EACCES), ('/', os.W_OK, errno.EROFS)]:
                with self.subTest(mode=mode), self.assertRaises(OSError) as denied:
                    mount('access', path, mode)
                self.assertEqual(denied.exception.errno, code)
            self.assertEqual(mount('listxattr', '/readme.md'), [])
            with self.assertRaises(OSError):
                mount('getxattr', '/readme.md', 'user.missing')
            self.assertEqual(mount('statfs', '/')['f_bsize'], 4096)
            self.assertEqual(mount('flush', '/readme.md', handle), 0)
            self.assertEqual(mount('fsync', '/readme.md', False, handle), 0)
            self.assertEqual(mount('release', '/readme.md', handle), 0)
            with self.assertRaises(OSError) as closed:
                mount('read', '/readme.md', 1, 0, handle)
            self.assertEqual(closed.exception.errno, errno.EBADF)
            with self.assertRaises(OSError) as unknown:
                mount('not_a_callback', '/')
            self.assertEqual(unknown.exception.errno, errno.ENOSYS)
        finally:
            runner.close()

    def test_reader_failures_preserve_their_distinct_os_error_codes(self):
        for error, code in [(SpaceProblem(401, 'unauthorized'), errno.EACCES),
                            (SpaceProblem(403, 'forbidden'), errno.EACCES),
                            (SpaceProblem(404, 'not_found'), errno.ENOENT),
                            (SpaceProblem(409, 'changed'), errno.ESTALE),
                            (SpaceProblem(413, 'too_large'), errno.EFBIG),
                            (SpaceProblem(429, 'limited'), errno.EAGAIN),
                            (IsADirectoryError(), errno.EISDIR),
                            (NotADirectoryError(), errno.ENOTDIR), (ValueError(), errno.EINVAL)]:
            class Tree:
                async def stat(self, path):
                    raise error
            runner = LoopRunner()
            try:
                with self.subTest(error=error), self.assertRaises(OSError) as result:
                    ReadOnlyMount(Tree(), runner)('getattr', '/')
                self.assertEqual(result.exception.errno, code)
            finally:
                runner.close()

    def test_closing_an_unused_runner_does_not_start_a_thread(self):
        runner = LoopRunner()
        runner.close()
        self.assertIsNone(runner.thread.ident)

    def test_ready_event_requires_successful_authorization_and_is_emitted_once(self):
        class Available:
            async def stat(self, path):
                return {"kind": "directory"}
        class Unavailable:
            async def stat(self, path):
                raise SpaceProblem(503, "delivery_unavailable")
        runner = LoopRunner()
        try:
            ready = Mock()
            mount = ReadOnlyMount(Available(), runner, on_ready=ready)
            mount("init", "/tmp/fixture")
            mount("init", "/tmp/fixture")
            ready.assert_called_once_with()
            failed_ready = Mock()
            with self.assertRaises(OSError):
                ReadOnlyMount(Unavailable(), runner, on_ready=failed_ready)("init", "/tmp/fixture")
            failed_ready.assert_not_called()
        finally:
            runner.close()

    def test_already_mounted_directory_is_explicit_and_does_not_load_fuse(self):
        with tempfile.TemporaryDirectory() as directory, \
                patch("space_vfs.mount.os.path.ismount", return_value=True), \
                contextlib.redirect_stderr(io.StringIO()) as output, \
                self.assertRaises(SystemExit) as error:
            main(["--mountpoint", directory, "--origin", "https://docs.example.com",
                  "--host", "docs.example.com", "--space", "docs"])
        self.assertEqual(error.exception.code, 2)
        self.assertIn("already mounted", output.getvalue())
        self.assertIn("Example:", output.getvalue())

    def test_rejects_every_mutating_callback(self):
        mount = ReadOnlyMount(None, None)
        for operation in ["write", "create", "truncate", "unlink", "mkdir", "rmdir", "rename",
                          "link", "symlink", "chmod", "chown", "utimens", "mknod", "setxattr", "removexattr"]:
            with self.subTest(operation=operation), self.assertRaises(OSError) as denied:
                mount(operation, "/quality/SKILL.md")
            self.assertEqual(denied.exception.errno, errno.EROFS)
        for flag in [os.O_WRONLY, os.O_RDWR, os.O_TRUNC, os.O_APPEND, os.O_CREAT]:
            with self.subTest(flag=flag), self.assertRaises(OSError) as denied:
                mount("open", "/quality/SKILL.md", flag)
            self.assertEqual(denied.exception.errno, errno.EROFS)

    def test_keeps_dependency_failures_as_io_errors(self):
        class Broken:
            async def stat(self, path):
                raise SpaceProblem(503, "delivery_unavailable")
        runner = LoopRunner()
        try:
            with self.assertRaises(OSError) as failure:
                ReadOnlyMount(Broken(), runner)("getattr", "/quality/SKILL.md")
            self.assertEqual(failure.exception.errno, errno.EIO)
        finally:
            runner.close()


class MountLifecycleTest(unittest.TestCase):
    """The FUSE call is replaced; these tests check lifecycle, never claim an OS mount succeeded."""
    def arguments(self, directory, *extra):
        return ['--mountpoint', directory, '--origin', 'https://docs.example.com',
                '--host', 'docs.example.com', '--space', 'docs', *extra]

    def test_platform_options_and_cleanup_after_success_or_failure(self):
        for system, version, extra, backend in [('Linux', '0', [], None),
                                                ('Darwin', '26.0', [], 'fskit'),
                                                ('Darwin', '25.0', [], 'kext'),
                                                ('Darwin', '26.0', ['--backend', 'kext'], 'kext')]:
            with self.subTest(system=system, version=version, extra=extra), tempfile.TemporaryDirectory() as directory:
                calls = []
                class Tree:
                    closed = False
                    async def stat(self, path):
                        return {'kind': 'directory'}
                    async def close(self):
                        self.closed = True
                tree = Tree()
                def fuse(mount, path, **options):
                    calls.append(options)
                    mount('init', path)
                with patch.dict('sys.modules', {'fuse': SimpleNamespace(FUSE=fuse)}), \
                        patch('space_vfs.mount.ResourceTree', return_value=tree), \
                        patch('space_vfs.mount.ContentClient'), \
                        patch('space_vfs.mount.platform.system', return_value=system), \
                        patch('space_vfs.mount.platform.mac_ver', return_value=(version, '', '')), \
                        contextlib.redirect_stderr(io.StringIO()) as output:
                    self.assertEqual(main(self.arguments(directory, *extra)), 0)
                self.assertTrue(tree.closed)
                self.assertTrue(calls[0]['ro'])
                self.assertEqual(calls[0].get('backend'), backend)
                self.assertIn('"status": "ready"', output.getvalue())

    def test_mount_failures_return_public_errors_and_always_close_the_runner(self):
        for error, code in [(OSError('private detail'), 1), (RuntimeError('private detail'), 1),
                            (SpaceProblem(503, 'delivery_unavailable'), 1), (KeyboardInterrupt(), 130)]:
            with self.subTest(error=error), tempfile.TemporaryDirectory() as directory, \
                    patch.dict('sys.modules', {'fuse': SimpleNamespace(FUSE=Mock(side_effect=error))}), \
                    contextlib.redirect_stderr(io.StringIO()) as output:
                self.assertEqual(main(self.arguments(directory)), code)
                self.assertNotIn('private detail', output.getvalue())

    def test_invalid_paths_options_and_missing_fuse_fail_before_mounting(self):
        with tempfile.TemporaryDirectory() as directory:
            invalid = [self.arguments(directory, directory),
                       self.arguments(directory, '--space', 'bad_slug'),
                       self.arguments(directory, '--backend', 'kext')]
            for words in invalid:
                with self.subTest(words=words), patch('space_vfs.mount.platform.system', return_value='Linux'), \
                        contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as result:
                    main(words)
                self.assertEqual(result.exception.code, 2)
            with patch.dict('sys.modules', {'fuse': None}), contextlib.redirect_stderr(io.StringIO()), \
                    self.assertRaises(SystemExit) as missing:
                main(self.arguments(directory))
            self.assertEqual(missing.exception.code, 2)
            with open(os.path.join(directory, 'occupied.txt'), 'w') as target:
                target.write('keep existing content')
            with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as occupied:
                main(self.arguments(directory))
            self.assertEqual(occupied.exception.code, 2)
