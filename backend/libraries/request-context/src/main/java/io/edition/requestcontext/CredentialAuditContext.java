package io.edition.requestcontext;

import java.util.UUID;

/** Request-local credential identity; never contains credential material or business state. */
public final class CredentialAuditContext implements AutoCloseable {
    private static final ThreadLocal<UUID> CURRENT = new ThreadLocal<>();
    private final UUID previous;

    private CredentialAuditContext(UUID id) {
        previous = CURRENT.get();
        if (id == null) CURRENT.remove();
        else CURRENT.set(id);
    }

    public static CredentialAuditContext open(UUID id) {
        return new CredentialAuditContext(id);
    }

    public static UUID current() {
        return CURRENT.get();
    }

    @Override
    public void close() {
        if (previous == null) CURRENT.remove();
        else CURRENT.set(previous);
    }
}
