package io.edition.control.compositions.platform.webhook;

import io.edition.concepts.audit.api.AuditApi;
import io.edition.concepts.tenantregistry.api.*;
import java.time.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "io.edition.operations.scheduling-enabled", havingValue = "true", matchIfMissing = true)
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

    @Scheduled(initialDelay = 60000, fixedDelay = 3600000)
    public void retain() {
        audit.retain(clock.instant().minus(retention));
    }
}
