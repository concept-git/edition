package io.space.cli.state;

import static io.space.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.space.cli.shared.CliFailure;
import io.space.cli.shared.PrivateFiles;
import java.nio.channels.*;
import java.nio.file.*;
import java.security.*;
import java.time.*;
import java.util.*;
import javax.crypto.Cipher;
import javax.crypto.spec.*;

/** 加密回执保存原请求和原键；同一意图用进程锁互斥，防止并发重复执行。 */
public final class InvocationJournal implements AutoCloseable {
    final Path directory;
    final Path file;
    final String id;
    final byte[] key;
    final FileChannel channel;
    final FileLock lock;

    /** 查询缺失回执不创建目录或锁，也不需要读取凭据。 */
    public static boolean exists(Path home, String profile, String id) {
        return Files.exists(location(home, profile, id), LinkOption.NOFOLLOW_LINKS);
    }

    private static Path location(Path home, String profile, String id) {
        validateId(id);
        ProfileStore.validName(profile);
        return home.resolve("journal").resolve(profile).resolve(id + ".enc");
    }

    public InvocationJournal(Path home, String profile, String id, String token) throws Exception {
        this.id = id;
        file = location(home, profile, id);
        directory = file.getParent();
        PrivateFiles.secureDirectory(directory);
        key = MessageDigest.getInstance("SHA-256")
                .digest(("spacectl-journal-v1:" + token).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        Path lockPath = directory.resolve(id + ".lock");
        if (Files.isSymbolicLink(lockPath))
            throw CliFailure.input("Refusing symbolic-link journal.", "Use private state.");
        channel = FileChannel.open(lockPath, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
        PrivateFiles.privateMode(lockPath, false);
        FileLock obtained;
        try {
            obtained = channel.tryLock();
        } catch (OverlappingFileLockException e) {
            obtained = null;
        }
        if (obtained == null) {
            channel.close();
            throw CliFailure.refused(
                    "invocation_busy",
                    "This intent is already executing.",
                    "Wait, then spacectl control +resume --id " + id);
        }
        lock = obtained;
    }

    public ObjectNode load() throws Exception {
        if (!Files.exists(file)) return null;
        PrivateFiles.privateMode(file, false);
        byte[] encoded = Files.readAllBytes(file);
        try {
            var cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(
                    Cipher.DECRYPT_MODE,
                    new SecretKeySpec(key, "AES"),
                    new GCMParameterSpec(128, Arrays.copyOf(encoded, 12)));
            cipher.updateAAD(id.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return (ObjectNode) JSON.readTree(cipher.doFinal(Arrays.copyOfRange(encoded, 12, encoded.length)));
        } catch (GeneralSecurityException e) {
            throw CliFailure.refused(
                    "journal_unreadable",
                    "Invocation journal cannot be authenticated with this credential.",
                    "Restore the original credential; do not resubmit an uncertain write with a new key.");
        }
    }

    public static void validateId(String id) {
        if (!id.matches("[a-zA-Z0-9_-]{1,100}"))
            throw CliFailure.input("Invalid invocation ID.", "Use 1..100 letters, digits, dash or underscore.");
    }

    public void save(ObjectNode node) throws Exception {
        byte[] nonce = new byte[12];
        new SecureRandom().nextBytes(nonce);
        var cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, nonce));
        cipher.updateAAD(id.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        byte[] encrypted = cipher.doFinal(JSON.writeValueAsBytes(node));
        byte[] bytes = Arrays.copyOf(nonce, nonce.length + encrypted.length);
        System.arraycopy(encrypted, 0, bytes, nonce.length, encrypted.length);
        PrivateFiles.atomic(file, bytes);
    }

    public static void requireReplayWindow(ObjectNode stored) {
        // 服务端幂等记录保留 24 小时；超过窗口后，同一个键也不能证明重放安全。
        if (Instant.parse(stored.path("createdAt").asText())
                .plus(Duration.ofHours(24))
                .isBefore(Instant.now()))
            throw CliFailure.refused(
                    "replay_window_expired",
                    "Server replay window has expired.",
                    "Inspect current resource and audit facts before deciding whether a new intent is necessary.");
    }

    @Override
    public void close() throws Exception {
        lock.release();
        channel.close();
        Arrays.fill(key, (byte) 0);
    }
}
