package io.edition.control.usecases.authoring.termination;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.usecases.access.TenantAccess;
import java.time.Clock;
import java.time.Duration;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** One bounded scan of expired pages; both the scheduler and operator entry use this rule. */
@Component
public class ExpiredTrashPurge {
    private final TenantAccess tenants;
    private final TerminalResources resources;
    private final PageApi pages;
    private final Clock clock;
    private final Duration retention;

    ExpiredTrashPurge(
            TenantAccess tenants,
            TerminalResources resources,
            PageApi pages,
            Clock clock,
            @Value("${io.edition.trash.retention:P30D}") Duration retention) {
        if (retention.isNegative() || retention.isZero()) {
            throw new IllegalArgumentException("trash retention must be positive");
        }
        this.tenants = tenants;
        this.resources = resources;
        this.pages = pages;
        this.clock = clock;
        this.retention = retention;
    }

    @Transactional
    public TerminationTypes.PurgeReport scan(UUID tenant) {
        return tenants.inTenant(tenant, () -> {
            int scanned = 0, purged = 0;
            UUID after = null;
            do {
                var candidates = pages.expired(clock.instant().minus(retention), after, 100);
                for (var candidate : candidates) {
                    scanned++;
                    after = candidate.value();
                    if (resources.purge(tenant, candidate.value(), retention)) purged++;
                }
                if (candidates.size() < 100) break;
            } while (after != null);
            return new TerminationTypes.PurgeReport(scanned, purged, scanned - purged);
        });
    }
}
