package io.space.concepts.release.validation;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.release.api.*;
import io.space.content.ContentProfile;
import io.space.content.ContentTypeDefinition;
import io.space.content.ContentTypeDefinition.Validation;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ContentValidationTest {
    private static final String ROOT = "https://example.test/schemas/card";
    private static final String ENVELOPE = """
            {"type":"object","required":["content","interpretation"],"properties":{
              "content":{"type":"object","required":["title"],"properties":{"title":{"type":"string"}}},
              "interpretation":{"type":"object","required":["theme"],"properties":{"theme":{"const":"dark"}}}}}
            """;
    private static final String CATALOG = "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json";
    private static final ContentProfile A2UI = new ContentProfile("a2ui", null, CATALOG, "v0.9.1");
    private static final String CREATE = """
            {"version":"v0.9.1","createSurface":{"surfaceId":"demo","catalogId":"https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"}}
            """;
    private static final String TEXT = """
            {"version":"v0.9.1","updateComponents":{"surfaceId":"demo","components":[{"id":"root","component":"Text","text":{"path":"/name"}}]}}
            """;

    @Test
    void retainsUnboundJsonAsRawSourceAndRequiresTheFrozenTypeAndFormat() {
        assertThat(ContentValidation.inspect("json", "{incomplete", null)).isEmpty();
        assertThat(ContentValidation.inspect(
                        "json", "{incomplete", new ContentProfile("json", null, Map.of("schema", false))))
                .isNotEmpty();
        assertThat(ContentValidation.inspect(
                        "json", "{incomplete", new ContentProfile("json-schema", null, null, null)))
                .extracting(issue -> issue.code())
                .containsExactly("content_validation_failed");
        assertThat(ContentValidation.inspect("html", "{}", A2UI))
                .extracting(issue -> issue.code())
                .containsExactly("content_format_mismatch");
        assertThat(ContentValidation.inspect(
                        "json",
                        "{}",
                        new ContentProfile("other", null, Map.of()),
                        definition(new Validation("json", ROOT, null), Map.of(ROOT, ENVELOPE))))
                .extracting(issue -> issue.code())
                .containsExactly("content_type_mismatch");
    }

    @Test
    void admitsARegisteredTypeUsingOnlyItsEnvelopeSchemaAndNestedInterpretation() {
        var definition = definition(new Validation("json", ROOT, null), Map.of(ROOT, ENVELOPE));
        var settings = new LinkedHashMap<String, Object>();
        settings.put("theme", "dark");
        settings.put("custom", Map.of("enabled", true, "values", List.of(1, "two")));
        settings.put("optional", null);
        var profile = new ContentProfile("demo-card", "version-1", settings);
        assertThat(ContentValidation.inspectDefinition(definition)).isEmpty();
        assertThat(ContentValidation.inspect("json", "{\"title\":\"Hello\"}", profile, definition))
                .isEmpty();
        assertThat(ContentValidation.inspect("json", "{\"title\":3}", profile, definition))
                .extracting(issue -> issue.code())
                .contains("schema_envelope_invalid");
        assertThat(ContentValidation.inspect(
                        "json",
                        "{\"title\":\"Hello\"}",
                        new ContentProfile("demo-card", null, Map.of("theme", "light")),
                        definition))
                .extracting(issue -> issue.path())
                .anyMatch(path -> path.contains("interpretation"));
    }

    @Test
    void bindsObjectBooleanAndLegacyStringSchemasWithoutSkippingFalse() {
        var schema = Map.of(
                "type", "object", "required", List.of("name"), "properties", Map.of("name", Map.of("type", "string")));
        for (Object value : List.of(
                schema,
                "{\"type\":\"object\",\"required\":[\"name\"],\"properties\":{\"name\":{\"type\":\"string\"}}}")) {
            var profile = new ContentProfile("json", null, Map.of("schema", value));
            assertThat(ContentValidation.inspect("json", "{\"name\":\"Ada\"}", profile))
                    .isEmpty();
            assertThat(ContentValidation.inspect("json", "{\"name\":1}", profile))
                    .extracting(issue -> issue.code())
                    .contains("schema_instance_invalid");
        }
        for (Object value : List.of(false, "false"))
            assertThat(ContentValidation.inspect(
                            "json", "{}", new ContentProfile("json", null, Map.of("schema", value))))
                    .extracting(issue -> issue.code())
                    .containsExactly("schema_instance_invalid");
        assertThat(ContentValidation.inspect("json", "{}", new ContentProfile("json", null, Map.of("schema", true))))
                .isEmpty();
        var nullSchema = new LinkedHashMap<String, Object>();
        nullSchema.put("schema", null);
        assertThat(ContentValidation.inspect("json", "{incomplete", new ContentProfile("json", null, nullSchema)))
                .isEmpty();
        assertThat(ContentValidation.inspect("json", "{}", new ContentProfile("json", null, Map.of("schema", 7))))
                .extracting(issue -> issue.detail())
                .containsExactly("Schema must be an object or boolean");
    }

    @Test
    void resolvesEscapedPointersAndAlwaysAppliesTheDynamicSchemaToContent() {
        var definition = definition(new Validation("json", null, "/interpretation/rules/a~1b~0c"), Map.of());
        var profile = new ContentProfile(
                "demo-card", null, Map.of("rules", Map.of("a/b~c", Map.of("type", "string", "const", "hello"))));
        assertThat(ContentValidation.inspect("json", "\"hello\"", profile, definition))
                .isEmpty();
        assertThat(ContentValidation.inspect("json", "{\"rules\":{}}", profile, definition))
                .extracting(issue -> issue.code())
                .contains("schema_instance_invalid");
        for (String pointer : List.of("/content", "/interpretation/bad~2", "expression(value)"))
            assertThat(ContentValidation.inspectDefinition(definition(new Validation("json", null, pointer), Map.of())))
                    .isNotEmpty();
    }

    @Test
    void treatsTextEncodingAsTextEvenWhenTheSourceLooksLikeJson() {
        String schema = "{\"properties\":{\"content\":{\"type\":\"string\",\"const\":\"{unfinished\"}}}";
        var definition = definition(new Validation("text", ROOT, null), Map.of(ROOT, schema));
        assertThat(ContentValidation.inspect(
                        "json", "{unfinished", new ContentProfile("demo-card", null, Map.of()), definition))
                .isEmpty();
    }

    @Test
    void resolvesOnlyTheFrozenResourceClosureIncludingRelativeReferences() {
        String child = "https://example.test/schemas/title";
        var resources =
                Map.of(ROOT, "{\"properties\":{\"content\":{\"$ref\":\"title\"}}}", child, "{\"type\":\"string\"}");
        var definition = definition(new Validation("json", ROOT, null), resources);
        assertThat(ContentValidation.inspectDefinition(definition)).isEmpty();
        assertThat(ContentValidation.inspect(
                        "json", "\"hello\"", new ContentProfile("demo-card", null, Map.of()), definition))
                .isEmpty();
        for (String reference : List.of("https://127.0.0.1/secret", "file:///etc/passwd", "classpath:secret")) {
            var unsafe = definition(
                    new Validation("json", ROOT, null),
                    Map.of(ROOT, "{\"$defs\":{\"unused\":{\"$ref\":\"" + reference + "\"}}}"));
            assertThat(ContentValidation.inspectDefinition(unsafe)).isNotEmpty();
            var dynamic = new ContentProfile("json", null, Map.of("schema", Map.of("$ref", reference)));
            assertThat(ContentValidation.inspect("json", "{}", dynamic)).isNotEmpty();
        }
        assertThat(ContentValidation.inspectDefinition(
                        definition(new Validation("json", "file:///etc/passwd", null), Map.of())))
                .isNotEmpty();
    }

    @Test
    void leavesReferencesInInstanceAnnotationsAsDataAndValidatesSchemaContentStructurally() {
        String schema = """
                {"const":{"$ref":"https://example.test/data","$schema":"ordinary data"},
                 "default":{"$ref":"file:///annotation"},"examples":[{"$ref":"https://example.test/example"}]}
                """;
        assertThat(ContentValidation.inspect("json", schema, new ContentProfile("json-schema", null, null, null)))
                .isEmpty();
        assertThat(ContentValidation.inspect(
                        "json",
                        "{\"$ref\":\"https://example.test/data\",\"$schema\":\"ordinary data\"}",
                        new ContentProfile("json", schema, null, null)))
                .isEmpty();
        assertThat(ContentValidation.inspect(
                        "json", "{\"type\":7}", new ContentProfile("json-schema", null, null, null)))
                .extracting(issue -> issue.code())
                .contains("schema_envelope_invalid");
        // Schema-as-content is data. It is not implicitly executed against itself.
        assertThat(ContentValidation.inspect(
                        "json",
                        "{\"$ref\":\"https://example.test/not-fetched\"}",
                        new ContentProfile("json-schema", null, null, null)))
                .isEmpty();
    }

    @Test
    void keepsA2uiStructuralAndMetadataChecksWithoutClaimingSequenceOrGraphValidation() {
        assertThat(ContentValidation.inspect("json", "[" + CREATE + "," + TEXT + "]", A2UI))
                .isEmpty();
        assertThat(ContentValidation.inspect("json", "[" + TEXT + "]", A2UI)).isEmpty();
        assertThat(ContentValidation.inspect(
                        "json", "[" + CREATE + "," + TEXT.replace("\"root\"", "\"other\"") + "]", A2UI))
                .isEmpty();
        String cycle = """
                {"version":"v0.9.1","updateComponents":{"surfaceId":"demo","components":[{"id":"root","component":"Column","children":["root"]}]}}
                """;
        assertThat(ContentValidation.inspect("json", "[" + CREATE + "," + cycle + "]", A2UI))
                .isEmpty();
        assertThat(ContentValidation.inspect(
                        "json", "[" + CREATE + "," + TEXT.replace("Text", "UnknownWidget") + "]", A2UI))
                .extracting(issue -> issue.code())
                .contains("schema_envelope_invalid");
        assertThat(ContentValidation.inspect(
                        "json", "[" + CREATE.replace(CATALOG, "https://example.test/other") + "]", A2UI))
                .isNotEmpty();
        assertThat(ContentValidation.inspect(
                        "json", "[" + CREATE + "]", new ContentProfile("a2ui", null, CATALOG, "other")))
                .extracting(issue -> issue.path())
                .anyMatch(path -> path.contains("interpretation"));
    }

    @Test
    void rejectsTrailingValuesAndExcessiveSourceAndSchemaStructures() {
        assertThat(ContentValidation.inspect("json", "{} {}", new ContentProfile("json-schema", null, null, null)))
                .isNotEmpty();
        assertThat(ContentValidation.inspect("json", "[".repeat(80) + "0" + "]".repeat(80), A2UI))
                .isNotEmpty();
        assertThat(ContentValidation.inspect("json", "x".repeat(2 * 1024 * 1024 + 1), null))
                .isNotEmpty();
        String large = "{\"const\":[" + "0,".repeat(20000) + "0]}";
        assertThat(ContentValidation.inspectDefinition(
                        definition(new Validation("json", ROOT, null), Map.of(ROOT, large))))
                .isNotEmpty();
        var resources = new LinkedHashMap<String, String>();
        for (int i = 0; i < 65; i++) resources.put("https://example.test/" + i, "true");
        assertThat(ContentValidation.inspectDefinition(definition(new Validation("json", null, null), resources)))
                .isNotEmpty();
    }

    @Test
    void rejectsInvalidDeclarationsAndUnsupportedDialectsBeforeCompilation() {
        assertThat(ContentValidation.inspectDefinition(definition(new Validation("yaml", null, null), Map.of())))
                .isNotEmpty();
        assertThat(ContentValidation.inspectDefinition(definition(new Validation(null, null, null), Map.of())))
                .isNotEmpty();
        assertThat(ContentValidation.inspectDefinition(definition(
                        new Validation("json", ROOT, null),
                        Map.of(ROOT, "{\"$schema\":\"https://example.test/dialect\"}"))))
                .extracting(issue -> issue.detail())
                .containsExactly("Use JSON Schema draft 2020-12");
        assertThat(ContentValidation.inspectDefinition(definition(
                        new Validation("json", ROOT, null),
                        Map.of(ROOT, "{\"properties\":{\"content\":{\"$ref\":\"#/$defs/missing\"}}}"))))
                .isNotEmpty();
        String oversized = "{\"description\":\"" + "x".repeat(2 * 1024 * 1024) + "\"}";
        assertThat(ContentValidation.inspectDefinition(
                        definition(new Validation("json", ROOT, null), Map.of(ROOT, oversized))))
                .extracting(issue -> issue.detail())
                .containsExactly("Schema resources exceed 2 MiB");
    }

    private static ContentTypeDefinition definition(Validation validation, Map<String, String> resources) {
        return new ContentTypeDefinition(
                "demo-card",
                "1.0.0",
                "Card",
                "json",
                "application/json",
                "json",
                "browser",
                Map.of("theme", "dark"),
                validation,
                resources,
                List.of(),
                List.of());
    }
}
