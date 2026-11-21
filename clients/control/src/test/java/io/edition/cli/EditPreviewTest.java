package io.edition.cli;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.edition.cli.command.CliApplication;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class EditPreviewTest {
    private final ObjectMapper json = new ObjectMapper();
    private final ByteArrayOutputStream stdout = new ByteArrayOutputStream();
    private final ByteArrayOutputStream stderr = new ByteArrayOutputStream();
    private static final String TENANT = "00b87eb3-a5f0-401c-aa33-d161806f90b3";

    @Test
    void previewBuildsTheRequestWithoutNeedingAnAccount() throws Exception {
        assertEquals(0, preview("authored"));
        var plan = json.readTree(stdout.toByteArray());
        assertTrue(plan.path("dry_run").asBoolean());
        assertEquals("POST", plan.path("method").asText());
        assertTrue(plan.path("url").asText().endsWith("/api/v1/tenants/" + TENANT + "/spaces"));
        assertEquals("Editorial notes", plan.at("/body/name").asText());
    }

    @Test
    void invalidModeIdentifiesTheFieldWithoutEchoingItsValue() throws Exception {
        assertNotEquals(0, preview("private-value"));
        var failure = json.readTree(stdout.toByteArray()).path("error");
        assertEquals("invalid_input", failure.path("reason").asText());
        assertEquals("body.mode", failure.at("/violations/0/field").asText());
        assertFalse((stdout.toString(StandardCharsets.UTF_8) + stderr.toString(StandardCharsets.UTF_8))
                .contains("private-value"));
    }

    private int preview(String mode) throws Exception {
        var cli = new CliApplication(InputStream.nullInputStream(), new PrintStream(stdout), new PrintStream(stderr));
        return cli.execute(
                "control",
                "spaces",
                "create",
                "--dry-run",
                "--params",
                json.writeValueAsString(java.util.Map.of("tenantId", TENANT)),
                "--json",
                json.writeValueAsString(java.util.Map.of("name", "Editorial notes", "mode", mode)));
    }
}
