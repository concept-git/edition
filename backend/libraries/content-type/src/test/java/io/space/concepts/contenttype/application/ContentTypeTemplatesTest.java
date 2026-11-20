package io.space.concepts.contenttype.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.space.concepts.contenttype.api.*;
import io.space.content.ContentPluginDescriptors;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ContentTypeTemplatesTest {
    @Test
    void keepsTwoIndependentImplementationsForOneTypeInRegistrationOrder() throws IOException {
        var descriptors = fixture();
        assertEquals(
                List.of("fixture.json.default", "fixture.json.alternate"),
                descriptors.plugins().stream().map(p -> p.manifest().id()).toList());
        assertEquals(2, descriptors.types().getFirst().renderers().size());
    }

    @Test
    void rejectsAPluginReferencingAnUnregisteredType() throws IOException {
        var manifest = new ContentPluginDescriptors.Manifest(
                "fixture.unknown",
                "Unknown",
                "1.0.0",
                1,
                List.of("unregistered"),
                List.of(),
                List.of(new ContentPluginDescriptors.View(
                        "preview", "Preview", "fixture-unknown", List.of("unregistered"), null)),
                null);
        var plugin = new ContentPluginDescriptors.Plugin(manifest, null, "json");
        var descriptors = fixture();

        assertThrows(
                IllegalArgumentException.class,
                () -> new ContentPluginDescriptors(1, descriptors.types(), List.of(plugin)));
    }

    @Test
    void rejectsMissingRenderersAndDuplicatePluginIdentities() throws IOException {
        var descriptors = fixture();
        var sourceOnly = new ContentPluginDescriptors.Plugin(
                new ContentPluginDescriptors.Manifest(
                        "fixture.source-only",
                        "Source",
                        "1.0.0",
                        1,
                        List.of("json"),
                        List.of(new ContentPluginDescriptors.View(
                                "source", "Source", "fixture-source", List.of("json"), null)),
                        List.of(),
                        null),
                "source",
                null);
        assertThrows(
                IllegalArgumentException.class,
                () -> new ContentPluginDescriptors(1, descriptors.types(), List.of(sourceOnly)));
        assertThrows(
                IllegalArgumentException.class,
                () -> new ContentPluginDescriptors(
                        1,
                        descriptors.types(),
                        List.of(
                                descriptors.plugins().getFirst(),
                                descriptors.plugins().getFirst())));
    }

    @Test
    void rejectsAnUnknownSourceFormat() throws IOException {
        var t = fixture().types().getFirst();
        assertThrows(
                IllegalArgumentException.class,
                () -> new ContentPluginDescriptors.Type(
                        t.id(),
                        t.version(),
                        t.label(),
                        "unknown",
                        t.mediaType(),
                        t.language(),
                        t.renderHost(),
                        t.defaultInterpretation(),
                        t.validation(),
                        t.schemaResources(),
                        t.editors(),
                        t.renderers()));
    }

    private static ContentPluginDescriptors fixture() throws IOException {
        try (var input =
                ContentTypeTemplatesTest.class.getResourceAsStream("/content-plugins/multiple-implementations.json")) {
            return JsonMapper.builder()
                    .build()
                    .readValue(
                            new String(input.readAllBytes(), StandardCharsets.UTF_8), ContentPluginDescriptors.class);
        }
    }
}
