package io.edition.content;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.*;

/** Passive version binding and interpretation values frozen with the source revision. */
public record ContentProfile(String contentType, String versionRef, Map<String, Object> interpretation) {
    public ContentProfile {
        if (contentType == null
                || contentType.isBlank()
                || contentType.length() > 128
                || (versionRef != null && versionRef.length() > 256))
            throw new IllegalArgumentException("Invalid content profile");
        interpretation = JsonValues.object(interpretation);
        if (JsonValues.canonical(interpretation).getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 262144)
            throw new IllegalArgumentException("Content interpretation too large");
    }

    public ContentProfile(String contentType, String schema, String catalogId, String protocolVersion) {
        this(contentType, null, new Interpretation(schema, catalogId, protocolVersion));
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static ContentProfile read(Map<String, Object> values) {
        var settings = new LinkedHashMap<String, Object>();
        if (values.get("interpretation") instanceof Map<?, ?> nested) {
            for (var entry : nested.entrySet()) settings.put((String) entry.getKey(), entry.getValue());
        } else {
            for (var entry : values.entrySet())
                if (entry.getValue() != null
                        && !Set.of("contentType", "versionRef").contains(entry.getKey()))
                    settings.put(entry.getKey(), entry.getValue());
        }
        return new ContentProfile((String) values.get("contentType"), (String) values.get("versionRef"), settings);
    }

    public static ContentProfile defaults(String format) {
        return new ContentProfile(format.toLowerCase(Locale.ROOT), null, Map.of());
    }

    public String fingerprintMaterial() {
        return JsonValues.canonical(Arrays.asList(contentType, versionRef, interpretation));
    }

    public static ContentProfile of(String format, String type, Map<String, Object> interpretation) {
        return new ContentProfile(type == null ? format.toLowerCase(Locale.ROOT) : type, null, interpretation);
    }

    public ContentProfile bind(String reference) {
        return new ContentProfile(contentType, reference, interpretation);
    }
    /** Source compatibility for callers; serialized values remain a generic JSON object. */
    public static final class Interpretation extends LinkedHashMap<String, Object> {
        public Interpretation(String schema, String catalogId, String protocolVersion) {
            if (schema != null) put("schema", schema);
            if (catalogId != null) put("catalogId", catalogId);
            if (protocolVersion != null) put("protocolVersion", protocolVersion);
        }
    }
}
