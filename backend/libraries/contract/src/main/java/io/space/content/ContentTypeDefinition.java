package io.space.content;

import java.util.*;

/** Neutral immutable data. Executable implementations are referenced only by build-trusted identities. */
public record ContentTypeDefinition(
        String id,
        String version,
        String label,
        String format,
        String mediaType,
        String language,
        String renderHost,
        Map<String, Object> defaultInterpretation,
        Validation validation,
        Map<String, String> schemaResources,
        List<Contribution> editors,
        List<Contribution> renderers) {
    public ContentTypeDefinition {
        defaultInterpretation = JsonValues.object(defaultInterpretation);
        schemaResources =
                schemaResources == null ? Map.of() : Collections.unmodifiableMap(new TreeMap<>(schemaResources));
        editors = editors == null ? List.of() : List.copyOf(editors);
        renderers = renderers == null ? List.of() : List.copyOf(renderers);
    }

    public record Validation(String encoding, String schemaRef, String instanceSchemaPointer) {}

    public record Contribution(
            String pluginId, String pluginVersion, String contributionId, Map<String, Object> config) {
        public Contribution {
            config = JsonValues.object(config);
        }
    }
}
