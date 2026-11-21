"""The generated CLI catalog exposes supported operations and detects stale installations."""
import csv
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


def load_compiler():
    script = Path(__file__).resolve().parents[1] / "generate_contract.py"
    spec = importlib.util.spec_from_file_location("catalog_compiler", script)
    compiler = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(compiler)
    return compiler


class CatalogPublicationTest(unittest.TestCase):
    def test_catalog_exposes_pagination_and_detects_missing_operation_files(self):
        compiler = load_compiler()
        with tempfile.TemporaryDirectory() as temporary:
            compiler.RESOURCE = Path(temporary, "contract")
            compiler.INVENTORY = Path(temporary, "inventory.csv")
            compiler.main([])
            index = json.loads((compiler.RESOURCE / "index.json").read_text())
            operation = compiler.RESOURCE / index["commands"]["control.spaces.list"]["ref"]
            detail = json.loads(operation.read_text())
            self.assertEqual(detail["operationId"], "listSpaces")
            self.assertTrue(detail["capabilities"]["pagination"])
            with compiler.INVENTORY.open() as stream:
                rows = list(csv.DictReader(stream))
            self.assertTrue(any(row["command"] == "editionctl control spaces list" for row in rows))
            compiler.main(["--check"])
            operation.unlink()
            with self.assertRaisesRegex(SystemExit, "Contract drift"):
                compiler.main(["--check"])

    def test_ambiguous_routes_and_undeclared_authority_are_rejected(self):
        import copy

        compiler = load_compiler()
        catalog = {"paths": {"/spaces": {"get": {"operationId": "listSpaces", "responses": {"200": {}},
                   "x-read-only": True, "x-credential-types": ["session"]}}}, "components": {"schemas": {}}}
        commands = {"listSpaces": {"name": "control.spaces.list", "description": "List accessible spaces."}}
        for change, reason in [
            (lambda api: api["paths"].update({"/other": api["paths"]["/spaces"]}), "Duplicate operationId"),
            (lambda api: api["paths"]["/spaces"]["get"].pop("x-credential-types"), "credential/effect"),
            (lambda api: api["paths"]["/spaces"]["get"].pop("x-read-only"), "credential/effect"),
            (lambda api: api["paths"]["/spaces"]["get"].update(operationId="unmapped"), "one command or exclusion"),
            (lambda api: api["paths"]["/spaces"]["get"].update(operationId="../bad"), "Unsafe operationId"),
            (lambda api: api["components"]["schemas"].update({"../other": {}}), "Unsafe schema name"),
        ]:
            with self.subTest(reason=reason):
                api = copy.deepcopy(catalog)
                change(api)
                with self.assertRaisesRegex(ValueError, reason):
                    compiler.compile_contract(api, commands, {})

    def test_examples_preserve_required_nullable_and_unique_body_fields(self):
        compiler = load_compiler()
        fields = {
            "note": {"type": "null"},
            "role": {"anyOf": [{"type": "string", "enum": ["reader"]}, {"type": "null"}]},
            "roles": {"type": "array", "uniqueItems": True, "minItems": 2,
                      "items": {"type": "string", "enum": ["reader", "owner"]}},
        }
        body = {"type": "object", "properties": fields, "required": list(fields)}
        wire = {"operationId": "assignRoles", "responses": {"201": {}},
                "x-read-only": False, "x-credential-types": ["session"],
                "requestBody": {"content": {"application/json": {"schema": body}}}}
        api = {"paths": {"/roles": {"summary": "Role assignments", "post": wire}}, "components": {"schemas": {}}}
        metadata = {"assignRoles": {"name": "control.roles.assign", "description": "Assign roles."}}
        operation, = compiler.compile_contract(api, metadata, {})
        self.assertEqual(operation["example"]["json"], {"note": None, "role": "reader", "roles": ["reader", "owner"]})
        fields["roles"]["minItems"] = 3
        with self.assertRaisesRegex(ValueError, "unique enum"):
            compiler.compile_contract(api, metadata, {})

    def test_command_authentication_and_option_types_must_come_from_the_wire_contract(self):
        compiler = load_compiler()
        wire = {"operationId": "search", "responses": {"200": {}}, "parameters": [],
                "x-read-only": True, "x-credential-types": ["anonymous"]}
        api = {"paths": {"/search": {"get": wire}}, "components": {"schemas": {}}}
        metadata = {"name": "control.site.search", "description": "Search the site."}
        for changes, reason in [({"credentialTypes": ["session"]}, "Metadata"),
                                ({"description": "  "}, "description")]:
            with self.subTest(changes=changes), self.assertRaisesRegex(ValueError, reason):
                compiler.compile_contract(api, {"search": {**metadata, **changes}}, {})
        wire["parameters"] = [{"name": "q", "in": "query"}]
        with self.assertRaisesRegex(ValueError, "Missing parameter schema"):
            compiler.compile_contract(api, {"search": metadata}, {})
        wire["parameters"] = [{"name": "q", "in": "query", "schema": {"$ref": "#/components/schemas/Absent"}}]
        with self.assertRaisesRegex(ValueError, "schema reference"):
            compiler.compile_contract(api, {"search": metadata}, {})

    def test_command_names_must_be_unambiguous_and_discoverable_from_group_help(self):
        compiler = load_compiler()
        read = {"operationId": "listPages", "x-credential-types": ["session"], "x-read-only": True, "responses": {}}
        api = {"paths": {"/pages": {"get": read}, "/spaces": {"get": {**read, "operationId": "listSpaces"}}},
               "components": {"schemas": {}}}
        description = {"name": "control.pages.list", "description": "List current tenant pages."}
        commands = {"listPages": description, "listSpaces": description}
        with self.assertRaisesRegex(ValueError, "Duplicate command name"):
            compiler.compile_contract(api, commands, {})
        commands["listSpaces"] = {**description, "name": "control.spaces.list"}
        with self.assertRaisesRegex(ValueError, "group"):
            compiler.compile_groups(commands, {"control.pages": "Pages"})
        self.assertEqual(set(compiler.compile_groups(commands, {"control.pages": "Pages", "control.spaces": "Spaces"})),
                         {"control.pages", "control.spaces"})

    def test_nullable_choices_keep_null_and_exclude_unsupported_values(self):
        compiler = load_compiler()
        schema = {"type": ["null", "string"], "pattern": "draft|published", "enum": ["draft", None, "unknown"]}
        self.assertEqual(compiler.exact_choice_patterns(schema)["enum"], ["draft", None])

    def test_edit_contract_cannot_be_published_without_explicit_content_intent(self):
        compiler = load_compiler()
        wire = {"operationId": "editPage", "x-credential-types": ["session"], "x-read-only": False,
                "responses": {}, "requestBody": {"content": {"application/json": {"schema": {"type": "object"}}}}}
        api = {"paths": {"/page": {"put": wire}}, "components": {"schemas": {}}}
        commands = {"editPage": {"name": "control.pages.edit", "description": "Edit page content."}}
        with self.assertRaisesRegex(ValueError, "intent"):
            compiler.compile_contract(api, commands, {})
