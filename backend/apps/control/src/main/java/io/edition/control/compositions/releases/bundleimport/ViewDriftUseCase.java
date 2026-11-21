package io.edition.control.compositions.releases.bundleimport;

import static io.edition.control.compositions.releases.bundleimport.BundleImportTypes.*;

import io.edition.control.compositions.DriftFacts;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.releases.release.ReleaseAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewDriftUseCase {

    private final TenantAccess tenants;

    private final ReleaseAccess access;

    private final DriftFacts drift;

    ViewDriftUseCase(BundleImportDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.drift = dependencies.drift;
    }

    @Transactional(readOnly = true)
    public DriftBoard viewDrift(String credential, UUID tenant, UUID space) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            access.space(tenant, space);
            access.require(credential, tenant, space, TenantAccess.READ);
            return tenants.inTenant(tenant, () -> {
                var board = drift.board(space);
                return new DriftBoard(
                        board.driftCount(),
                        board.items().stream()
                                .map(item -> new DriftItem(item.pageId(), item.slug(), item.title(), item.externalId()))
                                .toList());
            });
        }
    }
}
