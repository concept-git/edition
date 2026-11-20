package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.sun.net.httpserver.HttpServer;
import io.space.cli.contract.ContractCatalog;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

/** Real CLI processes against a recording HTTP server; no service credentials or production data. */
class ApiTest implements AutoCloseable {
    @TempDir
    Path work;

    HttpServer server;
    final List<String> requests = new CopyOnWriteArrayList<>();
    final List<String> bodies = new CopyOnWriteArrayList<>();
    final String tenant = "00000000-0000-0000-0000-000000000001";
    final String token = "spm_disposable_native_api_test";
    int postStatus = 200;

    static ApiTest open(Path work) throws Exception {
        var fixture = new ApiTest();
        fixture.work = work;
        fixture.start();
        return fixture;
    }

    @Override
    public void close() {
        stop();
    }

    String params() {
        return "{\"tenantId\":\"" + tenant + "\"}";
    }

    @BeforeEach
    void start() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            requests.add(exchange.getRequestMethod() + " " + exchange.getRequestURI());
            bodies.add(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            assertEquals("Bearer " + token, exchange.getRequestHeaders().getFirst("Authorization"));
            assertNull(exchange.getRequestHeaders().getFirst("Cookie"));
            boolean post = exchange.getRequestMethod().equals("POST");
            if (post) assertNotNull(exchange.getRequestHeaders().getFirst("Idempotency-Key"));
            String result = post
                    ? "{\"id\":\"created\"}"
                    : exchange.getRequestURI().getRawQuery() == null
                            ? "{\"items\":[{\"id\":\"first\"}],\"nextCursor\":\"next\"}"
                            : "{\"items\":[{\"id\":\"second\"}],\"nextCursor\":null}";
            byte[] bytes = result.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("ETag", "\"fixture\"");
            exchange.sendResponseHeaders(post ? postStatus : 200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    record Result(int code, String out, String err) {
        JsonNode json() throws Exception {
            return JSON.readTree(out);
        }

        void assertFailure(int exit, String reason) throws Exception {
            assertEquals(exit, code, out);
            assertEquals(reason, json().at("/error/reason").asText());
        }
    }

    Result run(String stdin, String... args) throws Exception {
        return runAt(null, stdin, args);
    }

    /** 模板只描述固定 argv；值在分词后替换，空白、引号和控制字符均原样保留。 */
    Result command(String template, String... values) throws Exception {
        var args = template.split(" ");
        assertEquals(values.length, Arrays.stream(args).filter("{}"::equals).count(), template);
        int next = 0;
        for (int i = 0; i < args.length; i++) if (args[i].equals("{}")) args[i] = values[next++];
        return run("", args);
    }

    Result runAt(Path directory, String stdin, String... args) throws Exception {
        var command = new ArrayList<>(List.of(
                Path.of(System.getProperty("java.home"), "bin/java").toString(),
                "-cp",
                System.getProperty("java.class.path"),
                "io.space.cli.Main"));
        command.addAll(List.of(args));
        io.space.cli.CoverageArguments.instrument(command);
        var builder = new ProcessBuilder(command);
        if (directory != null) builder.directory(directory.toFile());
        builder.environment().put("SPACECTL_HOME", work.resolve("state").toString());
        builder.environment().put("TEST_PAT", token);
        var process = builder.start();
        process.getOutputStream().write(stdin.getBytes(StandardCharsets.UTF_8));
        process.getOutputStream().close();
        var out = CompletableFuture.supplyAsync(() -> read(process.getInputStream()));
        var err = CompletableFuture.supplyAsync(() -> read(process.getErrorStream()));
        if (!process.waitFor(15, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            fail("Native CLI blocked");
        }
        return new Result(process.exitValue(), out.get(), err.get());
    }

    static String read(InputStream stream) {
        try {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    void configure() throws Exception {
        assertEquals(
                0,
                command(
                                "configure --base-url {} --allow-http-loopback --token-env {}",
                                "http://127.0.0.1:" + server.getAddress().getPort(),
                                "TEST_PAT")
                        .code);
    }

    @Test
    void selectedConfigurationAndSourceDiagnosticsDoNotExploreOtherProfilesOrAuthenticate() throws Exception {
        configure();
        assertEquals(
                0,
                command(
                                "--profile absent configure --base-url {} --token-env {}",
                                "https://example.test",
                                "ABSENT_PROFILE_CANARY")
                        .code());
        var selected = command("config get");
        assertEquals(0, selected.code(), selected.out());
        assertEquals("default", selected.json().path("profile").asText());
        assertEquals("TEST_PAT", selected.json().at("/configuration/tokenEnv").asText());
        assertFalse(selected.out().contains("ABSENT_PROFILE_CANARY"));
        var inspected = command("config inspect");
        assertEquals(0, inspected.code(), inspected.out());
        assertEquals("present", inspected.json().at("/source/state").asText());
        assertFalse(inspected.json().path("authenticationVerified").asBoolean());
        assertFalse(inspected.json().path("authorizationVerified").asBoolean());
        assertFalse((inspected.out() + inspected.err()).contains(token));
        var absent = command("--profile absent config inspect");
        assertEquals("missing", absent.json().at("/source/state").asText());
        assertEquals(
                "ABSENT_PROFILE_CANARY", absent.json().at("/source/reference").asText());
        assertFalse(absent.out().contains("TEST_PAT"));
        var listing = command("config list");
        assertTrue(listing.json().has("default"));
        assertTrue(listing.json().has("absent"));
        assertTrue(requests.isEmpty());
        assertFalse(Files.exists(work.resolve("state/journal")));
    }

    @Test
    void allMethodsExposeOnlyTheNativeSchemaContract() throws Exception {
        var catalog = new ContractCatalog();
        var schemas = new CommandSchema(catalog);
        int count = 0;
        for (var names = catalog.index.path("commands").fieldNames(); names.hasNext(); ) {
            String name = names.next();
            var schema = schemas.describe(name, false);
            count++;
            assertTrue(schema.has("httpMethod"), name);
            assertTrue(schema.has("parameters"), name);
            assertFalse(schema.has("knowledge"), name);
            assertEquals(
                    catalog.operation(name).path("path").asText().substring(1),
                    schema.path("path").asText());
            var op = catalog.operation(name);
            if (!op.path("requestBody").path("content").isEmpty()) {
                var expectedMedia = new HashSet<String>();
                op.path("requestBody").path("content").fieldNames().forEachRemaining(expectedMedia::add);
                var discoveredMedia = new HashSet<String>();
                schema.path("requestBody").path("contentTypes").forEach(media -> discoveredMedia.add(media.asText()));
                assertEquals(expectedMedia, discoveredMedia, name);
            }
            for (var responses = op.path("responses").properties().iterator(); responses.hasNext(); ) {
                var response = responses.next();
                if (response.getKey().startsWith("2"))
                    for (var media : response.getValue().path("content"))
                        if (media.has("schema")) assertTrue(schema.has("response"), name);
            }
        }
        assertEquals(195, count);
        var result = command("schema control.spaces.pages.edit");
        assertEquals(0, result.code, result.out);
        assertEquals(
                "EditPageRequest", result.json().at("/requestBody/schemaRef").asText());
        assertEquals("header", result.json().at("/parameters/If-Match/location").asText());
        assertFalse(Files.exists(work.resolve("state")));
        assertTrue(requests.isEmpty());
    }

    @Test
    void strictInputsRejectDuplicatesTrailingObjectsAndCoercionWithoutSideEffects() throws Exception {
        for (String bad : List.of(
                params() + " {}",
                params().replace("}", ",\"tenantId\":\"" + tenant + "\"}"),
                params().replace("}", ",\"limit\":\"10\"}"),
                params().replace("}", ",\"Authorization\":\"secret-canary\"}"))) {
            var result = command("control spaces list --params {} --dry-run", bad);
            assertEquals(3, result.code, result.out);
            assertTrue(result.json().has("error"));
            assertFalse((result.out + result.err).contains("secret-canary"));
        }
        assertFalse(Files.exists(work.resolve("state")));
        assertTrue(requests.isEmpty());
    }

    @Test
    void passwordPreviewsRedactStdinAndInlineSecretsFailWithoutState() throws Exception {
        var catalog = new ContractCatalog();
        for (String method :
                List.of("control.account.password.change", "control.account.erase", "control.auth.password.reset")) {
            var body = catalog.operation(method).path("example").path("json").deepCopy();
            var canaries = new ArrayList<String>();
            for (var fields = body.properties().iterator(); fields.hasNext(); ) {
                var field = fields.next();
                if (io.space.cli.shared.JsonSupport.secretField(field.getKey(), field.getValue())) {
                    String canary = "private-" + field.getKey() + "-canary";
                    canaries.add(canary);
                    ((com.fasterxml.jackson.databind.node.ObjectNode) body).put(field.getKey(), canary);
                }
            }
            var args = new ArrayList<>(List.of(method.split("\\.")));
            args.addAll(List.of("--json", "-", "--dry-run"));
            var preview = run(body.toString(), args.toArray(String[]::new));
            assertEquals(0, preview.code, preview.out + preview.err);
            for (String canary : canaries) assertFalse((preview.out + preview.err).contains(canary));
            assertTrue(preview.out.contains("REDACTED"));
            args.set(args.indexOf("-"), body.toString());
            var rejected = run("", args.toArray(String[]::new));
            assertEquals(3, rejected.code);
            for (String canary : canaries) assertFalse((rejected.out + rejected.err).contains(canary));
        }
        assertFalse(Files.exists(work.resolve("state")));
        assertTrue(requests.isEmpty());
    }

    @Test
    void nativeBodyAndStdinPreserveLegitimateTextAndPreviewNeedsNoProfile() throws Exception {
        String body = "{\"name\":\"中文 name\",\"mode\":\"authored\"}";
        var result = run(body, "control", "spaces", "create", "--params", params(), "--json", "-", "--dry-run");
        assertEquals(0, result.code, result.out);
        assertTrue(result.json().path("dry_run").asBoolean());
        assertEquals("中文 name", result.json().at("/body/name").asText());
        assertFalse(Files.exists(work.resolve("state")));
        assertTrue(requests.isEmpty());
    }

    @Test
    void duplicateStdinAndEscapingFilesFailBeforeHttp() throws Exception {
        var duplicate = run(params(), "control", "spaces", "create", "--params", "-", "--json", "-", "--dry-run");
        assertEquals(3, duplicate.code, duplicate.out);
        Path body = work.resolve("params.json");
        Files.writeString(body, params());
        var escape = command("control spaces list --params {} --dry-run", "@" + body);
        assertEquals(3, escape.code);
        var valid = command("control spaces list --params {} --file-root {} --dry-run", "@" + body, work.toString());
        assertEquals(0, valid.code, valid.out);
        assertTrue(requests.isEmpty());
    }

    @Test
    void rawApiOutputAndOriginalIntentPreventDuplicateWrites() throws Exception {
        configure();
        String body = "{\"name\":\"Example\",\"mode\":\"authored\"}";
        for (int i = 0; i < 2; i++) {
            var result = command("control spaces create --params {} --json {}", params(), body);
            assertEquals(0, result.code, result.out);
            assertEquals("created", result.json().path("id").asText());
            assertFalse(result.json().has("data"));
            assertEquals(i == 1, result.err().contains("Replayed historical receipt"));
        }
        assertEquals(1, requests.size());
        assertEquals(JSON.readTree(body), JSON.readTree(bodies.getFirst()));
    }

    @Test
    void paginationIsBoundedNdjsonWithOnePagePerLine() throws Exception {
        configure();
        var result = command("control spaces list --params {} --page-all --page-delay {}", params(), "0");
        assertEquals(0, result.code, result.out);
        var lines = result.out.lines().toList();
        assertEquals(2, lines.size());
        assertEquals("first", JSON.readTree(lines.get(0)).at("/items/0/id").asText());
        assertTrue(JSON.readTree(lines.get(1)).path("nextCursor").isNull());
        requests.clear();
        result = command("control spaces list --params {} --page-all --page-limit {}", params(), "1");
        assertEquals(1, requests.size());
        assertEquals("next", result.json().path("nextCursor").asText());
        assertTrue(result.err.contains("limit reached"));
    }

    @Test
    void nativeQueryArraysUseDeclaredFormSerializationAndRejectPaginationControls() throws Exception {
        configure();
        String second = "00000000-0000-0000-0000-000000000002";
        var parameters = JSON.createObjectNode().put("tenantId", tenant).put("spaceId", tenant);
        parameters.putArray("ids").add(tenant).add(second);
        var preview = command("control spaces pages list --params {} --dry-run", parameters.toString());
        assertEquals(0, preview.code(), preview.out());
        assertEquals(
                JSON.createArrayNode().add(tenant).add(second), preview.json().at("/query_params/ids"));
        assertTrue(requests.isEmpty());
        var result = command("control spaces pages list --params {}", parameters.toString());
        assertEquals(0, result.code(), result.out());
        assertTrue(requests.getFirst().contains("ids=" + tenant + "&ids=" + second));
        assertFalse(requests.getFirst().contains("%5B"));
        requests.clear();
        parameters.put("limit", 20);
        assertEquals(
                3,
                command("control spaces pages list --params {}", parameters.toString())
                        .code());
        parameters.remove("limit");
        parameters.put("cursor", "next");
        assertEquals(
                3,
                command("control spaces pages list --params {}", parameters.toString())
                        .code());
        parameters.remove("cursor");
        parameters.putArray("ids").add("not-a-uuid\n");
        assertEquals(
                3,
                command("control spaces pages list --params {}", parameters.toString())
                        .code());
        assertTrue(requests.isEmpty());
    }

    @Test
    void outputMigrationErrorsDoNotCreateAFileOrSendHttp() throws Exception {
        var result = command(
                "control spaces exports download --params {} --output json",
                JSON.createObjectNode()
                        .put("tenantId", tenant)
                        .put("spaceId", tenant)
                        .put("jobId", tenant)
                        .toString());
        assertEquals(3, result.code);
        assertTrue(result.out.contains("--format json"));
        assertTrue(requests.isEmpty());
    }

    @Test
    void fieldMasksRejectUnknownFieldsAndRequireContinuationBeforeHttp() throws Exception {
        for (String mask : List.of("items(typo),nextCursor", "items(id", "items(id)")) {
            var parameters = (com.fasterxml.jackson.databind.node.ObjectNode) JSON.readTree(params());
            parameters.put("fields", mask);
            var result = command("control spaces list --params {} --page-all --dry-run", parameters.toString());
            assertEquals(3, result.code, result.out);
        }
        var parameters = (com.fasterxml.jackson.databind.node.ObjectNode) JSON.readTree(params());
        parameters.put("fields", "items(id,name),nextCursor");
        var result = command("control spaces list --params {} --page-all --dry-run", parameters.toString());
        assertEquals(0, result.code, result.out);
        assertTrue(requests.isEmpty());
    }

    @Test
    void nativeBatchPrevalidatesAllItemsAndReplaysStableIdentities() throws Exception {
        configure();
        postStatus = 202;
        String item = "{\"id\":\"one\",\"method\":\"control.spaces.create\",\"params\":" + params()
                + ",\"json\":{\"name\":\"Batch\",\"mode\":\"authored\"}}";
        String batch = "{\"id\":\"batch-native\",\"items\":[" + item + "]}";
        var invalid = run(batch.replace("]}", "," + item + "]}"), "control", "+batch", "--json", "-");
        assertEquals(3, invalid.code, invalid.out);
        assertTrue(requests.isEmpty());
        var preview = run(batch, "control", "+batch", "--json", "-", "--dry-run");
        assertEquals(0, preview.code, preview.out);
        assertTrue(requests.isEmpty());
        for (int i = 0; i < 2; i++) {
            var result = run(batch, "control", "+batch", "--json", "-", "--parallel", "2");
            assertEquals(0, result.code, result.out);
            var lines = result.out.lines().toList();
            assertEquals(2, lines.size());
            assertTrue(JSON.readTree(lines.getFirst()).path("ok").asBoolean());
            assertEquals(202, JSON.readTree(lines.getFirst()).path("httpStatus").asInt());
            assertEquals(
                    "accepted", JSON.readTree(lines.getFirst()).path("state").asText());
            assertEquals(
                    i == 1, JSON.readTree(lines.getFirst()).path("replayed").asBoolean());
            var summary = JSON.readTree(lines.getLast());
            assertEquals("requestSummary", summary.path("kind").asText());
            assertEquals(1, summary.path("completedRequests").asInt());
            assertFalse(summary.path("backgroundCompletionVerified").asBoolean());
            assertFalse(summary.has("completed"));
        }
        assertEquals(1, requests.size());
    }

    @Test
    void binaryFilePreviewLeavesNoPrivateState() throws Exception {
        Path file = work.resolve("preview.pdf");
        Files.writeString(file, "%PDF-preview");
        String target = JSON.createObjectNode()
                .put("tenantId", tenant)
                .put("spaceId", tenant)
                .put("pageId", tenant)
                .toString();
        var result = command(
                "control spaces pages attachments upload --params {} --upload {} --file-root {} --dry-run",
                target,
                file.toString(),
                work.toString());
        assertEquals(0, result.code, result.err + result.out);
        assertFalse(Files.exists(work.resolve("state")));
        assertTrue(requests.isEmpty());
    }
}
