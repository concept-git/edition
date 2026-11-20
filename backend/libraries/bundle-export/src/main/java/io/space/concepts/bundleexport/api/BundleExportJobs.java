package io.space.concepts.bundleexport.api;

import java.time.Instant;
import java.util.*;

public interface BundleExportJobs {
    record View(
            UUID id,
            UUID spaceId,
            UUID releaseId,
            String status,
            int attempts,
            String error,
            String traceId,
            Instant createdAt,
            Instant expiresAt,
            Long bytes) {}

    record Lease(UUID id, UUID tenant, UUID token, int attempts, ExportSnapshot snapshot, Instant expiresAt) {}

    record Pending(UUID tenant, UUID id) {}

    record Stored(View view, Set<UUID> pageIds, String outputKey) {}

    record Page(List<View> items, String nextCursor) {
        public Page {
            items = List.copyOf(items);
        }
    }

    View enqueue(
            UUID id, UUID tenant, UUID space, UUID release, ExportSnapshot snapshot, Instant expiresAt, String trace);

    Optional<Stored> find(UUID space, UUID id);

    Optional<View> view(UUID space, UUID id);

    Page list(UUID space, UUID release, String cursor, int limit);

    List<Pending> pending(int limit);

    Optional<Lease> claim(UUID id);

    boolean heartbeat(Lease lease);

    void complete(Lease lease, String output, long bytes);

    void fail(Lease lease, String error, boolean retry);

    boolean retry(UUID space, UUID id);

    void outputMissing(UUID space, UUID id, String expectedKey);

    boolean referencesObject(String key);

    void terminateSpace(UUID space);

    void expire();
}
