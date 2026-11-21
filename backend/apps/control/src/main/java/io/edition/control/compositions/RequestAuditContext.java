package io.edition.control.compositions;

import java.util.UUID;

/** Ephemeral transport metadata; no HTTP types, credentials or business state. */
public final class RequestAuditContext implements AutoCloseable {
    private static final ThreadLocal<Metadata> CURRENT = new ThreadLocal<>();
    private final Metadata previous;

    private RequestAuditContext(Metadata value) {
        previous = CURRENT.get();
        CURRENT.set(value);
    }

    public static RequestAuditContext open(String actorType, UUID actorId, String ip, String requestId, UUID tenantId) {
        return new RequestAuditContext(
                new Metadata(UUID.randomUUID(), actorType, actorId, ip, requestId, tenantId, false));
    }

    public static RequestAuditContext flow() {
        var m = current();
        return new RequestAuditContext(
                new Metadata(m.rootId(), m.actorType(), m.actorId(), m.ip(), m.requestId(), m.tenantId(), true));
    }

    /** Bind one root occurrence for a direct application entry while preserving transport metadata. */
    public static RequestAuditContext entry() {
        return new RequestAuditContext(current());
    }

    public static Metadata current() {
        var m = CURRENT.get();
        return m == null
                ? new Metadata(UUID.randomUUID(), "system", null, null, org.slf4j.MDC.get("requestId"), null, false)
                : m;
    }

    public void close() {
        if (previous == null) CURRENT.remove();
        else CURRENT.set(previous);
    }

    public record Metadata(
            UUID rootId, String actorType, UUID actorId, String ip, String requestId, UUID tenantId, boolean flow) {}
}
