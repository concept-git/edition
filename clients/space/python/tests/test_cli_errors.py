"""Exercise CLI failure boundaries without changing real stdout file descriptors or credentials."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, Mock, patch

from space_vfs import cli
from space_vfs.errors import SpaceProblem
from space_vfs.report import MetadataFile, RunReport


class CliErrorsTest(unittest.TestCase):
    def parser(self):
        parser = cli.CliParser(prog='space-vfs')
        cli.configure_parser(parser, 'space-vfs')
        return parser

    def arguments(self, report=None):
        return SimpleNamespace(origin='https://docs.example.com', host='docs.example.com',
                               space='docs', command=None, words=['cat', '/space/readme.md'],
                               token_env='SPACE_TOKEN', tls_insecure=False, stdin=False,
                               metadata_file=report, invocation='space-vfs')

    def test_failure_reports_keep_distinct_actions_and_exit_codes(self):
        cases = [(SpaceProblem(503, 'delivery_unavailable', trace_id='trace-fixture'), 1, 'delivery_unavailable'),
                 (ImportError('private detail'), 1, 'dependency_missing'),
                 (BrokenPipeError('private detail'), 1, 'output_write_failed'),
                 (OSError('private detail'), 1, 'output_write_failed'),
                 (KeyboardInterrupt(), 130, 'interrupted'),
                 (RuntimeError('private detail'), 1, 'unexpected'),
                 (SystemExit(2), 2, 'invalid_arguments')]
        for error, code, failure in cases:
            with self.subTest(error=error), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / 'result.json'
                with patch.object(cli, 'execute', AsyncMock(side_effect=error)), \
                        patch.object(cli, 'silence_broken_output') as silence, \
                        contextlib.redirect_stderr(io.StringIO()) as output:
                    self.assertEqual(cli.run(self.arguments(str(path)), self.parser()), code)
                result = json.loads(path.read_text())
                self.assertEqual(result['errors'][0]['code'], failure)
                self.assertEqual(result['exit_code'], code)
                self.assertNotIn('private detail', output.getvalue())
                self.assertEqual(silence.call_count, int(isinstance(error, BrokenPipeError)))

    def test_parser_exit_without_metadata_remains_a_parser_exit(self):
        args = self.arguments()
        args.words = []
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            cli.run(args, self.parser())
        self.assertEqual(error.exception.code, 2)

    def test_metadata_prepare_and_commit_failures_return_io_exit_code(self):
        with tempfile.TemporaryDirectory() as directory:
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(cli.run(self.arguments(directory), self.parser()), 74)

            class BrokenCommit(MetadataFile):
                def commit(self, value):
                    raise OSError('private detail')
            with patch.object(cli, 'report_types', return_value=(RunReport, BrokenCommit)), \
                    patch.object(cli, 'execute', AsyncMock(return_value=0)), \
                    contextlib.redirect_stderr(io.StringIO()) as output:
                self.assertEqual(cli.run(self.arguments(str(Path(directory) / 'result.json')), self.parser()), 74)
            self.assertIn('metadata_write_failed', output.getvalue())
            self.assertNotIn('private detail', output.getvalue())

    def test_launcher_failure_report_and_invalid_report_destination(self):
        self.assertEqual(cli.write_failure_report(self.arguments(), 5, 'unexpected'), 5)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'result.json'
            self.assertEqual(cli.write_failure_report(self.arguments(str(path)), 5, 'unexpected'), 5)
            self.assertEqual(json.loads(path.read_text())['errors'][0]['code'], 'unexpected')
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(cli.write_failure_report(self.arguments(directory), 5, 'unexpected'), 74)

    def test_command_boundaries_and_help_do_not_interpret_literal_arguments(self):
        parser = self.parser()
        args = parser.parse_args(['--', 'grep', '--', '--help'])
        self.assertEqual(cli.command_text(parser, args), 'grep -- --help')
        self.assertFalse(cli.help_requested(args))
        self.assertFalse(cli.print_command_help(args, 'space-vfs'))
        args = parser.parse_args(['unknown-command', '--help'])
        self.assertTrue(cli.help_requested(args))
        self.assertFalse(cli.print_command_help(args, 'space-vfs'))
        args = parser.parse_args(['--command', 'cat /space/a | grep text'])
        self.assertFalse(cli.help_requested(args))
        self.assertEqual(cli.command_text(parser, args), 'cat /space/a | grep text')
        with contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertTrue(cli.print_command_help(parser.parse_args(['grep', '--help']), 'space-vfs'))
        self.assertIn("printf", output.getvalue())
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
            invalid = self.arguments()
            invalid.token_env = 'not-valid!'
            cli.validate_connection(parser, invalid)

    def test_windows_binary_mode_sets_all_three_streams(self):
        streams = [Mock(fileno=Mock(return_value=number)) for number in (0, 1, 2)]
        runtime = SimpleNamespace(setmode=Mock())
        with patch.object(cli, 'os', SimpleNamespace(name='nt', O_BINARY=32768)), \
                patch.object(cli, 'sys', SimpleNamespace(stdin=streams[0], stdout=streams[1], stderr=streams[2])), \
                patch.dict('sys.modules', {'msvcrt': runtime}):
            cli.binary_stdio()
        self.assertEqual(runtime.setmode.call_count, 3)

    def test_conflicting_commands_blank_expressions_and_missing_connection_are_explicit(self):
        parser = self.parser()
        for words in [['--command', 'ls /space', 'cat', '/space/a'], ['--command', '   ']]:
            args = parser.parse_args(words)
            with self.subTest(words=words), contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as result:
                cli.command_text(parser, args)
            self.assertEqual(result.exception.code, 2)
        args = self.arguments()
        args.origin = args.host = args.space = None
        cli.validate_connection(parser, args, allow_local=True)
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
            cli.validate_connection(parser, args)

    def test_metadata_refuses_stdout_missing_parents_and_unsafe_command_names(self):
        with tempfile.TemporaryDirectory() as directory:
            for path in ['-', str(Path(directory) / 'absent-parent/result.json')]:
                with self.subTest(path=path), self.assertRaises(OSError):
                    MetadataFile(path).check_target()
        args = self.arguments()
        args.words = ['$(private-command)']
        report = RunReport(args)
        self.assertIsNone(report.command['name'])
        report.problem(SpaceProblem(400, 'cursor_invalid'))
        self.assertEqual(report.document(1)['errors'][0]['action'], 'restart_pagination')
