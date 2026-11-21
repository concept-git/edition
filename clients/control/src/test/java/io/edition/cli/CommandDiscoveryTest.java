package io.edition.cli;

import static org.junit.jupiter.api.Assertions.*;

import io.edition.cli.command.CliApplication;
import java.io.*;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class CommandDiscoveryTest {
    @Test
    void offlineHelpIdentifiesTheExecutableAndInvalidCommandsFail() throws Exception {
        var output = new ByteArrayOutputStream();
        var cli = new CliApplication(InputStream.nullInputStream(), new PrintStream(output), new PrintStream(output));
        assertEquals(0, cli.execute("--help"));
        assertTrue(output.toString(StandardCharsets.UTF_8).contains("editionctl"));
        assertNotEquals(0, cli.execute("missing-command"));
    }
}
