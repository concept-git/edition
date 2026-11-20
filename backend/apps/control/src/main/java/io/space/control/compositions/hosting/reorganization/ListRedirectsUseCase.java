package io.space.control.compositions.hosting.reorganization;

import static io.space.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.space.concepts.redirect.api.RedirectApi;
import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.hosting.site.SiteAccess;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SiteNotFoundException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListRedirectsUseCase {

    private final RedirectApi redirects;
    private final ResourceChain resources;
    private final TenantAccess tenants;
    private final SiteAccess siteAccess;

    private final RedirectTargets targets;

    ListRedirectsUseCase(ReorganizationDependencies dependencies) {
        this.redirects = dependencies.redirects;
        this.resources = dependencies.resources;
        this.tenants = dependencies.tenants;
        this.siteAccess = dependencies.siteAccess;
        this.targets = dependencies.targets;
    }

    @Transactional(readOnly = true)
    public RedirectPage listRedirects(
            String credential, UUID tenant, UUID site, String origin, String cursor, int limit) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            SiteApi.View view = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
            siteAccess.require(credential, tenant, view, TenantAccess.READ);
            Optional<RedirectApi.Origin> parsed = RedirectInput.parseOrigin(origin);
            try {
                return tenants.inTenant(tenant, () -> {
                    RedirectApi.Page page = redirects.list(new RedirectApi.ScopeId(site), parsed, cursor, limit);
                    return new RedirectPage(
                            page.items().stream()
                                    .map(rule -> targets.redirectView(view, rule))
                                    .toList(),
                            page.nextCursor());
                });
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
        }
    }
}
