package io.edition.control.usecases.authoring.termination;

import static io.edition.control.usecases.authoring.termination.TerminationTypes.*;

import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeleteSiteUseCase {

    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;
    private final TerminalResources resources;

    DeleteSiteUseCase(TerminationDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.idempotency = dependencies.idempotency;
        this.resources = dependencies.resources;
    }

    @Transactional
    public FlowResponse<Deletion> deleteSite(String credential, UUID tenant, UUID site, String name, String key) {
        var principal = tenants.admitUser(credential, tenant);
        try {
            return idempotency.execute(
                    principal.principal(),
                    key,
                    "site.delete",
                    IdempotentFlowExecutor.canonical(tenant, site, name),
                    200,
                    Deletion.class,
                    () -> tenants.inTenant(tenant, () -> {
                        tenants.requireUser(
                                credential,
                                tenant,
                                List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)),
                                TenantAccess.ADMIN);
                        return Deletion.from(resources.site(
                                tenant, site, principal.principal().id(), name));
                    }));
        } catch (org.springframework.dao.CannotAcquireLockException busy) {
            throw new TerminationErrors.Busy();
        }
    }
}
