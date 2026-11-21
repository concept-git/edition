package io.edition.control.compositions.platform.operations;

import static io.edition.control.compositions.platform.operations.OperationsTypes.*;

import io.edition.concepts.importjob.api.ImportJobApi;
import io.edition.control.compositions.*;
import java.time.*;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class OperationsTypes {
    private OperationsTypes() {}

    public record StorageRetry(int retriedObjects) {}

    public record StorageUsage(
            Long sourceObjects, Long sourceBytes, Instant measuredAt, long databaseBytes, long failedSourceObjects) {}

    public record Choice(UUID id, String name) {}

    public record Capabilities(
            boolean audit, boolean webhooks, boolean tenantStats, List<Choice> spaces, List<Choice> sites) {}

    public record ExportContent(java.io.InputStream stream, String filename) {}

    public record ExportStatus(UUID id, String status, String error, Instant expiresAt) {
        static ExportStatus of(io.edition.concepts.audit.api.AuditExportsApi.Entry e) {
            return new ExportStatus(e.id(), e.status(), e.error(), e.expiresAt());
        }
    }

    public record AuditFilter(
            UUID actor, String action, UUID target, String outcome, Instant from, Instant to, Long cursor) {}

    public record AuditItem(
            long id,
            UUID eventId,
            UUID rootId,
            Instant time,
            String kind,
            String actorType,
            UUID actorId,
            String actorName,
            String action,
            String targetType,
            UUID targetId,
            String outcome,
            String ip,
            String requestId,
            UUID credentialId) {}

    public record AuditPage(List<AuditItem> items, Long nextCursor, Long total) {}

    public record Job(
            UUID id,
            UUID tenantId,
            UUID spaceId,
            String type,
            String status,
            String phase,
            Integer done,
            Integer total,
            int attempt,
            Instant nextRunAt,
            String outcome,
            String traceId,
            Set<String> allowedActions) {
        static Job of(ImportJobApi.View j, boolean retry) {
            return new Job(
                    j.id(),
                    j.tenantId(),
                    j.spaceId(),
                    "import",
                    j.status(),
                    j.phase(),
                    j.progressDone(),
                    j.progressTotal(),
                    j.attempt(),
                    j.nextRunAt(),
                    j.outcome(),
                    j.traceId(),
                    retry ? Set.of("retry") : Set.of());
        }
    }

    public record JobPage(List<Job> items, UUID nextCursor, Long total) {}
}
