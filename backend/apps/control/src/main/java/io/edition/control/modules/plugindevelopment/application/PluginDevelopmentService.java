package io.edition.control.modules.plugindevelopment.application;

import io.edition.control.modules.plugindevelopment.api.*;
import io.edition.control.modules.plugindevelopment.api.PluginDevelopmentApi;
import io.edition.control.modules.plugindevelopment.application.ports.DevelopmentRepository;
import io.edition.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

@Service
@Transactional
class PluginDevelopmentService implements PluginDevelopmentApi {
    private static final JsonMapper SOURCE_JSON = JsonMapper.builder()
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
            .build();
    private final DevelopmentRepository store;
    private final JsonMapper json;
    private final Clock clock;

    PluginDevelopmentService(DevelopmentRepository store, JsonMapper json, Clock clock) {
        this.store = store;
        this.json = json;
        this.clock = clock;
    }

    public Development create(String name, String type, Source source) {
        validate(name, type, source);
        var now = clock.instant();
        var value = new Development(UUID.randomUUID(), name, type, 1, source, digest(source), now, now);
        store.insert(value.id(), json.writeValueAsString(value));
        return value;
    }

    public Development save(UUID id, int base, String name, String type, Source source) {
        validate(name, type, source);
        var old = locked(id);
        if (old.revision() != base) throw new Conflict(old.revision());
        var value = new Development(id, name, type, base + 1, source, digest(source), old.createdAt(), clock.instant());
        store.save(id, json.writeValueAsString(value));
        return value;
    }

    public Optional<Development> find(UUID id) {
        return store.find(id, false).map(s -> json.readValue(s, Development.class));
    }

    public List<DevelopmentSummary> list() {
        return store.list().stream()
                .map(s -> json.readValue(s, DevelopmentSummary.class))
                .toList();
    }

    public void delete(UUID id, int base) {
        var old = locked(id);
        if (old.revision() != base) throw new Conflict(old.revision());
        store.delete(id);
    }

    public Candidate compile(UUID id, int base, String expected, String entry, String bundle, String environment) {
        var old = locked(id);
        if (old.revision() != base) throw new Conflict(old.revision());
        if (!old.sourceDigest().equals(expected)) throw new Invalid("sourceDigest", "digest_mismatch");
        if (!"browser-es2022-v1".equals(environment)) throw new Invalid("environment", "unsupported_environment");
        if (entry == null || !old.source().files().containsKey(entry)) throw new Invalid("entryPoint", "missing_entry");
        if (bundle == null
                || bundle.isBlank()
                || bundle.indexOf(0) >= 0
                || bundle.getBytes(StandardCharsets.UTF_8).length > 8 * 1024 * 1024)
            throw new Invalid("bundle", "invalid_size");
        var c = new Candidate(
                UUID.randomUUID(),
                id,
                base,
                expected,
                Sha256.hex(bundle),
                entry,
                bundle,
                environment,
                old.source(),
                clock.instant());
        store.candidate(c.id(), id, json.writeValueAsString(c));
        return c;
    }

    public List<CandidateSummary> candidates(UUID id) {
        if (!store.exists(id)) throw new Missing();
        return store.candidates(id).stream()
                .map(s -> json.readValue(s, CandidateSummary.class))
                .toList();
    }

    public Optional<Candidate> candidate(UUID development, UUID id) {
        return store.candidate(development, id).map(s -> json.readValue(s, Candidate.class));
    }

    private Development locked(UUID id) {
        return store.find(id, true)
                .map(s -> json.readValue(s, Development.class))
                .orElseThrow(Missing::new);
    }

    private String digest(Source source) {
        return Sha256.hex(json.writeValueAsString(source));
    }

    private void validate(String name, String type, Source source) {
        if (name == null || name.isBlank() || name.length() > 200) throw new Invalid("name", "invalid_name");
        if (type == null
                || type.isBlank()
                || type.length() > 128
                || type.chars().anyMatch(c -> Character.isWhitespace(c) || Character.isISOControl(c)))
            throw new Invalid("contentType", "invalid_type");
        if (source == null || source.files().isEmpty() || source.files().size() > 100)
            throw new Invalid("source.files", "invalid_count");
        for (var e : source.files().entrySet())
            if (e.getKey().isBlank()
                    || e.getKey().length() > 2048
                    || e.getKey().chars().anyMatch(c -> c < 32)
                    || e.getKey().startsWith("/")
                    || e.getKey().contains("\\")
                    || Arrays.asList(e.getKey().split("/")).contains("..")
                    || e.getValue() == null
                    || e.getValue().indexOf(0) >= 0) throw new Invalid("source.files", "invalid_path");
        if (json.writeValueAsBytes(source).length > 8 * 1024 * 1024) throw new Invalid("source", "too_large");
        for (var e : Map.of(
                        "manifest",
                        Objects.toString(source.manifest(), ""),
                        "configuration",
                        Objects.toString(source.configuration(), ""),
                        "fixtures",
                        Objects.toString(source.fixtures(), ""),
                        "dependencyLock",
                        Objects.toString(source.dependencyLock(), ""))
                .entrySet()) {
            try {
                if (e.getValue().indexOf(0) >= 0 || SOURCE_JSON.readTree(e.getValue()) == null)
                    throw new Invalid("source." + e.getKey(), "invalid_json");
            } catch (tools.jackson.core.JacksonException invalid) {
                throw new Invalid("source." + e.getKey(), "invalid_json");
            }
        }
    }
}
