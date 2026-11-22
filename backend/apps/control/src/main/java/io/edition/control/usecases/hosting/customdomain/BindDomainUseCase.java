package io.edition.control.usecases.hosting.customdomain;

import static io.edition.control.usecases.hosting.customdomain.CustomDomainTypes.*;

import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.hosting.site.SiteAccess;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class BindDomainUseCase {
    private final SiteAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final CustomDomainApi domains;

    private final IdempotentFlowExecutor idempotency;

    private final io.edition.control.usecases.resource.ResourceWriteLocks locks;

    BindDomainUseCase(CustomDomainDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.domains = dependencies.domains;
        this.idempotency = dependencies.idempotency;
        this.locks = dependencies.locks;
    }

    @Transactional
    public FlowResponse<DomainDetail> bindDomain(String credential, UUID tenant, UUID site, String host, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
            var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
            String normalized = DomainResults.host(host);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "domain.bind",
                    IdempotentFlowExecutor.canonical(tenant, site, normalized),
                    201,
                    DomainDetail.class,
                    () -> tenants.inTenant(tenant, () -> {
                        locks.site(tenant, site);
                        var result = domains.bind(normalized, site);
                        if (result instanceof CustomDomainApi.BindResult.Taken) DomainFailures.bindTaken();
                        var bound = DomainResults.bound(result);
                        if (!bound.target().equals(site)) DomainFailures.bindTaken();
                        return DomainResults.detail(bound);
                    }));
        }
    }
}
