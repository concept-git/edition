package io.edition.control.usecases.platform.statistics;

import static io.edition.control.usecases.platform.statistics.StatisticsTypes.*;

import io.edition.control.usecases.access.TenantAccess;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class TenantUsageUseCase {

    private final UsageProjection usage;
    private final TenantAccess tenants;

    private final Clock clock;

    TenantUsageUseCase(StatisticsDependencies dependencies) {
        this.usage = dependencies.usage;
        this.tenants = dependencies.tenants;
        this.clock = dependencies.clock;
    }

    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public Usage tenantUsage(String credential, UUID tenant, Instant from, Instant to) {
        var range = Range.of(from, to, clock);
        tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        return tenants.inTenant(tenant, () -> usage.usage(tenant, null, range.from(), range.to()));
    }
}
