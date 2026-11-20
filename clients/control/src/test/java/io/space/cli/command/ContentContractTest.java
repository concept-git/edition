package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.transport.ServerParameters;
import io.modelcontextprotocol.client.transport.StdioClientTransport;
import io.modelcontextprotocol.json.jackson2.JacksonMcpJsonMapper;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Duration;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

/** 新内容基线、显式意图和只读 POST 通过三入口共用契约；真实平台后验另行验证。 */
class ContentContractTest {
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

    @AfterEach
    void stop() {
        fixture.stop();
    }

    String target() {
        return JSON.createObjectNode()
                .put("tenantId", fixture.tenant)
                .put("spaceId", fixture.tenant)
                .put("pageId", fixture.tenant)
                .put("If-Match", "\"rev-1\"")
                .toString();
    }

    @Test
    void pageInspectUsesContentSnapshotAndItsSameResponseEtag() throws Exception {
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            fixture.requests.add(x.getRequestMethod() + " " + x.getRequestURI());
            byte[] bytes = "{\"content\":\"snapshot\",\"revision\":1}".getBytes(StandardCharsets.UTF_8);
            x.getResponseHeaders().set("Content-Type", "application/json");
            x.getResponseHeaders().set("ETag", "\"rev-1\"");
            x.sendResponseHeaders(200, bytes.length);
            x.getResponseBody().write(bytes);
            x.close();
        });
        var parameters = (com.fasterxml.jackson.databind.node.ObjectNode) JSON.readTree(target());
        parameters.remove("If-Match");
        var result = fixture.command("control spaces pages +inspect --params {}", parameters.toString());
        assertEquals(0, result.code(), result.out());
        assertEquals("snapshot", result.json().at("/body/content").asText());
        assertEquals("\"rev-1\"", result.json().at("/headers/etag").asText());
        assertTrue(fixture.requests.getFirst().endsWith("/pages/" + fixture.tenant + "/content"));
        var schema = fixture.command("schema control.spaces.pages.+inspect");
        assertEquals(0, schema.code(), schema.out());
        assertEquals(
                "control.spaces.pages.content.get",
                schema.json().path("apiMethod").asText());
        assertTrue(schema.json().at("/cli/output/shape").asText().contains("httpObservation"));
    }

    @Test
    void explicitIntentIsRequiredBeforeHttpByCliAndBatch() throws Exception {
        var missing = fixture.command(
                "control spaces pages edit --params {} --json {} --dry-run", target(), "{\"content\":\"new\"}");
        assertEquals(3, missing.code(), missing.out());
        var nullIntent = fixture.command(
                "control spaces pages edit --params {} --json {} --dry-run",
                target(),
                "{\"content\":\"new\",\"intent\":null}");
        assertEquals(3, nullIntent.code(), nullIntent.out());
        var valid = fixture.command(
                "control spaces pages edit --params {} --json {} --dry-run",
                target(),
                "{\"content\":\"new\",\"intent\":\"draft_only\",\"versionRef\":null}");
        assertEquals(0, valid.code(), valid.out());
        assertEquals("draft_only", valid.json().at("/body/intent").asText());
        assertTrue(valid.json().at("/body/versionRef").isNull());
        String batch =
                "{\"id\":\"intent\",\"items\":[{\"id\":\"edit\",\"method\":\"control.spaces.pages.edit\",\"params\":"
                        + target() + ",\"json\":{\"content\":\"new\"}}]}";
        assertEquals(
                3,
                fixture.run(batch, "control", "+batch", "--json", "-", "--dry-run")
                        .code());
        String nullBatch = batch.replace("\"content\":\"new\"", "\"content\":\"new\",\"intent\":null");
        assertEquals(
                3,
                fixture.run(nullBatch, "control", "+batch", "--json", "-", "--dry-run")
                        .code());
        assertTrue(fixture.requests.isEmpty());
        assertFalse(Files.exists(work.resolve("state/journal")));
    }

    @Test
    void readOnlyPostIsExposedWithoutWriteModeAndMcpRequiresContentIntent() throws Exception {
        fixture.server.removeContext("/");
        fixture.server.createContext("/", x -> {
            fixture.requests.add(x.getRequestMethod() + " " + x.getRequestURI());
            assertNull(x.getRequestHeaders().getFirst("Idempotency-Key"));
            byte[] bytes = "{\"items\":[]}".getBytes(StandardCharsets.UTF_8);
            x.getResponseHeaders().set("Content-Type", "application/json");
            x.sendResponseHeaders(200, bytes.length);
            x.getResponseBody().write(bytes);
            x.close();
        });
        try (var client = client(false)) {
            client.initialize();
            var tool = client.listTools().tools().stream()
                    .filter(t -> t.name().equals("control.spaces.pages.batchGet"))
                    .findFirst()
                    .orElseThrow();
            assertTrue(tool.annotations().readOnlyHint());
            var read = client.callTool(McpSchema.CallToolRequest.builder(tool.name())
                    .arguments(Map.of(
                            "params", Map.of("tenantId", fixture.tenant, "spaceId", fixture.tenant),
                            "json", Map.of("ids", List.of(fixture.tenant), "view", "summary")))
                    .build());
            assertFalse(read.isError(), read.toString());
            assertEquals(1, fixture.requests.size());
            assertTrue(fixture.requests.getFirst().startsWith("POST "));
        }
        fixture.requests.clear();
        try (var client = client(true)) {
            client.initialize();
            var args = new HashMap<String, Object>();
            args.put("params", JSON.convertValue(JSON.readTree(target()), Map.class));
            args.put("invocationId", "mcp-intent");
            args.put("dryRun", true);
            args.put("json", Map.of("content", "new"));
            var missing = client.callTool(McpSchema.CallToolRequest.builder("control.spaces.pages.edit")
                    .arguments(args)
                    .build());
            assertTrue(missing.isError());
            var nullBody = new HashMap<String, Object>();
            nullBody.put("content", "new");
            nullBody.put("intent", null);
            args.put("json", nullBody);
            var nullIntent = client.callTool(McpSchema.CallToolRequest.builder("control.spaces.pages.edit")
                    .arguments(args)
                    .build());
            assertTrue(nullIntent.isError(), nullIntent.toString());
            args.put("json", Map.of("content", "new", "intent", "draft_only"));
            var valid = client.callTool(McpSchema.CallToolRequest.builder("control.spaces.pages.edit")
                    .arguments(args)
                    .build());
            assertFalse(valid.isError(), valid.toString());
            assertTrue(fixture.requests.isEmpty());
        }
        assertFalse(Files.exists(work.resolve("state/journal")));
    }

    private io.modelcontextprotocol.client.McpSyncClient client(boolean writes) {
        var args = new ArrayList<>(List.of(
                "-cp",
                System.getProperty("java.class.path"),
                "io.space.cli.Main",
                "mcp",
                "--resources",
                "control.spaces.pages",
                "--file-root",
                work.toString()));
        if (writes) args.add("--allow-write");
        var parameters = ServerParameters.builder(
                        Path.of(System.getProperty("java.home"), "bin/java").toString())
                .args(io.space.cli.CoverageArguments.jvm(args.toArray(String[]::new)))
                .env(Map.of("SPACECTL_HOME", work.resolve("state").toString(), "TEST_PAT", fixture.token))
                .build();
        return McpClient.sync(new StdioClientTransport(parameters, new JacksonMcpJsonMapper(JSON)))
                .requestTimeout(Duration.ofSeconds(20))
                .build();
    }
}
