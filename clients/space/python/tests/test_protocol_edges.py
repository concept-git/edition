"""Verify cache, path and protocol boundaries where an empty success would hide a real failure."""
import hashlib
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from pydantic import ValidationError
from space_vfs.accessor import SpaceAccessor
from space_vfs.cache import ByteCache
from space_vfs.config import SpaceConfig
from space_vfs.errors import SpaceProblem
from space_vfs.io import _io_error, read_bytes, readdir, stat
from space_vfs.paths import validate
from space_vfs.tree import ReadHandle, ResourceTree


class CacheAndPathEdgesTest(unittest.TestCase):
    def test_cache_refuses_invalid_limits_and_does_not_reuse_replaced_or_unhashed_bytes(self):
        for limits in [(-1, 1), (1, -1)]:
            with self.assertRaises(ValueError):
                ByteCache(*limits)
        cache = ByteCache(max_bytes=3)
        cache.put('subject', 'version', '/a', '', b'x')
        self.assertIsNone(cache.get('subject', 'version', '/a'))
        cache.put('subject', 'version', '/a', 'one', b'1')
        cache.put('subject', 'version', '/a', 'two', b'22')
        self.assertEqual(cache.get('subject', 'version', '/a'), ('two', b'22'))
        cache.put('subject', 'version', '/a', 'large', b'4444')
        self.assertIsNone(cache.get('subject', 'version', '/a'))

    def test_control_characters_and_invalid_hosts_are_not_valid_reader_paths_or_config(self):
        for path in ['/a\x00b', '/a\x7fb']:
            with self.assertRaises(ValueError):
                validate(path)
        for host in ['bad host', 'bad/host', '']:
            with self.assertRaises(ValidationError):
                SpaceConfig(origin='https://docs.example.com', host=host, space='docs')


class ProtocolEdgesTest(unittest.IsolatedAsyncioTestCase):
    def client(self):
        return SimpleNamespace(identity='subject', snapshot=AsyncMock(return_value={'snapshot': 'v1'}),
                               stat=AsyncMock(return_value={'kind': 'directory'}),
                               content=AsyncMock(), children=AsyncMock(), aclose=AsyncMock())

    async def test_invalid_snapshot_and_byte_payload_do_not_become_successful_empty_results(self):
        client = self.client()
        tree = ResourceTree(client)
        for invalid in ['', None, 17]:
            client.snapshot.return_value = {'snapshot': invalid}
            with self.assertRaises(SpaceProblem) as result:
                await tree.snapshot()
            self.assertEqual(result.exception.status, 503)
        with self.assertRaises(ValueError):
            await tree.read(ReadHandle('v1', '/a', None), -1, 0)
        client.content.return_value = SimpleNamespace(payload=None, sha256=None, not_modified=False)
        with self.assertRaises(SpaceProblem):
            await tree.read(ReadHandle('v1', '/a', None), 5, 0)
        config = SpaceConfig(origin='https://docs.example.com', host='docs.example.com', space='docs')
        with patch('space_vfs.accessor.ContentClient', return_value=client):
            accessor = SpaceAccessor(config)
        with self.assertRaises(SpaceProblem) as error:
            await accessor.bind()
        self.assertEqual(error.exception.source, 'protocol')

    async def test_not_modified_without_matching_local_bytes_requires_an_unconditional_retry(self):
        from mirage import FileType
        client = self.client()
        accessor = SimpleNamespace(client=client, snapshot='v1', current=AsyncMock(return_value='v1'),
                                   bytes=ByteCache(), note=lambda error: None)
        payload = b'current bytes'
        digest = hashlib.sha256(payload).hexdigest()
        client.content.side_effect = [SimpleNamespace(not_modified=True),
                                     SimpleNamespace(not_modified=False, payload=payload, sha256=digest)]
        path = SimpleNamespace(resource_path='/a')
        self.assertEqual(await read_bytes(accessor, path), payload)
        self.assertEqual(client.content.await_count, 2)
        client.content.side_effect = None
        client.content.return_value = SimpleNamespace(not_modified=False, payload=None, sha256=digest)
        with self.assertRaises(SpaceProblem):
            await read_bytes(accessor, path)
        client.stat.return_value = {'kind': 'file'}
        with self.assertRaises(NotADirectoryError):
            await readdir(accessor, path)
        client.stat.return_value = {'kind': 'directory'}
        self.assertEqual((await stat(accessor, SimpleNamespace(resource_path='/'))).type, FileType.DIRECTORY)

    async def test_protocol_errors_keep_their_specific_filesystem_meaning(self):
        for error, kind in [(SpaceProblem(404, 'missing'), FileNotFoundError),
                            (SpaceProblem(403, 'forbidden'), PermissionError),
                            (SpaceProblem(400, 'not_a_file'), IsADirectoryError),
                            (SpaceProblem(422, 'validation_failed'), ValueError),
                            (SpaceProblem(503, 'unavailable'), SpaceProblem)]:
            self.assertIsInstance(_io_error(error, '/a'), kind)

    async def test_mount_plan_requires_a_directory_root_not_only_a_valid_snapshot(self):
        from space_vfs.mount import mount_plan
        client = self.client()
        client.stat.return_value = {'kind': 'file'}
        class Connection:
            async def __aenter__(self):
                return client
            async def __aexit__(self, *args):
                pass
        config = SpaceConfig(origin='https://docs.example.com', host='docs.example.com', space='docs')
        with patch('space_vfs.mount.ContentClient', return_value=Connection()), self.assertRaises(SpaceProblem) as invalid:
            await mount_plan(config, '/tmp/unused-fixture-path')
        self.assertEqual(invalid.exception.status, 503)
