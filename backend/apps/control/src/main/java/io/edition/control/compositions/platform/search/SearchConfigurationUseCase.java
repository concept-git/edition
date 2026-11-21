package io.edition.control.compositions.platform.search;

import static io.edition.control.compositions.platform.search.SearchTypes.*;

import io.edition.concepts.search.api.SearchApi;
import io.edition.control.compositions.*;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.OperationNotFoundException;
import io.edition.control.compositions.resource.ResourceChain;
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
