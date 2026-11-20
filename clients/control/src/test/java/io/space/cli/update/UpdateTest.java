package io.space.cli.update;

import static io.space.cli.shared.JsonSupport.JSON;
import static io.space.cli.shared.JsonSupport.canonical;
import static org.junit.jupiter.api.Assertions.*;

import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.jar.*;
import java.util.zip.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

class UpdateTest {
    private static final String CURRENT = io.space.cli.shared.BuildInfo.VERSION;
    private static final String NEXT = CURRENT.substring(0, CURRENT.lastIndexOf('.') + 1)
            + (Integer.parseInt(CURRENT.substring(CURRENT.lastIndexOf('.') + 1)) + 1);
    private static final String NEXT_MAJOR = (Integer.parseInt(CURRENT.split("\\.")[0]) + 1) + ".0.0";

    @TempDir
    Path temp;

    Path home, install, keyFile;
    HttpServer server;
    KeyPair signer;
    byte[] artifact, manifest;
    final java.util.concurrent.atomic.AtomicInteger contacts = new java.util.concurrent.atomic.AtomicInteger();

    @BeforeEach
    void setup() throws Exception {
        home = temp.resolve("home");
        install = temp.resolve("installation");
        Files.createDirectories(install.resolve("lib"));
        // 夹具符合用户拥有安装目录的契约，包含提权的 Windows CI 环境。
        Files.setOwner(
                install,
                install.getFileSystem()
                        .getUserPrincipalLookupService()
                        .lookupPrincipalByName(System.getProperty("user.name")));
        Files.writeString(
                install.resolve("release.json"),
                JSON.createObjectNode()
                        .put("product", "spacectl")
                        .put("version", CURRENT)
                        .toString());
        Files.writeString(install.resolve("original"), "preserve");
        Path previous = temp.resolve("previous.zip"), previousDir = temp.resolve("previous");
        Files.createDirectories(previousDir);
        Files.write(previous, archive(CURRENT, false));
        ReleaseUpdater.unpack(previous, previousDir);
        Files.copy(previousDir.resolve("spacectl/lib/fixture.jar"), install.resolve("lib/previous.jar"));
        signer = KeyPairGenerator.getInstance("Ed25519").generateKeyPair();
        keyFile = temp.resolve("publisher.pem");
        Files.writeString(
                keyFile, Base64.getEncoder().encodeToString(signer.getPublic().getEncoded()));
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", x -> {
            contacts.incrementAndGet();
            assertNull(x.getRequestHeaders().getFirst("Authorization"));
            assertNull(x.getRequestHeaders().getFirst("Cookie"));
            byte[] bytes = x.getRequestURI().getPath().equals("/manifest") ? manifest : artifact;
            x.sendResponseHeaders(200, bytes.length);
            x.getResponseBody().write(bytes);
            x.close();
        });
        server.start();
        artifact = archive(NEXT, false);
        publish(NEXT, 1);
        var configured = run(
                "update",
                "configure",
                "--manifest-url",
                origin() + "/manifest",
                "--public-key-file",
                keyFile.toString(),
                "--install-dir",
                install.toString(),
                "--allow-http-loopback",
                "--auto",
                "check");
        assertEquals(0, configured.code, configured.out + configured.err);
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    String origin() {
        return "http://127.0.0.1:" + server.getAddress().getPort();
    }

    void publish(String version, int major) throws Exception {
        var release = JSON.createObjectNode()
                .put("version", version)
                .put("apiMajor", major)
                .put("url", origin() + "/package.zip")
                .put("bytes", artifact.length)
                .put(
                        "sha256",
                        HexFormat.of()
                                .formatHex(MessageDigest.getInstance("SHA-256").digest(artifact)));
        Signature signature = Signature.getInstance("Ed25519");
        signature.initSign(signer.getPrivate());
        signature.update(JSON.writeValueAsBytes(canonical(release)));
        var envelope = JSON.createObjectNode();
        envelope.set("release", release);
        envelope.put("signature", Base64.getEncoder().encodeToString(signature.sign()));
        manifest = JSON.writeValueAsBytes(envelope);
    }

    byte[] archive(String version, boolean badVersion) throws Exception {
        Path dir = Files.createTempDirectory(temp, "fixture-");
        Path source = dir.resolve("Main.java");
        Files.writeString(
                source,
                "package io.space.cli; public class Main { public static void main(String[] a) { System.out.println(\"spacectl "
                        + (badVersion ? "9.9.9" : version) + "\"); } }");
        assertEquals(
                0,
                javax.tools.ToolProvider.getSystemJavaCompiler()
                        .run(null, null, null, "-d", dir.toString(), source.toString()));
        var jar = new ByteArrayOutputStream();
        try (var out = new JarOutputStream(jar)) {
            out.putNextEntry(new JarEntry("io/space/cli/Main.class"));
            out.write(Files.readAllBytes(dir.resolve("io/space/cli/Main.class")));
            out.closeEntry();
        }
        var zip = new ByteArrayOutputStream();
        try (var out = new ZipOutputStream(zip)) {
            for (var entry : Map.of(
                            "spacectl/lib/fixture.jar",
                            jar.toByteArray(),
                            "spacectl/release.json",
                            ("{\"product\":\"spacectl\",\"version\":\"" + version + "\"}")
                                    .getBytes(StandardCharsets.UTF_8))
                    .entrySet()) {
                out.putNextEntry(new ZipEntry(entry.getKey()));
                out.write(entry.getValue());
                out.closeEntry();
            }
        }
        return zip.toByteArray();
    }

    private static String read(InputStream stream) {
        try {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    record Result(int code, String out, String err) {
        com.fasterxml.jackson.databind.JsonNode json() throws Exception {
            return JSON.readTree(out);
        }
    }

    Result run(String... args) throws Exception {
        var command = new ArrayList<>(List.of(
                Path.of(System.getProperty("java.home"), "bin", "java").toString(),
                "-cp",
                System.getProperty("java.class.path"),
                "io.space.cli.Main"));
        command.addAll(List.of(args));
        io.space.cli.CoverageArguments.instrument(command);
        var builder = new ProcessBuilder(command);
        builder.environment().put("SPACECTL_HOME", home.toString());
        builder.environment().put("SPACE_PAT", "spm_must_never_reach_release_server");
        var process = builder.start();
        process.getOutputStream().close();
        var stdout = CompletableFuture.supplyAsync(() -> read(process.getInputStream()));
        var stderr = CompletableFuture.supplyAsync(() -> read(process.getErrorStream()));
        if (!process.waitFor(30, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            fail("Updater hung");
        }
        return new Result(process.exitValue(), stdout.get(), stderr.get());
    }

    JsonNodeResult waitResult() throws Exception {
        Instant deadline = Instant.now().plusSeconds(30);
        Path result = home.resolve("updates/result.json");
        while (!Files.exists(result) && Instant.now().isBefore(deadline)) Thread.sleep(200);
        assertTrue(Files.exists(result));
        return new JsonNodeResult(JSON.readTree(Files.readAllBytes(result)));
    }

    record JsonNodeResult(com.fasterxml.jackson.databind.JsonNode value) {}

    void assertState(String expected) throws Exception {
        var result = waitResult().value;
        assertEquals(expected, result.path("state").asText(), result.toString());
    }

    @Test
    void signedReleaseChecksAndInstallsAfterParentExit() throws Exception {
        var check = run("update", "check");
        assertEquals(0, check.code, check.err);
        assertTrue(check.json().path("available").asBoolean());
        assertEquals(0, run("update", "apply", "--dry-run").code);
        assertTrue(Files.exists(install.resolve("original")));
        var apply = run("update", "apply");
        assertEquals(0, apply.code, apply.err);
        assertState("applied");
        assertEquals(
                NEXT,
                JSON.readTree(Files.readAllBytes(install.resolve("release.json")))
                        .path("version")
                        .asText());
        assertTrue(Files.exists(install.resolveSibling(".spacectl-rollback-" + install.getFileName())
                .resolve("original")));
        assertFalse(Files.exists(home.resolve("profiles.json")));
    }

    @Test
    void invalidSignatureAndTamperedBytesCannotReplaceTheInstallation() throws Exception {
        var envelope = JSON.readTree(manifest);
        ((com.fasterxml.jackson.databind.node.ObjectNode) envelope.path("release")).put("version", NEXT_MAJOR);
        manifest = JSON.writeValueAsBytes(envelope);
        var rejected = run("update", "check");
        assertEquals(3, rejected.code);
        assertTrue(rejected.out.contains("update_signature_invalid"));
        publish(NEXT, 1);
        artifact = Arrays.copyOf(artifact, artifact.length);
        artifact[20] ^= 1;
        var tampered = run("update", "apply");
        assertEquals(3, tampered.code, tampered.err);
        assertTrue(Files.exists(install.resolve("original")));
        assertFalse(Files.exists(home.resolve("updates/pending.json")));
    }

    @Test
    void incompatibleReleaseAndUnsafeZipAreRejected() throws Exception {
        publish(NEXT_MAJOR, 2);
        assertEquals(3, run("update", "apply").code);
        var bytes = new ByteArrayOutputStream();
        try (var out = new ZipOutputStream(bytes)) {
            out.putNextEntry(new ZipEntry("../../escape"));
            out.write(1);
            out.closeEntry();
        }
        artifact = bytes.toByteArray();
        publish(NEXT, 1);
        assertEquals(3, run("update", "apply").code);
        assertFalse(Files.exists(temp.resolve("escape")));
        assertTrue(Files.exists(install.resolve("original")));
    }

    @Test
    void failedNewVersionProbeRestoresTheOldInstallation() throws Exception {
        artifact = archive(NEXT, true);
        publish(NEXT, 1);
        var apply = run("update", "apply");
        assertEquals(0, apply.code, apply.err);
        assertState("failed");
        assertTrue(Files.exists(install.resolve("original")));
        assertEquals(
                CURRENT,
                JSON.readTree(Files.readAllBytes(install.resolve("release.json")))
                        .path("version")
                        .asText());
    }

    @Test
    void explicitRollbackRestoresTheVerifiedPreviousVersion() throws Exception {
        assertEquals(0, run("update", "apply").code);
        assertState("applied");
        Files.delete(home.resolve("updates/result.json"));
        assertEquals(0, run("update", "rollback").code);
        assertState("rolled_back");
        assertTrue(Files.exists(install.resolve("original")));
    }

    @Test
    void automaticCheckSurvivesShortCommandsAndRateLimitsNetwork() throws Exception {
        var command = run("config", "list");
        assertEquals(0, command.code, command.err);
        assertTrue(command.json().isObject());
        Instant deadline = Instant.now().plusSeconds(20);
        Path state = home.resolve("updates/state.json");
        while (Instant.now().isBefore(deadline)) {
            if (Files.exists(state)
                    && JSON.readTree(Files.readAllBytes(state))
                            .path("available")
                            .asBoolean()) break;
            Thread.sleep(200);
        }
        assertTrue(JSON.readTree(Files.readAllBytes(state)).path("available").asBoolean());
        int before = contacts.get();
        var next = run("config", "list");
        assertEquals(0, next.code);
        Thread.sleep(400);
        assertEquals(before, contacts.get());
        assertTrue(next.err.contains("update_available"));
    }

    @Test
    void configuredAutomaticApplyUsesTheSameVerifiedInstallationProtocol() throws Exception {
        assertEquals(
                0,
                run(
                                "update",
                                "configure",
                                "--manifest-url",
                                origin() + "/manifest",
                                "--public-key-file",
                                keyFile.toString(),
                                "--install-dir",
                                install.toString(),
                                "--allow-http-loopback",
                                "--auto",
                                "apply")
                        .code);
        assertEquals(0, run("config", "list").code);
        assertState("applied");
    }

    @Test
    void aPublisherCannotForceADowngradeOrFollowRedirects() throws Exception {
        publish("0.9.9", 1);
        var old = run("update", "check");
        assertEquals(0, old.code);
        assertFalse(old.json().path("available").asBoolean());
        server.removeContext("/");
        server.createContext("/", x -> {
            x.getResponseHeaders().set("Location", origin() + "/other");
            x.sendResponseHeaders(302, -1);
            x.close();
        });
        assertEquals(1, run("update", "check").code);
        assertTrue(Files.exists(install.resolve("original")));
    }

    @Test
    void offlineHelpNeverLoadsUpdateSettingsOrContactsPublisher() throws Exception {
        var result = run("control", "spaces", "pages", "edit", "--help");
        assertEquals(0, result.code, result.err);
        assertEquals(0, contacts.get());
        assertFalse(Files.exists(home.resolve("updates/state.json")));
    }

    @Test
    void updateHelpHasExamplesAndStaysOffline() throws Exception {
        for (String method : List.of("configure", "check", "apply", "status", "rollback")) {
            var help = run("update", method, "--help");
            assertEquals(0, help.code, help.err);
            assertTrue(help.out.contains("Examples:"));
        }
        assertEquals(0, contacts.get());
        assertFalse(Files.exists(home.resolve("updates/state.json")));
    }

    @Test
    void symlinkInstallationCannotBypassManagedTargetValidation() throws Exception {
        Path alias = temp.resolve("alias");
        Files.createSymbolicLink(alias, install);
        var result = run(
                "update",
                "configure",
                "--manifest-url",
                origin() + "/manifest",
                "--public-key-file",
                keyFile.toString(),
                "--install-dir",
                alias.toString(),
                "--allow-http-loopback");
        assertEquals(3, result.code, result.err);
        assertEquals(
                install.toRealPath().toString(),
                JSON.readTree(Files.readAllBytes(home.resolve("updates/config.json")))
                        .path("installDir")
                        .asText());
    }

    @Test
    void aStalledHttpBodyCannotHangReleaseReads() throws Exception {
        var release = new CountDownLatch(1);
        server.removeContext("/");
        server.createContext("/", x -> {
            try {
                x.sendResponseHeaders(200, 100);
                x.getResponseBody().write(1);
                x.getResponseBody().flush();
                release.await(3, TimeUnit.SECONDS);
            } catch (Exception ignored) {
            } finally {
                x.close();
            }
        });
        try {
            var response = new ReleaseUpdater()
                    .client(JSON.readTree(Files.readAllBytes(home.resolve("updates/config.json"))))
                    .send(
                            java.net.http.HttpRequest.newBuilder(URI.create(origin() + "/manifest"))
                                    .GET()
                                    .build(),
                            java.net.http.HttpResponse.BodyHandlers.ofInputStream());
            long start = System.nanoTime();
            assertThrows(
                    java.net.http.HttpTimeoutException.class,
                    () -> io.space.cli.shared.HttpClients.readBody(
                            response.body(), Duration.ofMillis(100), body -> body.readNBytes(101)));
            assertTrue(Duration.ofNanos(System.nanoTime() - start).toMillis() < 2000);
        } finally {
            release.countDown();
        }
    }

    @Test
    void stateCannotBeLostInsideTheInstallation() throws Exception {
        home = install.resolve("user-state");
        var rejected = run(
                "update",
                "configure",
                "--manifest-url",
                origin() + "/manifest",
                "--public-key-file",
                keyFile.toString(),
                "--install-dir",
                install.toString(),
                "--allow-http-loopback");
        assertEquals(3, rejected.code, rejected.err);
        assertTrue(Files.exists(install.resolve("original")));
        assertFalse(Files.exists(home.resolve("updates/config.json")));
    }

    @Test
    void absentNewVersionReturnsUnchangedInsteadOfScheduled() throws Exception {
        publish(CURRENT, 1);
        var result = run("update", "apply");
        assertEquals(0, result.code, result.err);
        assertEquals("unchanged", result.json().path("state").asText());
        assertFalse(Files.exists(home.resolve("updates/pending.json")));
        assertTrue(Files.exists(install.resolve("original")));
    }

    @Test
    void changingPublisherConfigurationInvalidatesItsCachedCheck() throws Exception {
        assertEquals(0, run("update", "check").code);
        assertTrue(Files.exists(home.resolve("updates/state.json")));
        assertEquals(
                0,
                run(
                                "update",
                                "configure",
                                "--manifest-url",
                                origin() + "/manifest",
                                "--public-key-file",
                                keyFile.toString(),
                                "--install-dir",
                                install.toString(),
                                "--allow-http-loopback")
                        .code);
        assertFalse(Files.exists(home.resolve("updates/state.json")));
        Files.writeString(home.resolve("updates/pending.json"), "{}");
        assertEquals(
                3,
                run(
                                "update",
                                "configure",
                                "--manifest-url",
                                origin() + "/manifest",
                                "--public-key-file",
                                keyFile.toString(),
                                "--allow-http-loopback")
                        .code);
    }

    @Test
    void aVersionChangeDoesNotReuseAvailabilityFromTheOldProgram() throws Exception {
        var old = JSON.createObjectNode()
                .put("currentVersion", "0.9.9")
                .put("checkedAt", Instant.now().toString())
                .put("available", true);
        old.putObject("release").put("version", CURRENT);
        Files.writeString(home.resolve("updates/state.json"), old.toString());
        var command = run("config", "list");
        assertEquals(0, command.code, command.err);
        assertFalse(command.err.contains("update_available"));
        Instant deadline = Instant.now().plusSeconds(20);
        while (Instant.now().isBefore(deadline)) {
            var state = JSON.readTree(Files.readAllBytes(home.resolve("updates/state.json")));
            if (state.path("available").asBoolean()
                    && state.path("release").path("version").asText().equals(NEXT)) break;
            Thread.sleep(100);
        }
        assertEquals(
                NEXT,
                JSON.readTree(Files.readAllBytes(home.resolve("updates/state.json")))
                        .at("/release/version")
                        .asText());
    }

    @Test
    void configurationCannotRaceARealManualReleaseCheck() throws Exception {
        var contacted = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        server.removeContext("/");
        server.createContext("/", x -> {
            try {
                contacted.countDown();
                release.await(5, TimeUnit.SECONDS);
                x.sendResponseHeaders(200, manifest.length);
                x.getResponseBody().write(manifest);
            } catch (Exception ignored) {
            } finally {
                x.close();
            }
        });
        var checking = CompletableFuture.supplyAsync(() -> {
            try {
                return run("update", "check");
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        });
        try {
            assertTrue(contacted.await(5, TimeUnit.SECONDS));
            var rejected = run(
                    "update",
                    "configure",
                    "--manifest-url",
                    origin() + "/manifest",
                    "--public-key-file",
                    keyFile.toString(),
                    "--allow-http-loopback");
            assertEquals(3, rejected.code, rejected.err);
        } finally {
            release.countDown();
        }
        assertEquals(0, checking.get(10, TimeUnit.SECONDS).code);
    }
}
