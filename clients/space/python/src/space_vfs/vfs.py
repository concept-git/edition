from mirage import GenericResource, register_resource

from space_vfs.accessor import SpaceAccessor
from space_vfs.config import SpaceConfig
from space_vfs.io import io_table


class SpaceVFS(GenericResource):
    CONFIG_CLS = SpaceConfig

    def __init__(self, config: SpaceConfig):
        super().__init__(
            name="space",
            accessor=SpaceAccessor(config),
            io=io_table(),
            prompt="Online space pages as /<slug>.md (or .html/.txt/.json/.xml). Read-only live snapshot.",
            supports_snapshot=False,
        )


register_resource("space", SpaceVFS, SpaceConfig)
