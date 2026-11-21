import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class PackagedSkillTest(unittest.TestCase):
    def test_install_and_check_preserve_user_notes(self):
        installer = Path(__file__).resolve().parents[1] / "install_skill.py"
        with tempfile.TemporaryDirectory() as home:
            command = [sys.executable, str(installer)]
            env = {**os.environ, "CODEX_HOME": home}
            subprocess.run(command, env=env, check=True)
            skill = Path(home, "skills", "edition-ops")
            self.assertTrue((skill / "SKILL.md").is_file())
            note = skill / "notes.md"
            note.write_text("local notes")
            subprocess.run(command, env=env, check=True)
            subprocess.run([*command, "--check"], env=env, check=True)
            self.assertEqual(note.read_text(), "local notes")

    def test_upgrade_removes_retired_package_files_and_reports_local_drift(self):
        import json

        installer = Path(__file__).resolve().parents[1] / "install_skill.py"
        with tempfile.TemporaryDirectory() as home:
            env = {**os.environ, "CODEX_HOME": home}
            command = [sys.executable, str(installer)]
            root = Path(home, "skills", "edition-ops")
            (root / "references").mkdir(parents=True)
            (root / ".editionctl-managed").write_text(json.dumps({
                "schemaVersion": 1, "product": "editionctl",
                "files": ["SKILL.md", "references/retired.md"],
            }))
            (root / "SKILL.md").write_text("old version")
            (root / "references/retired.md").write_text("retired")
            checked = subprocess.run([*command, "--check"], env=env, capture_output=True, text=True)
            self.assertEqual(checked.returncode, 1)
            self.assertIn("obsolete", checked.stdout)
            self.assertEqual((root / "SKILL.md").read_text(), "old version")
            subprocess.run(command, env=env, check=True)
            self.assertFalse((root / "references").exists())
            self.assertNotEqual((root / "SKILL.md").read_text(), "old version")

    def test_an_unmanaged_or_damaged_installation_cannot_overwrite_local_content(self):
        installer = Path(__file__).resolve().parents[1] / "install_skill.py"
        with tempfile.TemporaryDirectory() as home:
            root = Path(home, "skills", "edition-ops")
            root.mkdir(parents=True)
            local = root / "SKILL.md"
            local.write_text("personal skill")
            for marker in (None, "{", '{"schemaVersion": 2}', '{"schemaVersion":1,"product":"editionctl","files":["../other"]}'):
                with self.subTest(marker=marker):
                    if marker is not None:
                        (root / ".editionctl-managed").write_text(marker)
                    for flags in ([], ["--check"]):
                        result = subprocess.run([sys.executable, str(installer), *flags],
                                                env={**os.environ, "CODEX_HOME": home}, capture_output=True)
                        self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(local.read_text(), "personal skill")

    def test_upgrade_keeps_personal_files_beside_retired_managed_references(self):
        installer = Path(__file__).resolve().parents[1] / "install_skill.py"
        with tempfile.TemporaryDirectory() as home:
            root = Path(home, "skills", "edition-ops")
            (root / "references").mkdir(parents=True)
            (root / ".editionctl-managed").write_text("editionctl\n")
            (root / "references/access.md").write_text("old instructions")
            note = root / "references/mine.md"
            note.write_text("personal workflow")
            subprocess.run([sys.executable, str(installer)], env={**os.environ, "CODEX_HOME": home}, check=True)
            self.assertFalse((root / "references/access.md").exists())
            self.assertEqual(note.read_text(), "personal workflow")

    def test_installer_refuses_to_replace_a_directory_or_follow_a_symbolic_link(self):
        installer = Path(__file__).resolve().parents[1] / "install_skill.py"
        with tempfile.TemporaryDirectory() as home:
            root = Path(home, "skills", "edition-ops")
            env = {**os.environ, "CODEX_HOME": home}
            command = [sys.executable, str(installer)]
            subprocess.run(command, env=env, check=True)
            entry = root / "SKILL.md"
            entry.unlink()
            entry.mkdir()
            self.assertNotEqual(subprocess.run(command, env=env, capture_output=True).returncode, 0)
            entry.rmdir()
            outside = Path(home, "personal")
            outside.write_text("personal")
            try:
                entry.symlink_to(outside)
            except OSError:
                self.skipTest("Creating symbolic links requires host privileges")
            self.assertNotEqual(subprocess.run(command, env=env, capture_output=True).returncode, 0)
            self.assertEqual(outside.read_text(), "personal")
