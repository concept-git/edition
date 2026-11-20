"""Report classification, limits, and atomic persistence failure boundaries."""

import hashlib
import json
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from space_vfs.errors import SpaceProblem
from space_vfs.report import MetadataFile, RunReport


def report(name="cat", shell=False):
    return RunReport(SimpleNamespace(command="private expression" if shell else None,
                                     words=[name, "private search text"]))


class ReportTest(unittest.TestCase):
    def test_http_errors_preserve_fields_and_next_action(self):
        for status, action, retry in [(401, "replace_credential", False), (403, "check_permission", False),
                                     (404, "check_resource", False), (409, "reopen_snapshot", True),
                                     (413, "choose_smaller_resource", False), (422, "fix_input", False),
                                     (429, "wait_and_retry", True), (503, "wait_and_retry", True)]:
            with self.subTest(status=status):
                run = report()
                failure = SpaceProblem(status, "fixture_code", 2, "fixture-trace")
                run.problem(failure, "read", "/fixture", "old-snapshot")
                run.problem(failure, "read", "/fixture", "old-snapshot")
                error = run.document(1)["errors"][0]
                self.assertEqual(len(run.errors), 1)
                self.assertEqual(error["http_status"], status)
                self.assertEqual(error["action"], action)
                self.assertEqual(error["retryable"], retry)
                self.assertEqual(error["trace_id"], "fixture-trace")
                self.assertEqual(error["retry_after_seconds"], 2)
                self.assertEqual(error["snapshot"], "old-snapshot")

    def test_transport_and_protocol_do_not_fabricate_http_status(self):
        for source, retry in [("transport", True), ("protocol", False)]:
            with self.subTest(source=source):
                run = report()
                run.problem(SpaceProblem(503, "delivery_unavailable", source=source))
                error = run.document(1)["errors"][0]
                self.assertIsNone(error["http_status"])
                self.assertEqual(error["retryable"], retry)

    def test_grep_no_match_is_distinct_from_failure_and_shell(self):
        run = report("grep")
        run.output(b"", b"", 1)
        self.assertEqual(run.document(1)["outcome"], "no_match")
        run.problem(SpaceProblem(403, "read_forbidden"))
        self.assertEqual(run.document(1)["outcome"], "error")
        shell = report("grep", shell=True)
        shell.output(b"", b"", 1)
        self.assertEqual(shell.document(1)["outcome"], "error")
        shell.command_exit_code = 0
        self.assertEqual(shell.document(0)["outcome"], "completed_with_errors")

    def test_limits_and_per_call_isolation(self):
        run, other = report(), report()
        for number in range(1100):
            run.resource("read", f"/{number}", f"s-{number % 2}", number, None)
            run.problem(SpaceProblem(404, "file_not_found"), "read", f"/{number}", "s-0")
        doc = run.document(0)
        self.assertEqual(len(doc["resources"]), 1024)
        self.assertEqual(len(doc["errors"]), 128)
        self.assertTrue(doc["resources_truncated"])
        self.assertTrue(doc["errors_truncated"])
        self.assertEqual(doc["outcome"], "completed_with_errors")
        self.assertFalse(other.had_errors)
        self.assertEqual(other.resources, [])

    def test_output_digest_and_resource_digest_have_separate_meaning(self):
        run = report()
        run.resource("read", "/a", "s1", 5, "reader-digest")
        run.resource("read", "/a", "s2", 6, "second-reader-digest")
        run.output(b"numbered output", b"", 0)
        doc = run.document(0)
        self.assertEqual(len(doc["resources"]), 2)
        self.assertEqual(doc["stdout"]["produced_sha256"], hashlib.sha256(b"numbered output").hexdigest())
        self.assertNotEqual(doc["stdout"]["produced_sha256"], doc["resources"][0]["reader_sha256"])
        self.assertNotIn("private search text", json.dumps(doc))
        self.assertNotIn("private expression", json.dumps(report(shell=True).document(0)))

    def test_replay_atomically_replaces_private_file_and_failed_replace_preserves_old(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "report.json"
            ids = []
            for _ in range(2):
                run = report()
                writer = MetadataFile(str(path))
                try:
                    writer.prepare()
                    writer.commit(run.document(0))
                finally:
                    writer.close()
                ids.append(json.loads(path.read_text())["run_id"])
            self.assertNotEqual(*ids)
            if os.name != "nt":
                self.assertEqual(path.stat().st_mode & 0o777, 0o600)
            old = path.read_bytes()
            writer = MetadataFile(str(path))
            try:
                writer.prepare()
                with patch("space_vfs.report.os.replace", side_effect=OSError("full disk")), self.assertRaises(OSError):
                    writer.commit(report().document(0))
            finally:
                writer.close()
            self.assertEqual(path.read_bytes(), old)
            self.assertEqual(list(Path(directory).glob("*.tmp")), [])

    def test_symlinks_and_standard_stream_aliases_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "report.json"
            target.write_text("old")
            link = Path(directory) / "alias.json"
            link.symlink_to(target)
            with self.assertRaises(OSError):
                MetadataFile(str(link)).prepare()
            with target.open("wb") as stdout, patch("space_vfs.report.sys.stdout", stdout), self.assertRaises(OSError):
                MetadataFile(str(target)).prepare()


if __name__ == "__main__":
    unittest.main()
