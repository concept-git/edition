package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Map;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ImportConsistencyTest {
    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());

    @Test
    void unusedNormalAttachmentDoesNotRejectThePack() throws Exception {
        byte[] png = Files.readAllBytes(ImportPacks.tree("F-v1-ok").resolve("attachments/pixel.png"));
        assertThat(png.length).isGreaterThan(16);
        var zip = ImportPacks.zipEntries(Map.of("README.md", bytes("# Guide"), "unused.png", png));
        var sink = new InMemoryAdaptSink();
        try (var source = new ZipPackSource(zip)) {
            assertThat(formats.adapt(source.index(), source, sink)).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            assertThat(sink.stored()).containsKey("attachments/unused.png");
        }
    }

    @Test
    void discardedSystemMarkersCannotSelectAnAdapter() throws Exception {
        for (var markers : java.util.List.of(
                Map.of("__MACOSX/manifest.json", bytes("{}")),
                Map.of("__MACOSX/ALL_META.TXT.json", bytes("{}"), "__MACOSX/CLASS.TXT.json", bytes("{}")))) {
            var files = new java.util.LinkedHashMap<>(markers);
            files.put("README.md", bytes("# Guide"));
            try (var source = new ZipPackSource(ImportPacks.zipEntries(files))) {
                assertThat(formats.sniff(source.index(), source)).contains("file-tree");
                assertThat(formats.adapt(source.index(), source, new InMemoryAdaptSink()))
                        .isInstanceOf(ImportFormatApi.Result.Adapted.class);
            }
        }
    }

    @Test
    void htmlHeadingTakesPrecedenceOverDocumentTitle() throws Exception {
        var zip = ImportPacks.zipEntries(Map.of(
                "page.html",
                bytes("<html><head><title>Site name</title></head><body><h1>Page heading</h1></body></html>")));
        try (var source = new ZipPackSource(zip)) {
            var result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Adapted.class);
            assertThat(((ImportFormatApi.Result.Adapted) result).pack().pages())
                    .extracting(AdaptedPack.Page::title)
                    .containsExactly("Page heading");
        }
    }

    private static byte[] bytes(String value) {
        return value.getBytes(StandardCharsets.UTF_8);
    }

    @Test
    void manifestWithDuplicateExternalIdentityIsRejectedBeforePageAssignment() throws Exception {
        String manifest = """
                {"bundleVersion":"1.0","generator":"test","pages":[
                {"externalId":"same","slug":"a","title":"A","format":"markdown","content":"a.md"},
                {"externalId":"same","slug":"b","title":"B","format":"markdown","content":"b.md"}],
                "toc":[],"checksums":{"a.md":"sha256:%s","b.md":"sha256:%s"}}
                """.formatted(Sha256.hex(bytes("A")), Sha256.hex(bytes("B")));
        var zip = ImportPacks.zipEntries(
                Map.of("manifest.json", bytes(manifest), "a.md", bytes("A"), "b.md", bytes("B")));
        try (var source = new ZipPackSource(zip)) {
            var result = formats.adapt(source.index(), source, new InMemoryAdaptSink());
            assertThat(result).isInstanceOf(ImportFormatApi.Result.Invalid.class);
            assertThat(((ImportFormatApi.Result.Invalid) result).issues())
                    .extracting(AdaptedPack.Issue::code)
                    .contains("duplicate_external_id");
        }
    }
}
