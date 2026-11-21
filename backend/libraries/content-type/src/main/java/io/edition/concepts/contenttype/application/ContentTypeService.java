package io.edition.concepts.contenttype.application;

import io.edition.concepts.contenttype.api.*;
import io.edition.concepts.contenttype.api.ContentTypeApi;
import io.edition.concepts.contenttype.application.ports.ContentTypeRepository;
import io.edition.content.*;
import io.edition.shared.Sha256;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

@Service
@Transactional
class ContentTypeService implements ContentTypeApi {
    private final ContentTypeRepository store;
    private final JsonMapper json;
    private final Clock clock;
    private final Map<String, Version> templates;
    private final List<Implementation> implementations;
    private final Set<String> editors = new HashSet<>(), renderers = new HashSet<>();

    ContentTypeService(ContentTypeRepository store, JsonMapper json, Clock clock) {
        this.store = store;
        this.json = json;
        this.clock = clock;
        try {
            var descriptors = json.readValue(resource("/content-plugins.json"), ContentPluginDescriptors.class);
            var manifest = json.readTree(resource("/content-schemas/manifest.json"));
            var loaded = new LinkedHashMap<String, Version>();
            for (var type : descriptors.types()) {
                var resources = new TreeMap<>(type.schemaResources());
                for (var uri : manifest.path("types").path(type.id())) {
                    String key = uri.asString();
                    resources.put(
                            key,
                            resource("/content-schemas/"
                                    + manifest.path("resources").path(key).asString()));
                }
                var definition = type.definition(resources);
                String digest = digest(definition);
                loaded.put(type.id(), new Version("builtin:" + type.id() + ":" + digest, digest, definition, null));
            }
            templates = Map.copyOf(loaded);
            var projected = new ArrayList<Implementation>();
            for (var plugin : descriptors.plugins()) {
                var m = plugin.manifest();
                for (var view : m.editors()) editors.add(key(m.id(), m.version(), view.id()));
                for (var view : m.renderers()) renderers.add(key(m.id(), m.version(), view.id()));
                var caps = new ArrayList<String>();
                if (!m.editors().isEmpty()) caps.add("source-edit");
                if (!m.renderers().isEmpty()) caps.add("preview");
                caps.addAll(List.of("validate", "export"));
                projected.add(new Implementation(
                        m.id(),
                        m.name(),
                        m.version(),
                        m.contentTypes(),
                        m.contentTypes().stream()
                                .map(t -> templates.get(t).definition().format())
                                .distinct()
                                .toList(),
                        caps,
                        true));
            }
            implementations = List.copyOf(projected);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot load trusted content definitions", e);
        }
    }

    public List<State> list() {
        var result = new TreeMap<String, State>();
        templates.forEach((id, v) -> result.put(id, initial(v)));
        for (var value : store.states()) {
            var state = json.readValue(value, State.class);
            result.put(state.contentType(), state);
        }
        return List.copyOf(result.values());
    }

    public List<Implementation> implementations() {
        return implementations;
    }

    public List<VersionSummary> versions(String type) {
        var result = new ArrayList<VersionSummary>();
        var builtin = templates.get(type);
        if (builtin != null) result.add(summary(builtin));
        for (var value : store.versions(type)) result.add(json.readValue(value, VersionSummary.class));
        return List.copyOf(result);
    }

    public Optional<Version> version(String reference) {
        if (reference == null) return Optional.empty();
        var builtin = templates.values().stream()
                .filter(v -> v.versionRef().equals(reference))
                .findFirst();
        if (builtin.isPresent()) return builtin;
        try {
            return store.version(UUID.fromString(reference)).map(s -> json.readValue(s, Version.class));
        } catch (IllegalArgumentException invalid) {
            return Optional.empty();
        }
    }

    public Optional<Version> matching(String type, String digest) {
        var builtin = templates.get(type);
        if (builtin != null && builtin.digest().equals(digest)) return Optional.of(builtin);
        return store.matching(type, digest).map(s -> json.readValue(s, Version.class));
    }

    public Optional<String> formatOf(String type) {
        return state(type)
                .flatMap(s -> version(s.activeVersionRef()))
                .map(v -> v.definition().format());
    }

    @Transactional(
            readOnly = true,
            noRollbackFor = {Invalid.class, Missing.class})
    public ContentTypeSnapshot resolve(String type, String reference, boolean requireEnabled) {
        var state = state(type).orElseThrow(Missing::new);
        if (requireEnabled && !state.enabled()) throw new Invalid("contentType", "content_type_disabled");
        // A missing reference is a fixed legacy template, never the mutable default pointer.
        Version value = reference == null
                ? Optional.ofNullable(templates.get(type)).orElseThrow(Missing::new)
                : version(reference).orElseThrow(Missing::new);
        if (!value.definition().id().equals(type)) throw new Invalid("versionRef", "content_type_mismatch");
        return value.snapshot();
    }

    public Version registerVersion(String type, int base, ContentTypeDefinition definition) {
        validate(type, definition);
        store.serialize(type);
        var old = state(type).orElse(null);
        baseline(old, base);
        if (store.versionExists(type, definition.version())) throw new Invalid("definition.version", "version_exists");
        var value = new Version(UUID.randomUUID().toString(), digest(definition), definition, clock.instant());
        store.version(UUID.fromString(value.versionRef()), type, definition.version(), json.writeValueAsString(value));
        if (old == null || old.revision() == 0) saveState(value, true, base + 1);
        else
            store.state(
                    type,
                    json.writeValueAsString(new State(
                            type,
                            old.enabled(),
                            base + 1,
                            old.activeVersionRef(),
                            old.label(),
                            old.format(),
                            old.mediaType(),
                            false)));
        return value;
    }

    public State activate(String type, int base, String reference) {
        store.serialize(type);
        var old = state(type).orElseThrow(Missing::new);
        baseline(old, base);
        var value = version(reference).orElseThrow(Missing::new);
        if (!value.definition().id().equals(type)) throw new Invalid("versionRef", "content_type_mismatch");
        return saveState(value, true, base + 1);
    }

    public State deactivate(String type, int base) {
        store.serialize(type);
        var old = state(type).orElseThrow(Missing::new);
        baseline(old, base);
        return saveState(version(old.activeVersionRef()).orElseThrow(Missing::new), false, base + 1);
    }

    public Optional<State> state(String type) {
        return store.state(type)
                .map(s -> json.readValue(s, State.class))
                .or(() -> Optional.ofNullable(templates.get(type)).map(this::initial));
    }

    private State initial(Version v) {
        var d = v.definition();
        return new State(d.id(), true, 0, v.versionRef(), d.label(), d.format(), d.mediaType(), true);
    }

    private State saveState(Version v, boolean enabled, int revision) {
        var d = v.definition();
        var s = new State(d.id(), enabled, revision, v.versionRef(), d.label(), d.format(), d.mediaType(), false);
        store.state(d.id(), json.writeValueAsString(s));
        return s;
    }

    private void baseline(State state, int base) {
        int current = state == null ? 0 : state.revision();
        if (current != base) throw new Conflict(current);
    }

    private VersionSummary summary(Version v) {
        return new VersionSummary(
                v.versionRef(), v.definition().id(), v.definition().version(), v.digest(), v.createdAt());
    }

    private String digest(ContentTypeDefinition d) {
        return Sha256.hex(JsonValues.canonical(json.convertValue(d, Map.class)));
    }

    private String key(String plugin, String version, String view) {
        return plugin + "@" + version + "/" + view;
    }

    private void validate(String type, ContentTypeDefinition d) {
        if (d == null
                || !Objects.equals(type, d.id())
                || type == null
                || type.isBlank()
                || type.length() > 128
                || type.chars().anyMatch(c -> Character.isWhitespace(c) || Character.isISOControl(c)))
            throw new Invalid("contentType", "invalid_type");
        for (var field : List.of(
                Objects.toString(d.version(), ""),
                Objects.toString(d.label(), ""),
                Objects.toString(d.mediaType(), ""),
                Objects.toString(d.language(), "")))
            if (field.isBlank() || field.length() > 200) throw new Invalid("definition", "invalid_metadata");
        if (DocumentFormat.fromWire(d.format()).isEmpty()
                || !("server".equals(d.renderHost()) || "browser".equals(d.renderHost())))
            throw new Invalid("definition", "invalid_format_or_host");
        if (d.renderers().isEmpty() || d.editors().size() > 50 || d.renderers().size() > 50)
            throw new Invalid("definition", "invalid_contributions");
        for (var view : d.editors())
            if (!editors.contains(key(view.pluginId(), view.pluginVersion(), view.contributionId())))
                throw new Invalid("definition.editors", "untrusted_contribution");
        for (var view : d.renderers())
            if (!renderers.contains(key(view.pluginId(), view.pluginVersion(), view.contributionId())))
                throw new Invalid("definition.renderers", "untrusted_contribution");
        if (json.writeValueAsBytes(d).length > 2 * 1024 * 1024
                || d.schemaResources().size() > 64) throw new Invalid("definition", "too_large");
    }

    private String resource(String path) throws IOException {
        try (var input = getClass().getResourceAsStream(path)) {
            if (input == null) throw new IllegalStateException("Missing trusted resource: " + path);
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
