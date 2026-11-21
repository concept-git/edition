package io.edition.cli.update;

import static io.edition.cli.shared.BuildInfo.VERSION;
import static io.edition.cli.shared.HttpClients.readBody;
import static io.edition.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import io.edition.cli.shared.CliFailure;
import io.edition.cli.shared.PrivateFiles;
import java.io.*;
import java.net.*;
import java.net.http.*;
import java.nio.file.*;
import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.time.*;
import java.util.*;
import java.util.zip.*;

/** 独立签名更新协议：核验发布源、版本和包哈希，再准备安装计划；不读取 Control 凭据。 */
public final class ReleaseUpdater {
    final Path home;
    final Path directory;

    public ReleaseUpdater() throws Exception {
        home = PrivateFiles.home();
        directory = home.resolve("updates");
        PrivateFiles.secureDirectory(directory);
    }

    public ObjectNode config() throws Exception {
        return read(directory.resolve("config.json"));
    }

    ObjectNode state() throws Exception {
        return read(directory.resolve("state.json"));
    }

    public ObjectNode status() throws Exception {
        var status = JSON.createObjectNode();
        status.set("configuration", config());
        status.set("check", state());
        status.set("installation", read(directory.resolve("result.json")));
        status.put("pending", Files.exists(directory.resolve("pending.json")));
        return status;
    }

    static ObjectNode read(Path path) throws Exception {
        if (!Files.exists(path)) return JSON.createObjectNode();
        PrivateFiles.privateMode(path, false);
        return (ObjectNode) JSON.readTree(Files.readAllBytes(path));
    }
    /** 明确声明部署选项；更新模块不接收命令上下文或管理凭据。 */
    public record Configuration(
            String manifestUrl,
            Path publicKeyFile,
            Path installDir,
            int intervalHours,
            String mode,
            boolean allowHttpLoopback,
            Path caFile) {}

    public void configure(Configuration settings) throws Exception {
        locked(() -> {
            configureLocked(settings);
            return null;
        });
    }

    private void configureLocked(Configuration settings) throws Exception {
        if (Files.exists(directory.resolve("pending.json")))
            throw CliFailure.refused(
                    "update_busy",
                    "An update is already pending.",
                    "Inspect editionctl update status before changing deployment choices.");
        URI source = url(settings.manifestUrl(), settings.allowHttpLoopback());
        PublicKey key = key(Files.readString(settings.publicKeyFile()));
        String mode = settings.mode();
        if (!Set.of("off", "check", "apply").contains(mode))
            throw CliFailure.input("Unknown update policy.", "Use --auto off, check or apply.");
        var cfg = JSON.createObjectNode()
                .put("manifestUrl", source.toString())
                .put("publicKey", Base64.getEncoder().encodeToString(key.getEncoded()))
                .put("mode", mode)
                .put("intervalHours", settings.intervalHours())
                .put("allowHttpLoopback", settings.allowHttpLoopback());
        if (settings.installDir() != null) {
            Path requested = settings.installDir().toAbsolutePath().normalize();
            if (Files.isSymbolicLink(requested))
                throw CliFailure.input(
                        "Installation directory cannot be a symlink.",
                        "Choose the managed distribution directory itself.");
            Path install = requested.toRealPath();
            managed(install);
            separateState(install);
            cfg.put("installDir", install.toString());
        }
        if (mode.equals("apply") && !cfg.has("installDir"))
            throw CliFailure.input(
                    "Automatic installation needs a managed installation directory.",
                    "Add --install-dir PATH, or choose --auto check.");
        if (settings.caFile() != null)
            cfg.put("caFile", settings.caFile().toAbsolutePath().toString());
        PrivateFiles.atomic(directory.resolve("config.json"), JSON.writeValueAsBytes(cfg));
        Files.deleteIfExists(directory.resolve("state.json"));
    }

    /** 配置、检查和准备安装共用锁，防止部署状态互相覆盖；子进程调用已持锁的方法。 */
    private <T> T locked(java.util.concurrent.Callable<T> operation) throws Exception {
        Path file = directory.resolve("check.lock");
        if (Files.isSymbolicLink(file))
            throw CliFailure.input("Update lock cannot be a symlink.", "Use private regular state files.");
        try (var channel =
                        java.nio.channels.FileChannel.open(file, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
                var lock = channel.tryLock()) {
            PrivateFiles.privateMode(file, false);
            if (lock == null)
                throw CliFailure.refused(
                        "update_busy",
                        "Another release operation is in progress.",
                        "Inspect editionctl update status, then retry after that operation completes.");
            return operation.call();
        }
    }

    static URI url(String value, boolean local) {
        try {
            URI uri = URI.create(value);
            if (uri.getHost() == null
                    || uri.getUserInfo() != null
                    || uri.getFragment() != null
                    || !(uri.getScheme().equals("https")
                            || local
                                    && uri.getScheme().equals("http")
                                    && Set.of("localhost", "127.0.0.1", "::1", "[::1]")
                                            .contains(uri.getHost()))) throw new IllegalArgumentException();
            return uri;
        } catch (Exception e) {
            throw CliFailure.input(
                    "Update source must be HTTPS without user credentials.",
                    "Use a trusted signed release manifest; HTTP is only for explicit loopback tests.");
        }
    }

    static PublicKey key(String text) throws Exception {
        String body = text.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        return KeyFactory.getInstance("Ed25519")
                .generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(body)));
    }

    HttpClient client(JsonNode cfg) throws Exception {
        url(cfg.path("manifestUrl").asText(), cfg.path("allowHttpLoopback").asBoolean());
        return io.edition.cli.shared.HttpClients.create(
                cfg.has("caFile") ? Path.of(cfg.path("caFile").asText()) : null);
    }

    public ObjectNode check(boolean force) throws Exception {
        return locked(() -> checkLocked(force));
    }

    ObjectNode checkLocked(boolean force) throws Exception {
        var cfg = config();
        if (!cfg.has("manifestUrl"))
            return JSON.createObjectNode().put("configured", false).put("currentVersion", VERSION);
        var old = state();
        if (!force && fresh(old, cfg)) return old;
        URI source = url(
                cfg.path("manifestUrl").asText(), cfg.path("allowHttpLoopback").asBoolean());
        var response = client(cfg)
                .send(
                        HttpRequest.newBuilder(source)
                                .timeout(Duration.ofSeconds(15))
                                .GET()
                                .build(),
                        HttpResponse.BodyHandlers.ofInputStream());
        byte[] bytes;
        bytes = readBody(response.body(), Duration.ofSeconds(15), body -> {
            if (response.statusCode() != 200)
                throw CliFailure.error(
                        "update_source_failed",
                        "Release source did not return a manifest.",
                        "Check the configured signed source; redirects are refused.");
            return body.readNBytes(256 * 1024 + 1);
        });
        if (bytes.length > 256 * 1024)
            throw CliFailure.input("Release manifest is too large.", "Use a bounded signed manifest.");
        var envelope = JSON.readTree(bytes);
        JsonNode release = envelope.path("release");
        Signature verifier = Signature.getInstance("Ed25519");
        verifier.initVerify(key(cfg.path("publicKey").asText()));
        verifier.update(JSON.writeValueAsBytes(canonical(release)));
        if (!verifier.verify(
                Base64.getDecoder().decode(envelope.path("signature").asText())))
            throw CliFailure.refused(
                    "update_signature_invalid",
                    "Release signature is invalid.",
                    "Use the configured trusted publisher; do not install this package.");
        String version = release.path("version").asText();
        int comparison = compare(version, VERSION);
        long size = release.path("bytes").asLong();
        if (size < 1
                || size > 128L * 1024 * 1024
                || !release.path("sha256").asText().matches("[0-9a-f]{64}"))
            throw CliFailure.input(
                    "Release integrity metadata is invalid.",
                    "Require version, bytes and SHA256 in the signed manifest.");
        URI artifact =
                url(release.path("url").asText(), cfg.path("allowHttpLoopback").asBoolean());
        if (!Objects.equals(source.getAuthority(), artifact.getAuthority())
                || !source.getScheme().equals(artifact.getScheme()))
            throw CliFailure.refused(
                    "update_origin_mismatch",
                    "Artifact must use the configured release origin.",
                    "Publish the artifact under the configured source origin.");
        boolean compatible = release.path("apiMajor").asInt(-1) == 1;
        var result = JSON.createObjectNode()
                .put("configured", true)
                .put("checkedAt", Instant.now().toString())
                .put("currentVersion", VERSION)
                .put("available", comparison > 0)
                .put("compatible", compatible)
                .put("automaticEligible", compatible && version.split("\\.")[0].equals(VERSION.split("\\.")[0]));
        result.set("release", release);
        PrivateFiles.atomic(directory.resolve("state.json"), JSON.writeValueAsBytes(result));
        return result;
    }

    static int compare(String a, String b) {
        if (!a.matches("[0-9]{1,6}\\.[0-9]{1,6}\\.[0-9]{1,6}") || !b.matches("[0-9]{1,6}\\.[0-9]{1,6}\\.[0-9]{1,6}"))
            throw CliFailure.input("Only stable semantic versions are accepted.", "Use MAJOR.MINOR.PATCH.");
        String[] aa = a.split("\\."), bb = b.split("\\.");
        for (int i = 0; i < 3; i++) {
            int n = Integer.compare(Integer.parseInt(aa[i]), Integer.parseInt(bb[i]));
            if (n != 0) return n;
        }
        return 0;
    }

    static boolean fresh(JsonNode state, JsonNode configuration) {
        return state.path("currentVersion").asText().equals(VERSION)
                && state.has("checkedAt")
                && Instant.parse(state.path("checkedAt").asText())
                        .plus(Duration.ofHours(
                                configuration.path("intervalHours").asInt(24)))
                        .isAfter(Instant.now());
    }

    static void managed(Path install) throws Exception {
        if (Files.isSymbolicLink(install)
                || !Files.isDirectory(install)
                || !Files.isRegularFile(install.resolve("release.json")))
            throw CliFailure.input(
                    "Installation is not managed by editionctl.",
                    "Use an extracted distribution with release.json; user state stays in EDITIONCTL_HOME.");
        var metadata = JSON.readTree(Files.readAllBytes(install.resolve("release.json")));
        if (!metadata.path("product").asText().equals("editionctl"))
            throw CliFailure.input(
                    "Installation marker belongs to another product.", "Choose the managed editionctl directory.");
        var user = install.getFileSystem()
                .getUserPrincipalLookupService()
                .lookupPrincipalByName(System.getProperty("user.name"));
        if (!Files.getOwner(install).equals(user))
            throw CliFailure.input(
                    "Installation belongs to another user.", "Choose an installation owned by this user.");
    }

    private void separateState(Path install) throws Exception {
        if (home.toRealPath().startsWith(install.toRealPath()))
            throw CliFailure.input(
                    "State cannot be inside the installation directory.",
                    "Keep EDITIONCTL_HOME outside the managed installation so updates preserve credentials and replay material.");
    }

    public ObjectNode schedule(boolean dryRun, boolean rollback) throws Exception {
        return locked(() -> scheduleLocked(dryRun, rollback));
    }

    ObjectNode scheduleLocked(boolean dryRun, boolean rollback) throws Exception {
        var cfg = config();
        if (!cfg.has("installDir"))
            throw CliFailure.input(
                    "Managed installation directory is absent.",
                    "editionctl update configure --install-dir PATH --manifest-url HTTPS_URL --public-key-file KEY.pem");
        Path install = Path.of(cfg.path("installDir").asText());
        managed(install);
        separateState(install);
        Path backup = install.resolveSibling(".editionctl-rollback-" + install.getFileName());
        var plan = JSON.createObjectNode()
                .put("installDir", install.toString())
                .put("backupDir", backup.toString())
                .put("stateDir", directory.toString())
                .put("parentPid", ProcessHandle.current().pid())
                .put("rollback", rollback)
                .put("operationId", UUID.randomUUID().toString());
        if (rollback) {
            managed(backup);
            plan.put(
                    "version",
                    JSON.readTree(Files.readAllBytes(backup.resolve("release.json")))
                            .path("version")
                            .asText());
        } else {
            var checked = checkLocked(true);
            if (!checked.path("available").asBoolean()) return checked.put("state", "unchanged");
            if (!checked.path("automaticEligible").asBoolean())
                throw CliFailure.refused(
                        "update_incompatible",
                        "Release is outside the supported automatic compatibility range.",
                        "Install a different CLI/API major version as a separate reviewed installation.");
            var release = checked.path("release");
            plan.put("version", release.path("version").asText());
            if (dryRun) return plan.put("state", "planned").put("signatureVerified", true);
            Path stage = Files.createTempDirectory(install.getParent(), ".editionctl-stage-");
            PrivateFiles.privateMode(stage, true);
            Path zip = Files.createTempFile(directory, "package-", ".zip");
            PrivateFiles.privateMode(zip, false);
            try {
                var response = client(cfg)
                        .send(
                                HttpRequest.newBuilder(url(
                                                release.path("url").asText(),
                                                cfg.path("allowHttpLoopback").asBoolean()))
                                        .timeout(Duration.ofSeconds(60))
                                        .GET()
                                        .build(),
                                HttpResponse.BodyHandlers.ofInputStream());
                try (var out = Files.newOutputStream(zip)) {
                    readBody(response.body(), Duration.ofSeconds(60), input -> {
                        if (response.statusCode() != 200)
                            throw CliFailure.error(
                                    "update_download_failed",
                                    "Package download failed; redirects are refused.",
                                    "Retry the signed release check.");
                        byte[] buffer = new byte[65536];
                        int n;
                        long total = 0;
                        while ((n = input.read(buffer)) != -1) {
                            total += n;
                            if (total > release.path("bytes").asLong())
                                throw CliFailure.refused(
                                        "update_integrity_failed",
                                        "Package exceeds signed size.",
                                        "Reject this artifact.");
                            out.write(buffer, 0, n);
                        }
                        if (total != release.path("bytes").asLong())
                            throw CliFailure.refused(
                                    "update_integrity_failed",
                                    "Package size differs from signed manifest.",
                                    "Reject this artifact.");
                        return total;
                    });
                }
                if (!hashFile(zip).equals(release.path("sha256").asText()))
                    throw CliFailure.refused(
                            "update_integrity_failed",
                            "Package digest differs from signed manifest.",
                            "Reject this artifact.");
                unpack(zip, stage);
                try (var children = Files.list(stage)) {
                    var dirs = children.toList();
                    if (dirs.size() != 1 || !Files.isDirectory(dirs.getFirst()))
                        throw CliFailure.input("Invalid distribution layout.", "Use the Gradle distribution ZIP.");
                    Path payload = dirs.getFirst();
                    // Windows 提权进程新建目录可能归 Administrators；沿用已核验的安装所有者。
                    Files.setOwner(payload, Files.getOwner(install));
                    managed(payload);
                    String version = JSON.readTree(Files.readAllBytes(payload.resolve("release.json")))
                            .path("version")
                            .asText();
                    if (!version.equals(plan.path("version").asText()))
                        throw CliFailure.input("Package version differs from signed release.", "Reject this artifact.");
                    plan.put("stagedDir", payload.toString());
                }
            } catch (Exception e) {
                UpdateProcess.remove(stage);
                throw e;
            } finally {
                Files.deleteIfExists(zip);
            }
        }
        if (System.getProperty("editionctl.update.businessPid") != null)
            plan.put("businessPid", Long.parseLong(System.getProperty("editionctl.update.businessPid")));
        if (dryRun) return plan.put("state", "planned");
        Path pending = directory.resolve("pending.json");
        boolean dispatched = false;
        try (var channel = java.nio.channels.FileChannel.open(
                        directory.resolve("update.lock"), StandardOpenOption.CREATE, StandardOpenOption.WRITE);
                var lock = channel.tryLock()) {
            PrivateFiles.privateMode(directory.resolve("update.lock"), false);
            if (lock == null || Files.exists(pending))
                throw CliFailure.refused(
                        "update_busy", "An update is already pending.", "Inspect editionctl update status.");
            Path worker = Files.createTempDirectory(directory, "worker-");
            PrivateFiles.privateMode(worker, true);
            plan.put("workerDir", worker.toString());
            var classpath = new ArrayList<String>();
            int index = 0;
            for (String item : System.getProperty("java.class.path").split(java.io.File.pathSeparator)) {
                Path original = Path.of(item);
                Path copy = worker.resolve("cp-" + index++ + (Files.isDirectory(original) ? "" : ".jar"));
                if (Files.isDirectory(original)) {
                    try (var entries = Files.walk(original)) {
                        for (Path path : entries.toList()) {
                            Path to = copy.resolve(original.relativize(path));
                            if (Files.isDirectory(path)) Files.createDirectories(to);
                            else Files.copy(path, to);
                        }
                    }
                } else Files.copy(original, copy);
                classpath.add(copy.toString());
            }
            PrivateFiles.atomic(pending, JSON.writeValueAsBytes(plan));
            var command = List.of(
                    Path.of(System.getProperty("java.home"), "bin", "java").toString(),
                    "-cp",
                    String.join(java.io.File.pathSeparator, classpath),
                    "io.edition.cli.update.UpdateProcess",
                    "install",
                    pending.toString());
            var builder = new ProcessBuilder(command)
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                    .redirectError(ProcessBuilder.Redirect.DISCARD);
            cleanEnvironment(builder, home);
            try {
                builder.start();
                dispatched = true;
            } catch (IOException failed) {
                Files.deleteIfExists(pending);
                throw failed;
            }
        } catch (Exception failed) {
            if (!dispatched) {
                if (plan.has("stagedDir"))
                    UpdateProcess.remove(
                            Path.of(plan.path("stagedDir").asText()).getParent());
                if (plan.has("workerDir"))
                    UpdateProcess.remove(Path.of(plan.path("workerDir").asText()));
            }
            throw failed;
        }
        return plan.put("state", "scheduled");
    }

    static void unpack(Path zip, Path stage) throws Exception {
        var names = new HashSet<String>();
        long expanded = 0;
        try (var stream = new ZipInputStream(Files.newInputStream(zip))) {
            ZipEntry entry;
            while ((entry = stream.getNextEntry()) != null) {
                String name = entry.getName().replace('\\', '/');
                Path target = stage.resolve(name).normalize();
                if (name.startsWith("/")
                        || name.contains(":")
                        || Arrays.asList(name.split("/")).contains("..")
                        || !target.startsWith(stage)
                        || !names.add(name)) throw CliFailure.input("Unsafe ZIP entry.", "Reject this package.");
                if (entry.isDirectory()) Files.createDirectories(target);
                else {
                    Files.createDirectories(target.getParent());
                    try (var out = Files.newOutputStream(target, StandardOpenOption.CREATE_NEW)) {
                        byte[] b = new byte[65536];
                        int n;
                        while ((n = stream.read(b)) != -1) {
                            expanded += n;
                            if (expanded > 512L * 1024 * 1024)
                                throw CliFailure.input("Expanded package is too large.", "Reject this package.");
                            out.write(b, 0, n);
                        }
                    }
                    if (name.endsWith("/bin/editionctl")) target.toFile().setExecutable(true, true);
                }
            }
        }
    }

    static void cleanEnvironment(ProcessBuilder builder, Path home) {
        var env = builder.environment();
        var kept = new HashMap<String, String>();
        for (String key : List.of("HOME", "USERPROFILE", "PATH", "SystemRoot", "WINDIR", "TMPDIR", "TMP", "TEMP"))
            if (env.containsKey(key)) kept.put(key, env.get(key));
        env.clear();
        env.putAll(kept);
        env.put("EDITIONCTL_HOME", home.toString());
    }

    public static void background(PrintStream stderr) {
        try {
            var updates = new ReleaseUpdater();
            var cfg = updates.config();
            if (!cfg.has("manifestUrl") || cfg.path("mode").asText().equals("off")) return;
            var previous = updates.state();
            boolean sameVersion = previous.path("currentVersion").asText().equals(VERSION);
            if (sameVersion
                    && previous.path("available").asBoolean()
                    && cfg.path("mode").asText().equals("check"))
                stderr.println(JSON.writeValueAsString(JSON.createObjectNode()
                        .put("type", "update_available")
                        .put("version", previous.path("release").path("version").asText())
                        .put("hint", "editionctl update apply --dry-run")));
            if (fresh(previous, cfg)) return;
            var builder = new ProcessBuilder(
                            Path.of(System.getProperty("java.home"), "bin", "java")
                                    .toString(),
                            "-cp",
                            System.getProperty("java.class.path"),
                            "io.edition.cli.update.UpdateProcess",
                            "check",
                            Long.toString(ProcessHandle.current().pid()))
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                    .redirectError(ProcessBuilder.Redirect.DISCARD);
            cleanEnvironment(builder, updates.home);
            builder.start();
        } catch (Exception ignored) {
            /* 后台更新检查失败不改变当前业务命令的结果。 */
        }
    }
}
