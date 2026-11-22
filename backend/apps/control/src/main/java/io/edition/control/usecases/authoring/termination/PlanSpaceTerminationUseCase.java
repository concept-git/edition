package io.edition.control.usecases.authoring.termination;

import static io.edition.control.usecases.authoring.termination.TerminationTypes.*;

import io.edition.control.usecases.access.TenantAccess;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PlanSpaceTerminationUseCase {

    private final TenantAccess tenants;

    private final TerminalResources resources;

    PlanSpaceTerminationUseCase(TerminationDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public TerminationPlan planSpaceTermination(String credential, UUID tenant, UUID space, String name) {
        tenants.requireUser(
                credential,
                tenant,
                List.of(TenantAccess.tenant(tenant), TenantAccess.space(space)),
                TenantAccess.ADMIN);
        return tenants.inTenant(tenant, () -> resources.planSpace(tenant, space, name));
    }
}
