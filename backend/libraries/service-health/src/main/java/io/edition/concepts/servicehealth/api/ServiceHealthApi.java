package io.edition.concepts.servicehealth.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public interface ServiceHealthApi {
    /** Upsert this process's heartbeat; the caller owns the (short) transaction. */
    void beat(String service, String instance, String version, Map<String, Object> details);

    /** Every known heartbeat row, newest first. */
    List<Heartbeat> heartbeats();

    /** Current database size in bytes; unavailable database failures propagate to the caller. */
    long databaseBytes();

    record Heartbeat(String service, String instance, String version, Instant seenAt, Map<String, Object> details) {}
}
