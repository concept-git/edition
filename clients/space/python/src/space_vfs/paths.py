"""Mount-relative paths that match space-reader validate()."""


def validate(path):
    if path is None or len(path) > 2048 or not path.startswith("/") or "\\" in path:
        raise ValueError("validation_failed")
    if any(ord(ch) < 32 or ord(ch) == 127 for ch in path):
        raise ValueError("validation_failed")
    if path != "/" and any(part in ("", ".", "..") for part in path[1:].split("/")):
        raise ValueError("validation_failed")
    return path


def normalize(path):
    text = "/" + str(path or "").lstrip("/")
    return validate("/" if text == "/" else text.rstrip("/"))


def entry_path(entry):
    return entry.get("path") if isinstance(entry, dict) else entry


def children(entries, directory):
    directory = normalize(directory)
    prefix = "/" if directory == "/" else directory + "/"
    names, seen = [], set()
    for entry in entries:
        path = entry_path(entry)
        if not path or path == directory or not path.startswith(prefix):
            continue
        name = path[len(prefix) :].split("/", 1)[0]
        if name and name not in seen:
            seen.add(name)
            names.append(name)
    return names
