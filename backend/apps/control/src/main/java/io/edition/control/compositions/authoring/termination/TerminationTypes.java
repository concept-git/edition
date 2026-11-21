package io.edition.control.compositions.authoring.termination;

import static io.edition.control.compositions.authoring.termination.TerminationTypes.*;

import io.edition.concepts.deletionrecovery.api.DeletionRecoveryApi;
import java.time.*;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class TerminationTypes {
    private TerminationTypes() {}

    public record TerminationPlan(
            String resourceType,
            UUID resourceId,
            String validationLevel,
            Instant observedAt,
            Map<String, Long> counts,
            List<String> effects,
            List<String> unknowns) {}

    public record Deletion(
            UUID id, String resourceType, UUID resourceId, String status, String error, Instant createdAt) {
        static Deletion from(DeletionRecoveryApi.Deletion r) {
            return new Deletion(r.id(), r.resourceType(), r.resourceId(), r.status(), r.error(), r.createdAt());
        }
    }

    public record DeletionPage(List<Deletion> items, UUID nextCursor) {}

    public record PurgeReport(int scanned, int purged, int protectedCount) {}
}
