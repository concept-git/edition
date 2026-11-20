package io.space.control.compositions.hosting.site;

import static io.space.control.compositions.hosting.site.SiteTypes.*;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListSpaceMountsUseCase {

    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SiteApi sites;
    private final CustomDomainApi domains;

    ListSpaceMountsUseCase(SiteDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.sites = dependencies.sites;
        this.domains = dependencies.domains;
    }

    @Transactional(readOnly = true)
    public List<SpaceMount> listSpaceMounts(String credential, UUID tenant, UUID space) {
        resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        var resolution = tenants.require(
                credential, tenant, List.of(TenantAccess.tenant(tenant), TenantAccess.space(space)), TenantAccess.READ);
        return tenants.inTenant(
                tenant,
                () -> sites.mountsOf(space).stream()
                        .map(occurrence -> sites.view(occurrence.site())
                                .filter(site -> site.tenantId().equals(tenant))
                                .map(site -> new SpaceMount(
                                        site.id(),
                                        site.name(),
                                        occurrence.slug(),
                                        domains.primaryOf(site.id()).orElse(null))))
                        .flatMap(java.util.Optional::stream)
                        .toList());
    }
}
