package io.edition.control.compositions.authoring.termination;

import static io.edition.control.compositions.authoring.termination.TerminationTypes.*;

import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeleteSpaceUseCase {

    private final TenantAccess tenants;
    private final IdempotentFlowExecutor idempotency;
    private final TerminalResources resources;

    DeleteSpaceUseCase(TerminationDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.idempotency = dependencies.idempotency;
        this.resources = dependencies.resources;
    }

    @Transactional
    public FlowResponse<Deletion> deleteSpace(String credential, UUID tenant, UUID space, String name, String key) {
        var principal = tenants.admitUser(credential, tenant);
        try {
            return idempotency.execute(
                    principal.principal(),
                    key,
                    "space.delete",
                    IdempotentFlowExecutor.canonical(tenant, space, name),
                    200,
                    Deletion.class,
                    () -> tenants.inTenant(tenant, () -> {
                        tenants.requireUser(
                                credential,
                                tenant,
                                List.of(TenantAccess.tenant(tenant), TenantAccess.space(space)),
                                TenantAccess.ADMIN);
                        return Deletion.from(resources.space(
                                tenant, space, principal.principal().id(), name));
                    }));
        } catch (org.springframework.dao.CannotAcquireLockException busy) {
            throw new TerminationErrors.Busy();
        }
    }
}
