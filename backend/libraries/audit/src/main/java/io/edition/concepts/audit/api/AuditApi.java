package io.edition.concepts.audit.api;

import java.time.Instant;
import java.util.*;

public interface AuditApi {
    long append(Event event);

    long appendPlatform(Event event);

    void failed(Event event);

    List<Entry> query(Filter filter, int limit);

    /** 与 query 同一过滤（忽略 before 游标）的总数。 */
    long count(Filter filter);

    void scrub(UUID actor);

    void retain(Instant cutoff);

    record Event(
            UUID tenantId,
            UUID eventId,
            UUID rootId,
            String kind,
            String actorType,
            UUID actorId,
            String action,
            String targetType,
            UUID targetId,
            String outcome,
            String ip,
            String requestId) {}

    record Filter(
            UUID actor,
            String action,
            UUID target,
            String outcome,
            Instant from,
            Instant to,
            Long before,
            boolean platform) {}

    record Entry(
            long id,
            UUID eventId,
            UUID rootId,
            Instant time,
            String kind,
            String actorType,
            UUID actorId,
            String action,
            String targetType,
            UUID targetId,
            String outcome,
            String ip,
            String requestId,
            UUID credentialId) {
        public Entry(
                long id,
                UUID eventId,
                UUID rootId,
                Instant time,
                String kind,
                String actorType,
                UUID actorId,
                String action,
                String targetType,
                UUID targetId,
                String outcome,
                String ip,
                String requestId) {
            this(
                    id,
                    eventId,
                    rootId,
                    time,
                    kind,
                    actorType,
                    actorId,
                    action,
                    targetType,
                    targetId,
                    outcome,
                    ip,
                    requestId,
                    null);
        }
    }
}
