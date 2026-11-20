"""Verify ownership checks and current packaged installation using only temporary skill roots."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).parents[1] / 'install_skill.py'
spec = importlib.util.spec_from_file_location('installer', SCRIPT)
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class SkillInstallTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.base = Path(self.directory.name)
        self.source = self.base / 'package/skills/space-ops'
        self.source.mkdir(parents=True)
        self.entry = self.source / 'SKILL.md'
        self.entry.write_text('current instructions')
        self.root = self.base / 'profile/skills'

    def install(self):
        with contextlib.redirect_stdout(io.StringIO()):
            installer.install([self.entry], self.root)

    def test_repository_skill_is_a_self_contained_single_file(self):
        package = SCRIPT.parents[1] / 'skills/space-ops'
        entry = package / 'SKILL.md'
        self.assertTrue(entry.is_file(), 'The release must include the skill entrypoint')
        text = entry.read_text()
        self.assertTrue(text.startswith('---\nname: space-ops\n'))
        self.assertEqual([p.relative_to(package).as_posix() for p in package.rglob('*') if p.is_file()], ['SKILL.md'])
        self.assertNotIn('](references/', text)
        with contextlib.redirect_stdout(io.StringIO()):
            installer.install([entry], self.root)
            self.assertTrue(installer.check([entry], self.root))
        self.assertEqual((self.root / 'space-ops/SKILL.md').read_bytes(), entry.read_bytes())

    def test_check_is_read_only_and_detects_drift_and_missing_files(self):
        self.assertFalse(installer.check([self.entry], self.root))
        self.assertFalse(self.root.exists())
        self.install()
        self.assertTrue(installer.check([self.entry], self.root))
        installed = self.root / 'space-ops/SKILL.md'
        installed.write_text('outdated instructions')
        self.assertFalse(installer.check([self.entry], self.root))
        self.assertEqual(installed.read_text(), 'outdated instructions')
        self.install()
        installed.unlink()
        self.assertFalse(installer.check([self.entry], self.root))
        self.assertFalse(installed.exists())
        self.install()
        (self.root / 'space-ops/local-notes.md').write_text('local notes')
        self.assertTrue(installer.check([self.entry], self.root))

    def test_repeat_install_updates_packaged_files_and_keeps_local_notes(self):
        self.install()
        references = self.root / 'space-ops/references'
        references.mkdir()
        (references / 'local-notes.md').write_text('local content')
        (self.source / 'references').mkdir()
        (self.source / 'references/content.md').write_text('current content')
        self.entry.write_text('updated instructions')
        self.assertFalse(installer.check([self.entry], self.root))
        self.install()
        self.assertTrue(installer.check([self.entry], self.root))
        self.assertEqual((references / 'content.md').read_text(), 'current content')
        self.assertEqual((references / 'local-notes.md').read_text(), 'local content')
        self.assertEqual(json.loads((self.root / 'space-ops/.spacectl-managed').read_text())['files'], ['SKILL.md', 'references/content.md'])

    def test_unrelated_skills_are_not_inspected_or_moved(self):
        unrelated = self.root / 'other-skill'
        unrelated.mkdir(parents=True)
        (unrelated / 'local.txt').write_text('retain me')
        self.install()
        self.assertEqual((unrelated / 'local.txt').read_text(), 'retain me')
        self.assertFalse((self.root.parent / 'spacectl-skill-backups').exists())

    def test_upgrade_removes_obsolete_managed_files_and_keeps_unknown_notes(self):
        extra = self.source / 'references/old.md'
        extra.parent.mkdir()
        extra.write_text('old packaged knowledge')
        self.install()
        destination = self.root / 'space-ops'
        (destination / 'references/local-notes.md').write_text('retain local content')
        extra.unlink()
        self.assertFalse(installer.check([self.entry], self.root))
        self.assertTrue((destination / 'references/old.md').exists(), '--check must not clean files')
        self.install()
        self.assertFalse((destination / 'references/old.md').exists())
        self.assertEqual((destination / 'references/local-notes.md').read_text(), 'retain local content')
        self.assertTrue(installer.check([self.entry], self.root))

    def test_legacy_marker_cleans_known_packaged_references_without_backup(self):
        destination = self.root / 'space-ops'
        destination.mkdir(parents=True)
        (destination / installer.MARKER).write_text('spacectl\n')
        for name in installer.LEGACY_FILES:
            file = destination / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text('previous package')
        self.assertFalse(installer.check([self.entry], self.root))
        self.install()
        self.assertEqual(sorted(p.relative_to(destination).as_posix() for p in destination.rglob('*') if p.is_file()), ['.spacectl-managed', 'SKILL.md'])
        self.assertFalse((self.root.parent / 'spacectl-skill-backups').exists())

    def test_managed_inner_symlink_is_rejected_before_main_file_changes(self):
        self.install()
        destination = self.root / 'space-ops'
        outside = self.base / 'outside.txt'
        outside.write_text('retain outside content')
        refs = destination / 'references'
        refs.mkdir()
        (destination / installer.MARKER).write_text('spacectl\n')
        (refs / 'content.md').symlink_to(outside)
        self.entry.write_text('next main content')
        with self.assertRaisesRegex(SystemExit, 'symbolic-link'):
            self.install()
        self.assertEqual((destination / 'SKILL.md').read_text(), 'current instructions')
        self.assertEqual(outside.read_text(), 'retain outside content')

    def test_inner_symlink_directory_and_marker_are_rejected(self):
        self.install()
        destination = self.root / 'space-ops'
        outside = self.base / 'outside'
        outside.mkdir()
        (outside / 'content.md').write_text('outside knowledge')
        (destination / installer.MARKER).write_text('spacectl\n')
        (destination / 'references').symlink_to(outside, target_is_directory=True)
        with self.assertRaisesRegex(SystemExit, 'symbolic-link'):
            self.install()
        (destination / 'references').unlink()
        (destination / installer.MARKER).unlink()
        (destination / installer.MARKER).symlink_to(outside / 'content.md')
        with self.assertRaisesRegex(SystemExit, 'symbolic-link'):
            self.install()

    def test_invalid_ownership_path_is_rejected_without_writes(self):
        self.install()
        destination = self.root / 'space-ops'
        (destination / installer.MARKER).write_text(json.dumps({
            'product': 'spacectl', 'schemaVersion': 1, 'files': ['../outside.txt'],
        }))
        self.entry.write_text('next instructions')
        with self.assertRaisesRegex(SystemExit, 'Invalid managed file path'):
            self.install()
        self.assertEqual((destination / 'SKILL.md').read_text(), 'current instructions')

    def test_hardlinked_main_file_is_replaced_without_changing_external_inode(self):
        self.install()
        destination = self.root / 'space-ops'
        outside = self.base / 'outside.txt'
        outside.write_text('retain outside content')
        (destination / 'SKILL.md').unlink()
        os.link(outside, destination / 'SKILL.md')
        self.install()
        self.assertEqual(outside.read_text(), 'retain outside content')
        self.assertEqual((destination / 'SKILL.md').read_text(), 'current instructions')

    def test_all_destinations_are_checked_before_first_install(self):
        second = self.source.parent / 'second-skill/SKILL.md'
        second.parent.mkdir()
        second.write_text('second package')
        (self.root / 'second-skill').mkdir(parents=True)
        with self.assertRaisesRegex(SystemExit, 'not managed'):
            installer.install([self.entry, second], self.root)
        self.assertFalse((self.root / 'space-ops').exists())

    def test_unmanaged_current_skill_prevents_writes(self):
        destination = self.root / 'space-ops'
        destination.mkdir(parents=True)
        with self.assertRaisesRegex(SystemExit, 'not managed'):
            self.install()
        self.assertEqual(list(destination.iterdir()), [])

    def test_symlink_destination_is_rejected_without_touching_its_target(self):
        self.root.mkdir(parents=True)
        target = self.base / 'outside'
        target.mkdir()
        try:
            (self.root / 'space-ops').symlink_to(target, target_is_directory=True)
        except OSError:
            self.skipTest('creating symlinks requires OS permission')
        with self.assertRaisesRegex(SystemExit, 'symbolic-link'):
            self.install()
        self.assertEqual(list(target.iterdir()), [])
