package io.edition.concepts.pluginverification.api;

import java.time.Instant;
import java.util.*;

public interface PluginVerificationApi {
    Verification record(Input input, List<Check> serverChecks);

    Optional<Verification> find(UUID id);

    List<VerificationSummary> list(UUID developmentId);

    record Check(String name, boolean passed, String message) {}

    record Evidence(boolean passed, List<Check> checks) {
        public Evidence {
            checks = checks == null ? List.of() : List.copyOf(checks);
        }
    }

    record Input(
            UUID developmentId,
            UUID candidateId,
            String sourceDigest,
            String bundleDigest,
            String fixtureDigest,
            String environment,
            Evidence browserEvidence) {}

    record Verification(
            UUID id,
            UUID developmentId,
            UUID candidateId,
            String sourceDigest,
            String bundleDigest,
            String fixtureDigest,
            String environment,
            Evidence browserEvidence,
            Evidence serverValidation,
            boolean productionEligible,
            Instant createdAt) {}

    record VerificationSummary(
            UUID id,
            UUID developmentId,
            UUID candidateId,
            String sourceDigest,
            String bundleDigest,
            String fixtureDigest,
            String environment,
            boolean browserPassed,
            boolean serverPassed,
            boolean productionEligible,
            Instant createdAt) {}
}
