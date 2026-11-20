package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.contract.ImportLimits;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ImportFormatValidationTest {
    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());

    @Test
    void zipSlipIsInvalid() throws Exception {
        Path zip = ImportPacks.zipSlip("../evil.md", "# nope\n".getBytes(StandardCharsets.UTF_8));
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(source.hasZipSlip()).isTrue();
            ImportFormatApi.Result result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Invalid.class);
            assertThat(((ImportFormatApi.Result.Invalid) result).issues())
                    .extracting(AdaptedPack.Issue::code)
                    .contains("zip_slip");
        }
    }

    @Test
    void oversizePageIsInvalid() throws Exception {
        String oversize = "x".repeat(ImportLimits.MAX_CONTENT_BYTES + 1);
        String manifest = """
                {
                  "bundleVersion": "1.0",
                  "generator": "bundle-v1",
                  "pages": [{
                    "externalId": "huge",
                    "slug": "huge",
                    "title": "Huge",
                    "format": "markdown",
                    "content": "content/huge.md"
                  }],
                  "toc": [],
                  "checksums": {"content/huge.md": "sha256:deadbeef"}
                }
                """;
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("manifest.json", manifest.getBytes(StandardCharsets.UTF_8));
        files.put("content/huge.md", oversize.getBytes(StandardCharsets.UTF_8));
        Path zip = ImportPacks.zipEntries(files);
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Invalid.class);
            assertThat(((ImportFormatApi.Result.Invalid) result).issues())
                    .extracting(AdaptedPack.Issue::code)
                    .contains("content_too_large");
        }
    }

    @Test
    void huaweiTocDeeperThanSevenIsInvalid() throws Exception {
        StringBuilder klass = new StringBuilder("[");
        StringBuilder meta = new StringBuilder("[");
        Map<String, byte[]> files = new LinkedHashMap<>();
        for (int depth = 1; depth <= 8; depth++) {
            if (depth > 1) {
                klass.append(',');
                meta.append(',');
            }
            String uri = "p" + depth + ".html";
            String parent = depth == 1 ? "" : Integer.toString(depth - 1);
            klass.append("{\"code\":\"")
                    .append(depth)
                    .append("\",\"p_code\":\"")
                    .append(parent)
                    .append("\",\"title\":\"L")
                    .append(depth)
                    .append("\",\"uri\":\"")
                    .append(uri)
                    .append("\"}");
            meta.append("{\"code\":\"")
                    .append(depth)
                    .append("\",\"uri\":\"")
                    .append(uri)
                    .append("\",\"title\":\"L")
                    .append(depth)
                    .append("\",\"des\":\"d\",\"kw\":\"k\",")
                    .append("\"product_code\":\"ecs\",\"doc_type\":\"api\",\"githuburl\":\"https://example.com\"}");
            files.put(uri, ("<h1>L" + depth + "</h1>").getBytes(StandardCharsets.UTF_8));
        }
        klass.append(']');
        meta.append(']');
        files.put("ALL_META.TXT.json", meta.toString().getBytes(StandardCharsets.UTF_8));
        files.put("CLASS.TXT.json", klass.toString().getBytes(StandardCharsets.UTF_8));
        Path zip = ImportPacks.zipEntries(files);
        try (ZipPackSource source = new ZipPackSource(zip)) {
            ImportFormatApi.Result result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Invalid.class);
            assertThat(((ImportFormatApi.Result.Invalid) result).issues())
                    .extracting(AdaptedPack.Issue::code)
                    .contains("toc_depth_exceeded");
        }
    }
}
