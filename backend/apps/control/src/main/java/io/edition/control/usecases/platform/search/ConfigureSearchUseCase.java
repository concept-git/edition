package io.edition.control.usecases.platform.search;

import static io.edition.control.usecases.platform.search.SearchTypes.*;

import io.edition.control.modules.audit.api.AuditApi;
import io.edition.control.modules.search.api.SearchApi;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.flow.OperationNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ConfigureSearchUseCase {
    private final SearchApi search;
    private final SiteApi sites;
    private final TenantAccess tenants;

    private final ResourceChain resources;
    private final IdempotentFlowExecutor idempotency;
    private final AuditApi audit;

    ConfigureSearchUseCase(SearchDependencies dependencies) {
        this.search = dependencies.search;
        this.sites = dependencies.sites;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.idempotency = dependencies.idempotency;
        this.audit = dependencies.audit;
    }

    @Transactional
    public FlowResponse<Configuration> configureSearch(
            String credential, UUID tenant, UUID site, List<String> fields, String key) {
        resources.site(tenant, site).orElseThrow(OperationNotFoundException::new);
        var who = tenants.requireUser(
                credential, tenant, List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)), TenantAccess.ADMIN);
        if (fields == null || fields.size() != 3 || !new HashSet<>(fields).equals(Set.of("title", "headings", "body")))
            throw new SearchConfigurationInvalid("fields");
        return idempotency.execute(
                who.principal(),
                key,
                "search.configure",
                IdempotentFlowExecutor.canonical(tenant, site, fields),
                202,
                Configuration.class,
                () -> tenants.inTenant(tenant, () -> {
                    sites.lock(new SiteApi.SiteId(site)).orElseThrow(OperationNotFoundException::new);
                    var configured = search.configureBoost(new SearchApi.ScopeId(site), fields);
                    var c = RequestAuditContext.current();
                    audit.append(new AuditApi.Event(
                            tenant,
                            UUID.randomUUID(),
                            c.rootId(),
                            "fact",
                            "user",
                            who.principal().id(),
                            "Search.configureBoost",
                            "site",
                            site,
                            "ok",
                            c.ip(),
                            c.requestId()));
                    return Configuration.of(configured);
                }));
    }
}
