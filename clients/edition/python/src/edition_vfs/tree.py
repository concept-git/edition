"""Canonical Reader paths and online byte reads, independent of FUSE/Mirage."""

from dataclasses import dataclass
import hashlib

from edition_vfs.cache import ByteCache
from edition_vfs.errors import SpaceProblem
from edition_vfs.paths import normalize


@dataclass(frozen=True)
class ReadHandle:
    snapshot: str
    path: str
    sha256: str | None


class ResourceTree:
    def __init__(self, client):
        self.client = client
        self.cache = ByteCache()

    async def snapshot(self):
        result = await self.client.snapshot()
        snapshot = result.get("snapshot")
        if not isinstance(snapshot, str) or not snapshot:
            raise SpaceProblem(503, "delivery_unavailable")
        return snapshot

    async def stat(self, path):
        return await self.client.stat(await self.snapshot(), normalize(path))

    async def children(self, path):
        snapshot = await self.snapshot()
        path = normalize(path)
        row = await self.client.stat(snapshot, path)
        if row.get("kind") != "directory":
            raise NotADirectoryError(path)
        return await self.client.children(snapshot, path)

    async def open(self, path):
        snapshot = await self.snapshot()
        path = normalize(path)
        row = await self.client.stat(snapshot, path)
        if row.get("kind") != "file":
            raise IsADirectoryError(path)
        return ReadHandle(snapshot, path, row.get("sha256"))

    async def read(self, handle, size, offset):
        if size < 0 or offset < 0:
            raise ValueError("invalid read range")
        cached = self.cache.get(self.client.identity, handle.snapshot, handle.path)
        try:
            result = await self.client.content(handle.snapshot, handle.path, cached[0] if cached else None)
            payload = cached[1] if result.not_modified and cached else result.payload
            if payload is None or not result.sha256:
                raise SpaceProblem(503, "delivery_unavailable")
            digest = hashlib.sha256(payload).hexdigest()
            if digest != result.sha256 or (handle.sha256 and digest != handle.sha256):
                raise SpaceProblem(503, "delivery_unavailable")
            self.cache.put(self.client.identity, handle.snapshot, handle.path, digest, payload)
            return payload[offset:offset + size]
        except SpaceProblem:
            self.cache.drop_identity(self.client.identity)
            raise

    async def close(self):
        self.cache.drop_identity(self.client.identity)
        await self.client.aclose()
