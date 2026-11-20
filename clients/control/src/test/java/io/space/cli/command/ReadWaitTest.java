package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

/** 等待只读同一目标，终态事实由服务端提供；预算和目标漂移均保留最后观察。 */
class ReadWaitTest {
    @TempDir
    Path work;

    ApiTest fixture;
    final List<String> requests = new CopyOnWriteArrayList<>();

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

    String params() {
        return JSON.createObjectNode()
                .put("tenantId", fixture.tenant)
                .put("spaceId", fixture.tenant)
                .put("jobId", fixture.tenant)
                .toString();
    }

    void respond(String... values) {
        fixture.server.removeContext("/");
        var count = new AtomicInteger();
        fixture.server.createContext("/", exchange -> {
            requests.add(exchange.getRequestMethod() + " " + exchange.getRequestURI());
            assertEquals("GET", exchange.getRequestMethod());
            assertNull(exchange.getRequestHeaders().getFirst("Idempotency-Key"));
            byte[] body = values[Math.min(count.getAndIncrement(), values.length - 1)].getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
    }

    String job(boolean terminal, boolean successful) {
        return JSON.createObjectNode()
                .put("id", fixture.tenant)
                .put("status", terminal ? "completed" : "running")
                .put("terminal", terminal)
                .put("successful", successful)
                .put("nextPollAfterSeconds", 0)
                .toString();
    }

    ApiTest.Result waitJob(String... extra) throws Exception {
        var args = new ArrayList<>(
                List.of("control", "spaces", "imports", "get", "--params", params(), "--wait", "--wait-interval", "0"));
        args.addAll(List.of(extra));
        return fixture.run("", args.toArray(String[]::new));
    }

    @Test
    void originalJobPollsUntilTypedTerminalAndDoesNotWriteRecoveryState() throws Exception {
        respond(job(false, false), job(true, true));
        var result = waitJob();
        assertEquals(0, result.code(), result.out() + result.err());
        assertEquals("terminal", result.json().at("/wait/state").asText());
        assertTrue(result.json().at("/wait/successful").asBoolean());
        assertEquals(2, result.json().at("/wait/attempts").asInt());
        assertEquals(2, requests.size());
        assertEquals(requests.getFirst(), requests.getLast());
        assertFalse(Files.exists(work.resolve("state/journal")));
    }

    @Test
    void terminalHeldIsNotSuccessfulAndAttemptBudgetRetainsLastObservation() throws Exception {
        respond(job(true, false));
        var held = waitJob();
        assertEquals("terminal", held.json().at("/wait/state").asText());
        assertFalse(held.json().at("/wait/successful").asBoolean());
        requests.clear();
        respond(job(false, false));
        var exhausted = waitJob("--wait-attempts", "1");
        assertEquals(0, exhausted.code(), exhausted.out());
        assertEquals("budget_exhausted", exhausted.json().at("/wait/state").asText());
        assertEquals("running", exhausted.json().at("/observation/status").asText());
        assertEquals(1, requests.size());
    }

    @Test
    void targetMismatchOrMissingCompletionFactsNeverMasqueradeAsCompletion() throws Exception {
        respond(job(true, true).replace(fixture.tenant, "00000000-0000-0000-0000-000000000002"));
        assertEquals(1, waitJob().code());
        assertEquals(1, requests.size());
        requests.clear();
        respond("{\"id\":\"" + fixture.tenant + "\",\"status\":\"completed\"}");
        var result = waitJob();
        assertEquals(1, result.code());
        assertEquals("wait_contract", result.json().at("/error/reason").asText());
        assertEquals(1, requests.size());
    }

    @Test
    void originalJobUuidComparisonAcceptsEquivalentUppercaseInput() throws Exception {
        String id = "abcdefab-1234-5678-9abc-abcdefabcdef";
        respond(job(true, true).replace(fixture.tenant, id));
        var parameters = (com.fasterxml.jackson.databind.node.ObjectNode) JSON.readTree(params());
        parameters.put("jobId", id.toUpperCase(Locale.ROOT));
        var result = fixture.command("control spaces imports get --params {} --wait", parameters.toString());
        assertEquals(0, result.code(), result.out());
        assertEquals("terminal", result.json().at("/wait/state").asText());
        assertTrue(result.json().at("/wait/successful").asBoolean());
        assertEquals(1, requests.size());
    }

    @Test
    void ordinaryReadAndDryRunKeepTheirOriginalContracts() throws Exception {
        respond(job(false, false));
        var ordinary = fixture.command("control spaces imports get --params {}", params());
        assertEquals("running", ordinary.json().path("status").asText());
        assertFalse(ordinary.json().has("wait"));
        requests.clear();
        var preview = waitJob("--dry-run");
        assertEquals(0, preview.code(), preview.out());
        assertTrue(preview.json().path("dry_run").asBoolean());
        assertTrue(requests.isEmpty());
        assertEquals(
                3,
                fixture.command("control spaces imports get --params {} --wait-attempts {}", params(), "1")
                        .code());
        assertEquals(3, waitJob("--target-epoch", "1").code());
        assertTrue(requests.isEmpty());
    }

    @Test
    void deliveryFreezesFirstEpochAndDoesNotFollowReplacementTarget() throws Exception {
        respond(
                "{\"targetEpoch\":7,\"onlineEpoch\":6,\"current\":null,\"terminal\":false,\"successful\":false,\"nextPollAfterSeconds\":0}",
                "{\"targetEpoch\":8,\"onlineEpoch\":6,\"current\":null,\"terminal\":false,\"successful\":false,\"nextPollAfterSeconds\":0}");
        String parameters = JSON.createObjectNode()
                .put("tenantId", fixture.tenant)
                .put("siteId", fixture.tenant)
                .toString();
        var result =
                fixture.command("control sites deliveries get --params {} --wait --wait-interval {}", parameters, "0");
        assertEquals(0, result.code(), result.out());
        assertEquals("superseded", result.json().at("/wait/state").asText());
        assertEquals(7, result.json().at("/wait/targetEpoch").asLong());
        assertFalse(result.json().at("/wait/successful").asBoolean());
        assertEquals(8, result.json().at("/observation/targetEpoch").asLong());
        assertEquals(2, requests.size());
    }

    @Test
    void deliveryRequiresExactReadableEpochAndDisabledIsExplicitlyUnsuccessful() throws Exception {
        String parameters = JSON.createObjectNode()
                .put("tenantId", fixture.tenant)
                .put("siteId", fixture.tenant)
                .toString();
        String[] args = {
            "control",
            "sites",
            "deliveries",
            "get",
            "--params",
            parameters,
            "--wait",
            "--target-epoch",
            "7",
            "--wait-attempts",
            "1"
        };
        respond(
                "{\"targetEpoch\":8,\"onlineEpoch\":7,\"terminal\":false,\"successful\":false,\"current\":{\"epoch\":7,\"readable\":true}}");
        var matched = fixture.run("", args);
        assertEquals("terminal", matched.json().at("/wait/state").asText());
        assertTrue(matched.json().at("/wait/successful").asBoolean());
        respond(
                "{\"targetEpoch\":8,\"onlineEpoch\":8,\"terminal\":true,\"successful\":true,\"current\":{\"epoch\":8,\"readable\":true}}");
        var newer = fixture.run("", args);
        assertEquals("superseded", newer.json().at("/wait/state").asText());
        assertFalse(newer.json().at("/wait/successful").asBoolean());
        respond(
                "{\"status\":\"disabled\",\"targetEpoch\":0,\"onlineEpoch\":null,\"terminal\":true,\"successful\":false,\"current\":null}");
        var disabled = fixture.command("control sites deliveries get --params {} --wait", parameters);
        assertEquals("failed", disabled.json().at("/wait/state").asText());
        assertFalse(disabled.json().at("/wait/successful").asBoolean());
    }

    @Test
    void queuedDeliveryMayHaveNoOnlineEpochAndBudgetTimeoutRetainsPreviousObservation() throws Exception {
        String parameters = JSON.createObjectNode()
                .put("tenantId", fixture.tenant)
                .put("siteId", fixture.tenant)
                .toString();
        respond(
                "{\"status\":\"queued\",\"targetEpoch\":1,\"onlineEpoch\":null,\"current\":null,\"terminal\":false,\"successful\":false}");
        var queued =
                fixture.command("control sites deliveries get --params {} --wait --wait-attempts {}", parameters, "1");
        assertEquals(0, queued.code(), queued.out());
        assertEquals("budget_exhausted", queued.json().at("/wait/state").asText());
        assertEquals("queued", queued.json().at("/observation/status").asText());
        fixture.server.removeContext("/");
        var attempt = new AtomicInteger();
        fixture.server.createContext("/", exchange -> {
            int n = attempt.incrementAndGet();
            if (n > 1)
                try {
                    Thread.sleep(1500);
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                }
            byte[] body = job(false, false).getBytes(StandardCharsets.UTF_8);
            try {
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                exchange.getResponseBody().write(body);
            } finally {
                exchange.close();
            }
        });
        var expired = waitJob("--wait-timeout", "1");
        assertEquals(0, expired.code(), expired.out());
        assertEquals("budget_exhausted", expired.json().at("/wait/state").asText());
        assertTrue(expired.json().at("/wait/lastReadTimedOut").asBoolean());
        assertEquals("running", expired.json().at("/observation/status").asText());
        assertEquals(2, expired.json().at("/wait/attempts").asInt());
    }
}
