package io.space.concepts.bundleexport;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.bundleexport.api.*;
import io.space.shared.Sha256;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipInputStream;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class BundleZipWriterTest {
    @Test
    void exportsAttachmentsAtCanonicalResourcePaths() throws Exception {
        byte[] bytes = "pixel".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        var attachment = new ExportSnapshot.Attachment("images/pixel.png", "store/pixel", Sha256.hex(bytes));
        var page = new ExportSnapshot.Page(
                UUID.randomUUID(),
                "guide",
                "guide.md",
                "Guide",
                "markdown",
                "Guide",
                Map.of(),
                null,
                Map.of(),
                List.of(attachment));
        var output = new ByteArrayOutputStream();
        new BundleZipWriter(JsonMapper.builder().build())
                .write(
                        new ExportSnapshot("test", Instant.EPOCH, List.of(page), List.of()),
                        output,
                        key -> new ByteArrayInputStream(bytes),
                        () -> {});
        var entries = new java.util.LinkedHashMap<String, byte[]>();
        try (var zip = new ZipInputStream(new ByteArrayInputStream(output.toByteArray()))) {
            for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
                entries.put(entry.getName(), zip.readAllBytes());
            }
        }
        assertThat(entries.get("images/pixel.png")).isEqualTo(bytes);
        var manifest = JsonMapper.builder().build().readTree(entries.get("manifest.json"));
        assertThat(manifest.path("pages").get(0).path("attachments").get(0).asString())
                .isEqualTo("images/pixel.png");
        assertThat(manifest.path("checksums").path("images/pixel.png").asString())
                .isEqualTo("sha256:" + Sha256.hex(bytes));
    }

    @Test
    void exportsSourceDocumentsWithTheirOwnExtensionsAndOriginalBytes() throws Exception {
        List<ExportSnapshot.Page> pages = new ArrayList<>();
        for (String format : List.of("txt", "json", "xml")) {
            pages.add(new ExportSnapshot.Page(
                    UUID.randomUUID(),
                    format,
                    format,
                    format,
                    format,
                    "<tag>&</tag>\n",
                    Map.of(),
                    null,
                    Map.of(),
                    List.of()));
        }
        var output = new ByteArrayOutputStream();
        new BundleZipWriter(JsonMapper.builder().build())
                .write(new ExportSnapshot("test", Instant.EPOCH, pages, List.of()), output, ignored -> null, () -> {});
        var names = new ArrayList<String>();
        try (var zip = new ZipInputStream(new ByteArrayInputStream(output.toByteArray()))) {
            for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
                names.add(entry.getName());
                if (entry.getName().startsWith("content/"))
                    assertThat(new String(zip.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8))
                            .isEqualTo("<tag>&</tag>\n");
            }
        }
        for (ExportSnapshot.Page page : pages) assertThat(names).contains("content/" + page.id() + "." + page.format());
        assertThat(names).contains("manifest.json");
    }
}
