"""Exercise both public command entry points with real Mirage and HTTP I/O."""

import hashlib
import contextlib
import http.server
import importlib.util
import json
import io
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from test_client import FakeReader


ROOT = Path(__file__).resolve().parents[4]
CLI = ROOT / "clients/space/python/src/space_vfs/cli.py"
BINARY = b"\x00\xff\xfe\r\n\x80"


class CliReader(FakeReader):
    invalid_snapshot = False
    fault = None
    fault_remaining = None
    fault_count = 0

    def do_GET(self):
        if self.invalid_snapshot and urlparse(self.path).path.endswith("/snapshot"):
            return self._json({})
        query = parse_qs(urlparse(self.path).query)
        if query.get("path") == ["/fault"] and self.fault and self.fault_remaining != 0:
            type(self).fault_count += 1
            if self.fault_remaining is not None:
                type(self).fault_remaining -= 1
            status, code = self.fault
            self.send_response(status)
            self.send_header("Content-Type", "application/problem+json")
            self.send_header("Retry-After", "0")
            self.end_headers()
            self.wfile.write(json.dumps({"code": code, "traceId": "fixture-trace"}).encode())
            return
        if urlparse(self.path).path.endswith("/content") and query.get("path") == ["/binary.bin"]:
            self.send_response(200)
            self.send_header("ETag", '"' + hashlib.sha256(BINARY).hexdigest() + '"')
            self.send_header("Content-Type", "application/octet-stream")
            self.end_headers()
            self.wfile.write(BINARY)
            return
        super().do_GET()


@unittest.skipUnless(importlib.util.find_spec("mirage"), "mirage-ai extra is not installed")
class CommandCliTest(unittest.TestCase):
    def setUp(self):
        self.previous_pages = FakeReader.pages
        FakeReader.pages = {"/file name.md": {"text": "hello world\n"}, "/binary.bin": {"text": "fixture"}}
        self.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), CliReader)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True)
        self.thread.start()
        self.connection = ["--origin", f"http://127.0.0.1:{self.server.server_port}",
                           "--host", "docs.localhost", "--space", "docs"]
        self.env = dict(os.environ, SPACE_TOKEN="spc_ok")

    def tearDown(self):
        CliReader.invalid_snapshot = False
        CliReader.fault = None
        CliReader.fault_remaining = None
        CliReader.fault_count = 0
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        FakeReader.pages = self.previous_pages

    def invoke(self, words, *, launcher=False, stdin=None, env=None):
        prefix = [sys.executable, str(CLI)]
        if launcher:
            prefix = [os.environ.get("SPACE_NODE", "node"), str(ROOT / "infra/space.ts"), "vfs", "--python", sys.executable]
        return subprocess.run([*prefix, *self.connection, *words], cwd=ROOT,
                              input=stdin, capture_output=True, env=env or self.env, timeout=10)

    def test_both_entry_points_keep_spaces_and_literal_substitution(self):
        for launcher in (False, True):
            with self.subTest(launcher=launcher):
                matched = self.invoke(["grep", "hello world", "/space/file name.md"], launcher=launcher)
                self.assertEqual(matched.returncode, 0, matched.stderr)
                self.assertEqual(matched.stdout, b"hello world\n")
                literal = self.invoke(["echo", "$(cat /space/file name.md)"], launcher=launcher)
                self.assertEqual(literal.returncode, 0, literal.stderr)
                self.assertEqual(literal.stdout, b"$(cat /space/file name.md)\n")

    def test_both_entry_points_preserve_binary_file_bytes(self):
        for launcher in (False, True):
            with self.subTest(launcher=launcher):
                result = self.invoke(["cat", "/space/binary.bin"], launcher=launcher)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout, BINARY)

    def test_metadata_preserves_binary_stdout_and_records_its_hash(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "result with spaces.json"
            result = self.invoke(["--metadata-file", str(path), "cat", "/space/binary.bin"])
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(result.stdout, BINARY)
            report = json.loads(path.read_text())
        self.assertEqual(report["outcome"], "success")
        self.assertEqual(report["command"], {"mode": "argv", "name": "cat"})
        self.assertEqual(report["stdout"]["produced_sha256"], hashlib.sha256(BINARY).hexdigest())
        self.assertEqual(report["stdout"]["produced_bytes"], len(BINARY))
        self.assertTrue(report["stdout"]["delivery_complete"])
        self.assertEqual(report["resources"][0]["path"], "/binary.bin")

    def metadata(self, words, *, launcher=False, env=None, stdin=None):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "result.json"
            result = self.invoke(["--metadata-file", str(path), *words], launcher=launcher, env=env, stdin=stdin)
            return result, json.loads(path.read_text())

    def test_metadata_outcomes_match_on_both_entries(self):
        for launcher in (False, True):
            for words, code, outcome in [(["grep", "missing", "/space/file name.md"], 1, "no_match"),
                                         (["cat", "/space/absent.md"], 1, "error"),
                                         (["--command", "cat /space/absent.md || true"], 0, "completed_with_errors"),
                                         (["--command", "cat /space/absent.md | head"], 0, "completed_with_errors")]:
                with self.subTest(launcher=launcher, words=words):
                    result, doc = self.metadata(words, launcher=launcher)
                    self.assertEqual(result.returncode, code, result.stderr)
                    self.assertEqual(doc["exit_code"], code)
                    self.assertEqual(doc["command_exit_code"], code)
                    self.assertEqual(doc["outcome"], outcome)
                    if outcome != "no_match":
                        self.assertEqual(doc["errors"][0]["http_status"], 404)

    def test_metadata_captures_bind_failure_without_token(self):
        result, doc = self.metadata(["cat", "/space/file name.md"], env=dict(self.env, SPACE_TOKEN="bad"))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(doc["outcome"], "error")
        self.assertEqual(doc["errors"][0]["http_status"], 401)
        self.assertEqual(doc["errors"][0]["code"], "invalid_token")
        self.assertFalse(doc["errors"][0]["retryable"])
        self.assertNotIn('"bad"', json.dumps(doc))

    def test_metadata_keeps_http_error_fields_through_mirage_translation(self):
        for status, code in [(403, "read_forbidden"), (409, "snapshot_changed"),
                             (413, "content_too_large"), (422, "validation_failed"),
                             (429, "read_limit_exceeded"), (503, "delivery_unavailable")]:
            with self.subTest(status=status):
                CliReader.fault = status, code
                result, doc = self.metadata(["cat", "/space/fault"])
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(doc["outcome"], "error")
                self.assertEqual(len(doc["errors"]), 1)
                error = doc["errors"][0]
                self.assertEqual(error["http_status"], status)
                self.assertEqual(error["code"], code)
                self.assertEqual(error["trace_id"], "fixture-trace")
                self.assertEqual(error["retry_after_seconds"], 0)
                self.assertEqual(error["snapshot"], FakeReader.snapshot)

    def test_metadata_does_not_report_recovered_http_retries_as_failure(self):
        FakeReader.pages["/fault"] = {"text": "ready\n"}
        CliReader.fault = 503, "delivery_unavailable"
        CliReader.fault_remaining = 1
        result, doc = self.metadata(["cat", "/space/fault"])
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, b"ready\n")
        self.assertEqual(doc["outcome"], "success")
        self.assertEqual(doc["errors"], [])
        self.assertEqual(CliReader.fault_count, 1)

    def test_metadata_rejects_invalid_protocol_without_fabricated_http_error(self):
        CliReader.invalid_snapshot = True
        result, doc = self.metadata(["cat", "/space/file name.md"])
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(doc["errors"][0]["source"], "protocol")
        self.assertIsNone(doc["errors"][0]["http_status"])
        self.assertFalse(doc["errors"][0]["retryable"])

    def test_metadata_preserves_partial_output_and_read_context(self):
        result, doc = self.metadata(["cat", "/space/file name.md", "/space/absent.md"])
        self.assertEqual(result.stdout, b"hello world\n")
        self.assertEqual(doc["outcome"], "error")
        error = doc["errors"][0]
        self.assertEqual(error["path"], "/absent.md")
        self.assertEqual(error["snapshot"], FakeReader.snapshot)
        self.assertEqual(doc["stdout"]["produced_bytes"], len(result.stdout))

    def test_metadata_describes_transformed_output_and_stdin_without_storing_input(self):
        result, doc = self.metadata(["cat", "-n", "/space/file name.md"])
        digest = hashlib.sha256(result.stdout).hexdigest()
        self.assertEqual(doc["stdout"]["produced_sha256"], digest)
        self.assertNotEqual(doc["resources"][0]["reader_sha256"], digest)
        result, doc = self.metadata(["--stdin", "grep", "sensitive-pattern"], stdin=b"sensitive-pattern body\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn("sensitive-pattern", json.dumps(doc))
        self.assertEqual(doc["resources"], [])

    def test_invalid_report_target_fails_before_any_reader_request(self):
        before = len(FakeReader.seen)
        with tempfile.TemporaryDirectory() as directory:
            for target in ("", "-", directory, str(Path(directory) / "missing/report.json")):
                with self.subTest(target=target):
                    result = self.invoke(["--metadata-file", target, "cat", "/space/file name.md"])
                    self.assertEqual(result.returncode, 74)
                    self.assertIn(b"metadata_write_failed", result.stderr)
                    self.assertEqual(result.stdout, b"")
        self.assertEqual(len(FakeReader.seen), before)

    def test_metadata_cannot_overwrite_redirected_binary_output(self):
        for launcher in (False, True):
            with tempfile.TemporaryDirectory() as directory, self.subTest(launcher=launcher):
                path = Path(directory) / "output.bin"
                prefix = [sys.executable, str(CLI)]
                if launcher:
                    prefix = [os.environ.get("SPACE_NODE", "node"), str(ROOT / "infra/space.ts"), "vfs", "--python", sys.executable]
                with path.open("wb") as stdout:
                    result = subprocess.run([*prefix, *self.connection, "--metadata-file", str(path),
                                             "cat", "/space/binary.bin"], stdout=stdout, stderr=subprocess.PIPE,
                                            env=self.env, timeout=10)
                self.assertEqual(result.returncode, 74, result.stderr)
                self.assertEqual(path.read_bytes(), b"")

    def test_metadata_is_written_after_interrupt(self):
        from space_vfs.cli import main
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "result.json"
            with patch("space_vfs.cli.execute", side_effect=KeyboardInterrupt):
                self.assertEqual(main([*self.connection, "--metadata-file", str(path), "ls", "/space"]), 130)
            doc = json.loads(path.read_text())
            self.assertEqual(doc["errors"][0]["code"], "interrupted")
            self.assertEqual(doc["exit_code"], 130)

    def test_metadata_reports_broken_stdout_pipe(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "result.json"
            process = subprocess.Popen([sys.executable, str(CLI), *self.connection, "--metadata-file", str(path),
                                        "cat", "/space/binary.bin"], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                       env=self.env)
            process.stdout.close()
            self.assertEqual(process.wait(timeout=15), 1)
            process.stderr.close()
            doc = json.loads(path.read_text())
        self.assertEqual(doc["command_exit_code"], 0)
        self.assertEqual(doc["outcome"], "error")
        self.assertFalse(doc["stdout"]["delivery_complete"])
        self.assertEqual(doc["errors"][0]["code"], "output_write_failed")

    def test_metadata_reports_close_failure_and_final_file_failure(self):
        from mirage import Workspace
        from space_vfs.cli import main
        from types import SimpleNamespace
        real_close = Workspace.close
        async def broken_close(workspace):
            await real_close(workspace)
            raise OSError("fixture-secret-detail")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "result.json"
            stdout, stderr = io.BytesIO(), io.BytesIO()
            args = [*self.connection, "--metadata-file", str(path), "cat", "/space/file name.md"]
            with patch("space_vfs.cli.sys.stdout", SimpleNamespace(buffer=stdout)), \
                    patch("space_vfs.cli.sys.stderr", SimpleNamespace(buffer=stderr, write=lambda s: stderr.write(s.encode()))), \
                    patch.object(Workspace, "close", broken_close):
                self.assertEqual(main(args), 1)
            doc = json.loads(path.read_text())
            self.assertEqual(doc["command_exit_code"], 0)
            self.assertEqual(doc["outcome"], "error")
            self.assertNotIn("fixture-secret-detail", path.read_text())
            old = path.read_bytes()
            stdout, stderr = io.BytesIO(), io.BytesIO()
            with patch("space_vfs.cli.sys.stdout", SimpleNamespace(buffer=stdout)), \
                    patch("space_vfs.cli.sys.stderr", SimpleNamespace(buffer=stderr, write=lambda s: stderr.write(s.encode()))), \
                    patch("os.replace", side_effect=OSError("full disk")):
                self.assertEqual(main(args), 74)
            self.assertEqual(path.read_bytes(), old)
            self.assertIn(b"metadata_write_failed", stderr.getvalue())

    def test_explicit_shell_pipeline_and_substitution(self):
        for launcher in (False, True):
            for expression in ["cat '/space/file name.md' | grep hello", "echo $(cat '/space/file name.md')"]:
                with self.subTest(launcher=launcher, expression=expression):
                    result = self.invoke(["--command", expression], launcher=launcher)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(result.stdout, b"hello world\n")

    def test_both_entry_points_forward_piped_stdin(self):
        for launcher in (False, True):
            with self.subTest(launcher=launcher):
                result = self.invoke(["--stdin", "grep", "hello"], launcher=launcher,
                                     stdin=b"ignore\nhello from stdin\n")
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout, b"hello from stdin\n")

    def test_exit_status_and_errors_remain_separate_from_content(self):
        result = self.invoke(["cat", "/space/absent.md"])
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, b"")
        self.assertIn(b"No such file", result.stderr)
        unmatched = self.invoke(["grep", "missing", "/space/file name.md"])
        self.assertEqual(unmatched.returncode, 1)

    def test_private_token_uses_selected_environment_not_argv(self):
        env = dict(self.env, SPACE_TOKEN="bad", VFS_TEST_READER_TOKEN="spc_ok")
        result = self.invoke(["--token-env", "VFS_TEST_READER_TOKEN", "cat", "/space/file name.md"], env=env)
        self.assertEqual(result.returncode, 0, result.stderr)
        denied = self.invoke(["cat", "/space/file name.md"], env=dict(self.env, SPACE_TOKEN="bad"))
        self.assertNotEqual(denied.returncode, 0)
        self.assertEqual(denied.stdout, b"")
        self.assertNotIn(b"bad", denied.stderr)

    def test_invalid_connection_is_actionable_and_redacts_credentials(self):
        result = subprocess.run([sys.executable, str(CLI), "--origin", "https://user:fixture-secret@example.com",
                                 "--host", "docs.localhost", "--space", "docs", "ls", "/space"],
                                capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 2)
        self.assertIn(b"Example:", result.stderr)
        self.assertNotIn(b"Traceback", result.stderr)
        self.assertNotIn(b"fixture-secret", result.stderr)

    def test_non_primary_help_needs_no_reader(self):
        result = subprocess.run([os.environ.get("SPACE_NODE", "node"), str(ROOT / "infra/space.ts"), "vfs", "--python", sys.executable,
                                 "head", "--help"], capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(b"Usage:", result.stdout)
        self.assertIn(b"Examples:", result.stdout)

    def test_mount_dry_run_checks_access_without_fuse(self):
        with tempfile.TemporaryDirectory() as directory:
            result = subprocess.run([sys.executable, "-m", "space_vfs.mount", "--mountpoint", directory,
                                     *self.connection, "--dry-run"], input=b"", capture_output=True,
                                    env=self.env, timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr)
        plan = json.loads(result.stdout)
        self.assertEqual(plan["status"], "validated")
        self.assertTrue(plan["read_only"])
        self.assertEqual(plan["snapshot"], FakeReader.snapshot)
        self.assertNotIn(b"spc_ok", result.stdout + result.stderr)

    def test_mount_dry_run_auth_failure_is_not_a_success_plan(self):
        with tempfile.TemporaryDirectory() as directory:
            result = subprocess.run([sys.executable, "-m", "space_vfs.mount", directory,
                                     *self.connection, "--dry-run"], capture_output=True,
                                    env=dict(self.env, SPACE_TOKEN="bad"), timeout=10)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, b"")
        self.assertIn(b"401 invalid_token", result.stderr)
        self.assertIn(b"valid reader Token", result.stderr)
        self.assertNotIn(b"Traceback", result.stderr)

    def test_mount_dry_run_rejects_invalid_reader_metadata(self):
        CliReader.invalid_snapshot = True
        with tempfile.TemporaryDirectory() as directory:
            result = subprocess.run([sys.executable, "-m", "space_vfs.mount", directory,
                                     *self.connection, "--dry-run"], capture_output=True,
                                    env=self.env, timeout=10)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, b"")
        self.assertIn(b"503 delivery_unavailable", result.stderr)
        self.assertNotIn(b"Traceback", result.stderr)

    def test_stdin_on_terminal_fails_immediately_instead_of_prompting(self):
        from space_vfs.cli import main
        with patch("space_vfs.cli.sys.stdin.isatty", return_value=True), \
                contextlib.redirect_stderr(io.StringIO()) as output, \
                self.assertRaises(SystemExit) as error:
            main([*self.connection, "--stdin", "grep", "hello"])
        self.assertEqual(error.exception.code, 2)
        self.assertIn("requires piped input", output.getvalue())


class OfflineCliTest(unittest.TestCase):
    def test_metadata_reports_missing_runtime_and_parsed_validation_errors(self):
        for words, code, error in [(["ls", "/space"], 1, "dependency_missing"),
                                   ([], 2, "invalid_arguments"),
                                   (["--command", ""], 2, "invalid_arguments")]:
            with tempfile.TemporaryDirectory() as directory, self.subTest(words=words):
                path = Path(directory) / "result.json"
                args = [sys.executable, "-S", str(CLI), "--origin", "https://docs.example.com",
                        "--host", "docs.example.com", "--space", "docs", "--metadata-file", str(path), *words]
                result = subprocess.run(args, capture_output=True, timeout=5)
                self.assertEqual(result.returncode, code, result.stderr)
                doc = json.loads(path.read_text())
                self.assertEqual(doc["errors"][0]["code"], error)
                self.assertIsNone(doc["command_exit_code"])

    def test_metadata_option_does_not_create_file_for_offline_help(self):
        for prefix in ([sys.executable, "-S", str(CLI)],
                       [os.environ.get("SPACE_NODE", "node"), str(ROOT / "infra/space.ts"), "vfs"]):
            with tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "ignored.json"
                result = subprocess.run([*prefix, "--metadata-file", str(path), "cat", "--help"],
                                        capture_output=True, timeout=5)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertFalse(path.exists())

    def test_primary_help_works_without_site_or_optional_dependencies(self):
        # -S removes site-packages. Common help must still work.
        for prefix in ([sys.executable, "-S", str(CLI)],
                       [os.environ.get("SPACE_NODE", "node"), str(ROOT / "infra/space.ts"), "vfs"]):
            for suffix in (["--help"], ["ls", "--help"], ["ls", "-l", "--help"], ["cat", "--help"], ["grep", "--help"]):
                with self.subTest(prefix=prefix, suffix=suffix):
                    result = subprocess.run([*prefix, *suffix], capture_output=True, timeout=5)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertIn(b"Examples:", result.stdout)
                    self.assertEqual(result.stderr, b"")

    def test_missing_and_conflicting_inputs_fail_with_complete_example(self):
        for words in ([], ["--origin", "https://docs.example.com", "ls", "/space"],
                      ["--command", "ls /space", "cat", "/space/intro"], ["--command", ""]):
            with self.subTest(words=words):
                result = subprocess.run([sys.executable, "-S", str(CLI), *words], capture_output=True, timeout=5)
                self.assertEqual(result.returncode, 2)
                self.assertIn(b"Example: space-vfs --origin", result.stderr)
                self.assertEqual(result.stdout, b"")
                self.assertNotIn(b"Traceback", result.stderr)
