"""Headless command entry point. Parser and common help use only the stdlib."""

import argparse
import asyncio
import os
from pathlib import Path
import re
import runpy
import shlex
import sys


COMMAND_HELP = {
    "ls": ("List authorized files and directories", "ls [flags] [path ...]", """  -1       One entry per line
  -l       Include file metadata
  -R       List directories recursively
  -a       Include hidden entries
  --help   Show this help""", ["ls /space", "ls -1 /space", "ls -l /space"]),
    "cat": ("Read original file bytes", "cat [flags] path ...", """  -n       Number output lines
  -b       Number nonempty output lines
  -s       Suppress repeated empty lines
  --help   Show this help""", ["cat /space/intro", 'cat "/space/file name.md"', "cat /space/manual.pdf > manual.pdf"]),
    "grep": ("Find text in files or --stdin input", "grep [flags] pattern [path ...]", """  -r       Search directories recursively
  -i       Ignore case
  -n       Include line numbers
  -F       Match a literal string
  -e TEXT  Specify a pattern, including one starting with '-'
  -f PATH  Read patterns from a file
  -q       Return only the match exit code
  --help   Show this help""", ['grep -n "hello world" /space/intro', "grep -r -F Webhook /space", "--stdin grep hello"]),
}


class CliParser(argparse.ArgumentParser):
    def error(self, message):
        self.print_usage(sys.stderr)
        self.exit(2, f"Error: {message}\nExample: {getattr(self, 'example', self.prog + ' --help')}\n")


def configure_parser(parser, prefix):
    """Shared by the installed CLI and the repository launcher."""
    parser.example = f"{prefix} ls /space"
    parser.formatter_class = argparse.RawDescriptionHelpFormatter
    parser.description = "Read an authorized Space with Mirage commands (ls, cat, grep, ...)."
    parser.epilog = f"""Options must precede the command. Command arguments keep their literal boundaries.
Use --command for shell expressions. The /space mount is read-only.

Examples:
  {prefix} ls /space
  {prefix} cat "/space/file name.md"
  {prefix} grep -n "hello world" /space/intro
  {prefix} --command 'cat /space/intro | grep hello'
  {prefix} --metadata-file result.json cat /space/manual.pdf > manual.pdf
  printf 'hello\\n' | {prefix} --stdin grep hello
  {prefix} ls --help
"""
    parser.add_argument("--origin", help="site origin URL; required for standalone reads")
    parser.add_argument("--host", help="site Host header, e.g. docs.example.com")
    parser.add_argument("--space", help="space slug, e.g. docs")
    parser.add_argument("--token-env", default="EDITION_TOKEN", metavar="NAME", help="Bearer environment variable (default: EDITION_TOKEN)")
    parser.add_argument("--tls-insecure", action="store_true", help="allow a test certificate for a loopback origin")
    parser.add_argument("--stdin", action="store_true", help="read piped bytes as command input; never prompt")
    parser.add_argument("--metadata-file", metavar="PATH", help="atomically write a JSON result report; keep stdout as original bytes")
    parser.add_argument("--command", metavar="EXPRESSION", help="explicit Mirage shell expression; enables pipes and substitutions")
    parser.add_argument("words", nargs=argparse.REMAINDER, metavar="command [args ...]", help="Mirage command and literal arguments")


def command_text(parser, args):
    words = args.words[1:] if args.words[:1] == ["--"] else args.words
    args.words = words
    if args.command is not None and words:
        parser.error("use either command arguments or --command, not both")
    if args.command is not None:
        if not args.command.strip():
            parser.error("--command must contain a shell expression")
        return args.command
    if not words:
        parser.error("provide a command, such as ls /space")
    return shlex.join(words)


def help_requested(args):
    if args.command is not None or not args.words:
        return False
    flags = args.words[1:]
    # A '--help' pattern after the command's '--' is literal data.
    if "--" in flags:
        flags = flags[:flags.index("--")]
    return "--help" in flags


def print_command_help(args, prefix):
    """Return True when common command help was printed without the runtime."""
    if not help_requested(args) or args.words[0] not in COMMAND_HELP:
        return False
    name = args.words[0]
    description, usage, options, examples = COMMAND_HELP[name]
    print(f"{description}\n\nUsage: {prefix} {usage}\n\nCommon options:\n{options}\n\nExamples:")
    for example in examples:
        if example.startswith("--stdin"):
            print(f"  printf 'hello\\n' | {prefix} {example}")
        else:
            print(f"  {prefix} {example}")
    print("\nSee the Mirage runtime for additional flags. Connection and --stdin options precede the command.")
    return True


def validate_connection(parser, args, *, allow_local=False):
    supplied = any(value is not None for value in (args.origin, args.host, args.space))
    if supplied or not allow_local:
        missing = [f"--{name}" for name in ("origin", "host", "space") if getattr(args, name) is None]
        if missing:
            parser.error("required connection options: " + ", ".join(missing))
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", args.token_env):
        parser.error("--token-env must be an environment variable name")
    if getattr(args, "stdin", False) and sys.stdin.isatty():
        parser.error("--stdin requires piped input; use printf 'hello\\n' | " + parser.example.rsplit(" ls", 1)[0] + " --stdin grep hello")


def binary_stdio():
    if os.name == "nt":
        import msvcrt
        for stream in (sys.stdin, sys.stdout, sys.stderr):
            msvcrt.setmode(stream.fileno(), os.O_BINARY)


def validation_message(error):
    # Pydantic input/ctx can contain credentials. Only emit our public messages.
    return "; ".join((".".join(map(str, item["loc"])) or "connection") + ": " + item["msg"]
                     for item in error.errors(include_input=False, include_context=False, include_url=False))


def problem_message(error):
    action = {401: "set a valid reader Token in the configured environment variable",
              403: "check the reader grant for this resource", 404: "check --space and the resource path",
              409: "rerun the command to open the current snapshot", 413: "choose a file below the read limit",
              429: "retry later with fewer concurrent reads", 503: "check Reader availability and retry later"}
    message = f"{error.status} {error.code}: {action.get(error.status, 'check the command and connection options')}"
    if error.trace_id:
        message += f" (traceId: {error.trace_id})"
    return message


async def execute(args, text, *, help_only=False, report=None):
    from mirage import ConsistencyPolicy, MountMode, Workspace
    from edition_vfs import SpaceConfig, EditionVFS

    mounts = {} if help_only else {"/space": EditionVFS(SpaceConfig(
        origin=args.origin, host=args.host, space=args.space,
        token=os.environ.get(args.token_env), tls_insecure=args.tls_insecure,
    ))}
    if report is not None and mounts:
        mounts["/space"].accessor.report = report
    workspace = Workspace(mounts, mode=MountMode.READ, consistency=ConsistencyPolicy.ALWAYS)
    try:
        stdin = sys.stdin.buffer.read() if args.stdin and not help_only else None
        result = await workspace.execute(text, stdin=stdin)
        if report is not None:
            report.command_exit_code = result.exit_code
        stdout = await result.materialize_stdout()
        stderr = await result.materialize_stderr()
        if report is not None:
            report.output(stdout, stderr, result.exit_code)
        sys.stdout.buffer.write(stdout)
        sys.stdout.buffer.flush()
        if report is not None:
            report.stdout["delivery_complete"] = True
        sys.stderr.buffer.write(stderr)
        if help_requested(args) and result.exit_code == 0:
            sys.stdout.buffer.write(f"\nExamples:\n  {args.invocation} --command {shlex.quote(text)}\n".encode())
        sys.stdout.buffer.flush()
        sys.stderr.buffer.flush()
        return result.exit_code
    finally:
        try:
            await workspace.close()
        except Exception as error:
            raise RuntimeError("workspace cleanup failed") from error


def report_types():
    # Also works for script/launcher calls without the optional client dependencies.
    module = runpy.run_path(str(Path(__file__).with_name("report.py")))
    return module["RunReport"], module["MetadataFile"]


def metadata_error():
    print("Error: metadata_write_failed. Use a writable regular file in an existing directory, "
          "separate from stdin/stdout/stderr.\nExample: edition-vfs --origin https://docs.example.com "
          "--host docs.example.com --space docs --metadata-file /tmp/vfs-result.json ls /space", file=sys.stderr)


def write_failure_report(args, exit_code, code):
    """Launcher setup failures use the same report format as the child CLI."""
    if getattr(args, "metadata_file", None) is None:
        return exit_code
    report_class, file_class = report_types()
    report = report_class(args)
    report.failure(code)
    writer = file_class(args.metadata_file)
    try:
        writer.prepare()
        writer.commit(report.document(exit_code))
        return exit_code
    except (OSError, ValueError, TypeError):
        metadata_error()
        return 74
    finally:
        writer.close()


def silence_broken_output():
    # Suppress a second flush error when a downstream reader has closed.
    with open(os.devnull, "wb") as sink:
        for stream in (sys.stdout, sys.stderr):
            os.dup2(sink.fileno(), stream.fileno())


def run(args, parser, *, help_only=False):
    report = writer = None
    if args.metadata_file is not None and not help_only:
        report_class, file_class = report_types()
        report, writer = report_class(args), file_class(args.metadata_file)
        try:
            writer.prepare()
        except OSError:
            writer.close()
            metadata_error()
            return 74
    code = 1
    try:
        text = command_text(parser, args)
        if not help_only:
            validate_connection(parser, args)
        binary_stdio()
        from pydantic import ValidationError
        from edition_vfs.errors import SpaceProblem
        try:
            code = asyncio.run(execute(args, text, help_only=help_only, report=report))
        except ValidationError as error:
            parser.error(validation_message(error))
        except SpaceProblem as error:
            if report is not None:
                report.problem(error)
            print("Error: " + problem_message(error), file=sys.stderr)
            code = 1
    except SystemExit as error:
        if report is None:
            raise
        code = int(error.code)
        report.failure("invalid_arguments")
    except ImportError:
        if report is not None:
            report.failure("dependency_missing")
        print('Error: install the VFS command runtime in this Python environment.\n'
              'Example: python3 -m pip install -e "clients/edition/python[mirage]"', file=sys.stderr)
        code = 1
    except BrokenPipeError:
        if report is not None:
            report.failure("output_write_failed", "output")
        silence_broken_output()
        code = 1
    except OSError:
        if report is not None:
            report.failure("output_write_failed", "output")
        print("Error: VFS I/O failed; check the input pipe and Reader availability.", file=sys.stderr)
        code = 1
    except KeyboardInterrupt:
        if report is not None:
            report.failure("interrupted")
        code = 130
    except Exception:
        if report is not None:
            report.failure("unexpected")
        print("Error: unexpected. An internal failure prevented completion; report this issue.", file=sys.stderr)
        code = 1
    if writer is not None:
        try:
            writer.commit(report.document(code))
        except (OSError, ValueError, TypeError):
            metadata_error()
            code = 74
        finally:
            writer.close()
    return code


def main(argv=None):
    parser = CliParser(prog="edition-vfs")
    prefix = "edition-vfs --origin https://docs.example.com --host docs.example.com --space docs"
    configure_parser(parser, prefix)
    args = parser.parse_args(argv)
    args.words = args.words[1:] if args.words[:1] == ["--"] else args.words
    args.invocation = prefix
    if print_command_help(args, prefix):
        return 0
    version_only = args.command is None and len(args.words) == 2 and args.words[1] == "--version"
    return run(args, parser, help_only=help_requested(args) or version_only)


if __name__ == "__main__":
    raise SystemExit(main())
