package io.space.concepts.release.validation;

import com.networknt.schema.FailFastAssertionException;
import com.networknt.schema.Schema;
import com.networknt.schema.SchemaException;
import com.networknt.schema.SchemaLocation;
import com.networknt.schema.SchemaRegistry;
import com.networknt.schema.SpecificationVersion;
import io.space.concepts.release.api.*;
import io.space.concepts.release.api.ReleaseApi.Issue;
import io.space.content.ContentPluginDescriptors;
import io.space.content.ContentProfile;
import io.space.content.ContentTypeDefinition;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Bounded declaration-based admission. All schema resources resolve from the frozen definition. */
public final class ContentValidation {
    private static final String DIALECT = "https://json-schema.org/draft/2020-12/schema";
    private static final URI DYNAMIC_BASE = URI.create("https://space.invalid/dynamic-schema");
    private static final JsonMapper JSON = JsonMapper.builder()
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
            .build();
    private static final Map<String, ContentTypeDefinition> TEMPLATES = templates();
    private static final int MAX_NODES = 20000;
    private static final int MAX_SCHEMA_BYTES = 2 * 1024 * 1024;

    private ContentValidation() {}

    /** Legacy callers use only immutable build templates, never a tenant's mutable default. */
    public static List<Issue> inspect(String format, String content, ContentProfile profile) {
        String type = profile == null ? format.toLowerCase(Locale.ROOT) : profile.contentType();
        return inspect(format, content, profile, TEMPLATES.get(type));
    }

    public static List<Issue> inspect(
            String format, String content, ContentProfile supplied, ContentTypeDefinition definition) {
        if (definition == null) return issue("unsupported_content_type", "/contentType", "Unregistered content type");
        ContentProfile profile = supplied == null
                ? new ContentProfile(definition.id(), null, definition.defaultInterpretation())
                : supplied;
        if (!definition.id().equals(profile.contentType()))
            return issue("content_type_mismatch", "/contentType", "Content type does not match its frozen definition");
        if (!definition.format().equals(format.toLowerCase(Locale.ROOT)))
            return issue("content_format_mismatch", "/contentType", "Content type requires " + definition.format());
        if (content == null || bytes(content) > 2 * 1024 * 1024)
            return issue("content_too_large", "/content", "Content exceeds 2 MiB");
        try {
            ContentTypeDefinition.Validation declaration = definition.validation();
            if (declaration == null) return List.of();
            validateDeclaration(declaration);
            var envelope = JSON.createObjectNode();
            envelope.set("interpretation", JSON.valueToTree(profile.interpretation()));
            JsonNode dynamic = declaration.instanceSchemaPointer() == null
                    ? null
                    : envelope.at(declaration.instanceSchemaPointer());
            boolean hasDynamic = dynamic != null && !dynamic.isMissingNode() && !dynamic.isNull();
            // JSON remains raw source unless an actual schema binding requires its interpretation.
            if (declaration.schemaRef() == null && !hasDynamic) return List.of();
            JsonNode value = declaration.encoding().equals("json")
                    ? JSON.readTree(content)
                    : JSON.getNodeFactory().stringNode(content);
            if (value == null) throw new IllegalArgumentException("Content is not a JSON value");
            bounded(value, 0, new int[1]);
            envelope.set("content", value);
            bounded(envelope, 0, new int[1]);
            SchemaRegistry registry = registry(definition.schemaResources());
            if (declaration.schemaRef() != null) {
                requireResource(
                        URI.create(declaration.schemaRef()),
                        definition.schemaResources().keySet());
                List<Issue> errors = validation(
                        registry.getSchema(SchemaLocation.of(declaration.schemaRef())),
                        envelope,
                        "schema_envelope_invalid");
                if (!errors.isEmpty()) return errors;
            }
            if (!hasDynamic) return List.of();
            if (dynamic.isString()) {
                if (bytes(dynamic.asString()) > 262144)
                    throw new IllegalArgumentException("Instance schema exceeds 256 KiB");
                dynamic = JSON.readTree(dynamic.asString());
            }
            requireSchema(dynamic);
            var dynamicIds = new HashSet<String>();
            collectIds(dynamic, DYNAMIC_BASE, dynamicIds);
            localReferences(dynamic, DYNAMIC_BASE, definition.schemaResources().keySet(), dynamicIds);
            List<Issue> errors =
                    validation(registry.getSchema(SchemaLocation.of(DIALECT)), dynamic, "invalid_json_schema");
            if (!errors.isEmpty()) return errors;
            Schema schema = registry.getSchema(SchemaLocation.of(DYNAMIC_BASE.toString()), dynamic);
            schema.initializeValidators();
            return validation(schema, value, "schema_instance_invalid");
        } catch (IllegalArgumentException e) {
            return issue("content_validation_failed", "/", safe(e.getMessage()));
        } catch (JacksonException | SchemaException | FailFastAssertionException e) {
            return issue("content_validation_failed", "/", "Invalid JSON, schema, or unresolved local reference");
        }
    }

    /** Used at registration as well as admission: reject unbounded or incomplete resource closures. */
    public static List<Issue> inspectDefinition(ContentTypeDefinition definition) {
        try {
            if (definition.validation() != null) validateDeclaration(definition.validation());
            SchemaRegistry registry = registry(definition.schemaResources());
            if (definition.validation() != null && definition.validation().schemaRef() != null) {
                String reference = definition.validation().schemaRef();
                requireResource(
                        URI.create(reference), definition.schemaResources().keySet());
                registry.getSchema(SchemaLocation.of(reference)).initializeValidators();
            }
            return List.of();
        } catch (IllegalArgumentException | JacksonException | SchemaException | FailFastAssertionException e) {
            return issue("invalid_content_schema", "/validation", safe(e.getMessage()));
        }
    }

    private static void validateDeclaration(ContentTypeDefinition.Validation declaration) {
        if (declaration.encoding() == null || !Set.of("text", "json").contains(declaration.encoding()))
            throw new IllegalArgumentException("Content encoding must be text or json");
        String pointer = declaration.instanceSchemaPointer();
        if (pointer != null
                && (!pointer.startsWith("/interpretation/")
                        || pointer.length() > 512
                        || pointer.matches(".*~(?![01]).*")))
            throw new IllegalArgumentException("Instance schema pointer must locate interpretation metadata");
    }

    private static SchemaRegistry registry(Map<String, String> resources) {
        if (resources.size() > 64) throw new IllegalArgumentException("At most 64 schema resources");
        int total = 0;
        var parsed = new LinkedHashMap<String, JsonNode>();
        var identities = new HashSet<String>(resources.keySet());
        for (var entry : resources.entrySet()) {
            requireHttp(URI.create(entry.getKey()));
            total += bytes(entry.getValue());
            if (total > MAX_SCHEMA_BYTES) throw new IllegalArgumentException("Schema resources exceed 2 MiB");
            JsonNode schema = JSON.readTree(entry.getValue());
            requireSchema(schema);
            parsed.put(entry.getKey(), schema);
            collectIds(schema, URI.create(entry.getKey()), identities);
        }
        for (var entry : parsed.entrySet())
            localReferences(entry.getValue(), URI.create(entry.getKey()), identities, new HashSet<>());
        SchemaRegistry registry = SchemaRegistry.withDefaultDialect(
                SpecificationVersion.DRAFT_2020_12,
                builder -> builder.schemas(resources).schemaLoader(loader -> loader.fetchRemoteResources(false)));
        Schema meta = registry.getSchema(SchemaLocation.of(DIALECT));
        for (var entry : parsed.entrySet()) {
            if (!meta.validate(entry.getValue()).isEmpty())
                throw new IllegalArgumentException("Invalid schema resource");
            registry.getSchema(SchemaLocation.of(entry.getKey())).initializeValidators();
        }
        return registry;
    }

    private static void requireSchema(JsonNode schema) {
        bounded(schema, 0, new int[1]);
        if (schema == null || (!schema.isObject() && !schema.isBoolean()))
            throw new IllegalArgumentException("Schema must be an object or boolean");
    }

    private static void collectIds(JsonNode schema, URI base, Set<String> identities) {
        if (schema == null || !schema.isObject()) return;
        URI current = schema.has("$id") ? base.resolve(schema.path("$id").asString()) : base;
        requireHttp(current);
        identities.add(withoutFragment(current));
        children(schema, child -> collectIds(child, current, identities));
    }

    private static void localReferences(JsonNode schema, URI base, Set<String> resources, Set<String> localIds) {
        if (schema == null || !schema.isObject()) return;
        URI current = schema.has("$id") ? base.resolve(schema.path("$id").asString()) : base;
        requireHttp(current);
        localIds.add(withoutFragment(current));
        if (schema.has("$schema") && !DIALECT.equals(schema.path("$schema").asString()))
            throw new IllegalArgumentException("Use JSON Schema draft 2020-12");
        for (String key : List.of("$ref", "$dynamicRef")) {
            if (!schema.has(key)) continue;
            if (!schema.path(key).isString()) throw new IllegalArgumentException("Schema reference must be a string");
            URI target = current.resolve(schema.path(key).asString());
            if (!localIds.contains(withoutFragment(target))) requireResource(target, resources);
        }
        children(schema, child -> localReferences(child, current, resources, localIds));
    }

    /** Traverse schema locations, leaving const/default/examples and other instance annotations untouched. */
    private static void children(JsonNode schema, java.util.function.Consumer<JsonNode> visitor) {
        for (String key : List.of(
                "additionalProperties",
                "unevaluatedProperties",
                "propertyNames",
                "items",
                "contains",
                "unevaluatedItems",
                "not",
                "if",
                "then",
                "else",
                "contentSchema")) visitor.accept(schema.get(key));
        for (String key : List.of("allOf", "anyOf", "oneOf", "prefixItems")) {
            JsonNode values = schema.get(key);
            if (values != null && values.isArray()) for (JsonNode child : values) visitor.accept(child);
        }
        for (String key : List.of("$defs", "properties", "patternProperties", "dependentSchemas")) {
            JsonNode values = schema.get(key);
            if (values != null && values.isObject()) for (JsonNode child : values) visitor.accept(child);
        }
    }

    private static void requireResource(URI reference, Set<String> resources) {
        requireHttp(reference);
        if (!resources.contains(withoutFragment(reference)))
            throw new IllegalArgumentException("Schema reference is outside the frozen resource closure");
    }

    private static void requireHttp(URI uri) {
        if (uri.getScheme() == null || !Set.of("https", "http").contains(uri.getScheme()) || uri.getHost() == null)
            throw new IllegalArgumentException("Schema identifiers must be absolute HTTP(S) URIs; I/O is disabled");
    }

    private static String withoutFragment(URI uri) {
        String value = uri.toString();
        int fragment = value.indexOf('#');
        return fragment < 0 ? value : value.substring(0, fragment);
    }

    private static int bytes(String value) {
        if (value == null) throw new IllegalArgumentException("Missing schema source");
        return value.getBytes(StandardCharsets.UTF_8).length;
    }

    private static void bounded(JsonNode node, int depth, int[] nodes) {
        if (++nodes[0] > MAX_NODES || depth > 64)
            throw new IllegalArgumentException("Content structure exceeds validation limits");
        if (node != null && node.isContainer()) for (JsonNode child : node) bounded(child, depth + 1, nodes);
    }

    private static List<Issue> validation(Schema schema, JsonNode value, String code) {
        return schema.validate(value).stream()
                .limit(50)
                .map(error -> new Issue(code, error.getInstanceLocation().toString(), null, safe(error.getMessage())))
                .toList();
    }

    private static List<Issue> issue(String code, String path, String detail) {
        return List.of(new Issue(code, path, null, detail));
    }

    private static String safe(String detail) {
        return detail == null ? "Content validation failed" : detail.substring(0, Math.min(512, detail.length()));
    }

    private static Map<String, ContentTypeDefinition> templates() {
        var descriptors = JSON.readValue(resource("/content-plugins.json"), ContentPluginDescriptors.class);
        var manifest = JSON.readValue(resource("/content-schemas/manifest.json"), SchemaManifest.class);
        var result = new LinkedHashMap<String, ContentTypeDefinition>();
        for (var type : descriptors.types()) {
            var resources = new LinkedHashMap<>(type.schemaResources());
            for (String uri : manifest.types().getOrDefault(type.id(), List.of()))
                resources.put(
                        uri, resource("/content-schemas/" + manifest.resources().get(uri)));
            result.put(type.id(), type.definition(resources));
        }
        return Map.copyOf(result);
    }

    private static String resource(String path) {
        try (var input = ContentValidation.class.getResourceAsStream(path)) {
            if (input == null) throw new IllegalStateException("Missing trusted content resource: " + path);
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read trusted content resource", e);
        }
    }

    private record SchemaManifest(int version, Map<String, String> resources, Map<String, List<String>> types) {}
}
