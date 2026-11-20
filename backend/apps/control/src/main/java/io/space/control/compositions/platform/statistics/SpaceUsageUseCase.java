package io.space.control.compositions.platform.statistics;

import static io.space.control.compositions.platform.statistics.StatisticsTypes.*;

import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.OperationNotFoundException;
import io.space.control.compositions.resource.ResourceChain;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SpaceUsageUseCase {

    private final UsageProjection usage;
    private final TenantAccess tenants;
    private final ResourceChain resources;

    private final Clock clock;

    SpaceUsageUseCase(StatisticsDependencies dependencies) {
        this.usage = dependencies.usage;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.clock = dependencies.clock;
    }

    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public Usage spaceUsage(String credential, UUID tenant, UUID space, Instant from, Instant to) {
        var range = Range.of(from, to, clock);
        resources.space(tenant, space).orElseThrow(OperationNotFoundException::new);
        tenants.requireUser(
                credential,
                tenant,
                List.of(TenantAccess.tenant(tenant), TenantAccess.space(space)),
                TenantAccess.ADMIN);
        return tenants.inTenant(tenant, () -> usage.usage(tenant, space, range.from(), range.to()));
    }
}
