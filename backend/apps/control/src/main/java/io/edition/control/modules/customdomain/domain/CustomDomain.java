package io.edition.control.modules.customdomain.domain;

import io.edition.control.modules.customdomain.api.*;
import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.modules.customdomain.api.Host;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public final class CustomDomain {
    private final Host host;
    private final UUID target;
    private boolean verified;
    private boolean primary;
    private final String dnsToken;
    private final Instant createdAt;

    public CustomDomain(Host host, UUID target, boolean verified, boolean primary, String dnsToken, Instant createdAt) {
        this.host = Objects.requireNonNull(host, "host");
        this.target = Objects.requireNonNull(target, "target");
        this.verified = verified;
        this.primary = primary;
        this.dnsToken = Objects.requireNonNull(dnsToken, "dns token");
        this.createdAt = Objects.requireNonNull(createdAt, "created at");
        if (primary && !verified) throw new NotVerified();
    }

    public boolean verify(String token) {
        Objects.requireNonNull(token, "dns token");
        if (verified) return false;
        if (!dnsToken.equals(token)) throw new NotProven();
        verified = true;
        return true;
    }

    public boolean setPrimary() {
        if (!verified) throw new NotVerified();
        if (primary) return false;
        primary = true;
        return true;
    }

    public void clearPrimary() {
        primary = false;
    }

    public CustomDomainApi.View view() {
        return new CustomDomainApi.View(host.value(), target, verified, primary, dnsToken, createdAt);
    }

    public Host host() {
        return host;
    }

    public UUID target() {
        return target;
    }

    public boolean verified() {
        return verified;
    }

    public boolean primary() {
        return primary;
    }

    public String dnsToken() {
        return dnsToken;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public static final class NotProven extends RuntimeException {}

    public static final class NotVerified extends RuntimeException {}
}
