from functools import partial

from mirage import CommandIO, ContentType, FileStat, FileType, PathSpec, stream_from_bytes

from space_vfs.errors import SpaceProblem
from space_vfs.paths import normalize

_TYPES = {
    "md": ContentType.TEXT,
    "html": ContentType.TEXT,
    "txt": ContentType.TEXT,
    "json": ContentType.TEXT,
    "xml": ContentType.TEXT,
    "png": ContentType.IMAGE_PNG,
    "jpg": ContentType.IMAGE_JPEG,
    "jpeg": ContentType.IMAGE_JPEG,
    "pdf": ContentType.PDF,
}


def _path(path: PathSpec) -> str:
    return normalize(path.resource_path)


def _name(path):
    return "/" if path == "/" else path.rsplit("/", 1)[-1]


def _content_type(path):
    suffix = path.rsplit(".", 1)[-1].lower() if "." in path else ""
    return _TYPES.get(suffix, ContentType.BINARY)


def _record(accessor, operation, path, snapshot, size=None, sha256=None):
    report = getattr(accessor, "report", None)
    if report is not None:
        report.resource(operation, path, snapshot, size, sha256)


def _failure(accessor, error, operation, path, snapshot):
    report = getattr(accessor, "report", None)
    if report is not None:
        report.problem(error, operation, path, snapshot)
    accessor.note(error)


async def readdir(accessor, path, index=None):
    directory = _path(path)
    snapshot = accessor.snapshot
    try:
        snapshot = await accessor.current()
        if (await accessor.client.stat(snapshot, directory)).get("kind") == "file":
            raise NotADirectoryError(directory)
        names = await accessor.client.children(snapshot, directory)
        _record(accessor, "list", directory, snapshot)
        virtual = getattr(path, "virtual", None)
        if virtual is None:
            return names
        root = virtual.rstrip("/")
        return [f"{root}/{name}" if root else f"/{name}" for name in names]
    except SpaceProblem as error:
        _failure(accessor, error, "list", directory, snapshot)
        raise _io_error(error, directory)


async def stat(accessor, path, index=None):
    target = _path(path)
    snapshot = accessor.snapshot
    try:
        snapshot = await accessor.current()
        row = await accessor.client.stat(snapshot, target)
    except SpaceProblem as error:
        _failure(accessor, error, "stat", target, snapshot)
        raise _io_error(error, target)
    _record(accessor, "stat", target, snapshot, row.get("size"), row.get("sha256"))
    if row.get("kind") == "directory":
        return FileStat(name=_name(target), size=None, type=FileType.DIRECTORY)
    extra = {key: row[key] for key in ("sha256", "pageId") if row.get(key)}
    return FileStat(
        name=_name(target),
        size=row.get("size"),
        type=FileType.FILE,
        content=_content_type(target),
        fingerprint=row.get("sha256"),
        extra=extra,
    )


async def read_bytes(accessor, path, index=None):
    target = _path(path)
    snapshot = accessor.snapshot
    try:
        snapshot = await accessor.current()
        cached = accessor.bytes.get(accessor.client.identity, snapshot, target)
        # The content endpoint already checks file type, snapshot and permissions.
        # A condition is useful only when we actually possess its matching bytes.
        result = await accessor.client.content(snapshot, target, cached[0] if cached else None)
        if result.not_modified:
            if cached:
                _record(accessor, "read", target, snapshot, len(cached[1]), cached[0])
                return cached[1]
            result = await accessor.client.content(snapshot, target)
        if result.payload is None:
            raise SpaceProblem(503, "delivery_unavailable", source="protocol")
        accessor.bytes.put(accessor.client.identity, snapshot, target, result.sha256, result.payload)
        _record(accessor, "read", target, snapshot, len(result.payload), result.sha256)
        return result.payload
    except SpaceProblem as error:
        _failure(accessor, error, "read", target, snapshot)
        raise _io_error(error, target)


def io_table():
    return CommandIO(
        readdir=readdir,
        read_bytes=read_bytes,
        read_stream=partial(stream_from_bytes, read_bytes),
        stat=stat,
        is_mounted=lambda _accessor: True,
        local=False,
    )


def _io_error(error, path):
    if error.status == 404:
        return FileNotFoundError(path)
    if error.forbidden():
        return PermissionError(error)
    if error.code == "not_a_file":
        return IsADirectoryError(path)
    if error.code == "validation_failed":
        return ValueError(error)
    return error
