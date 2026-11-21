import asyncio
import sys

from edition_vfs import ContentClient
from edition_vfs.tree import ResourceTree


async def main(origin, host):
    async with ContentClient(origin, host, "docs") as client:
        tree = ResourceTree(client)
        files = await tree.children("/")
        if "start" not in files:
            raise ValueError(f"Released page missing from mount: {files}")
        handle = await tree.open("/start")
        sys.stdout.buffer.write(await tree.read(handle, 4096, 0))


if __name__ == "__main__":
    asyncio.run(main(*sys.argv[1:]))
