"""Check real contract coverage and reject unsafe metadata/schema drift."""
import importlib.util
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

SCRIPT = Path(__file__).parents[1] / 'generate_contract.py'
spec = importlib.util.spec_from_file_location('compiler', SCRIPT)
compiler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(compiler)


class CompilerTest(unittest.TestCase):
    def setUp(self):
        self.api = compiler.read(compiler.ROOT / 'contracts/openapi.json')
        self.commands = compiler.read(compiler.CLI / 'metadata/commands.json')
        self.excluded = compiler.read(compiler.CLI / 'metadata/excluded.json')

    def compile(self):
        return compiler.compile_contract(self.api, self.commands, self.excluded)

    def test_finite_patterns_match_whole_values_without_narrowing_general_regexes(self):
        source = {'type': ['string', 'null'], 'pattern': 'authored|synced'}
        self.assertEqual(['authored', 'synced', None], compiler.exact_choice_patterns(source)['enum'])
        self.assertNotIn('enum', source)
        restricted = dict(source, enum=['synced', None])
        self.assertEqual(['synced', None], compiler.exact_choice_patterns(restricted)['enum'])
        for pattern in ['^authored|synced$', '[a-z]+', 'prefix.*', 'hello world|other']:
            value = {'type': 'string', 'pattern': pattern}
            self.assertEqual(value, compiler.exact_choice_patterns(value))

    def test_group_map_matches_actual_command_hierarchy(self):
        groups = compiler.read(compiler.CLI / 'metadata/groups.json')
        self.assertEqual(groups, compiler.compile_groups(self.commands, groups))
        for invalid in [dict(groups, **{'control.absent': 'Unmapped group'}),
                        {key: value for key, value in groups.items() if key != 'control.spaces'},
                        dict(groups, **{'control.spaces': ''})]:
            with self.assertRaisesRegex(ValueError, 'command group'):
                compiler.compile_groups(self.commands, invalid)

    def test_every_real_operation_has_one_command_or_reason(self):
        methods = self.compile()
        self.assertEqual(195, len(methods))
        self.assertEqual(23, len(self.excluded))
        self.assertTrue(all(reason.strip() for reason in self.excluded.values()))
        self.assertEqual(195, len({m['apiCommand'] for m in methods}))
        edit = next(m for m in methods if m['operationId'] == 'editPage')
        self.assertEqual('control.spaces.pages.edit', edit['apiCommand'])
        self.assertEqual('server-key', edit['idempotencyMode'])
        self.assertTrue(edit['mutates'])
        self.assertFalse(next(m for m in methods if m['operationId'] == 'previewPage')['mutates'])
        self.assertEqual(['anonymous'], next(m for m in methods if m['operationId'] == 'login')['credentialTypes'])

    def test_unmapped_or_duplicate_operations_fail(self):
        self.commands.pop('editPage')
        with self.assertRaises(ValueError): self.compile()
        self.setUp()
        self.commands['editPage']['name'] = self.commands['viewPage']['name']
        with self.assertRaises(ValueError): self.compile()

    def test_metadata_cannot_change_authorization_or_http(self):
        for key in ['path', 'credentialTypes', 'scope', 'readOnly']:
            self.setUp(); self.commands['editPage'][key] = 'override'
            with self.assertRaises(ValueError): self.compile()

    def test_new_callers_require_explicit_content_intent_without_duplicating_wire_enum(self):
        body = {'type': 'object', 'required': ['content'], 'properties': {
            'content': {'type': 'string'}, 'intent': {'type': 'string', 'enum': ['draft_only', 'hotfix']}}}
        api = {'components': {'schemas': {}}, 'paths': {'/content': {'put': {
            'operationId': 'editPage', 'x-credential-types': ['management_token'], 'x-read-only': False,
            'requestBody': {'content': {'application/json': {'schema': body}}}, 'responses': {}}}}}
        method = compiler.compile_contract(api, {'editPage': {'name': 'control.spaces.pages.edit', 'description': 'Edit content'}}, {})[0]
        self.assertEqual(['intent'], method['cliRequiredBodyFields'])
        self.assertEqual('draft_only', method['example']['json']['intent'])
        self.assertEqual(['content'], method['requestBody']['content']['application/json']['schema']['required'])
        body['properties'].pop('intent')
        with self.assertRaisesRegex(ValueError, 'CLI intent contract'):
            compiler.compile_contract(api, {'editPage': {'name': 'control.spaces.pages.edit', 'description': 'Edit content'}}, {})

    def test_external_or_missing_type_refs_fail(self):
        for ref in ['https://untrusted.invalid/schema', '#/components/schemas/Absent']:
            self.setUp(); self.api['components']['schemas']['Unsafe'] = {'$ref': ref}
            with self.assertRaises(ValueError): self.compile()

    def test_missing_authoritative_capabilities_fail(self):
        operation = next(w for p in self.api['paths'].values() for w in p.values() if isinstance(w, dict) and w.get('operationId') == 'editPage')
        operation.pop('x-credential-types')
        with self.assertRaises(ValueError): self.compile()

    def test_effect_metadata_must_be_boolean_and_paths_must_be_safe(self):
        operation = next(w for p in self.api['paths'].values() for w in p.values() if isinstance(w, dict) and w.get('operationId') == 'editPage')
        operation['x-read-only'] = 'false'
        with self.assertRaises(ValueError): self.compile()
        self.setUp(); self.api['components']['schemas']['../escape'] = {'type': 'object'}
        with self.assertRaises(ValueError): self.compile()

    def test_generation_is_deterministic_and_contains_no_ontology(self):
        first = compiler.generate()
        self.assertEqual(first, compiler.generate())
        self.assertTrue(all(name.startswith(('operations/', 'schemas/')) or name == 'index.json' for name in first))
        self.assertNotIn('ontology', first['index.json'])

    def test_generated_files_round_trip_and_detect_real_drift(self):
        # 在真实文件系统执行生成与检查，Windows CI 同时覆盖路径和默认编码差异。
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cli = root / 'clients/control'
            (cli / 'scripts').mkdir(parents=True)
            (root / 'contracts').mkdir()
            (root / 'docs/design').mkdir(parents=True)
            shutil.copy(SCRIPT, cli / 'scripts/generate_contract.py')
            shutil.copytree(compiler.CLI / 'metadata', cli / 'metadata')
            shutil.copy(compiler.ROOT / 'contracts/openapi.json', root / 'contracts/openapi.json')
            command = [sys.executable, str(cli / 'scripts/generate_contract.py')]
            subprocess.run(command, check=True, capture_output=True)
            subprocess.run([*command, '--check'], check=True, capture_output=True)
            target = cli / 'src/main/resources/contract/operations/editPage.json'
            self.assertNotIn(b'\r\n', target.read_bytes())
            target.write_text('{}\n', encoding='utf-8')
            result = subprocess.run([*command, '--check'], capture_output=True, text=True)
            self.assertNotEqual(0, result.returncode)
            self.assertIn('Contract drift', result.stderr)

    def test_generation_removes_obsolete_files_and_checks_missing_inventory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cli = root / 'clients/control'
            resource = cli / 'src/main/resources/contract'
            inventory = root / 'docs/design/control-cli-api-inventory.csv'
            (root / 'contracts').mkdir(parents=True)
            inventory.parent.mkdir(parents=True)
            cli.mkdir(parents=True)
            shutil.copytree(compiler.CLI / 'metadata', cli / 'metadata')
            shutil.copy(compiler.ROOT / 'contracts/openapi.json', root / 'contracts/openapi.json')
            with patch.multiple(compiler, ROOT=root, CLI=cli, RESOURCE=resource, INVENTORY=inventory):
                compiler.main([])
                compiler.main(['--check'])
                obsolete = resource / 'obsolete.json'
                obsolete.write_text('{}')
                with self.assertRaisesRegex(SystemExit, 'Contract drift'):
                    compiler.main(['--check'])
                compiler.main([])
                self.assertFalse(obsolete.exists())
                inventory.unlink()
                with self.assertRaisesRegex(SystemExit, 'Contract drift'):
                    compiler.main(['--check'])

    def test_credential_capabilities_include_passwords_and_owner_invitations(self):
        methods = {m['apiCommand']: m for m in self.compile()}
        for name in ['control.account.password.change', 'control.account.erase', 'control.auth.password.reset']:
            self.assertTrue(methods[name]['capabilities']['secretInput'], name)
        for name in ['control.admin.tenants.create', 'control.managementTokens.create']:
            self.assertTrue(methods[name]['capabilities']['secretOutput'], name)

    def test_replayed_response_models_retain_secret_and_array_constraints(self):
        methods = {m['apiCommand']: m for m in self.compile()}
        self.assertTrue(methods['control.teams.invitations.create']['capabilities']['secretOutput'])
        fields = methods['control.sites.search.set']['example']['json']['fields']
        self.assertEqual({'title', 'headings', 'body'}, set(fields))
        self.assertEqual(3, len(fields))

    def test_unsafe_and_duplicate_operation_ids_are_rejected(self):
        for identity in ['../escape', 'contains space', 'viewPage']:
            with self.subTest(identity=identity):
                self.setUp()
                self.api['paths']['/extra'] = {'get': {'operationId': identity}}
                with self.assertRaisesRegex(ValueError, 'operationId'):
                    self.compile()

    def test_operation_cannot_be_both_excluded_and_exposed(self):
        self.excluded['editPage'] = 'ambiguous'
        with self.assertRaisesRegex(ValueError, 'exactly one'):
            self.compile()

    def test_invalid_descriptions_confirmation_and_missing_parameter_schemas_fail(self):
        for metadata in [{'description': ' '}, {'confirm': 'yes'}]:
            with self.subTest(metadata=metadata):
                self.setUp()
                self.commands['editPage'].update(metadata)
                with self.assertRaisesRegex(ValueError, 'description or confirmation'):
                    self.compile()
        self.setUp()
        operation = next(w for p in self.api['paths'].values() for w in p.values()
                         if isinstance(w, dict) and w.get('operationId') == 'editPage')
        operation['parameters'] = [{'name': 'missingSchema'}]
        with self.assertRaisesRegex(ValueError, 'parameter schema'):
            self.compile()

    def test_examples_cover_union_array_boolean_null_and_reference_constraints(self):
        # A small contract isolates example rules from the product's changing operation inventory.
        def compiled(schema, schemas=None):
            api = {'components': {'schemas': schemas or {}}, 'paths': {'/sample': {'post': {
                'operationId': 'sample', 'x-credential-types': ['anonymous'], 'x-read-only': False,
                'requestBody': {'content': {'application/json': {'schema': schema}}}, 'responses': {}}}}}
            return compiler.compile_contract(api, {'sample': {'name': 'control.sample.run', 'description': 'Sample'}}, {})[0]
        self.assertEqual(compiled({'anyOf': [{'type': 'boolean'}, {'type': 'string'}]})['example']['json'], False)
        self.assertIsNone(compiled({'type': ['null']})['example']['json'])
        self.assertEqual(compiled({'type': 'array', 'minItems': 2, 'items': {'type': 'integer', 'minimum': 4}})['example']['json'], [4, 4])
        self.assertEqual(compiled({'type': 'string', 'pattern': 'alpha|beta', 'minLength': 10})['example']['json'], 'alpha' * 10)
        with self.assertRaisesRegex(ValueError, 'unique enum values'):
            compiled({'type': 'array', 'uniqueItems': True, 'minItems': 2, 'items': {'enum': [None, 'only']}})
        with self.assertRaisesRegex(ValueError, 'unbounded schema'):
            compiled({'$ref': '#/components/schemas/Loop'}, {'Loop': {'type': 'object', 'required': ['next'], 'properties': {'next': {'$ref': '#/components/schemas/Loop'}}}})


if __name__ == '__main__': unittest.main()
