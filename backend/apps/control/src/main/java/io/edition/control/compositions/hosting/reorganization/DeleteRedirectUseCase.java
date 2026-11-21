package io.edition.control.compositions.hosting.reorganization;

import static io.edition.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.edition.concepts.redirect.api.RedirectApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.hosting.site.SiteAccess;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SiteNotFoundException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeleteRedirectUseCase {

    private final RedirectApi redirects;
    private final ResourceChain resources;
    private final TenantAccess tenants;
    private final SiteAccess siteAccess;

    private final IdempotentFlowExecutor idempotency;

    DeleteRedirectUseCase(ReorganizationDependencies dependencies) {
        this.redirects = dependencies.redirects;
        this.resources = dependencies.resources;
        this.tenants = dependencies.tenants;
        this.siteAccess = dependencies.siteAccess;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public void deleteRedirect(String credential, UUID tenant, UUID site, String path, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            SiteApi.View view = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
            Resolution resolution = siteAccess.require(credential, tenant, view, TenantAccess.ADMIN);
            String normalized = RedirectInput.manualPath(path);
            idempotency.execute(
                    resolution.principal(),
                    key,
                    "redirect.delete",
                    IdempotentFlowExecutor.canonical(tenant, site, normalized),
                    () -> tenants.inTenant(tenant, () -> {
                        Optional<RedirectApi.Rule> rule = redirects.get(new RedirectApi.ScopeId(site), normalized);
                        if (rule.isPresent() && rule.orElseThrow().origin() == RedirectApi.Origin.AUTO) {
                            throw new RedirectNotManualException();
                        }
                        redirects.retire(new RedirectApi.ScopeId(site), normalized);
                        return null;
                    }));
        }
    }
}
