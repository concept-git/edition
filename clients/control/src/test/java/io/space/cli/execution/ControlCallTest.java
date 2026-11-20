package io.space.cli.execution;

import static io.space.cli.shared.JsonSupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import io.space.cli.contract.ContractCatalog;
import io.space.cli.shared.CliFailure;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class ControlCallTest {
    private static final String PARAMS = "{\"tenantId\":\"00000000-0000-0000-0000-000000000001\"}";

    @Test
    void preparedCallKeepsValidatedRequestAndOptionsWithoutReadingStdinAgain() throws Exception {
        var catalog = new ContractCatalog();
        var output = new ByteArrayOutputStream();
        var call = new ControlCall(
                catalog,
                new ByteArrayInputStream(PARAMS.getBytes(StandardCharsets.UTF_8)),
                new PrintStream(output),
                new PrintStream(OutputStream.nullOutputStream()));
        call.command = "control spaces create";
        call.options.put("params", "-");
        call.options.put("json", "{\"name\":\"Original\",\"mode\":\"authored\"}");
        call.options.put("dry-run", "true");
        var prepared = call.prepare(catalog.operation("control.spaces.create"));
        call.options.put("json", "{\"name\":\"Changed after validation\",\"mode\":\"authored\"}");
        call.options.put("dry-run", "false");
        call.options.put("profile", "changed-after-validation");
        prepared.invoke();
        var result = JSON.readTree(output.toByteArray());
        assertTrue(result.path("dry_run").asBoolean());
        assertEquals("Original", result.at("/body/name").asText());
    }

    @Test
    void validationMasksDynamicKeysAndBoundsMachineReadableViolations() throws Exception {
        var call = new ControlCall(new ContractCatalog());
        var schema = JSON.readTree(
                "{\"type\":\"object\",\"properties\":{\"labels\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"integer\"}}}}");
        var input = JSON.createObjectNode();
        var labels = input.putObject("labels");
        for (int i = 0; i < 20; i++) labels.put("secret-key-canary-" + i, "private-value-canary");
        var failure = assertThrows(CliFailure.class, () -> call.validate(schema, input, "body"));
        assertTrue(failure.violations.size() <= 16);
        assertTrue(failure.violationsTruncated);
        assertEquals(java.util.List.of(new CliFailure.Violation("body.labels.*", "type")), failure.violations);
        assertFalse(failure.toString().contains("canary"));
        assertDoesNotThrow(() -> call.validate(schema, JSON.readTree("{\"labels\":{\"valid\":1}}"), "body"));
    }

    @Test
    void failedValidationAndPreviewDoNotStartApplicationBackgroundWork() throws Exception {
        var catalog = new ContractCatalog();
        var started = new AtomicInteger();
        var output = new PrintStream(OutputStream.nullOutputStream());
        var call = new ControlCall(catalog, InputStream.nullInputStream(), output, output, started::incrementAndGet);
        call.command = "control spaces create";
        var operation = catalog.operation("control.spaces.create");
        assertThrows(CliFailure.class, () -> call.invoke(operation));
        assertEquals(0, started.get());
        call.options.put("params", PARAMS);
        call.options.put("json", "{\"name\":\"Preview\",\"mode\":\"authored\"}");
        call.options.put("dry-run", "true");
        call.invoke(operation);
        assertEquals(0, started.get());
    }
}
