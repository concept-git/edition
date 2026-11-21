package io.edition.concepts.plugindevelopment.api;

import java.time.Instant;
import java.util.*;

public interface PluginDevelopmentApi {
    Development create(String name, String contentType, Source source);

    Development save(UUID id, int baseRevision, String name, String contentType, Source source);

    Optional<Development> find(UUID id);

    List<DevelopmentSummary> list();

    void delete(UUID id, int baseRevision);

    Candidate compile(
            UUID id, int baseRevision, String sourceDigest, String entryPoint, String bundle, String environment);

    List<CandidateSummary> candidates(UUID id);

    Optional<Candidate> candidate(UUID developmentId, UUID id);

    record Source(
            Map<String, String> files,
            String manifest,
            String configuration,
            String fixtures,
            String dependencyLock,
            String baselineRef) {
        public Source {
            files = files == null ? Map.of() : Collections.unmodifiableMap(new TreeMap<>(files));
        }
    }

    record Development(
            UUID id,
            String name,
            String contentType,
            int revision,
            Source source,
            String sourceDigest,
            Instant createdAt,
            Instant updatedAt) {}

    record DevelopmentSummary(
            UUID id,
            String name,
            String contentType,
            int revision,
            String sourceDigest,
            Instant createdAt,
            Instant updatedAt) {}

    record CandidateSummary(
            UUID id,
            UUID developmentId,
            int sourceRevision,
            String sourceDigest,
            String bundleDigest,
            String entryPoint,
            String environment,
            Instant createdAt) {}

    record Candidate(
            UUID id,
            UUID developmentId,
            int sourceRevision,
            String sourceDigest,
            String bundleDigest,
            String entryPoint,
            String bundle,
            String environment,
            Source source,
            Instant createdAt) {}

    final class Invalid extends RuntimeException {
        public final String field;
        public final String reason;

        public Invalid(String f, String r) {
            field = f;
            reason = r;
        }
    }

    final class Conflict extends RuntimeException {
        public final int revision;

        public Conflict(int r) {
            revision = r;
        }
    }

    final class Missing extends RuntimeException {}
}
