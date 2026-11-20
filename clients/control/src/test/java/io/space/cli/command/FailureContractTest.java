package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import io.space.cli.state.InvocationJournal;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

/** Regression probes for failure classification and recovery through actual CLI processes. */
class FailureContractTest {
    @TempDir
    Path work;

    ApiTest fixture;

    @BeforeEach
    void start() throws Exception {
        fixture = new ApiTest();
        fixture.work = work;
        fixture.start();
    }

    @AfterEach
    void stop() {
        fixture.stop();
    }

    @Test
    void failedLaterPageDoesNotReuseThePreviousPagesCompletedState() throws Exception {
        fixture.configure();
        fixture.server.removeContext("/");
        var calls = new AtomicInteger();
        fixture.server.createContext("/", x -> {
            if (calls.incrementAndGet() == 1) reply(x, 200, "{\"items\":[],\"nextCursor\":\"next\"}");
            else reply(x, 503, "{}");
        });
        var result =
                fixture.command("control spaces list --params {} --page-all --page-delay {}", fixture.params(), "0");
        assertEquals(1, result.code());
        var lines = result.out().lines().toList();
        assertEquals(2, lines.size());
        var failure = JSON.readTree(lines.getLast());
        assertTrue(failure.has("error"));
        assertFalse(failure.has("state"));
    }

    @Test
    void retryAfterAndUnknownOutcomeSurviveCliAndBatchErrors() throws Exception {
        fixture.configure();
        var header = new java.util.concurrent.atomic.AtomicReference<>("137");
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            x.getRequestBody().readAllBytes();
            x.getResponseHeaders().set("Retry-After", header.get());
            reply(x, 429, "{\"code\":\"rate_limited\",\"detail\":\"remote-canary\"}");
        });
        for (String value : List.of("137", "Wed, 21 Oct 2037 07:28:00 GMT", "remote-canary")) {
            header.set(value);
            var response = fixture.command(
                    "control spaces create --params {} --json {} --invocation-id {}",
                    fixture.params(),
                    "{\"name\":\"Fixture\",\"mode\":\"authored\"}",
                    "wait-" + value.length());
            assertEquals(1, response.code());
            assertEquals("unknown", response.json().path("state").asText());
            if (value.equals("remote-canary"))
                assertFalse(response.json().path("error").has("retryAfter"));
            else assertEquals(value, response.json().at("/error/retryAfter").asText());
            assertFalse((response.out() + response.err()).contains("remote-canary"));
        }
        header.set("137");
        String batch = "{\"id\":\"limited\",\"items\":[{\"id\":\"read\",\"method\":\"control.spaces.list\",\"params\":"
                + fixture.params() + "}]}";
        var response = fixture.run(batch, "control", "+batch", "--json", "-");
        assertEquals(1, response.code());
        assertEquals(
                "137",
                JSON.readTree(response.out().lines().findFirst().orElseThrow())
                        .at("/result/error/retryAfter")
                        .asText());
    }

    @Test
    void fieldErrorsAreBoundedSanitizedAndRetainedInRejectionReceipts() throws Exception {
        fixture.configure();
        var problem = JSON.createObjectNode().put("code", "validation_failed").put("detail", "remote-canary");
        var violations = problem.putArray("violations");
        violations.addObject().put("field", "name").put("code", "size_out_of_range");
        violations.addObject().put("field", "mode").put("code", "remote_canary");
        violations.addObject().put("field", "remote_canary").put("code", "required");
        for (int i = 0; i < 70; i++) violations.addObject().put("field", "name").put("code", "required");
        var calls = new AtomicInteger();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            calls.incrementAndGet();
            x.getRequestBody().readAllBytes();
            reply(x, 422, problem.toString());
        });
        var response = fixture.command(
                "control spaces create --params {} --json {} --invocation-id invalid-fields",
                fixture.params(),
                "{\"name\":\"Fixture\",\"mode\":\"authored\"}");
        assertEquals(1, response.code());
        assertEquals("name", response.json().at("/error/violations/0/field").asText());
        assertEquals(
                "size_out_of_range",
                response.json().at("/error/violations/0/code").asText());
        assertEquals("invalid", response.json().at("/error/violations/1/code").asText());
        assertTrue(response.json().at("/error/violations").size() <= 64);
        assertTrue(response.json().at("/error/violationsTruncated").asBoolean());
        assertFalse((response.out() + response.err()).contains("canary"));
        assertEquals("rejected", response.json().path("state").asText());
        var replay = fixture.command("control +resume --id invalid-fields");
        assertEquals(1, replay.code());
        assertEquals(response.json().at("/error/violations"), replay.json().at("/error/violations"));
        assertTrue(replay.json().at("/error/violationsTruncated").asBoolean());
        assertEquals(1, calls.get());
    }

    @Test
    void editsRequireConfirmationBeforeCredentialsAndExplainHotfixEffects() throws Exception {
        var op = new io.space.cli.contract.ContractCatalog().operation("control.spaces.pages.edit");
        var example = op.path("example");
        String[] args = {
            "control",
            "spaces",
            "pages",
            "edit",
            "--params",
            example.path("params").toString(),
            "--json",
            example.path("json").toString()
        };
        var denied = fixture.run("", args);
        assertEquals(3, denied.code());
        assertTrue(denied.out().contains("confirmation"));
        var preview = new ArrayList<>(List.of(args));
        preview.add("--dry-run");
        assertEquals(0, fixture.run("", preview.toArray(String[]::new)).code());
        assertTrue(fixture.requests.isEmpty());
        assertFalse(Files.exists(work.resolve("state")));
        for (String[] discovery : List.of(
                new String[] {"schema", "control.spaces.pages.edit"},
                new String[] {"control", "spaces", "pages", "edit", "--help"})) {
            var result = fixture.run("", discovery);
            assertEquals(0, result.code());
            assertTrue(result.out().contains("synced"));
            assertTrue(result.out().contains("hotfix"));
            assertTrue(result.out().contains("--yes"));
        }
    }

    @Test
    void missingMethodFailsWithoutCreatingState() throws Exception {
        for (String[] command :
                List.of(new String[] {}, new String[] {"control"}, new String[] {"control", "spaces"})) {
            var result = fixture.run("", command);
            result.assertFailure(3, "invalid_input");
            assertTrue(result.json().at("/error/hint").asText().contains("--help"));
        }
        assertTrue(fixture.requests.isEmpty());
        assertFalse(Files.exists(work.resolve("state")));
    }

    @Test
    void invalidIntentIsRejectedDuringPreviewAndBeforeProfileAccess() throws Exception {
        for (String id : List.of("../outside", "x".repeat(101), "")) {
            var command = new ArrayList<>(List.of(
                    "control",
                    "spaces",
                    "create",
                    "--params",
                    fixture.params(),
                    "--json",
                    "{\"name\":\"Fixture\",\"mode\":\"authored\"}",
                    "--invocation-id",
                    id));
            var execute = fixture.run("", command.toArray(String[]::new));
            assertEquals(3, execute.code(), execute.out());
            assertTrue(execute.json().at("/error/message").asText().contains("invocation ID"));
            command.add("--dry-run");
            var preview = fixture.run("", command.toArray(String[]::new));
            assertEquals(3, preview.code(), preview.out());
        }
        assertTrue(fixture.requests.isEmpty());
        assertFalse(Files.exists(work.resolve("state")));
    }

    @Test
    void missingReceiptReportsOnlyTheSelectedProfileWithoutCredentialsHttpOrJournal() throws Exception {
        fixture.configure();
        assertEquals(
                0,
                fixture.command(
                                "--profile evaluation configure --base-url {} --token-env {}",
                                "https://example.test",
                                "MISSING_SOURCE_CANARY")
                        .code());
        for (String selected : List.of("default", "evaluation")) {
            for (String helper : List.of("+receipt", "+resume")) {
                var result = fixture.command("--profile {} control {} --id retained-intent", selected, helper);
                assertEquals(3, result.code(), result.out());
                assertEquals(400, result.json().at("/error/code").asInt());
                assertEquals("invalid_input", result.json().at("/error/reason").asText());
                assertTrue(result.json().at("/error/message").asText().contains("selected profile '" + selected + "'"));
                String hint = result.json().at("/error/hint").asText();
                assertTrue(hint.contains("same --profile as the original receipt"));
                assertTrue(hint.contains("keep --id retained-intent"));
                assertTrue(hint.contains("control +receipt --id retained-intent"));
                assertFalse((result.out() + result.err()).contains("MISSING_SOURCE_CANARY"));
                assertFalse((result.out() + result.err()).contains(fixture.token));
                assertFalse(result.out().contains(selected.equals("default") ? "evaluation" : "default"));
                assertFalse(hint.contains("config list"));
            }
        }
        assertTrue(fixture.requests.isEmpty());
        assertFalse(Files.exists(work.resolve("state/journal")));
    }

    @Test
    void invalidServerJsonIsAResponseFailureAcrossCliAndBatch() throws Exception {
        fixture.configure();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> reply(x, 200, "{\"secret\":\"remote-canary\", malformed"));
        var result = fixture.command("control spaces list --params {}", fixture.params());
        result.assertFailure(1, "response_invalid_json");
        assertFalse((result.out() + result.err()).contains("remote-canary"));
        String batch = JSON.createObjectNode()
                .put("id", "failed-read")
                .set(
                        "items",
                        JSON.createArrayNode()
                                .add(JSON.createObjectNode()
                                        .put("id", "read")
                                        .put("method", "control.spaces.list")
                                        .set("params", JSON.readTree(fixture.params()))))
                .toString();
        var items = fixture.run(batch, "control", "+batch", "--json", "-");
        assertEquals(1, items.code(), items.out());
        var first = JSON.readTree(items.out().lines().findFirst().orElseThrow());
        assertFalse(first.path("ok").asBoolean());
        assertEquals("response_invalid_json", first.at("/result/error/reason").asText());
        assertEquals(200, first.path("httpStatus").asInt());
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> reply(x, 200, "   "));
        var empty = fixture.command("control spaces list --params {}", fixture.params());
        empty.assertFailure(1, "response_invalid_json");
    }

    @Test
    void pendingIdempotencyAndRequestTimeoutRemainRecoverable() throws Exception {
        fixture.configure();
        for (int status : List.of(409, 408, 429, 503)) {
            var keys = new CopyOnWriteArrayList<String>();
            var bodies = new CopyOnWriteArrayList<String>();
            fixture.server.removeContext("/");
            fixture.server.createContext("/", x -> {
                keys.add(x.getRequestHeaders().getFirst("Idempotency-Key"));
                bodies.add(new String(x.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                reply(
                        x,
                        keys.size() == 1 ? status : 200,
                        keys.size() == 1
                                ? (status == 409 ? "{\"code\":\"idempotency_request_in_progress\"}" : "{}")
                                : "{\"id\":\"created\"}");
            });
            String intent = "pending-" + status;
            var first = fixture.command(
                    "control spaces create --params {} --json {} --invocation-id {}",
                    fixture.params(),
                    "{\"name\":\"Fixture\",\"mode\":\"authored\"}",
                    intent);
            assertEquals(1, first.code(), first.out());
            assertTrue(first.json().at("/error/message").asText().contains("unconfirmed"));
            assertFalse(first.json().at("/error/message").asText().contains("rejected"));
            assertTrue(first.json().at("/error/hint").asText().contains("original request and key"));
            try (var journal = new InvocationJournal(work.resolve("state"), "default", intent, fixture.token)) {
                assertFalse(journal.load().has("rejection"));
            }
            var resumed = fixture.command("control +resume --id {}", intent);
            assertEquals(0, resumed.code(), resumed.out());
            assertEquals(2, keys.size());
            assertEquals(keys.getFirst(), keys.getLast());
            assertEquals(bodies.getFirst(), bodies.getLast());
            assertEquals(0, fixture.command("control +resume --id {}", intent).code());
            assertEquals(2, keys.size());
        }
    }

    @Test
    void truncatedResponseUsesTheSameIoFailureForCliAndBatch() throws Exception {
        fixture.configure();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            x.getResponseHeaders().set("Content-Type", "application/json");
            x.sendResponseHeaders(200, 100);
            x.getResponseBody().write('{');
            x.getResponseBody().flush();
            // 先让客户端观察响应头，再断开正文；否则故障可能发生在收到响应头之前。
            java.util.concurrent.locks.LockSupport.parkNanos(
                    java.time.Duration.ofMillis(200).toNanos());
            x.close();
        });
        var cli = fixture.command("control spaces list --params {}", fixture.params());
        cli.assertFailure(1, "io_failed");
        String batch =
                "{\"id\":\"truncated\",\"items\":[{\"id\":\"read\",\"method\":\"control.spaces.list\",\"params\":"
                        + fixture.params() + "}]}";
        var items = fixture.run(batch, "control", "+batch", "--json", "-");
        assertEquals(1, items.code(), items.out());
        var first = JSON.readTree(items.out().lines().findFirst().orElseThrow());
        assertEquals("io_failed", first.at("/result/error/reason").asText());
        assertEquals(200, first.path("httpStatus").asInt());
    }

    @Test
    void malformedInputRemainsAValidationFailureWithoutHttp() throws Exception {
        var number =
                fixture.command("control spaces list --params {} --timeout secret-canary --dry-run", fixture.params());
        assertEquals(3, number.code(), number.out());
        assertFalse((number.out() + number.err()).contains("secret-canary"));
        for (String source : List.of("{", fixture.params() + " {}")) {
            var result = fixture.command("control spaces list --params {} --dry-run", source);
            result.assertFailure(3, "invalid_input");
        }
        Path file = work.resolve("invalid-utf8.json");
        Files.write(file, new byte[] {(byte) 0xff});
        var utf8 = fixture.command(
                "control spaces list --params {} --file-root {} --dry-run", "@" + file, work.toString());
        utf8.assertFailure(3, "invalid_input");
        assertTrue(fixture.requests.isEmpty());
        assertFalse(Files.exists(work.resolve("state")));
    }

    @Test
    void confirmedConflictStillBlocksReplay() throws Exception {
        fixture.configure();
        var calls = new AtomicInteger();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            calls.incrementAndGet();
            x.getRequestBody().readAllBytes();
            reply(x, 409, "{\"code\":\"idempotency_key_reused\"}");
        });
        var rejected = fixture.command(
                "control spaces create --params {} --json {} --invocation-id conflict",
                fixture.params(),
                "{\"name\":\"Fixture\",\"mode\":\"authored\"}");
        assertEquals(1, rejected.code(), rejected.out());
        assertTrue(rejected.json().at("/error/message").asText().contains("rejected"));
        assertFalse(rejected.json().at("/error/hint").asText().contains("+resume"));
        var resumed = fixture.command("control +resume --id conflict");
        resumed.assertFailure(1, "idempotency_key_reused");
        assertEquals(1, calls.get());
    }

    @Test
    void credentialMismatchNamesAcceptedTypesWithoutRedirectingToConsole() throws Exception {
        fixture.configure();
        var result = fixture.command("control managementTokens list");
        result.assertFailure(2, "credential_type_required");
        assertTrue(result.json().at("/error/hint").asText().contains("session"));
        assertTrue(result.json().at("/error/hint").asText().contains("profile"));
        assertFalse(result.json()
                .at("/error/hint")
                .asText()
                .toLowerCase(Locale.ROOT)
                .contains("console"));
        assertTrue(fixture.requests.isEmpty());
    }

    @Test
    void missingCredentialNamesOnlyTheConfiguredSourceWithoutHttp() throws Exception {
        assertEquals(
                0,
                fixture.command(
                                "configure --base-url {} --allow-http-loopback --token-env {}",
                                "http://127.0.0.1:"
                                        + fixture.server.getAddress().getPort(),
                                "SPACECTL_TEST_ABSENT_CREDENTIAL_20261016")
                        .code());
        var result = fixture.command("control auth status");
        result.assertFailure(2, "credential_missing");
        String hint = result.json().at("/error/hint").asText();
        assertTrue(hint.contains("SPACECTL_TEST_ABSENT_CREDENTIAL_20261016"), hint);
        assertFalse(hint.contains("credential set"), hint);
        assertFalse((result.out() + result.err()).contains(fixture.token));
        assertTrue(fixture.requests.isEmpty());
    }

    @Test
    void rejectedRequestsGiveContractBasedActionsWithoutLeakingRemoteDetails() throws Exception {
        fixture.configure();
        for (String reason :
                List.of("management_scope_required", "cross_site_request_rejected", "import_source_unreachable")) {
            fixture.server.removeContext("/");
            fixture.server.createContext(
                    "/", x -> reply(x, 403, "{\"code\":\"" + reason + "\",\"detail\":\"remote-secret-canary\"}"));
            var result = fixture.command("control sites list --params {}", fixture.params());
            assertEquals(1, result.code(), result.out());
            assertEquals(reason, result.json().at("/error/reason").asText());
            assertEquals(403, result.json().at("/error/code").asInt());
            String hint = result.json().at("/error/hint").asText();
            assertTrue(hint.contains("spacectl schema control.sites.list"), hint);
            if (reason.equals("management_scope_required")) {
                assertTrue(hint.contains("hosting:read"), hint);
                assertFalse(hint.contains("--auth-origin"), hint);
            } else if (reason.equals("cross_site_request_rejected")) {
                assertTrue(hint.contains("Session profile"), hint);
                assertTrue(hint.contains("--auth-origin"), hint);
            } else {
                assertTrue(hint.contains("unconfirmed"), hint);
                assertTrue(hint.contains("--upload"), hint);
            }
            assertFalse((result.out() + result.err()).contains("remote-secret-canary"));
            assertFalse((result.out() + result.err()).contains(fixture.token));
        }
    }

    private void reply(com.sun.net.httpserver.HttpExchange exchange, int status, String text)
            throws java.io.IOException {
        byte[] body = text.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }
}
