package io.edition.concepts.mailoutbox.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Durable delivery protocol; payloads are internal and never returned by HTTP. */
public interface MailDeliveryApi {
    Optional<Lease> claim();

    Map<String, String> payload(Lease lease);

    boolean prepare(Lease lease, Map<String, String> payload);

    void accepted(Lease lease);

    void obsolete(Lease lease);

    void failed(Lease lease, String code, boolean retryable);

    List<View> list(UUID tenant, io.edition.shared.KeysetCursor before, int limit);

    Optional<View> view(UUID id);

    boolean retry(UUID id);

    void eraseRecipient(String recipient);

    record Lease(UUID id, UUID token, String kind, String recipient, String encryptedPayload, int attempt) {}

    record View(
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
            boolean canRetry) {}
}
