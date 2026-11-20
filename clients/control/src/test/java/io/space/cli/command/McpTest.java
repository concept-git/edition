package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.transport.ServerParameters;
import io.modelcontextprotocol.client.transport.StdioClientTransport;
import io.modelcontextprotocol.json.jackson2.JacksonMcpJsonMapper;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.file.Path;
import java.time.Duration;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class McpTest {
    @TempDir
    Path work;

    @Test
    void writeIntentsDistinguishRecoveryFromIndependentEffects() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            fixture.configure();
            var keys = new java.util.ArrayList<String>();
            var state = new java.util.concurrent.atomic.AtomicReference<>("active");
            fixture.server.removeContext("/");
            fixture.server.createContext("/", x -> {
                fixture.requests.add(x.getRequestURI().toString());
                keys.add(x.getRequestHeaders().getFirst("Idempotency-Key"));
                state.set(x.getRequestURI().toString().endsWith(":archive") ? "archived" : "active");
                byte[] bytes = JSON.createObjectNode()
                        .put("status", state.get())
                        .toString()
                        .getBytes(java.nio.charset.StandardCharsets.UTF_8);
                x.getResponseHeaders().set("Content-Type", "application/json");
                x.sendResponseHeaders(200, bytes.length);
                x.getResponseBody().write(bytes);
                x.close();
            });
            try (var client = client(fixture, "control.spaces", true)) {
                client.initialize();
                var target = Map.of("tenantId", fixture.tenant, "spaceId", fixture.tenant);
                var missing = call(client, "control.spaces.archive", Map.of("params", target, "confirm", true));
                assertTrue(missing.isError());
                assertTrue(fixture.requests.isEmpty());
                var first = Map.<String, Object>of("params", target, "confirm", true, "invocationId", "archive-first");
                for (boolean replayed : List.of(false, true)) {
                    var result = call(client, "control.spaces.archive", first);
                    assertFalse(result.isError(), result.toString());
                    assertEquals(
                            replayed,
                            JSON.valueToTree(result).at("/_meta/replayed").asBoolean());
                    assertEquals(
                            "completed",
                            JSON.valueToTree(result).at("/_meta/state").asText());
                }
                assertEquals(1, fixture.requests.size());
                var restored = call(
                        client, "control.spaces.restore", Map.of("params", target, "invocationId", "restore-next"));
                assertFalse(restored.isError());
                assertEquals("active", state.get());
                var last = call(
                        client,
                        "control.spaces.archive",
                        Map.of("params", target, "confirm", true, "invocationId", "archive-again"));
                assertFalse(last.isError(), last.toString());
                assertFalse(JSON.valueToTree(last).at("/_meta/replayed").asBoolean());
                assertEquals("archived", state.get());
                assertEquals(3, fixture.requests.size());
                assertNotEquals(keys.getFirst(), keys.getLast());
                var conflict = call(
                        client,
                        "control.spaces.archive",
                        Map.of(
                                "params",
                                Map.of("tenantId", fixture.tenant, "spaceId", "00000000-0000-0000-0000-000000000002"),
                                "confirm",
                                true,
                                "invocationId",
                                "archive-first"));
                assertTrue(conflict.isError());
                assertEquals(
                        "intent_mismatch",
                        JSON.valueToTree(conflict.structuredContent())
                                .at("/error/reason")
                                .asText());
                assertEquals(3, fixture.requests.size());
            }
        }
    }

    @Test
    void remoteJsonAndIoFailuresUseTheSharedCliReasons() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            fixture.configure();
            fixture.server.removeContext("/");
            var truncated = new java.util.concurrent.atomic.AtomicBoolean();
            fixture.server.createContext("/", x -> {
                x.getResponseHeaders().set("Content-Type", "application/json");
                byte[] bytes =
                        "{\"secret\":\"remote-canary\", malformed".getBytes(java.nio.charset.StandardCharsets.UTF_8);
                x.sendResponseHeaders(200, truncated.get() ? 100 : bytes.length);
                x.getResponseBody().write(bytes);
                x.getResponseBody().flush();
                if (truncated.get())
                    java.util.concurrent.locks.LockSupport.parkNanos(
                            Duration.ofMillis(200).toNanos());
                x.close();
            });
            try (var client = client(fixture, "control.spaces", false)) {
                client.initialize();
                for (String reason : List.of("response_invalid_json", "io_failed")) {
                    var result =
                            call(client, "control.spaces.list", Map.of("params", Map.of("tenantId", fixture.tenant)));
                    assertTrue(result.isError(), result.toString());
                    assertEquals(
                            reason,
                            JSON.valueToTree(result.structuredContent())
                                    .at("/error/reason")
                                    .asText());
                    assertEquals(
                            200,
                            JSON.valueToTree(result).at("/_meta/httpStatus").asInt());
                    assertFalse(result.toString().contains("remote-canary"));
                    truncated.set(true);
                }
            }
        }
    }

    @Test
    void structuredErrorsRetainWaitAndFieldDetailsWithoutRemoteSecrets() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            fixture.configure();
            var status = new java.util.concurrent.atomic.AtomicInteger(429);
            fixture.server.removeContext("/");
            fixture.server.createContext("/", x -> {
                x.getRequestBody().readAllBytes();
                x.getResponseHeaders().set("Content-Type", "application/json");
                x.getResponseHeaders().set("Retry-After", "137");
                byte[] bytes = ("{\"code\":\"validation_failed\",\"detail\":\"remote-canary\","
                                + "\"violations\":[{\"field\":\"name\",\"code\":\"size_out_of_range\"}]}")
                        .getBytes(java.nio.charset.StandardCharsets.UTF_8);
                x.sendResponseHeaders(status.get(), bytes.length);
                x.getResponseBody().write(bytes);
                x.close();
            });
            try (var client = client(fixture, "control.spaces", true)) {
                client.initialize();
                for (int code : List.of(429, 422)) {
                    status.set(code);
                    var result = call(
                            client,
                            "control.spaces.create",
                            Map.of(
                                    "invocationId",
                                    "error-" + code,
                                    "params",
                                    Map.of("tenantId", fixture.tenant),
                                    "json",
                                    Map.of("name", "Fixture", "mode", "authored")));
                    assertTrue(result.isError());
                    var body = JSON.valueToTree(result.structuredContent());
                    assertEquals("137", body.at("/error/retryAfter").asText());
                    assertEquals(
                            "size_out_of_range",
                            body.at("/error/violations/0/code").asText());
                    assertEquals(
                            code == 429 ? "unknown" : "rejected",
                            body.path("state").asText());
                    assertEquals(body.path("state"), JSON.valueToTree(result).at("/_meta/state"));
                    assertFalse(result.toString().contains("remote-canary"));
                }
            }
        }
    }

    @Test
    void writeModeDoesNotExposeOwnerInvitationCredentials() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            fixture.configure();
            try (var client = client(fixture, "control.admin.tenants", true)) {
                client.initialize();
                assertFalse(client.listTools().tools().stream()
                        .anyMatch(t -> t.name().equals("control.admin.tenants.create")));
                var denied = assertThrows(
                        io.modelcontextprotocol.spec.McpError.class,
                        () -> call(
                                client,
                                "control.admin.tenants.create",
                                Map.of("json", Map.of("name", "Fixture", "ownerEmail", "agent@example.test"))));
                assertTrue(denied.getMessage().contains("Unknown tool"));
                assertTrue(fixture.requests.isEmpty());
            }
        }
    }

    @Test
    void asynchronousAcceptanceRetainsStatusOutsideTheProviderBody() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            fixture.postStatus = 202;
            fixture.configure();
            try (var client = client(fixture, "control.spaces", true)) {
                client.initialize();
                var result = call(
                        client,
                        "control.spaces.create",
                        Map.of(
                                "invocationId",
                                "async-create",
                                "params",
                                Map.of("tenantId", fixture.tenant),
                                "json",
                                Map.of("name", "Fixture", "mode", "authored")));
                assertFalse(Boolean.TRUE.equals(result.isError()), result.toString());
                var json = JSON.valueToTree(result);
                assertEquals(202, json.at("/_meta/httpStatus").asInt());
                assertEquals(
                        "created",
                        JSON.valueToTree(result.structuredContent()).path("id").asText());
            }
        }
    }

    @Test
    void officialSdkCallsShareHttpAndCannotOverrideTrustOrEnableWrites() throws Exception {
        try (var fixture = ApiTest.open(work)) {
            fixture.configure();
            var client = client(fixture, "control.spaces", false);
            try {
                assertEquals("spacectl", client.initialize().serverInfo().name());
                var tools = client.listTools().tools();
                assertFalse(tools.isEmpty());
                assertTrue(tools.stream()
                        .allMatch(t -> Boolean.TRUE.equals(t.annotations().readOnlyHint())));
                assertFalse(tools.stream().anyMatch(t -> t.name().equals("control.spaces.create")));
                var method = tools.stream()
                        .filter(t -> t.name().equals("control.spaces.list"))
                        .findFirst()
                        .orElseThrow();
                assertTrue(method.inputSchema().containsKey("properties"));
                var result = call(client, method.name(), Map.of("params", Map.of("tenantId", fixture.tenant)));
                assertFalse(Boolean.TRUE.equals(result.isError()), result.toString());
                assertEquals(
                        "first",
                        JSON.valueToTree(result.structuredContent())
                                .at("/items/0/id")
                                .asText());
                String path = fixture.requests.getFirst();
                fixture.requests.clear();
                var cli = fixture.command("control spaces list --params {}", fixture.params());
                assertEquals(0, cli.code());
                assertEquals(path, fixture.requests.getFirst());
                fixture.requests.clear();
                var denied = call(
                        client,
                        method.name(),
                        Map.of("params", Map.of("tenantId", fixture.tenant), "profile", "secret-canary"));
                assertTrue(denied.isError());
                assertFalse(denied.toString().contains("secret-canary"));
                assertTrue(fixture.requests.isEmpty());
                fixture.server.removeContext("/");
                fixture.server.createContext("/", exchange -> {
                    byte[] bytes =
                            "{\"items\":[{\"id\":\"first\",\"secret\":\"typed-result-canary\"}],\"nextCursor\":null}"
                                    .getBytes(java.nio.charset.StandardCharsets.UTF_8);
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, bytes.length);
                    exchange.getResponseBody().write(bytes);
                    exchange.close();
                });
                var redacted = call(client, method.name(), Map.of("params", Map.of("tenantId", fixture.tenant)));
                assertFalse(redacted.isError());
                assertFalse(redacted.toString().contains("typed-result-canary"));
                assertEquals(
                        "REDACTED",
                        JSON.valueToTree(redacted.structuredContent())
                                .at("/items/0/secret")
                                .asText());
                var batch = fixture.command(
                        "control +batch --json {}",
                        "{\"id\":\"redaction\",\"items\":[{\"id\":\"read\",\"method\":\"control.spaces.list\",\"params\":"
                                + fixture.params() + "}]}");
                assertEquals(0, batch.code(), batch.out());
                assertFalse(batch.out().contains("typed-result-canary"));
                assertEquals(
                        "REDACTED",
                        JSON.readTree(batch.out().lines().findFirst().orElseThrow())
                                .at("/result/items/0/secret")
                                .asText());
            } finally {
                client.close();
            }
        }
    }

    private io.modelcontextprotocol.client.McpSyncClient client(ApiTest fixture, String resource, boolean write) {
        var args = new ArrayList<>(List.of(
                "-cp",
                System.getProperty("java.class.path"),
                "io.space.cli.Main",
                "mcp",
                "--resources",
                resource,
                "--file-root",
                work.toString()));
        if (write) args.add("--allow-write");
        var parameters = ServerParameters.builder(
                        Path.of(System.getProperty("java.home"), "bin/java").toString())
                .args(io.space.cli.CoverageArguments.jvm(args.toArray(String[]::new)))
                .env(Map.of("SPACECTL_HOME", work.resolve("state").toString(), "TEST_PAT", fixture.token))
                .build();
        return McpClient.sync(new StdioClientTransport(parameters, new JacksonMcpJsonMapper(JSON)))
                .requestTimeout(Duration.ofSeconds(20))
                .build();
    }

    private static McpSchema.CallToolResult call(
            io.modelcontextprotocol.client.McpSyncClient client, String method, Map<String, Object> arguments) {
        return client.callTool(
                McpSchema.CallToolRequest.builder(method).arguments(arguments).build());
    }
}
