package io.edition.contentapp.compositions.resources;

import io.edition.content.DocumentFormat;
import io.edition.contentapp.compositions.access.ContentIdentity.PublicationCredential;
import io.edition.contentapp.compositions.shared.ContentProblem;
import io.edition.contentapp.entry.persistence.PublicationPages;
import io.edition.delivery.contract.SiteSnapshot;
import io.minio.*;
import io.swagger.v3.oas.annotations.media.Schema;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import java.util.concurrent.Semaphore;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 绑定快照的元数据与字节读取。
 * 授权与快照身份始终先于 304；游标绑定快照与主体。
 */
@Service
public final class ContentFiles {
    public static final int MAX_PAGE_SIZE = 200;
    public static final int MAX_CONTENT_BYTES = 64 * 1024 * 1024;
    private final MinioClient objects;
    private final String bucket;
    private final byte[] key;
    private final PublicationPages publication;
    private final Semaphore reads = new Semaphore(4);

    public ContentFiles(
            MinioClient objects,
            @Value("${delivery.objects.bucket}") String bucket,
            @Value("${delivery.cursor-key}") String key,
            PublicationPages publication) {
        this.publication = publication;
        this.objects = objects;
        this.bucket = bucket;
        this.key = Base64.getDecoder().decode(key);
        if (this.key.length < 32) throw new IllegalArgumentException("cursor key too short");
    }

    public record Mount(
            String host, SiteSnapshot.Space space, PublicationCredential credential, String snapshot, String binding) {}

    public Mount mount(String host, String slug, String expected, PublicationCredential proof) {
        var read = publication.mount(host, slug, proof);
        if (!"ok".equals(read.outcome())) throw ContentProblem.publication(read.outcome());
        if (expected != null && !expected.equals(read.snapshot())) throw new ContentProblem(409, "snapshot_changed");
        return new Mount(host, read.space(), proof, read.snapshot(), read.binding());
    }

    public record Snapshot(
            String snapshot,
            UUID spaceId,
            String slug,
            String name,

            @Schema(
                    types = {"string", "null"},
                    format = "uuid")
            UUID releaseId,

            int maxPageSize,
            int maxContentBytes,
            int maxConcurrentReads) {}

    public record Entry(
            String path,
            String kind,

            @Schema(
                    types = {"string", "null"},
                    format = "uuid")
            UUID pageId,

            @Schema(types = {"string", "null"}) String title,
            @Schema(types = {"string", "null"}) String format,

            @Schema(
                    types = {"integer", "null"},
                    format = "int64")
            Long size,

            @Schema(types = {"string", "null"}) String sha256,
            @Schema(types = {"string", "null"}) String contentVersion,
            @Schema(types = {"string", "null"}) String readingPath,
            Map<String, String> properties,
            Map<String, String> seo,

            @Schema(
                    types = {"string", "null"},
                    format = "date-time")
            java.time.Instant promotedAt) {}

    public record Listing(
            String snapshot,
            List<Entry> entries,
            @Schema(types = {"string", "null"}) String nextCursor) {}

    public record Toc(String snapshot, List<SiteSnapshot.Node> nodes) {}

    public record Content(byte[] bytes, String type, String sha256, boolean notModified) {}

    public Snapshot describe(Mount m) {
        return new Snapshot(
                m.snapshot(),
                m.space().id(),
                m.space().slug(),
                m.space().name(),
                m.space().releaseId(),
                MAX_PAGE_SIZE,
                MAX_CONTENT_BYTES,
                4);
    }

    public Listing list(Mount m, int limit, String cursor) {
        if (limit < 1 || limit > MAX_PAGE_SIZE) throw new ContentProblem(422, "validation_failed");
        String binding = m.snapshot() + "|" + m.binding();
        String after = decode(cursor, binding);
        var rows = rows(m, after, limit + 1, null);
        var entries =
                rows.stream().limit(limit).map(row -> entry(row, row.size())).toList();
        String next = rows.size() > limit ? encode(binding, entries.getLast().path()) : null;
        return new Listing(m.snapshot(), entries, next);
    }

    public Entry stat(Mount m, String path) {
        validate(path);
        if (path.equals("/"))
            return new Entry(path, "directory", null, null, null, null, null, null, null, Map.of(), Map.of(), null);
        var row = locate(m, path);
        Long size = row.size();
        if (row.kind().equals("file") && size == null) size = objectSize(attachment(row));
        return entry(row, size);
    }

    public Toc toc(Mount m) {
        return new Toc(m.snapshot(), m.space().navigation());
    }

    public Content content(Mount m, String path, String condition) {
        var row = locate(m, path);
        if (!row.kind().equals("file")) throw new ContentProblem(422, "not_a_file");
        if (!reads.tryAcquire()) throw new ContentProblem(429, "read_limit_exceeded");
        try {
            byte[] bytes;
            String type;
            if (row.size() != null) {
                if (row.size() > MAX_CONTENT_BYTES) throw new ContentProblem(413, "content_too_large");
                type = DocumentFormat.fromStored(row.page().format()).mediaType();
                if (matches(condition, fileHash(row))) return new Content(null, type, fileHash(row), true);
                var page = page(m, row.page().path());
                bytes = page.content().getBytes(StandardCharsets.UTF_8);
            } else {
                var attachment = attachment(row);
                long size = objectSize(attachment);
                if (size > MAX_CONTENT_BYTES) throw new ContentProblem(413, "content_too_large");
                type = Optional.ofNullable(java.net.URLConnection.guessContentTypeFromName(path))
                        .orElse("application/octet-stream");
                if (matches(condition, fileHash(row))) return new Content(null, type, fileHash(row), true);
                try (var stream = objects.getObject(GetObjectArgs.builder()
                        .bucket(bucket)
                        .object(attachment.storageKey())
                        .build())) {
                    bytes = stream.readNBytes(MAX_CONTENT_BYTES + 1);
                } catch (java.io.IOException | io.minio.errors.MinioException failure) {
                    throw ContentProblem.unavailable();
                }
                if (bytes.length > MAX_CONTENT_BYTES) throw new ContentProblem(413, "content_too_large");
                if (bytes.length != size) throw ContentProblem.unavailable();
            }
            if (!digest(bytes).equals(fileHash(row))) throw ContentProblem.unavailable();
            return new Content(bytes, type, fileHash(row), false);
        } finally {
            reads.release();
        }
    }

    private PublicationPages.FileEntry locate(Mount m, String path) {
        validate(path);
        return rows(m, "", 1, path).stream().findFirst().orElseThrow(() -> new ContentProblem(404, "file_not_found"));
    }

    private SiteSnapshot.Attachment attachment(PublicationPages.FileEntry row) {
        return row.page().attachments().stream()
                .filter(a -> ("/" + a.path()).equals(row.path()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("missing snapshot attachment"));
    }

    private List<PublicationPages.FileEntry> rows(Mount mount, String after, int limit, String exact) {
        return publication.files(
                mount.host(), mount.space().slug(), mount.snapshot(), mount.credential(), after, limit, exact);
    }

    private SiteSnapshot.Page page(Mount mount, String path) {
        var credential = mount.credential();
        var read = publication.read(mount.host(), path, credential.token(), credential.proof(), credential.session());
        if (!"ok".equals(read.outcome())) throw ContentProblem.publication(read.outcome());
        if (!Objects.equals(read.page().releaseId(), mount.space().releaseId()))
            throw new ContentProblem(409, "snapshot_changed");
        return read.page();
    }

    private long objectSize(SiteSnapshot.Attachment a) {
        try {
            return objects.statObject(StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(a.storageKey())
                            .build())
                    .size();
        } catch (io.minio.errors.MinioException failure) {
            throw ContentProblem.unavailable();
        }
    }

    private Entry entry(PublicationPages.FileEntry row, Long size) {
        var p = row.page();
        return new Entry(
                row.path(),
                row.kind(),
                p.id(),
                p.title(),
                row.size() == null ? null : p.format(),
                size,
                fileHash(row),
                p.contentHash(),
                p.path(),
                p.properties(),
                p.seo(),
                p.promotedAt());
    }

    private static String fileHash(PublicationPages.FileEntry row) {
        String raw = row.sha256();
        if (raw == null) return null;
        String hash = raw.startsWith("sha256:") ? raw.substring(7) : raw;
        if (!hash.matches("[0-9a-f]{64}")) throw new IllegalStateException("invalid snapshot file digest");
        return hash;
    }

    private static void validate(String path) {
        if (path == null
                || path.length() > 2048
                || !path.startsWith("/")
                || path.contains("\\")
                || path.codePoints().anyMatch(c -> c < 32 || c == 127)
                || (!path.equals("/")
                        && Arrays.stream(path.substring(1).split("/", -1))
                                .anyMatch(s -> s.isEmpty() || s.equals(".") || s.equals(".."))))
            throw new ContentProblem(422, "validation_failed");
    }

    private static boolean matches(String condition, String hash) {
        if (condition == null) return false;
        return Arrays.stream(condition.split(","))
                .map(String::strip)
                .anyMatch(s -> s.equals("*") || s.equals("\"" + hash + "\"") || s.equals("W/\"" + hash + "\""));
    }

    private String encode(String binding, String after) {
        try {
            byte[] nonce = new byte[12];
            new SecureRandom().nextBytes(nonce);
            var cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, cursorKey(), new GCMParameterSpec(128, nonce));
            byte[] encrypted = cipher.doFinal((binding + "\n" + after).getBytes(StandardCharsets.UTF_8));
            byte[] envelope = new byte[nonce.length + encrypted.length];
            System.arraycopy(nonce, 0, envelope, 0, nonce.length);
            System.arraycopy(encrypted, 0, envelope, nonce.length, encrypted.length);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(envelope);
        } catch (GeneralSecurityException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private String decode(String cursor, String binding) {
        if (cursor == null) return "";
        if (cursor.length() > 16384) throw new ContentProblem(422, "cursor_invalid");
        try {
            byte[] envelope = Base64.getUrlDecoder().decode(cursor);
            if (envelope.length < 28) throw new IllegalArgumentException();
            var cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, cursorKey(), new GCMParameterSpec(128, envelope, 0, 12));
            String payload = new String(cipher.doFinal(envelope, 12, envelope.length - 12), StandardCharsets.UTF_8);
            int split = payload.indexOf('\n');
            if (split < 0) throw new IllegalArgumentException();
            if (!payload.substring(0, split).equals(binding)) throw new ContentProblem(409, "snapshot_changed");
            return payload.substring(split + 1);
        } catch (GeneralSecurityException | IllegalArgumentException invalid) {
            throw new ContentProblem(422, "cursor_invalid");
        }
    }

    private SecretKeySpec cursorKey() throws NoSuchAlgorithmException {
        var hash = MessageDigest.getInstance("SHA-256");
        hash.update("reader-files-cursor-v1".getBytes(StandardCharsets.US_ASCII));
        return new SecretKeySpec(hash.digest(key), "AES");
    }

    public static String digest(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }
}
