package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import java.time.Instant;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class PluginManagementTypes {
    private PluginManagementTypes() {}

    public record Descriptor(
            String id,
            String name,
            String version,
            List<String> contentTypes,
            List<String> formats,
            List<String> capabilities,
            boolean trusted) {}

    public record Catalog(List<Descriptor> items, String productionLoading, boolean canDevelop) {}

    public record Source(
            Map<String, String> files,
            String manifest,
            String configuration,
            String fixtures,
            String dependencyLock,
            String baselineRef) {}

    public record Development(
            UUID id,
            String name,
            String contentType,
            int revision,
            Source source,
            String sourceDigest,
            Instant createdAt,
            Instant updatedAt) {}

    public record Candidate(
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

    public record Check(String name, boolean passed, String message) {}

    public record Evidence(boolean passed, List<Check> checks) {}

    public record Verification(
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

    public record DevelopmentSummary(
            UUID id,
            String name,
            String contentType,
            int revision,
            String sourceDigest,
            Instant createdAt,
            Instant updatedAt) {}

    public record CandidateSummary(
            UUID id,
            UUID developmentId,
            int sourceRevision,
            String sourceDigest,
            String bundleDigest,
            String entryPoint,
            String environment,
            Instant createdAt) {}

    public record DevelopmentList(List<DevelopmentSummary> items) {}

    public record CandidateList(List<CandidateSummary> items) {}

    public record VerificationSummary(
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

    public record VerificationList(List<VerificationSummary> items) {}

    public record Removed(UUID id) {}
}
