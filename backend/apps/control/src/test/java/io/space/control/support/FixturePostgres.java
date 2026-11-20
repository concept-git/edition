package io.space.control.support;

import java.io.IOException;
import java.net.ServerSocket;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.testcontainers.containers.PostgreSQLContainer;

/** Disposable real PostgreSQL; an explicit native binary supports verification without Docker. */
public final class FixturePostgres implements AutoCloseable {
    private PostgreSQLContainer<?> container;
    private Path bin;
    private Path root;
    private String url;
    private String password;

    public void start() throws Exception {
        String nativeBin = System.getenv("SPACE_TEST_POSTGRES_BIN");
        if (nativeBin == null || nativeBin.isBlank()) {
            container = new PostgreSQLContainer<>("postgres:18.6");
            container.start();
            return;
        }
        bin = Path.of(nativeBin).toRealPath();
        root = Files.createTempDirectory("space-pg-fixture-");
        try {
            run("postgres", "--version");
            if (!Files.readString(root.resolve("command.log")).contains("PostgreSQL) 18."))
                throw new IOException("Fixture requires PostgreSQL 18");
            password = UUID.randomUUID().toString();
            Path passwordFile = root.resolve("password");
            Files.writeString(passwordFile, password);
            run(
                    "initdb",
                    "-D",
                    root.resolve("data").toString(),
                    "-U",
                    "fixture",
                    "--auth=scram-sha-256",
                    "--pwfile=" + passwordFile,
                    "--encoding=UTF8",
                    "--locale=C");
            Files.delete(passwordFile);
            int port;
            try (var socket = new ServerSocket(0)) {
                port = socket.getLocalPort();
            }
            run(
                    "pg_ctl",
                    "-D",
                    root.resolve("data").toString(),
                    "-l",
                    root.resolve("server.log").toString(),
                    "-o",
                    "-h 127.0.0.1 -p " + port + " -k ''",
                    "-w",
                    "start");
            url = "jdbc:postgresql://127.0.0.1:" + port + "/postgres";
        } catch (Exception failure) {
            close();
            throw failure;
        }
    }

    public String getJdbcUrl() {
        return container == null ? url : container.getJdbcUrl();
    }

    public String getUsername() {
        return container == null ? "fixture" : container.getUsername();
    }

    public String getPassword() {
        return container == null ? password : container.getPassword();
    }

    private void run(String program, String... arguments) throws Exception {
        var command = new ArrayList<>(List.of(bin.resolve(program).toString()));
        command.addAll(List.of(arguments));
        Path log = root.resolve("command.log");
        var process = new ProcessBuilder(command)
                .redirectErrorStream(true)
                .redirectOutput(log.toFile())
                .start();
        if (!process.waitFor(45, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new IOException("Fixture " + program + " timed out");
        }
        if (process.exitValue() != 0) throw new IOException("Fixture " + program + " failed: " + Files.readString(log));
    }

    @Override
    public void close() throws Exception {
        if (container != null) container.stop();
        if (root == null) return;
        // Never remove a running cluster or a caller's data directory.
        if (Files.exists(root.resolve("data/postmaster.pid")))
            run("pg_ctl", "-D", root.resolve("data").toString(), "-m", "fast", "-w", "stop");
        try (var paths = Files.walk(root)) {
            for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
        }
        root = null;
    }
}
