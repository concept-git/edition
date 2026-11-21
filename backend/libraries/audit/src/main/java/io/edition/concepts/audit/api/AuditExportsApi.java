package io.edition.concepts.audit.api;

import java.time.Instant;
import java.util.*;

public interface AuditExportsApi {
    Entry create(UUID tenant, UUID actor, AuditApi.Filter filter, Instant cutoff);

    Optional<Entry> view(UUID id);

    List<Entry> claim();

    boolean renew(Entry entry);

    void finish(Entry entry, String objectKey, String error);

    record Entry(
            UUID id,
            UUID tenantId,
            UUID actorId,
            AuditApi.Filter filter,
            Instant cutoff,
            String status,
            String objectKey,
            String error,
            UUID token,
            Instant expiresAt) {}
}
