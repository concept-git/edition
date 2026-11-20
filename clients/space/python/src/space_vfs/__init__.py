from space_vfs.client import Content, ContentClient
from space_vfs.config import SpaceConfig
from space_vfs.errors import SpaceProblem
from space_vfs.paths import children, normalize, validate

__all__ = [
    "Content",
    "ContentClient",
    "SpaceConfig",
    "SpaceProblem",
    "SpaceVFS",
    "children",
    "normalize",
    "validate",
]


def __getattr__(name):
    if name == "SpaceVFS":
        from space_vfs.vfs import SpaceVFS

        return SpaceVFS
    raise AttributeError(name)
