from mirage import Accessor

from space_vfs.cache import ByteCache
from space_vfs.client import ContentClient
from space_vfs.errors import SpaceProblem


class SpaceAccessor(Accessor):
    def __init__(self, config):
        secret = config.token.get_secret_value() if config.token else None
        self.client = ContentClient(
            config.origin,
            config.host,
            config.space,
            secret,
            config.tls_insecure,
            config.max_concurrent_reads,
        )
        self.snapshot = None
        self.bytes = ByteCache()
        self.report = None

    async def bind(self):
        try:
            mount = await self.client.snapshot()
            snapshot = mount.get("snapshot")
            if not isinstance(snapshot, str) or not snapshot:
                raise SpaceProblem(503, "delivery_unavailable", source="protocol")
            if self.snapshot and self.snapshot != snapshot:
                raise SpaceProblem(409, "snapshot_changed", source="client")
            self.snapshot = snapshot
            return mount
        except SpaceProblem as error:
            if self.report is not None:
                self.report.problem(error, "bind", "/", self.snapshot)
            self.note(error)
            raise

    async def current(self):
        if not self.snapshot:
            await self.bind()
        return self.snapshot

    def note(self, error):
        if error.forbidden() or error.remount():
            self.invalidate()

    def invalidate(self):
        self.snapshot = None
        self.bytes.drop_identity(self.client.identity)

    async def close(self):
        self.invalidate()
        await self.client.aclose()
        await super().close()
