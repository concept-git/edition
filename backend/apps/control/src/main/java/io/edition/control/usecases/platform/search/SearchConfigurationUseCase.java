package io.edition.control.usecases.platform.search;

import static io.edition.control.usecases.platform.search.SearchTypes.*;

import io.edition.control.modules.search.api.SearchApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.OperationNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SearchConfigurationUseCase {
    private final SearchApi search;

    private final TenantAccess tenants;

    private final ResourceChain resources;

    SearchConfigurationUseCase(SearchDependencies dependencies) {
        this.search = dependencies.search;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public Configuration searchConfiguration(String credential, UUID tenant, UUID site) {
        resources.site(tenant, site).orElseThrow(OperationNotFoundException::new);
        tenants.requireUser(
                credential, tenant, List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)), TenantAccess.ADMIN);
        return tenants.inTenant(tenant, () -> Configuration.of(search.configuredBoost(new SearchApi.ScopeId(site))));
    }
}
