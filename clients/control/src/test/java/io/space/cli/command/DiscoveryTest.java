package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import io.space.cli.contract.ContractCatalog;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class DiscoveryTest {
    @TempDir
    Path work;

    @Test
    void nativeParserRejectsAmbiguousOrInvalidInputWithoutEffects() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            fixture.configure();
            Files.createDirectory(work.resolve("files"));
            var mcp = fixture.runAt(work, "", "mcp", "--resources", "control.tenants", "--file-root", "files");
            assertEquals(0, mcp.code(), mcp.err());
            assertEquals("", mcp.out());
            for (String[] invalid : List.of(
                    new String[] {"control", "tenants", "stats", "get", "--timeout", "not-an-integer", "--dry-run"},
                    new String[] {"control", "spaces", "absent", "--help"},
                    new String[] {"mcp", "--unknown-secret-canary", "--help"},
                    new String[] {"schema", "control.Usage", "--brief", "--brief"},
                    new String[] {"schema", "control.Usage", "--brief=invalid"},
                    new String[] {"schema", "control.Usage", "extra-positional-value"})) {
                var result = fixture.run("", invalid);
                assertEquals(3, result.code(), result.out() + result.err());
                assertFalse((result.out() + result.err()).contains("unknown-secret-canary"));
            }
            var help = fixture.command("control tenants stats get --help");
            assertEquals(0, help.code());
            assertFalse(help.out().contains("\u001b"));
            var schema = fixture.command("schema schema --brief");
            assertEquals("0", schema.json().at("/cli/arguments/0/index").asText());
            assertTrue(schema.json().at("/cli/arguments/0/required").asBoolean());
            assertEquals(schema.out(), fixture.command("schema schema --brief").out());
            assertEquals(0, fixture.command("schema control.Usage --brief=yes").code());
            assertEquals(0, fixture.command("schema control.Usage --brief=1").code());
            assertEquals(0, fixture.command("-v").code());
            var selected = fixture.command("config get --profile default");
            assertEquals(0, selected.code(), selected.out());
            assertEquals("default", selected.json().path("profile").asText());
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state/journal")));
        }
    }

    @Test
    void briefPreservesNativeContractsAndMethodSpecificCliSemantics() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            var common = Set.of("--profile", "--format", "--file-root", "--timeout", "--help", "--version");
            for (String target : List.of(
                    "control.tenants.stats.get",
                    "control.spaces.pages.edit",
                    "control.spaces.pages.list",
                    "control.spaces.imports.get",
                    "control.spaces.pages.+inspect",
                    "control.+batch",
                    "control.+receipt",
                    "config.inspect")) {
                var full = fixture.command("schema {}", target);
                var brief = fixture.command("schema {} --brief", target);
                assertEquals(0, brief.code(), brief.out());
                assertEquals(1, brief.out().lines().count(), target);
                assertTrue(full.out().lines().count() > 1);
                var nativeFull = (com.fasterxml.jackson.databind.node.ObjectNode)
                        full.json().deepCopy();
                var nativeBrief = (com.fasterxml.jackson.databind.node.ObjectNode)
                        brief.json().deepCopy();
                nativeFull.remove("cli");
                nativeBrief.remove("cli");
                assertEquals(nativeFull, nativeBrief, target);
                var cliFull = full.json().path("cli");
                var cliBrief = brief.json().path("cli");
                for (var entry : cliFull.path("options").properties()) {
                    if (common.contains(entry.getKey())
                            && !entry.getValue().path("required").asBoolean())
                        assertFalse(cliBrief.path("options").has(entry.getKey()), target);
                    else assertEquals(entry.getValue(), cliBrief.path("options").path(entry.getKey()), target);
                }
                for (String key : List.of("command", "output", "inputSchemaRef", "arguments", "constraints")) {
                    var expected = cliFull.path(key);
                    if (expected.isArray() && expected.isEmpty()) assertFalse(cliBrief.has(key), target);
                    else assertEquals(expected, cliBrief.path(key), target);
                }
                if (cliFull.path("description").equals(full.json().path("description")))
                    assertFalse(cliBrief.has("description"), target);
                else assertEquals(cliFull.path("description"), cliBrief.path("description"), target);
                assertTrue(brief.out().length() < full.out().length(), target);
            }
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
    }

    @Test
    void briefSupportsTypesExpansionOptionPositionsAndStructuredFailures() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            for (String target : List.of(
                    "control.tenants.stats.get",
                    "control.Usage",
                    "control.EditPageRequest",
                    "control.BatchRequest",
                    "control.+batch")) {
                for (boolean expand : List.of(false, true)) {
                    var extra = expand ? new String[] {"--resolve-refs"} : new String[0];
                    var normal = new ArrayList<>(List.of("schema", target));
                    normal.addAll(List.of(extra));
                    var full = fixture.run("", normal.toArray(String[]::new));
                    normal.add("--brief");
                    var brief = fixture.run("", normal.toArray(String[]::new));
                    var before = new ArrayList<>(List.of("schema", "--brief", "--profile", "default"));
                    before.addAll(List.of(extra));
                    before.add(target);
                    assertEquals(0, brief.code(), brief.out());
                    assertEquals(
                            brief.json(),
                            fixture.run("", before.toArray(String[]::new)).json(),
                            target);
                    if (!full.json().has("cli")) assertEquals(full.json(), brief.json(), target);
                }
            }
            for (String[] args : List.of(
                    new String[] {"schema", "--brief", "control.absent.nope"},
                    new String[] {"schema", "control.AbsentType", "--brief", "--resolve-refs"},
                    new String[] {"schema", "control.Usage", "--brief", "--unknown"})) {
                var result = fixture.run("", args);
                result.assertFailure(3, "invalid_input");
            }
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
    }

    @Test
    void localHelpersDescribeTheirActualOptionsWithoutStateOrCredentials() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            for (String helper :
                    List.of("control.+receipt", "control.+resume", "control.+batch", "config.get", "config.inspect")) {
                var result = fixture.command("schema {}", helper);
                assertEquals(0, result.code(), result.out() + result.err());
                assertEquals("localHelper", result.json().path("kind").asText());
                assertTrue(result.json().at("/cli/options/--profile").isObject());
                if (helper.equals("control.+batch")) {
                    assertEquals(
                            "batchRequest",
                            result.json().at("/cli/options/--json/input").asText());
                    assertEquals(
                            "ndjson", result.json().at("/cli/output/encoding").asText());
                    assertEquals(
                            "control.BatchRequest",
                            result.json().at("/cli/inputSchemaRef").asText());
                } else if (helper.startsWith("control.")) {
                    assertTrue(result.json().at("/cli/options/--id/required").asBoolean());
                    assertFalse(result.json().at("/cli/options").has("--params"));
                }
            }
            assertFalse(Files.exists(work.resolve("state")));
            assertTrue(fixture.requests.isEmpty());
        }
    }

    @Test
    void schemaOptionsBeforeAndAfterTargetHaveEquivalentContracts() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            for (String target : List.of(
                    "control.spaces.pages.edit",
                    "control.spaces.pages.+inspect",
                    "control.+receipt",
                    "control.BatchRequest",
                    "control.PageDetail")) {
                var after = fixture.command("schema {} --resolve-refs", target);
                var before = fixture.command("schema --resolve-refs {}", target);
                var profile = fixture.command("schema --profile default --resolve-refs {}", target);
                assertEquals(0, after.code(), after.out());
                assertEquals(0, before.code(), before.out());
                assertEquals(0, profile.code(), profile.out());
                assertEquals(after.json(), before.json(), target);
                assertEquals(after.json(), profile.json(), target);
                if (target.equals("control.spaces.pages.edit"))
                    assertTrue(before.json().at("/cli/options").has("--json"));
            }
            for (String[] args : List.of(
                    new String[] {"schema", "control.absent.nope", "--resolve-refs"},
                    new String[] {"schema", "--resolve-refs", "control.absent.nope"})) {
                var bad = fixture.run("", args);
                assertEquals(3, bad.code());
                assertEquals("invalid_input", bad.json().at("/error/reason").asText());
            }
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
    }

    @Test
    void helperInputErrorsPointToTheActualContentOperationBeforeCredentialsOrHttp() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            for (String leaf : List.of("+inspect", "get")) {
                String method =
                        leaf.equals("+inspect") ? "control.spaces.pages.content.get" : "control.spaces.pages.get";
                var schema = fixture.command("schema {}", "control.spaces.pages." + leaf);
                assertEquals(0, schema.code(), schema.out());
                assertEquals(method, schema.json().path("apiMethod").asText());
                for (String params : List.of("{\"tenantId\":\"bad\"}", "{}", "{")) {
                    var rejected = fixture.command("control spaces pages {} --params {}", leaf, params);
                    assertEquals(3, rejected.code(), rejected.out());
                    assertEquals(400, rejected.json().at("/error/code").asInt());
                    assertEquals(
                            "invalid_input", rejected.json().at("/error/reason").asText());
                    assertTrue(rejected.json().at("/error/hint").asText().contains("spacectl schema " + method));
                    assertFalse((rejected.out() + rejected.err()).contains(fixture.token));
                    if (leaf.equals("+inspect"))
                        assertFalse(rejected.out().contains("spacectl schema control.spaces.pages.get"));
                }
            }
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
    }

    @Test
    void finiteChoicePatternsRejectSubstringMatchesBeforeAnyEffects() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            for (String mode : List.of("not-authored", "synced-old", "prefix-authored-suffix")) {
                var invalid = fixture.command(
                        "control spaces create --params {} --json {} --dry-run",
                        fixture.params(),
                        "{\"name\":\"Valid\",\"mode\":\"" + mode + "\"}");
                invalid.assertFailure(3, "invalid_input");
                assertTrue(invalid.json().at("/error/violations").toString().contains("body.mode"));
            }
            for (String mode : List.of("authored", "synced")) {
                var valid = fixture.command(
                        "control spaces create --params {} --json {} --dry-run",
                        fixture.params(),
                        "{\"name\":\"Valid\",\"mode\":\"" + mode + "\"}");
                assertEquals(0, valid.code(), valid.out());
            }
            var schema = fixture.command("schema control.spaces.create --brief");
            assertEquals(
                    JSON.readTree("[\"authored\",\"synced\"]"),
                    schema.json().at("/requestBody/schema/properties/mode/enum"));
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
    }

    @Test
    void methodMapsExposeExactCredentialAndMutationRequirements() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            var catalog = new ContractCatalog();
            for (String method : List.of(
                    "control.auth.bootstrap.login",
                    "control.tokens.create",
                    "control.spaces.pages.edit",
                    "control.spaces.delete",
                    "control.spaces.list")) {
                var result = fixture.command("schema {} --brief", method);
                assertEquals(0, result.code(), result.out());
                var operation = catalog.operation(method);
                assertEquals(operation.path("credentialTypes"), result.json().path("credentialTypes"), method);
                assertEquals(operation.path("idempotencyMode"), result.json().path("idempotencyMode"), method);
                assertEquals(operation.path("highImpact"), result.json().path("confirmationRequired"), method);
            }
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
    }

    @Test
    void commandGroupsExposeBoundedMachineReadableMapsWithoutLoadingOperations() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            for (String group : List.of("control", "control.spaces", "control.spaces.pages", "config", "update")) {
                var result = fixture.command("schema {} --brief", group);
                assertEquals(0, result.code(), result.out());
                assertEquals("commandGroup", result.json().path("kind").asText());
                assertFalse(result.json().at("/cli/description").asText().isBlank());
                var children = result.json().path("subcommands");
                assertTrue(children.isArray() && !children.isEmpty());
                for (var child : children) {
                    String method = child.path("schema").asText();
                    assertTrue(method.startsWith(group + "."));
                    assertFalse(method.substring(group.length() + 1).contains("."), method);
                    assertFalse(child.path("description").asText().isBlank());
                    assertEquals(0, fixture.command("schema {} --brief", method).code(), method);
                }
            }
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
        var out = new ByteArrayOutputStream();
        var app = new CliApplication(
                InputStream.nullInputStream(), new PrintStream(out), new PrintStream(OutputStream.nullOutputStream()));
        assertEquals(0, app.execute("schema", "control.spaces.pages", "--brief"));
        assertEquals(Set.of("index.json"), app.catalog.loadedFiles());
    }

    @Test
    void localValidationReportsSafeFieldsAndCodesBeforeCredentialAccess() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            var invalid = fixture.command(
                    "control spaces create --params {} --json {} --dry-run",
                    fixture.params(),
                    "{\"name\":42,\"mode\":\"wrong\"}");
            invalid.assertFailure(3, "invalid_input");
            var fields = new HashSet<String>();
            for (var item : invalid.json().at("/error/violations"))
                fields.add(item.path("field").asText());
            assertEquals(Set.of("body.name", "body.mode"), fields);
            var missing = fixture.command(
                    "control spaces create --params {} --json {} --dry-run", fixture.params(), "{\"name\":\"Valid\"}");
            assertEquals(
                    "body.mode", missing.json().at("/error/violations/0/field").asText());
            var parameter = fixture.command("control spaces list --params {} --dry-run", "{\"tenantId\":\"bad\"}");
            assertEquals(
                    "params.tenantId",
                    parameter.json().at("/error/violations/0/field").asText());
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
    }

    @Test
    void allGeneratedExamplesExecuteAsOfflinePreviews() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            var catalog = new ContractCatalog();
            var failures = new ArrayList<String>();
            int count = 0;
            Files.writeString(work.resolve("upload.bin"), "preview-file");
            for (var op : catalog.allOperations()) {
                var sample = op.path("example");
                Files.writeString(
                        work.resolve("private-params.json"),
                        sample.path("params").toString());
                Files.writeString(
                        work.resolve("private-body.json"), sample.path("json").toString());
                String example = ContractCatalog.example(op);
                var tokens = new ArrayList<String>();
                var match = Pattern.compile("'([^']*)'|([^ ]+)").matcher(example);
                while (match.find()) tokens.add(match.group(1) == null ? match.group(2) : match.group(1));
                assertEquals("spacectl", tokens.removeFirst());
                assertEquals("--dry-run", tokens.getLast());
                var result = fixture.runAt(work, "", tokens.toArray(String[]::new));
                count++;
                if (result.code() != 0) failures.add(op.path("apiCommand").asText() + " " + result.out());
                else assertTrue(result.json().path("dry_run").asBoolean());
            }
            assertEquals(195, count);
            assertTrue(failures.isEmpty(), String.join("\n", failures));
            assertTrue(fixture.requests.isEmpty());
            assertFalse(Files.exists(work.resolve("state")));
        }
    }

    @Test
    void layeredHelpStaysSmallAndOldPathsCannotMasqueradeAsValidCommands() throws Exception {
        var out = new ByteArrayOutputStream();
        var err = new ByteArrayOutputStream();
        var app = new CliApplication(InputStream.nullInputStream(), new PrintStream(out), new PrintStream(err));
        assertEquals(0, app.execute("--help"));
        assertEquals(Set.of("index.json"), app.catalog.loadedFiles());
        assertTrue(out.toString().contains("Examples:"));
        assertFalse(out.toString().contains("ontology"));
        out.reset();
        assertEquals(0, app.execute("control", "spaces", "pages", "edit", "--help"));
        assertEquals(Set.of("index.json", "operations/editPage.json"), app.catalog.loadedFiles());
        assertTrue(out.toString().contains("--json"));
        assertFalse(out.toString().contains("--upload"));
        for (String[] args : List.of(
                new String[] {"page", "content", "set", "--help"},
                new String[] {"control", "spaces", "absent", "--help"},
                new String[] {"ontology", "show"})) {
            out.reset();
            assertEquals(3, app.execute(args));
            assertEquals(
                    "invalid_input",
                    JSON.readTree(out.toByteArray()).at("/error/reason").asText());
        }
        out.reset();
        assertEquals(0, app.execute("control", "spaces", "list", "--version"));
        assertTrue(out.toString().startsWith("spacectl 1."));
    }
}
