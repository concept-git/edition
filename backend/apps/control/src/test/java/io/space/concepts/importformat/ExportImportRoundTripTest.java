package io.space.concepts.importformat;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.bundleexport.api.BundleZipWriter;
import io.space.concepts.bundleexport.api.ExportSnapshot;
import io.space.concepts.importformat.api.ImportFormatApi;
import io.space.concepts.importformat.archive.ZipPackSource;
import io.space.concepts.importformat.contract.AdaptSink;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.contract.ImportFormatAdapter;
import io.space.concepts.importformat.formats.bundle.ManifestBundleAdapter;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ExportImportRoundTripTest {
    static final String PIXEL_SHA = "ebf4f635a17d10d6eb46ba680b70142419aa3220f228001a036d311a22ee9d2a";
    private final ImportFormatApi formats = io.space.concepts.importformat.StandardImportFormats.create(
            JsonMapper.builder().build());

    @Test
    void exportedSourceDocumentsRoundTripThroughBundleV1() throws Exception {
        List<ExportSnapshot.Page> pages = List.of("txt", "json", "xml").stream()
                .map(format -> new ExportSnapshot.Page(
                        UUID.randomUUID(),
                        format,
                        format,
                        format,
                        format,
                        "<literal>&</literal>\n",
                        Map.of(),
                        null,
                        Map.of(),
                        List.of()))
                .toList();
        var output = new ByteArrayOutputStream();
        new BundleZipWriter(JsonMapper.builder().build())
                .write(
                        new ExportSnapshot("space/1.0", Instant.EPOCH, pages, List.of()),
                        output,
                        ignored -> null,
                        () -> {});
        Path zip = Files.createTempFile("source-formats-bundle-", ".zip");
        try {
            Files.write(zip, output.toByteArray());
            try (ZipPackSource source = new ZipPackSource(zip)) {
                AdaptedPack pack = ((ImportFormatApi.Result.Adapted)
                                formats.adapt(source.index(), source, new InMemoryAdaptSink()))
                        .pack();
                assertThat(pack.pages()).extracting(AdaptedPack.Page::format).containsExactly("txt", "json", "xml");
                assertThat(pack.pages()).extracting(AdaptedPack.Page::content).containsOnly("<literal>&</literal>\n");
            }
        } finally {
            Files.deleteIfExists(zip);
        }
    }

    @Test
    void exportedContentProfileRoundTripsThroughTheBundleAdapter() throws Exception {
        var profile = new io.space.content.ContentProfile(
                "a2ui", null, "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json", "v0.9.1");
        var page = new ExportSnapshot.Page(
                UUID.randomUUID(), "ui", "ui.json", "UI", "json", "[]", Map.of(), null, Map.of(), List.of(), profile);
        var adapted = adapt(page);
        assertThat(adapted.pack().pages().getFirst().contentProfile()).isEqualTo(profile);
        assertThat(adapted.pack().pages().getFirst().content()).isEqualTo("[]");
    }

    @Test
    void exportedFrozenDefinitionRoundTripsThroughTheBundleAdapter() throws Exception {
        var mapper = JsonMapper.builder().build();
        Map<String, Object> settings = mapper.readValue(
                "{\"custom\":{\"values\":[1,true,null,\"x\"]}}",
                new tools.jackson.core.type.TypeReference<Map<String, Object>>() {});
        String ref = UUID.randomUUID().toString();
        var profile = new io.space.content.ContentProfile("demo-card", ref, settings);
        var definition = new io.space.content.ContentTypeDefinition(
                "demo-card",
                "1",
                "Demo",
                "json",
                "application/json",
                "json",
                "browser",
                settings,
                new io.space.content.ContentTypeDefinition.Validation("json", "https://example.test/schema", null),
                Map.of("https://example.test/schema", "true"),
                List.of(),
                List.of(new io.space.content.ContentTypeDefinition.Contribution(
                        "builtin.json", "1.0.0", "render", Map.of())));
        var frozen = new io.space.content.ContentTypeSnapshot(ref, "abc", definition);
        var page = new ExportSnapshot.Page(
                UUID.randomUUID(),
                "demo",
                "demo.json",
                "Demo",
                "json",
                "{}",
                Map.of(),
                null,
                Map.of(),
                List.of(),
                profile,
                frozen);
        var adapted = adapt(page);
        assertThat(adapted.pack().pages().getFirst().contentProfile()).isEqualTo(profile);
        assertThat(adapted.pack().pages().getFirst().contentTypeDefinition()).isEqualTo(frozen);
    }

    private ImportFormatAdapter.Outcome.Adapted adapt(ExportSnapshot.Page page) throws Exception {
        var output = new ByteArrayOutputStream();
        new BundleZipWriter(JsonMapper.builder().build())
                .write(
                        new ExportSnapshot("test", Instant.EPOCH, List.of(page), List.of()),
                        output,
                        key -> null,
                        () -> {});
        Path zip = Files.createTempFile("bundle-adapter-", ".zip");
        try {
            Files.write(zip, output.toByteArray());
            try (var source = new ZipPackSource(zip)) {
                var outcome = new ManifestBundleAdapter(JsonMapper.builder().build()).adapt(source, new AdaptSink() {
                    public AdaptSink.StoredAttachment putAttachment(String path, java.io.InputStream in, long size) {
                        throw new AssertionError("no attachments");
                    }

                    public void info(String code, String path, String detail) {}
                });
                assertThat(outcome).isInstanceOf(ImportFormatAdapter.Outcome.Adapted.class);
                return (ImportFormatAdapter.Outcome.Adapted) outcome;
            }
        } finally {
            Files.deleteIfExists(zip);
        }
    }
}
