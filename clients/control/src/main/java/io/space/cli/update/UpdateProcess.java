package io.space.cli.update;

import static io.space.cli.shared.BuildInfo.VERSION;
import static io.space.cli.shared.JsonSupport.*;

import io.space.cli.shared.PrivateFiles;
import java.nio.channels.FileChannel;
import java.nio.file.*;
import java.time.*;
import java.util.*;

/** 更新子进程的唯一入口。检查不阻塞业务命令，安装等待原进程退出后再替换文件。 */
public final class UpdateProcess {
    private UpdateProcess() {}

    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Expected update mode and target");
        switch (args[0]) {
            case "check" -> check(args[1]);
            case "install" -> install(Path.of(args[1]));
            default -> throw new IllegalArgumentException("Unknown update mode");
        }
    }

    private static void check(String businessPid) throws Exception {
        var updates = new ReleaseUpdater();
        var file = updates.directory.resolve("check.lock");
        try (var channel = FileChannel.open(file, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
                var lock = channel.tryLock()) {
            PrivateFiles.privateMode(file, false);
            if (lock == null) return;
            var cfg = updates.config();
            if (!cfg.has("manifestUrl") || cfg.path("mode").asText().equals("off")) return;
            var cached = updates.state();
            if (ReleaseUpdater.fresh(cached, cfg)) return;
            if (!cached.path("currentVersion").asText().equals(VERSION)) cached = JSON.createObjectNode();
            // 请求前记录检查时间：发布服务不可用时也要限频，不能每次命令都联网。
            cached.put("currentVersion", VERSION)
                    .put("checkedAt", Instant.now().toString())
                    .put("checkState", "checking");
            PrivateFiles.atomic(updates.directory.resolve("state.json"), JSON.writeValueAsBytes(cached));
            try {
                var checked = updates.checkLocked(true);
                if (cfg.path("mode").asText().equals("apply")
                        && checked.path("available").asBoolean()
                        && checked.path("automaticEligible").asBoolean()) {
                    System.setProperty("spacectl.update.businessPid", businessPid);
                    updates.scheduleLocked(false, false);
                }
            } catch (Exception failed) {
                cached.put("checkState", "failed").put("error", "release_check_failed");
                PrivateFiles.atomic(updates.directory.resolve("state.json"), JSON.writeValueAsBytes(cached));
            }
        }
    }

    private static void install(Path pending) throws Exception {
        var plan = JSON.readTree(Files.readAllBytes(pending));
        Path install = Path.of(plan.path("installDir").asText()),
                backup = Path.of(plan.path("backupDir").asText());
        Path state = Path.of(plan.path("stateDir").asText());
        var result = JSON.createObjectNode()
                .put("operationId", plan.path("operationId").asText())
                .put("version", plan.path("version").asText());
        boolean moved = false;
        Path previous = null;
        String phase = "wait_for_parent";
        try {
            // Windows 等系统会锁住正在使用的 JAR；主命令退出前不移动安装目录。
            Instant end = Instant.now().plusSeconds(120);
            while (alive(plan.path("parentPid").asLong())
                    || plan.has("businessPid") && alive(plan.path("businessPid").asLong())) {
                if (Instant.now().isAfter(end)) throw new IllegalStateException("parent still running");
                Thread.sleep(200);
            }
            phase = "validate_installation";
            ReleaseUpdater.managed(install);
            if (plan.path("rollback").asBoolean()) {
                ReleaseUpdater.managed(backup);
                previous = install.resolveSibling(".spacectl-displaced-" + UUID.randomUUID());
                phase = "move_current";
                Files.move(install, previous, StandardCopyOption.ATOMIC_MOVE);
                moved = true;
                phase = "restore_backup";
                Files.move(backup, install, StandardCopyOption.ATOMIC_MOVE);
            } else {
                if (Files.exists(backup)) {
                    ReleaseUpdater.managed(backup);
                    phase = "remove_previous_backup";
                    remove(backup);
                }
                phase = "move_current";
                Files.move(install, backup, StandardCopyOption.ATOMIC_MOVE);
                previous = backup;
                moved = true;
                phase = "install_staged";
                Files.move(Path.of(plan.path("stagedDir").asText()), install, StandardCopyOption.ATOMIC_MOVE);
            }
            // 移动成功还不等于可用；启动新版本校验实际输出，失败则恢复旧目录。
            phase = "probe_version";
            var process = new ProcessBuilder(
                            Path.of(System.getProperty("java.home"), "bin", "java")
                                    .toString(),
                            "-cp",
                            // * 是 Java classpath 语法，不是 Windows 允许的文件路径字符。
                            install.resolve("lib") + java.io.File.separator + "*",
                            "io.space.cli.Main",
                            "--version")
                    .redirectErrorStream(true)
                    .start();
            if (!process.waitFor(20, java.util.concurrent.TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new IllegalStateException("version probe timed out");
            }
            String output = new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8)
                    .strip();
            if (process.exitValue() != 0
                    || !output.equals("spacectl " + plan.path("version").asText()))
                throw new IllegalStateException("version probe failed");
            if (plan.path("rollback").asBoolean()) Files.move(previous, backup, StandardCopyOption.ATOMIC_MOVE);
            result.put("state", plan.path("rollback").asBoolean() ? "rolled_back" : "applied");
        } catch (Exception failed) {
            if (moved && previous != null && Files.exists(previous)) {
                if (Files.exists(install)) remove(install);
                Files.move(previous, install, StandardCopyOption.ATOMIC_MOVE);
            }
            // 只记录固定阶段和异常类型，不输出可能含路径或秘密的异常消息。
            result.put("state", "failed")
                    .put("error", "installation_failed_original_restored")
                    .put("failureStage", phase)
                    .put("errorType", failed.getClass().getSimpleName());
        } finally {
            result.put("completedAt", Instant.now().toString());
            PrivateFiles.atomic(state.resolve("result.json"), JSON.writeValueAsBytes(result));
            Files.deleteIfExists(pending);
            if (plan.has("stagedDir")) {
                Path stage = Path.of(plan.path("stagedDir").asText()).getParent();
                if (Files.exists(stage)) remove(stage);
            }
        }
    }

    private static boolean alive(long pid) {
        return ProcessHandle.of(pid).map(ProcessHandle::isAlive).orElse(false);
    }

    static void remove(Path root) throws Exception {
        if (!Files.exists(root)) return;
        try (var paths = Files.walk(root)) {
            for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
        }
    }
}
