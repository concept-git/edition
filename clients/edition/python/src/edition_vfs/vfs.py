from mirage import GenericResource, register_resource

from edition_vfs.accessor import SpaceAccessor
from edition_vfs.config import SpaceConfig
from edition_vfs.io import io_table


class EditionVFS(GenericResource):
    CONFIG_CLS = SpaceConfig

    def __init__(self, config: SpaceConfig):
        super().__init__(
            name="edition",
            accessor=SpaceAccessor(config),
            io=io_table(),
            prompt="Online space pages as /<slug>.md (or .html/.txt/.json/.xml). Read-only live snapshot.",
            supports_snapshot=False,
        )


register_resource("edition", EditionVFS, SpaceConfig)
