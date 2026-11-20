package io.space.concepts.bundleexport;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.bundleexport.api.BundleZipWriter;
import io.space.concepts.bundleexport.api.ExportSnapshot;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipInputStream;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

class BundleZipWriterFormatsTest {
    private final JsonMapper json = JsonMapper.builder().build();

    @Test
    void contentProfileIsFrozenInTheManifest() throws Exception {
        var profile = new io.space.content.ContentProfile(
                "a2ui", null, "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json", "v0.9.1");
        var page = new ExportSnapshot.Page(
                UUID.randomUUID(), "ui", "ui.json", "UI", "json", "[]", Map.of(), null, Map.of(), List.of(), profile);

        JsonNode item = manifestPage(page);

        assertThat(item.path("format").asString()).isEqualTo("json");
        assertThat(item.path("contentType").asString()).isEqualTo("a2ui");
        assertThat(item.path("interpretation").path("protocolVersion").asString())
                .isEqualTo("v0.9.1");
    }

    @Test
    void genericValuesAndFrozenDefinitionSurviveTheManifest() throws Exception {
        Map<String, Object> settings = json.readValue(
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

        JsonNode item = manifestPage(page);

        assertThat(item.path("contentType").asString()).isEqualTo("demo-card");
        assertThat(item.path("versionRef").asString()).isEqualTo(ref);
        assertThat(item.path("contentTypeDefinition").path("versionRef").asString())
                .isEqualTo(ref);
        assertThat(item.path("contentTypeDefinition").path("digest").asString()).isEqualTo("abc");
    }

    private JsonNode manifestPage(ExportSnapshot.Page page) throws Exception {
        var output = new ByteArrayOutputStream();
        new BundleZipWriter(json)
                .write(
                        new ExportSnapshot("test", Instant.EPOCH, List.of(page), List.of()),
                        output,
                        key -> null,
                        () -> {});
        try (var zip = new ZipInputStream(new ByteArrayInputStream(output.toByteArray()))) {
            for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
                if (entry.getName().equals("manifest.json")) {
                    return json.readTree(zip.readAllBytes()).path("pages").get(0);
                }
            }
        }
        throw new AssertionError("manifest.json missing");
    }
}
