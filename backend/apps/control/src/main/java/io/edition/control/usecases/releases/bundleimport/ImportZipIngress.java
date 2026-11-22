package io.edition.control.usecases.releases.bundleimport;

import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.edition.control.usecases.resource.InvalidBundleException;
import io.edition.shared.Sha256;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.DigestOutputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import org.springframework.stereotype.Component;

/** 入站 zip：边读边 sha256，封存到 {@code import-zips/{sha256}}；超限 / 非 zip 不建 job。 */
@Component
class ImportZipIngress {
    private final ObjectStoreApi objectStore;
    private final RemoteZipFetcher remote;

    ImportZipIngress(ObjectStoreApi objectStore, RemoteZipFetcher remote) {
        this.objectStore = objectStore;
        this.remote = remote;
    }

    /** Convenience path used after request/space locks have been acquired. */
    Stored admit(BundleImportTypes.ImportSource source) {
        try (Prepared prepared = prepare(source)) {
            return store(prepared);
        }
    }

    /** Reads and fingerprints input without reserving/writing an object or taking database locks. */
    Prepared prepare(BundleImportTypes.ImportSource source) {
        try {
            return switch (source) {
                case BundleImportTypes.ImportSource.ZipStream zip ->
                    copy(zip.body(), zip.declaredSize(), BundleImportTypes.MAX_ZIP_BYTES);
                case BundleImportTypes.ImportSource.StoredUpload upload -> {
                    var opened = objectStore.open(upload.uploadKey());
                    if (opened.isEmpty()) throw new ImportUploadNotFoundException();
                    try (InputStream in = opened.orElseThrow()) {
                        yield copy(in, -1, BundleImportTypes.MAX_ZIP_BYTES);
                    }
                }
                case BundleImportTypes.ImportSource.RemoteZip url -> {
                    try (RemoteZipFetcher.Fetched fetched = remote.open(url.url())) {
                        yield copy(fetched.body(), -1, RemoteZipFetcher.MAX_REMOTE_ZIP_BYTES);
                    }
                }
            };
        } catch (ObjectStoreApi.Unavailable failure) {
            throw new ImportObjectStoreUnavailableException(failure);
        } catch (IOException failure) {
            throw new UncheckedIOException(failure);
        }
    }

    Stored store(Prepared prepared) {
        try (InputStream content = Files.newInputStream(prepared.file())) {
            Stored stored = prepared.stored();
            objectStore.putIfAbsent(stored.key(), content, stored.size(), "application/zip");
            return stored;
        } catch (ObjectStoreApi.Unavailable failure) {
            throw new ImportObjectStoreUnavailableException(failure);
        } catch (IOException failure) {
            throw new UncheckedIOException(failure);
        }
    }

    private Prepared copy(InputStream body, long declaredSize, long maxBytes) throws IOException {
        if (declaredSize > maxBytes) throw new ZipTooLargeException();
        Path temp = Files.createTempFile("import-zip-", ".bin");
        boolean retained = false;
        try {
            MessageDigest digest = Sha256.newDigest();
            long copied = 0;
            try (OutputStream file = Files.newOutputStream(temp);
                    DigestOutputStream hashed = new DigestOutputStream(file, digest)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = body.read(buffer)) >= 0) {
                    if (read == 0) continue;
                    copied += read;
                    if (copied > maxBytes) throw new ZipTooLargeException();
                    hashed.write(buffer, 0, read);
                }
            }
            if (copied < 2 || !zipMagic(temp)) throw new InvalidBundleException();
            String sha = HexFormat.of().formatHex(digest.digest());
            var prepared = new Prepared(temp, new Stored(sha, "import-zips/" + sha, copied));
            retained = true;
            return prepared;
        } finally {
            if (!retained) ImportZipFile.remove(temp);
        }
    }

    record Prepared(Path file, Stored stored) implements AutoCloseable {
        @Override
        public void close() {
            ImportZipFile.remove(file);
        }
    }

    private static boolean zipMagic(Path file) throws IOException {
        try (InputStream in = Files.newInputStream(file)) {
            int first = in.read();
            int second = in.read();
            return first == 'P' && second == 'K';
        }
    }

    record Stored(String sha256, String key, long size) {}
}
