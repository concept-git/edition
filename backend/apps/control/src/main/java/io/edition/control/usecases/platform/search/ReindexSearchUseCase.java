package io.edition.control.usecases.platform.search;

import static io.edition.control.usecases.platform.search.SearchTypes.*;

import io.edition.control.modules.audit.api.AuditApi;
import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.modules.search.api.SearchApi;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.flow.OperationNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ReindexSearchUseCase {
    private final SearchApi search;
    private final SiteApi sites;
    private final TenantAccess tenants;
    private final PlatformOperatorGuard operators;
    private final ResourceChain resources;
    private final IdempotentFlowExecutor idempotency;
    private final AuditApi audit;

    ReindexSearchUseCase(SearchDependencies dependencies) {
        this.search = dependencies.search;
        this.sites = dependencies.sites;
        this.tenants = dependencies.tenants;
        this.operators = dependencies.operators;
        this.resources = dependencies.resources;
        this.idempotency = dependencies.idempotency;
        this.audit = dependencies.audit;
    }

    @Transactional
    public FlowResponse<Configuration> reindexSearch(String credential, UUID tenant, UUID site, String key) {
        var who = operators.require(credential);
        resources.site(tenant, site).orElseThrow(OperationNotFoundException::new);
        return idempotency.execute(
                new PermissionApi.Principal(PermissionApi.PrincipalType.USER, who.value()),
                key,
                "search.reindex",
                IdempotentFlowExecutor.canonical(tenant, site),
                202,
                Configuration.class,
                () -> tenants.inTenant(tenant, () -> {
                    sites.lock(new SiteApi.SiteId(site)).orElseThrow(OperationNotFoundException::new);
                    var scope = new SearchApi.ScopeId(site);
                    var configured = search.configureBoost(
                            scope, search.configuredBoost(scope).fields());
                    var c = RequestAuditContext.current();
                    audit.appendPlatform(new AuditApi.Event(
                            null,
                            UUID.randomUUID(),
                            c.rootId(),
                            "fact",
                            "user",
                            who.value(),
                            "Operations.reindex",
                            "site",
                            site,
                            "ok",
                            c.ip(),
                            c.requestId()));
                    return Configuration.of(configured);
                }));
    }
}
