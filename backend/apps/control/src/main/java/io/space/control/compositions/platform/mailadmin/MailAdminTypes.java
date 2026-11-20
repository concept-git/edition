package io.space.control.compositions.platform.mailadmin;

import static io.space.control.compositions.platform.mailadmin.MailAdminTypes.*;

import io.space.concepts.mailoutbox.api.MailDeliveryApi;
import io.space.control.compositions.*;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class MailAdminTypes {
    private MailAdminTypes() {}

    public record MailJobPage(List<MailJob> items, String nextCursor) {}

    public record MailJob(
            UUID id,
            String kind,
            String recipient,
            UUID tenantId,
            String status,
            int attempt,
            Instant nextRunAt,
            String error,
            UUID traceId,
            String outcome,
            Instant createdAt,
            Instant completedAt,
            boolean canRetry) {
        static MailJob from(MailDeliveryApi.View value, Resolution actor) {
            return new MailJob(
                    value.id(),
                    value.kind(),
                    value.recipient(),
                    value.tenantId(),
                    value.status(),
                    value.attempt(),
                    value.nextRunAt(),
                    value.error(),
                    value.traceId(),
                    value.outcome(),
                    value.createdAt(),
                    value.completedAt(),
                    value.canRetry()
                            && io.space.control.compositions.access.ManagementCapabilities.permits(
                                    actor, "operations:write"));
        }
    }
}
