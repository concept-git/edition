"""Small byte cache. Callers must receive an online 304 before reusing a hit."""

from collections import OrderedDict


class ByteCache:
    def __init__(self, max_bytes=64 * 1024 * 1024, max_entries=1024):
        if max_bytes < 0 or max_entries < 0:
            raise ValueError("cache limits must be nonnegative")
        self.max_bytes = max_bytes
        self.max_entries = max_entries
        self._rows = OrderedDict()
        self._size = 0

    def get(self, identity, snapshot, path):
        key = (identity, snapshot, path)
        row = self._rows.get(key)
        if row is not None:
            self._rows.move_to_end(key)
        return row

    def put(self, identity, snapshot, path, sha256, payload):
        if not sha256 or payload is None:
            return
        key = (identity, snapshot, path)
        previous = self._rows.pop(key, None)
        if previous:
            self._size -= len(previous[1])
        if len(payload) > self.max_bytes:
            return
        self._rows[key] = (sha256, payload)
        self._size += len(payload)
        # Empty files consume key/object memory even when their byte size is zero.
        while self._size > self.max_bytes or len(self._rows) > self.max_entries:
            _, (_, evicted) = self._rows.popitem(last=False)
            self._size -= len(evicted)

    def drop_identity(self, identity):
        self._rows = OrderedDict((key, value) for key, value in self._rows.items() if key[0] != identity)
        self._size = sum(len(value[1]) for value in self._rows.values())
