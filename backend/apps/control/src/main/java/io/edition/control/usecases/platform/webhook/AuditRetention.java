package io.edition.control.usecases.platform.webhook;

import io.edition.control.modules.audit.api.AuditApi;
import io.edition.control.modules.tenantregistry.api.*;
import java.time.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AuditRetention {
    private final AuditApi audit;
    private final Duration retention;
    private final Clock clock;

    public AuditRetention(
            AuditApi audit, Clock clock, @Value("${io.edition.audit.retention:P180D}") Duration retention) {
        if (retention.isNegative() || retention.isZero())
            throw new IllegalArgumentException("audit retention must be positive");
        this.audit = audit;
        this.clock = clock;
        this.retention = retention;
    }

    public void retain() {
        audit.retain(clock.instant().minus(retention));
    }
}
