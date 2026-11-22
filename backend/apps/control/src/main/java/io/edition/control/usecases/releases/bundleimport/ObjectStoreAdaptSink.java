package io.edition.control.usecases.releases.bundleimport;

import io.edition.control.modules.importformat.attachments.AttachmentTypes;
import io.edition.control.modules.importformat.contract.AdaptSink;
import io.edition.control.modules.importformat.contract.AdaptedPack;
import io.edition.control.modules.importformat.contract.ImportLimits;
import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.edition.shared.Sha256;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.DigestOutputStream;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

/** AdaptSink：每个附件边哈希边写入对象存储，不把整包 byte[] 进堆。单附件仍受 10 MiB 上限。 */
final class ObjectStoreAdaptSink implements AdaptSink {
    private final ObjectStoreApi objectStore;
    private final List<AdaptedPack.Issue> issues = new ArrayList<>();

    ObjectStoreAdaptSink(ObjectStoreApi objectStore) {
        this.objectStore = objectStore;
    }

    @Override
    public StoredAttachment putAttachment(String logicalPath, InputStream in, long size) {
        if (size > ImportLimits.MAX_ATTACHMENT_BYTES) throw new TooLarge(logicalPath);
        Path temp = null;
        try {
            temp = Files.createTempFile("import-att-", ".bin");
            MessageDigest digest = Sha256.newDigest();
            long copied = 0;
            try (OutputStream hashed = new DigestOutputStream(Files.newOutputStream(temp), digest)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) >= 0) {
                    if (read == 0) continue;
                    copied += read;
                    if (copied > ImportLimits.MAX_ATTACHMENT_BYTES) throw new TooLarge(logicalPath);
                    hashed.write(buffer, 0, read);
                }
            }
            byte[] magic;
            try (InputStream peek = Files.newInputStream(temp)) {
                magic = peek.readNBytes(16);
            }
            String mime = AttachmentTypes.sniff(magic);
            if (mime == null) throw new UnsupportedType(logicalPath);
            String sha = HexFormat.of().formatHex(digest.digest());
            try (InputStream stored = Files.newInputStream(temp)) {
                objectStore.putIfAbsent(sha, stored, copied, mime);
            }
            return new StoredAttachment(sha, sha, mime, copied);
        } catch (IOException failure) {
            throw new UncheckedIOException(failure);
        } finally {
            if (temp != null) {
                try {
                    Files.deleteIfExists(temp);
                } catch (IOException ignored) {
                    // attachment temp is best-effort
                }
            }
        }
    }

    @Override
    public void info(String code, String path, String detail) {
        issues.add(new AdaptedPack.Issue(code, path, detail));
    }

    @Override
    public List<AdaptedPack.Issue> issues() {
        return List.copyOf(issues);
    }
}
