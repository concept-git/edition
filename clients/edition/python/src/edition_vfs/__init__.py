from edition_vfs.client import Content, ContentClient
from edition_vfs.config import SpaceConfig
from edition_vfs.errors import SpaceProblem
from edition_vfs.paths import children, normalize, validate

__all__ = [
    "Content",
    "ContentClient",
    "SpaceConfig",
    "SpaceProblem",
    "EditionVFS",
    "children",
    "normalize",
    "validate",
]


def __getattr__(name):
    if name == "EditionVFS":
        from edition_vfs.vfs import EditionVFS

        return EditionVFS
    raise AttributeError(name)
