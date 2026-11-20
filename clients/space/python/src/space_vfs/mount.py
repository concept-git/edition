"""Read-only OS mount. Each callback keeps Reader's online authorization."""

import argparse
import asyncio
import errno
import itertools
import json
import os
from pathlib import Path
import platform
import stat
import threading
import sys

from pydantic import ValidationError

from space_vfs.client import ContentClient
from space_vfs.cli import CliParser, problem_message, validate_connection, validation_message
from space_vfs.config import SpaceConfig
from space_vfs.errors import SpaceProblem
from space_vfs.tree import ResourceTree


class LoopRunner:
    def __init__(self):
        self.loop = asyncio.new_event_loop()
        self.thread = threading.Thread(target=self.loop.run_forever, daemon=True)
        self.lock = threading.Lock()

    def run(self, coroutine):
        with self.lock:
            if self.thread.ident is None:
                self.thread.start()
        return asyncio.run_coroutine_threadsafe(coroutine, self.loop).result()

    def close(self):
        if self.thread.ident is not None:
            self.loop.call_soon_threadsafe(self.loop.stop)
            self.thread.join()
        self.loop.close()


class ReadOnlyMount:
    WRITES = frozenset({"write", "create", "truncate", "unlink", "mkdir", "rmdir", "rename",
                        "link", "symlink", "chmod", "chown", "utimens", "mknod", "setxattr", "removexattr"})

    def __init__(self, tree, runner, config=None, on_ready=None):
        self.config = config
        self.tree = tree
        self.runner = runner
        self.handles = {}
        self.ids = itertools.count(1)
        self.lock = threading.Lock()
        self.on_ready = on_ready

    def __getattr__(self, operation):
        if operation in self.WRITES:
            return self.read_only
        raise AttributeError(operation)

    def read_only(self, *args):
        raise OSError(errno.EROFS, "read-only space")

    def __call__(self, operation, *args):
        method = getattr(self, operation, None)
        if method is None:
            raise OSError(errno.ENOSYS, "unsupported operation")
        try:
            return method(*args)
        except SpaceProblem as error:
            code = {401: errno.EACCES, 403: errno.EACCES, 404: errno.ENOENT,
                    409: errno.ESTALE, 413: errno.EFBIG, 429: errno.EAGAIN}.get(error.status, errno.EIO)
            raise OSError(code, error.code) from error
        except IsADirectoryError as error:
            raise OSError(errno.EISDIR, "directory") from error
        except NotADirectoryError as error:
            raise OSError(errno.ENOTDIR, "not a directory") from error
        except ValueError as error:
            raise OSError(errno.EINVAL, "invalid path or range") from error

    def init(self, path):
        if self.tree is None:
            secret = self.config.token.get_secret_value() if self.config.token else None
            self.tree = ResourceTree(ContentClient(self.config.origin, self.config.host, self.config.space,
                                                  secret, self.config.tls_insecure))
        self.runner.run(self.tree.stat("/"))
        if self.on_ready is not None:
            self.on_ready()
            self.on_ready = None

    def getattr(self, path, fh=None):
        row = self.runner.run(self.tree.stat(path))
        directory = row.get("kind") == "directory"
        return {"st_mode": (stat.S_IFDIR | 0o555) if directory else (stat.S_IFREG | 0o444),
                "st_nlink": 2 if directory else 1, "st_size": row.get("size") or 0,
                "st_uid": os.getuid(), "st_gid": os.getgid()}

    def readdir(self, path, fh):
        return [".", "..", *self.runner.run(self.tree.children(path))]

    def open(self, path, flags):
        if (flags & os.O_ACCMODE) != os.O_RDONLY or flags & (os.O_TRUNC | os.O_CREAT | os.O_APPEND):
            raise OSError(errno.EROFS, "read-only space")
        handle = self.runner.run(self.tree.open(path))
        with self.lock:
            number = next(self.ids)
            self.handles[number] = handle
        return number

    def read(self, path, size, offset, fh):
        with self.lock:
            handle = self.handles.get(fh)
        if handle is None:
            raise OSError(errno.EBADF, "closed handle")
        return self.runner.run(self.tree.read(handle, size, offset))

    def release(self, path, fh):
        with self.lock:
            self.handles.pop(fh, None)
        return 0

    def access(self, path, mode):
        row = self.runner.run(self.tree.stat(path))
        if mode & os.W_OK:
            raise OSError(errno.EROFS, "read-only space")
        if mode & os.X_OK and row.get("kind") != "directory":
            raise OSError(errno.EACCES, "not executable")
        return 0

    def getxattr(self, path, name, position=0):
        self.runner.run(self.tree.stat(path))
        raise OSError(getattr(errno, "ENOATTR", getattr(errno, "ENODATA", errno.ENOTSUP)), "no extended attribute")

    def listxattr(self, path):
        self.runner.run(self.tree.stat(path))
        return []

    def statfs(self, path):
        self.runner.run(self.tree.stat(path))
        return {"f_bsize": 4096, "f_frsize": 4096, "f_blocks": 0, "f_bfree": 0, "f_bavail": 0,
                "f_files": 0, "f_ffree": 0, "f_namemax": 255}

    def flush(self, path, fh):
        return 0

    def fsync(self, path, datasync, fh):
        return 0


async def mount_plan(config, mountpoint):
    secret = config.token.get_secret_value() if config.token else None
    async with ContentClient(config.origin, config.host, config.space, secret, config.tls_insecure) as client:
        snapshot = (await client.snapshot()).get("snapshot")
        if not isinstance(snapshot, str) or not snapshot:
            raise SpaceProblem(503, "delivery_unavailable")
        if (await client.stat(snapshot, "/")).get("kind") != "directory":
            raise SpaceProblem(503, "delivery_unavailable")
    return {"status": "validated", "mountpoint": str(mountpoint), "origin": config.origin,
            "host": config.host, "space": config.space, "snapshot": snapshot, "read_only": True}


def main(argv=None):
    example = "space-vfs-mount --mountpoint /tmp/space-skills --origin https://docs.example.com --host docs.example.com --space skills"
    parser = CliParser(description="Mount an online Space as a read-only OS directory",
                       formatter_class=argparse.RawDescriptionHelpFormatter,
                       epilog=f"""Runs in the foreground. Ctrl+C or OS unmount ends the process.
Private spaces read a Bearer from SPACE_TOKEN (or --token-env NAME).
--dry-run checks Reader access and prints JSON without loading FUSE or mounting.
Successful FUSE init emits a JSON ready event on stderr.

Examples:
  mkdir -p /tmp/space-skills
  {example} --dry-run
  {example}
  umount /tmp/space-skills                     # macOS
  fusermount -u /tmp/space-skills              # Linux
""")
    parser.example = example
    parser.add_argument("mountpoint_pos", type=Path, nargs="?", metavar="mountpoint", help="existing empty directory")
    parser.add_argument("--mountpoint", type=Path, help="existing empty directory (alternative to positional mountpoint)")
    parser.add_argument("--origin", required=True, help="site origin URL, e.g. https://docs.example.com")
    parser.add_argument("--host", required=True, help="site Host header, e.g. docs.example.com")
    parser.add_argument("--space", required=True, help="space slug, e.g. skills")
    parser.add_argument("--tls-insecure", action="store_true", help="allow a test certificate for a loopback origin")
    parser.add_argument("--token-env", default="SPACE_TOKEN", metavar="NAME", help="Bearer environment variable (default: SPACE_TOKEN)")
    parser.add_argument("--dry-run", action="store_true", help="validate access and output a JSON plan without mounting")
    parser.add_argument("--backend", choices=["kext", "fskit"], help="macFUSE backend; defaults to FSKit on macOS 26+")
    args = parser.parse_args(argv)
    if bool(args.mountpoint) == bool(args.mountpoint_pos):
        parser.error("provide one mountpoint: --mountpoint PATH or a positional PATH")
    validate_connection(parser, args)
    if args.backend and platform.system() != "Darwin":
        parser.error("--backend is supported only on macOS")
    try:
        config = SpaceConfig(origin=args.origin, host=args.host, space=args.space,
                             token=os.environ.get(args.token_env), tls_insecure=args.tls_insecure)
        mountpoint = (args.mountpoint or args.mountpoint_pos).resolve()
        if os.path.ismount(mountpoint):
            parser.error("mountpoint is already mounted; use the existing mount or unmount it first")
        if not mountpoint.is_dir() or any(mountpoint.iterdir()):
            parser.error("mountpoint must be an existing empty directory; create one with mkdir -p /tmp/space-skills")
        if args.dry_run:
            print(json.dumps(asyncio.run(mount_plan(config, mountpoint))))
            return 0
        try:
            from fuse import FUSE
        except (ImportError, OSError):
            parser.error('install space-vfs[fuse] and enable macFUSE/libfuse. '
                         'Install command: python3 -m pip install -e "clients/space/python[fuse]"')
        runner = LoopRunner()
        def ready():
            print(json.dumps({"status": "ready", "mountpoint": str(mountpoint), "host": config.host,
                              "space": config.space, "read_only": True}), file=sys.stderr, flush=True)
        mount = ReadOnlyMount(None, runner, config, on_ready=ready)
        options = {"ro": True, "foreground": True, "direct_io": True,
                   "attr_timeout": 0, "entry_timeout": 0, "negative_timeout": 0, "fsname": "space-vfs"}
        if platform.system() == "Darwin":
            options.update(nolocalcaches=True, noappledouble=True, noapplexattr=True, nobrowse=True)
            options["backend"] = args.backend or ("fskit" if int(platform.mac_ver()[0].split(".")[0]) >= 26 else "kext")
        try:
            FUSE(mount, str(mountpoint), **options)
        finally:
            try:
                if mount.tree is not None:
                    runner.run(mount.tree.close())
            finally:
                runner.close()
        return 0
    except ValidationError as error:
        parser.error(validation_message(error))
    except SpaceProblem as error:
        print("Error: " + problem_message(error), file=sys.stderr)
        return 1
    except (OSError, RuntimeError):
        print("Error: mount failed; check Reader access, the mountpoint and the enabled FUSE runtime.\n"
              f"Example: {example} --dry-run", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
