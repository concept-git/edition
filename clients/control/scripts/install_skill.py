"""Install packaged skills and remove only their obsolete managed files."""
import argparse
import errno
import json
import os
import tempfile
from pathlib import Path, PurePosixPath

MARKER = '.editionctl-managed'
LEGACY_FILES = {
    'SKILL.md', 'agents/openai.yaml', 'references/access.md',
    'references/content.md', 'references/delivery.md', 'references/recovery.md',
}


def relative_file(value):
    if (not isinstance(value, str) or not value or ':' in value or '\\' in value
            or any(ord(char) < 32 for char in value)):
        raise SystemExit('Invalid managed file path')
    path = PurePosixPath(value)
    if path.is_absolute() or any(part in ('.', '..') for part in path.parts) or str(path) != value or value == MARKER:
        raise SystemExit('Invalid managed file path')
    return value


def target_file(destination, relative):
    target = destination / relative_file(relative)
    for path in (target, *target.parents):
        if path == destination.parent:
            break
        if path.is_symlink():
            raise SystemExit(f'Refusing symbolic-link skill file: {path}')
    if target.is_dir():
        raise SystemExit(f'Refusing directory in managed file position: {target}')
    return target


def owned_files(destination):
    if destination.is_symlink():
        raise SystemExit(f'Refusing symbolic-link skill: {destination}')
    if not destination.exists():
        return set()
    marker = destination / MARKER
    if marker.is_symlink():
        raise SystemExit(f'Refusing symbolic-link ownership marker: {marker}')
    if not marker.is_file():
        raise SystemExit(f'Existing skill is not managed by editionctl: {destination}')
    text = marker.read_text()
    if text == 'editionctl\n':
        return set(LEGACY_FILES)
    try:
        data = json.loads(text)
        if (not isinstance(data, dict) or data.get('product') != 'editionctl'
                or data.get('schemaVersion') != 1 or not isinstance(data.get('files'), list)):
            raise ValueError()
        return {relative_file(value) for value in data['files']}
    except (ValueError, TypeError):
        raise SystemExit(f'Invalid editionctl ownership marker: {marker}') from None


def package_files(source):
    files = {}
    for path in sorted(source.rglob('*')):
        if path.is_symlink():
            raise SystemExit(f'Refusing symbolic-link packaged file: {path}')
        if path.is_file() and path.name not in ('.DS_Store', MARKER):
            files[relative_file(path.relative_to(source).as_posix())] = path
    return files


def plan(entry, root):
    source = entry.parent
    destination = root / source.name
    files = package_files(source)
    previous = owned_files(destination)
    for relative in previous | files.keys():
        target_file(destination, relative)
    return destination, files, previous - files.keys()


def check(sources, root):
    """Read only this package's destinations; unknown local files are not inspected."""
    drift = []
    for entry in sources:
        try:
            destination, files, obsolete = plan(entry, root)
        except SystemExit as error:
            drift.append(str(error))
            continue
        for relative, file in files.items():
            target = destination / relative
            if not target.is_file() or target.read_bytes() != file.read_bytes():
                drift.append(f'{destination.name}/{relative}: missing or changed')
        for relative in sorted(obsolete):
            if (destination / relative).exists():
                drift.append(f'{destination.name}/{relative}: obsolete managed file')
    for item in drift:
        print(item)
    if not drift:
        print('Installed skills match the packaged files.')
    return not drift


def remove_obsolete(destination, relative):
    target = destination / relative
    target.unlink(missing_ok=True)
    for parent in target.parents:
        if parent == destination:
            break
        try:
            parent.rmdir()
        except FileNotFoundError:
            continue
        except OSError as error:
            if error.errno in (errno.ENOTEMPTY, errno.EEXIST):
                break
            raise


def replace_file(target, content, mode=0o600):
    """Replace one file without following its old inode or exposing partial contents."""
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=target.parent, prefix='.editionctl-', delete=False) as file:
            temporary = Path(file.name)
            os.chmod(temporary, mode)
            file.write(content)
        os.replace(temporary, target)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def install(sources, root):
    """Validate every managed path before the first write, including obsolete paths."""
    plans = [plan(entry, root) for entry in sources]
    for destination, files, obsolete in plans:
        destination.mkdir(parents=True, exist_ok=True)
        for relative, source in files.items():
            target = destination / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            replace_file(target, source.read_bytes(), source.stat().st_mode & 0o777)
        for relative in sorted(obsolete):
            remove_obsolete(destination, relative)
        replace_file(destination / MARKER, (json.dumps({
            'product': 'editionctl', 'schemaVersion': 1, 'files': sorted(files),
        }, indent=2) + '\n').encode())
        print(destination)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Read-only comparison of installed and packaged skill files')
    args = parser.parse_args()
    sources = sorted((Path(__file__).resolve().parents[1] / 'skills').glob('*/SKILL.md'))
    root = Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))) / 'skills'
    if not sources:
        raise SystemExit('Packaged skills are absent.')
    if not args.check:
        install(sources, root)
    if not check(sources, root):
        raise SystemExit(1)
