package io.edition.concepts.deletionrecovery.api;

import java.time.Instant;
import java.util.*;

public interface DeletionRecoveryApi {
    void boundLockWait();

    void lockSpace(UUID space);

    Deletion deleted(UUID tenant, String type, UUID target, UUID actor, Set<String> objects, Set<UUID> sites);

    Optional<Deletion> deletion(UUID target);

    List<Deletion> deletions(UUID before, int limit);

    void finish(UUID target, String status, String error);

    void retry(UUID target);

    record Deletion(
            UUID id,
            UUID tenantId,
            String resourceType,
            UUID resourceId,
            UUID actorId,
            String status,
            String error,
            Set<String> objects,
            Set<UUID> sites,
            Instant createdAt) {}
}
