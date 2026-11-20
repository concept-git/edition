package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import com.sun.net.httpserver.HttpServer;
import io.space.cli.shared.CliFailure;
import io.space.cli.state.ProfileStore;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

/** Adversarial and uncertain-outcome probes through real processes, transport, and encrypted state. */
class SafetyTest {
    @TempDir
    Path work;

    ApiTest fixture;

    @BeforeEach
    void start() throws Exception {
        fixture = new ApiTest();
        fixture.work = work;
        fixture.start();
        fixture.configure();
    }

    @Test
    void nestedDynamicSecretsRequirePrivateInputAndNeverAppearInPreviews() throws Exception {
        String params = fixture.params().replace("}", ",\"spaceId\":\"" + fixture.tenant + "\"}");
        String body =
                "{\"title\":\"Valid\",\"slug\":\"valid\",\"format\":\"markdown\",\"interpretation\":{\"nested\":[{\"accessToken\":\"dynamic-secret-canary\"}]}}";
        var inline = fixture.command("control spaces pages create --params {} --json {} --dry-run", params, body);
        inline.assertFailure(3, "invalid_input");
        assertFalse((inline.out() + inline.err()).contains("dynamic-secret-canary"));
        var privateInput = fixture.run(
                body, "control", "spaces", "pages", "create", "--params", params, "--json", "-", "--dry-run");
        assertEquals(0, privateInput.code(), privateInput.out());
        assertFalse((privateInput.out() + privateInput.err()).contains("dynamic-secret-canary"));
        assertEquals(
                "REDACTED",
                privateInput
                        .json()
                        .at("/body/interpretation/nested/0/accessToken")
                        .asText());
        assertTrue(fixture.requests.isEmpty());
        assertFalse(Files.exists(work.resolve("state/journal")));
    }

    @Test
    void invalidPaginationCursorsCannotMasqueradeAsCompleteResults() throws Exception {
        for (String cursor : List.of("{}", "[]", "0", "false", "\"\"")) {
            fixture.server.removeContext("/");
            fixture.server.createContext(
                    "/", x -> reply(x, 200, "application/json", "{\"items\":[],\"nextCursor\":" + cursor + "}"));
            var result = fixture.command("control spaces list --params {} --page-all --page-delay 0", fixture.params());
            assertEquals(1, result.code(), result.out());
            var lines = result.out().lines().toList();
            assertEquals(
                    "cursor_loop",
                    JSON.readTree(lines.getLast()).at("/error/reason").asText());
        }
    }

    @Test
    void undeclaredSecretResponseFieldsAreRedactedInEveryFormat() throws Exception {
        fixture.server.removeContext("/");
        fixture.server.createContext(
                "/",
                x -> reply(
                        x,
                        200,
                        "application/json",
                        "{\"items\":[{\"id\":\"public-id\",\"token\":{\"type\":\"public-type\"},\"accessToken\":\"undeclared-secret-canary\"}]}"));
        for (String format : List.of("json", "yaml", "csv", "table")) {
            var result = fixture.command("control spaces list --params {} --format {}", fixture.params(), format);
            assertEquals(0, result.code(), result.out() + result.err());
            assertFalse((result.out() + result.err()).contains("undeclared-secret-canary"));
            assertTrue(result.out().contains("public-id"));
            assertTrue(result.out().contains("public-type"));
        }
    }

    @Test
    void credentialOutputsHideInvitationSecretsAndKeepTokenMetadata() throws Exception {
        fixture.server.removeContext("/");
        fixture.server.createContext(
                "/",
                x -> reply(
                        x,
                        200,
                        "application/json",
                        "{\"tenantId\":\"tenant-created\",\"ownerInviteToken\":\"private-owner-canary\"}"));
        var tenant = fixture.command(
                "control admin tenants create --json {}",
                "{\"name\":\"Fixture\",\"ownerEmail\":\"agent@example.test\"}");
        assertEquals(0, tenant.code(), tenant.out() + tenant.err());
        assertEquals("REDACTED", tenant.json().path("ownerInviteToken").asText());
        assertEquals("tenant-created", tenant.json().path("tenantId").asText());
        assertFalse((tenant.out() + tenant.err()).contains("private-owner-canary"));
        assertEquals(
                0,
                fixture.command(
                                "configure --base-url {} --allow-http-loopback --token-env {} --credential-type session",
                                "http://127.0.0.1:"
                                        + fixture.server.getAddress().getPort(),
                                "TEST_PAT")
                        .code());
        fixture.server.removeContext("/");
        fixture.server.createContext(
                "/",
                x -> reply(
                        x,
                        200,
                        "application/json",
                        "{\"token\":{\"id\":\"pat-created\",\"name\":\"automation\",\"scopes\":[\"content:read\"]},\"secret\":\"private-issued-canary\"}"));
        var token = fixture.command(
                "control managementTokens create --json {}",
                "{\"name\":\"automation\",\"expiry\":\"2027-01-01T00:00:00Z\",\"scopes\":[\"content:read\"]}");
        assertEquals(0, token.code(), token.out() + token.err());
        assertEquals("pat-created", token.json().at("/token/id").asText());
        assertEquals("content:read", token.json().at("/token/scopes/0").asText());
        assertEquals("REDACTED", token.json().path("secret").asText());
        assertFalse((token.out() + token.err()).contains("private-issued-canary"));
    }

    @Test
    void multipartFilenameIsPreservedAndParticipatesInTheIntent() throws Exception {
        var bodies = new CopyOnWriteArrayList<String>();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            bodies.add(new String(x.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            reply(x, 200, "application/json", "{\"ref\":\"attachment\"}");
        });
        for (String name : List.of("中文.pdf", "another.pdf")) {
            Path file = work.resolve(name);
            Files.writeString(file, "%PDF-identical-bytes");
            var result = fixture.command(
                    "control spaces pages attachments upload --params {} --upload {} --file-root {}",
                    target(),
                    file.toString(),
                    work.toString());
            assertEquals(0, result.code(), result.out());
        }
        assertEquals(2, bodies.size());
        assertTrue(bodies.get(0).contains("filename=\"中文.pdf\""));
        assertTrue(bodies.get(1).contains("filename=\"another.pdf\""));
    }

    @AfterEach
    void stop() {
        fixture.stop();
    }

    String target() {
        return JSON.createObjectNode()
                .put("tenantId", fixture.tenant)
                .put("spaceId", fixture.tenant)
                .put("pageId", fixture.tenant)
                .toString();
    }

    void reply(com.sun.net.httpserver.HttpExchange exchange, int status, String type, String text)
            throws java.io.IOException {
        byte[] body = text.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", type);
        exchange.sendResponseHeaders(status, body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }

    @Test
    void credentialsCannotEscapeThroughRedirectsOrRemoteErrors() throws Exception {
        assertEquals(2, fixture.command("control managementTokens list").code());
        assertTrue(fixture.requests.isEmpty());
        var escaped = new AtomicInteger();
        var other = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        other.createContext("/", x -> {
            escaped.incrementAndGet();
            x.sendResponseHeaders(204, -1);
            x.close();
        });
        other.start();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            x.getResponseHeaders()
                    .set("Location", "http://127.0.0.1:" + other.getAddress().getPort() + "/leak");
            x.sendResponseHeaders(302, -1);
            x.close();
        });
        try {
            var result = fixture.command("control auth status");
            assertEquals(1, result.code());
            assertEquals(0, escaped.get());
            assertFalse((result.out() + result.err()).contains(fixture.token));
        } finally {
            other.stop(0);
        }
        fixture.server.removeContext("/");
        fixture.server.createContext(
                "/",
                x -> reply(
                        x,
                        403,
                        "application/problem+json",
                        JSON.createObjectNode()
                                .put("code", fixture.token)
                                .put("message", fixture.token)
                                .put("traceId", fixture.token)
                                .toString()));
        var error = fixture.command("control auth status");
        assertEquals(1, error.code());
        assertEquals(403, error.json().at("/error/code").asInt());
        assertFalse((error.out() + error.err()).contains(fixture.token));
    }

    @Test
    void keyedUnknownWriteResumesOriginalKeyAndBytesWithoutPlaintextState() throws Exception {
        assertEquals(
                0,
                fixture.command(
                                "--profile evaluation configure --base-url {} --allow-http-loopback --token-env {}",
                                "http://127.0.0.1:"
                                        + fixture.server.getAddress().getPort(),
                                "TEST_PAT")
                        .code());
        var keys = new CopyOnWriteArrayList<String>();
        var bodies = new CopyOnWriteArrayList<String>();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            keys.add(x.getRequestHeaders().getFirst("Idempotency-Key"));
            bodies.add(new String(x.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            reply(
                    x,
                    keys.size() == 1 ? 503 : 200,
                    "application/json",
                    keys.size() == 1 ? "{}" : "{\"id\":\"created\"}");
        });
        String body = "{\"name\":\"private-payload-canary\",\"mode\":\"authored\"}";
        assertEquals(
                1,
                fixture.command(
                                "control spaces create --params {} --json {} --invocation-id original",
                                fixture.params(),
                                body)
                        .code());
        Path original = work.resolve("state/journal/default/original.enc");
        byte[] unknownReceipt = Files.readAllBytes(original);
        for (String helper : List.of("+receipt", "+resume")) {
            var wrong = fixture.command("--profile evaluation control {} --id original", helper);
            assertEquals(3, wrong.code(), wrong.out());
            assertTrue(wrong.json().at("/error/message").asText().contains("selected profile 'evaluation'"));
            assertFalse((wrong.out() + wrong.err()).contains("private-payload-canary"));
            assertEquals(1, keys.size());
            assertArrayEquals(unknownReceipt, Files.readAllBytes(original));
            assertFalse(Files.exists(work.resolve("state/journal/evaluation")));
        }
        var inspected = fixture.command("control +receipt --id original");
        assertEquals(0, inspected.code(), inspected.out());
        assertFalse(inspected.json().path("hasResult").asBoolean());
        assertFalse(inspected.json().has("request"));
        assertEquals(1, keys.size());
        assertEquals(0, fixture.command("control +resume --id original").code());
        byte[] completedReceipt = Files.readAllBytes(original);
        var replayed = fixture.command("control +resume --id original");
        assertEquals(0, replayed.code(), replayed.out());
        assertTrue(replayed.err().contains("Replayed historical receipt"));
        assertArrayEquals(completedReceipt, Files.readAllBytes(original));
        assertEquals(2, keys.size());
        assertEquals(keys.get(0), keys.get(1));
        assertEquals(bodies.get(0), bodies.get(1));
        try (var files = Files.walk(work.resolve("state"))) {
            for (var file : files.filter(Files::isRegularFile).toList()) {
                var text = new String(Files.readAllBytes(file), StandardCharsets.ISO_8859_1);
                assertFalse(text.contains(fixture.token));
                assertFalse(text.contains("private-payload-canary"));
            }
        }
    }

    @Test
    void unknownUnkeyedWriteCannotBeReplayed() throws Exception {
        var submitted = new AtomicInteger();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            submitted.incrementAndGet();
            assertNull(x.getRequestHeaders().getFirst("Idempotency-Key"));
            x.getRequestBody().readAllBytes();
            reply(x, 503, "application/json", "{}");
        });
        var first = fixture.command(
                "control admin tenants resume --params {} --invocation-id unkeyed",
                JSON.createObjectNode().put("id", fixture.tenant).toString());
        assertEquals(1, first.code(), first.out());
        assertTrue(first.json().at("/error/hint").asText().contains("+receipt"));
        assertFalse(first.json().at("/error/hint").asText().contains("+resume"));
        assertTrue(first.json().at("/error/hint").asText().contains("must not be replayed"));
        var again = fixture.command("control +resume --id unkeyed");
        assertEquals(3, again.code());
        assertTrue(again.out().contains("outcome_unknown"));
        assertEquals(1, submitted.get());
    }

    @Test
    void changedUploadMaterialCannotResume() throws Exception {
        var submitted = new AtomicInteger();
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            submitted.incrementAndGet();
            x.getRequestBody().readAllBytes();
            reply(x, 503, "application/json", "{}");
        });
        Path file = work.resolve("attachment.pdf");
        Files.writeString(file, "%PDF-first");
        assertEquals(
                1,
                fixture.command(
                                "control spaces pages attachments upload --params {} --upload {} --file-root {} --invocation-id upload",
                                target(),
                                file.toString(),
                                work.toString())
                        .code());
        Files.writeString(file, "%PDF-replaced");
        var result = fixture.command("control +resume --id upload");
        assertEquals(3, result.code());
        assertTrue(result.out().contains("replay_material_changed"));
        assertEquals(1, submitted.get());
    }

    @Test
    void binaryDownloadIsPrivateAndDoesNotOverwrite() throws Exception {
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            String accept = x.getRequestHeaders().getFirst("Accept");
            if (accept == null || !(accept.contains("application/zip") || accept.contains("*/*"))) {
                reply(x, 406, "application/problem+json", "{\"code\":\"response_not_acceptable\"}");
                return;
            }
            reply(x, 200, "application/zip", "PK-fixture-bytes");
        });
        Path file = work.resolve("bundle.zip");
        String target = JSON.createObjectNode()
                .put("tenantId", fixture.tenant)
                .put("spaceId", fixture.tenant)
                .put("jobId", fixture.tenant)
                .toString();
        String[] command = {
            "control",
            "spaces",
            "exports",
            "download",
            "--params",
            target,
            "--output",
            file.toString(),
            "--file-root",
            work.toString()
        };
        var first = fixture.run("", command);
        assertEquals(0, first.code(), first.out());
        assertEquals("PK-fixture-bytes", Files.readString(file));
        assertEquals(
                file.toRealPath().toString(), first.json().path("saved_file").asText());
        assertEquals(3, fixture.run("", command).code());
        assertEquals("PK-fixture-bytes", Files.readString(file));
    }

    @Test
    void responseBodyDeadlinePreventsAStalledServerFromHangingTheAgent() throws Exception {
        var release = new CountDownLatch(1);
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            try {
                x.getResponseHeaders().set("Content-Type", "application/json");
                x.sendResponseHeaders(200, 100);
                x.getResponseBody().write('{');
                x.getResponseBody().flush();
                release.await(5, TimeUnit.SECONDS);
            } catch (Exception ignored) {
            } finally {
                x.close();
            }
        });
        long start = System.nanoTime();
        try {
            var result = fixture.command("control spaces list --params {} --timeout {}", fixture.params(), "1");
            assertEquals(1, result.code(), result.out());
            assertTrue(result.out().contains("request_timeout"));
            assertTrue(TimeUnit.NANOSECONDS.toSeconds(System.nanoTime() - start) < 4);
        } finally {
            release.countDown();
        }
    }

    @Test
    void fileSymlinksAndUnsafeOriginsFailBeforeRequests() throws Exception {
        Path real = work.resolve("params.json"), link = work.resolve("link.json");
        Files.writeString(real, fixture.params());
        Files.createSymbolicLink(link, real);
        var result = fixture.command("control spaces list --params {} --file-root {}", "@" + link, work.toString());
        assertEquals(3, result.code());
        assertTrue(fixture.requests.isEmpty());
        for (String origin : List.of(
                "http://example.com",
                "https://user:password@example.com",
                "https://example.com/path",
                "https://example.com/?secret=x"))
            assertThrows(CliFailure.class, () -> ProfileStore.origin(origin, true));
    }
}
