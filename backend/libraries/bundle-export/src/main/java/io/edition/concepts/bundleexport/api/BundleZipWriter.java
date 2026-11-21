package io.edition.concepts.bundleexport.api;

import io.edition.content.DocumentFormat;
import io.edition.content.ResourcePath;
import io.edition.shared.Sha256;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import java.util.zip.*;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/** Pure serializer; sync supplies the authorized immutable input and attachment streams. */
@Component
public class BundleZipWriter {
    public static final long MAX_ZIP_BYTES = 500L * 1024 * 1024;
    private final JsonMapper json;

    public BundleZipWriter(JsonMapper json) {
        this.json = json;
    }

    @FunctionalInterface
    public interface Attachments {
        InputStream open(String key) throws IOException;
    }

    public void write(ExportSnapshot snapshot, OutputStream output, Attachments attachments, Runnable heartbeat)
            throws IOException {
        var checksums = new LinkedHashMap<String, String>();
        var pages = new ArrayList<Map<String, Object>>();
        var files = new LinkedHashMap<String, ExportSnapshot.Attachment>();
        try (var zip = new ZipOutputStream(new LimitedOutput(output), StandardCharsets.UTF_8)) {
            for (var page : snapshot.pages()) {
                heartbeat.run();
                String content = "content/" + page.id() + "."
                        + DocumentFormat.fromWire(page.format())
                                .orElseThrow(() -> new Invalid("format_invalid"))
                                .extension();
                byte[] bytes = page.content().getBytes(StandardCharsets.UTF_8);
                if (bytes.length > 2 * 1024 * 1024) throw new Invalid("content_too_large");
                entry(zip, content);
                zip.write(bytes);
                zip.closeEntry();
                checksums.put(content, checksum(bytes));
                var manifest = new LinkedHashMap<String, Object>();
                manifest.put("externalId", page.externalId());
                manifest.put("slug", page.slug());
                manifest.put("title", page.title());
                manifest.put("format", page.format());
                manifest.put("contentType", page.contentProfile().contentType());
                manifest.put("interpretation", page.contentProfile().interpretation());
                manifest.put("versionRef", page.contentProfile().versionRef());
                manifest.put("contentTypeDefinition", page.contentTypeDefinition());
                manifest.put("content", content);
                manifest.put("seo", page.seo());
                manifest.put("icon", page.icon());
                manifest.put("properties", page.properties());
                var paths = new ArrayList<String>();
                for (var attachment : page.attachments()) {
                    String path = safe(attachment.path());
                    try {
                        new ResourcePath(path);
                    } catch (IllegalArgumentException invalid) {
                        throw new Invalid("attachment_path_invalid");
                    }
                    var previous = files.putIfAbsent(path, attachment);
                    if (previous != null
                            && (!previous.sha256().equals(attachment.sha256())
                                    || !previous.storageKey().equals(attachment.storageKey())))
                        throw new Invalid("attachment_path_conflict");
                    paths.add(path);
                }
                manifest.put("attachments", paths);
                pages.add(manifest);
            }
            byte[] buffer = new byte[65536];
            for (var attachment : files.values()) {
                heartbeat.run();
                entry(zip, attachment.path());
                MessageDigest hash = Sha256.newDigest();
                long size = 0;
                try (var input = attachments.open(attachment.storageKey())) {
                    if (input == null) throw new Invalid("export_source_missing");
                    int read;
                    while ((read = input.read(buffer)) != -1) {
                        size += read;
                        if (size > 10L * 1024 * 1024) throw new Invalid("attachment_too_large");
                        hash.update(buffer, 0, read);
                        zip.write(buffer, 0, read);
                        heartbeat.run();
                    }
                }
                zip.closeEntry();
                String checksum = "sha256:" + HexFormat.of().formatHex(hash.digest());
                if (!checksum.equalsIgnoreCase(normalize(attachment.sha256()))) throw new Invalid("checksum_mismatch");
                checksums.put(attachment.path(), checksum);
            }
            var manifest = new LinkedHashMap<String, Object>();
            manifest.put("bundleVersion", "1.0");
            manifest.put("generator", snapshot.generator());
            manifest.put("generatedAt", snapshot.generatedAt().toString());
            manifest.put("pages", pages);
            manifest.put("toc", snapshot.toc());
            manifest.put("checksums", checksums);
            byte[] bytes = json.writeValueAsBytes(manifest);
            if (bytes.length > 2 * 1024 * 1024) throw new Invalid("manifest_too_large");
            entry(zip, "manifest.json");
            zip.write(bytes);
            zip.closeEntry();
        }
    }

    private static String safe(String path) {
        if (path == null || path.isBlank() || path.startsWith("/") || path.contains("\\") || path.indexOf('\0') >= 0)
            throw new Invalid("path_invalid");
        for (String part : path.split("/", -1)) if (part.equals("..")) throw new Invalid("path_invalid");
        return path;
    }

    private static void entry(ZipOutputStream zip, String name) throws IOException {
        var entry = new ZipEntry(safe(name));
        entry.setTime(0);
        zip.putNextEntry(entry);
    }

    private static String normalize(String checksum) {
        return checksum.startsWith("sha256:") ? checksum : "sha256:" + checksum;
    }

    private static String checksum(byte[] bytes) {
        return "sha256:" + Sha256.hex(bytes);
    }

    public static final class Invalid extends RuntimeException {
        public Invalid(String code) {
            super(code);
        }
    }

    private static final class LimitedOutput extends FilterOutputStream {
        private long count;

        LimitedOutput(OutputStream output) {
            super(output);
        }

        @Override
        public void write(int value) throws IOException {
            if (++count > MAX_ZIP_BYTES) throw new Invalid("file_too_large");
            out.write(value);
        }

        @Override
        public void write(byte[] bytes, int offset, int length) throws IOException {
            count += length;
            if (count > MAX_ZIP_BYTES) throw new Invalid("file_too_large");
            out.write(bytes, offset, length);
        }
    }
}
