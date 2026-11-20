package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.ZipPackSource;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ImportFormatSniffTest {
    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());

    @Test
    void bundleV1WinsWhenMixedWithHuaweiAndOkfFiles() throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("manifest.json", "{\"bundleVersion\":\"1.0\"}".getBytes(StandardCharsets.UTF_8));
        files.put("ALL_META.TXT.json", "[]".getBytes(StandardCharsets.UTF_8));
        files.put("CLASS.TXT.json", "[]".getBytes(StandardCharsets.UTF_8));
        files.put(".okfignore", "".getBytes(StandardCharsets.UTF_8));
        files.put("index.md", "---\nokf_version: \"0.1\"\n---\n".getBytes(StandardCharsets.UTF_8));
        Path zip = ImportPacks.zipEntries(files);
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index())).contains("bundle-v1");
            assertThat(formats.sniff(source.index(), source)).contains("bundle-v1");
        }
    }

    @Test
    void hwMiniHitsHwcloudDocs() throws Exception {
        Path zip = ImportPacks.zipFixture("F-hw-mini");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index())).contains("hwcloud-docs");
        }
    }

    @Test
    void okfMiniHitsOkfV01() throws Exception {
        Path zip = ImportPacks.zipFixture("F-okf-mini");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index())).contains("okf-v0.1");
            assertThat(formats.sniff(source.index(), source)).contains("okf-v0.1");
        }
    }

    @Test
    void githubStyleWrapperStillSniffsOkfAtLogicalRoot() throws Exception {
        Path zip = ImportPacks.wrappedZip("F-okf-mini", "AgenticWeb4-tourism-okf-deadbeef");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(source.index().names()).noneMatch(name -> name.startsWith("AgenticWeb4"));
            assertThat(source.index().names())
                    .anyMatch(name -> name.equals(".okfignore") || name.endsWith("/.okfignore"));
            assertThat(formats.sniff(source.index())).contains("okf-v0.1");
            assertThat(formats.sniff(source.index(), source)).contains("okf-v0.1");
        }
    }

    @Test
    void unknownZipIsUnknownFormat() throws Exception {
        Path zip = ImportPacks.zipFixture("F-unknown");
        try (ZipPackSource source = new ZipPackSource(zip)) {
            assertThat(formats.sniff(source.index())).isEmpty();
            assertThat(formats.adapt(source.index(), source, new InMemoryAdaptSink()))
                    .isInstanceOf(ImportFormatApi.Result.UnknownFormat.class);
        }
    }

    @Test
    void indexMarkdownWithoutOkfVersionFallsThroughToFileTree() throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put("index.md", "# Just a site\n".getBytes(StandardCharsets.UTF_8));
        files.put("page.md", "# Page\n".getBytes(StandardCharsets.UTF_8));
        Path zip = ImportPacks.zipEntries(files);
        try (ZipPackSource source = new ZipPackSource(zip)) {
            // okf-v0.1 窥读后放弃；普通 markdown 目录由兜底 file-tree 接手，而不是判成未知格式
            assertThat(formats.sniff(source.index(), source)).contains("file-tree");
            assertThat(formats.adapt(source.index(), source, new InMemoryAdaptSink()))
                    .isInstanceOf(ImportFormatApi.Result.Adapted.class);
        }
    }
}
