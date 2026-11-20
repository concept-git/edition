"""Bounded per-call evidence and private atomic metadata files (stdlib only)."""

import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys
import tempfile
import time
import uuid


EXAMPLE = "space-vfs --origin https://docs.example.com --host docs.example.com --space docs ls /space"
READER_ACTIONS = {
    401: ("replace_credential", False, "Set a valid reader Token in the selected environment variable."),
    403: ("check_permission", False, "Check the reader grant for this resource."),
    404: ("check_resource", False, "Check the space and resource path."),
    409: ("reopen_snapshot", True, "Run a new command to open the current snapshot."),
    413: ("choose_smaller_resource", False, "Choose a file below the read limit."),
    422: ("fix_input", False, "Correct the input or restart pagination."),
    429: ("wait_and_retry", True, "Wait for Retry-After and reduce concurrent reads."),
    503: ("wait_and_retry", True, "Check Reader availability and retry later."),
    504: ("wait_and_retry", True, "Check Reader availability and retry later."),
}
LOCAL_ACTIONS = {
    "invalid_arguments": ("fix_input", False, "Correct the command arguments."),
    "dependency_missing": ("install_runtime", False, "Install space-vfs[mirage] in the selected Python environment."),
    "platform_unavailable": ("check_connection", False, "Start the local platform or provide explicit connection options."),
    "transport_unavailable": ("check_connection", True, "Check the connection and retry later."),
    "command_failed": ("check_command", False, "Check the command and its diagnostic output."),
    "output_write_failed": ("check_output", False, "Check the output pipe or destination."),
    "interrupted": ("rerun_command", False, "The command was interrupted."),
    "unexpected": ("report_issue", False, "An internal failure prevented completion."),
}


class RunReport:
    def __init__(self, args):
        self.started = time.monotonic()
        self.run_id = str(uuid.uuid4())
        shell = args.command is not None
        name = args.words[0] if args.words and not shell else None
        if name is not None and not re.fullmatch(r"[a-z][a-z0-9_-]{0,63}", name):
            name = None
        self.command = {"mode": "shell" if shell else "argv",
                        "name": name}
        self.command_exit_code = None
        self.stdout = {"produced_bytes": 0, "produced_sha256": hashlib.sha256(b"").hexdigest(),
                       "delivery_complete": False}
        self.stderr = {"produced_bytes": 0}
        self.resources = []
        self.errors = []
        self.resources_truncated = False
        self.errors_truncated = False
        self.had_errors = False
        self._resource_keys = set()

    def resource(self, operation, path, snapshot, size=None, sha256=None):
        key = (operation, path, snapshot, size, sha256)
        if key in self._resource_keys:
            return
        if len(self.resources) >= 1024:
            self.resources_truncated = True
            return
        self._resource_keys.add(key)
        self.resources.append({"operation": operation, "path": path, "snapshot": snapshot,
                               "size_bytes": size, "reader_sha256": sha256})

    def _error(self, row):
        self.had_errors = True
        if len(self.errors) >= 128:
            self.errors_truncated = True
        else:
            self.errors.append(row)

    def problem(self, error, operation=None, path=None, snapshot=None):
        # The same exception can cross bind and read boundaries. Record it once.
        if getattr(error, "_vfs_report", None) is self:
            return
        error._vfs_report = self
        source = getattr(error, "source", "reader")
        code = "transport_unavailable" if source == "transport" else error.code
        action, retryable, message = (LOCAL_ACTIONS[code] if source == "transport" else
                                     READER_ACTIONS.get(error.status, LOCAL_ACTIONS["unexpected"]))
        if code == "cursor_invalid":
            action, retryable = "restart_pagination", True
        if source == "protocol":
            action, retryable, message = "report_issue", False, "Reader returned invalid protocol data."
        self._error({"source": source, "code": code, "http_status": getattr(error, "http_status", error.status),
                     "operation": operation, "path": path, "snapshot": snapshot,
                     "retryable": retryable, "retry_after_seconds": error.retry_after,
                     "trace_id": error.trace_id, "action": action, "message": message, "example": EXAMPLE})

    def failure(self, code, source="cli"):
        action, retryable, message = LOCAL_ACTIONS[code]
        self._error({"source": source, "code": code, "http_status": None,
                     "operation": None, "path": None, "snapshot": None,
                     "retryable": retryable, "retry_after_seconds": None, "trace_id": None,
                     "action": action, "message": message, "example": EXAMPLE})

    def output(self, stdout, stderr, code):
        self.command_exit_code = code
        self.stdout.update(produced_bytes=len(stdout), produced_sha256=hashlib.sha256(stdout).hexdigest())
        self.stderr["produced_bytes"] = len(stderr)

    def document(self, exit_code):
        no_match = (self.command == {"mode": "argv", "name": "grep"} and self.command_exit_code == 1
                    and exit_code == 1 and not self.had_errors and self.stderr["produced_bytes"] == 0)
        if exit_code == 0:
            outcome = "completed_with_errors" if self.had_errors else "success"
        elif no_match:
            outcome = "no_match"
        else:
            outcome = "error"
            if not self.had_errors:
                self.failure("command_failed", "command")
        return {"schema_version": 1, "run_id": self.run_id, "command": self.command, "outcome": outcome,
                "command_exit_code": self.command_exit_code, "exit_code": exit_code,
                "duration_ms": max(0, round((time.monotonic() - self.started) * 1000)),
                "stdout": self.stdout, "stderr": self.stderr, "resources": self.resources, "errors": self.errors,
                "resources_truncated": self.resources_truncated, "errors_truncated": self.errors_truncated}


class MetadataFile:
    def __init__(self, name):
        self.path = Path(name).absolute()
        self.name = name
        self.temporary = None
        self.fd = None

    def check_target(self):
        if self.name == "-":
            raise OSError("metadata cannot replace stdout")
        if not self.path.parent.is_dir():
            raise OSError("metadata parent directory must exist")
        try:
            target = self.path.lstat()
        except FileNotFoundError:
            return
        if not stat.S_ISREG(target.st_mode):
            raise OSError("metadata target must be a regular file")
        for stream in (sys.stdin, sys.stdout, sys.stderr):
            try:
                opened = os.fstat(stream.fileno())
            except (AttributeError, OSError, ValueError):
                continue
            if stat.S_ISREG(opened.st_mode) and (opened.st_dev, opened.st_ino) == (target.st_dev, target.st_ino):
                raise OSError("metadata target conflicts with a standard stream")

    def prepare(self):
        self.check_target()
        self.fd, name = tempfile.mkstemp(prefix=".space-vfs-", suffix=".json.tmp", dir=self.path.parent)
        self.temporary = Path(name)

    def commit(self, document):
        # Recheck after execution, before replacement, including symlinks and stream collisions.
        self.check_target()
        fd, self.fd = self.fd, None
        with os.fdopen(fd, "w", encoding="utf-8") as output:
            json.dump(document, output, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
            output.write("\n")
            output.flush()
            os.fsync(output.fileno())
        os.replace(self.temporary, self.path)
        self.temporary = None

    def close(self):
        if self.fd is not None:
            os.close(self.fd)
            self.fd = None
        if self.temporary is not None:
            self.temporary.unlink(missing_ok=True)
            self.temporary = None
