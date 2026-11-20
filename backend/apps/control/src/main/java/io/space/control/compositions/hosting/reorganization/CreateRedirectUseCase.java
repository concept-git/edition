package io.space.control.compositions.hosting.reorganization;

import static io.space.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.space.concepts.redirect.api.RedirectApi;
import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.hosting.site.SiteAccess;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CreateRedirectUseCase {

    private final RedirectApi redirects;
    private final ResourceChain resources;
    private final TenantAccess tenants;
    private final SiteAccess siteAccess;

    private final IdempotentFlowExecutor idempotency;

    private final RedirectTargets targets;

    CreateRedirectUseCase(ReorganizationDependencies dependencies) {
        this.redirects = dependencies.redirects;
        this.resources = dependencies.resources;
        this.tenants = dependencies.tenants;
        this.siteAccess = dependencies.siteAccess;
        this.idempotency = dependencies.idempotency;
        this.targets = dependencies.targets;
    }

    @Transactional
    public FlowResponse<RedirectView> createRedirect(
            String credential, UUID tenant, UUID site, String path, String targetType, UUID targetId, String key) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            SiteApi.View view = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
            Resolution resolution = siteAccess.require(credential, tenant, view, TenantAccess.ADMIN);
            RedirectApi.TargetType type = RedirectInput.parseTargetType(targetType);
            String normalized = RedirectInput.manualPath(path);
            targets.requireTarget(tenant, view, type, targetId);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "redirect.create",
                    IdempotentFlowExecutor.canonical(tenant, site, normalized, type, targetId),
                    200,
                    RedirectView.class,
                    () -> tenants.inTenant(tenant, () -> {
                        var current = targets.lockTarget(tenant, site, type, targetId);
                        return targets.redirectView(
                                current,
                                RedirectResults.registered(redirects.register(
                                        new RedirectApi.ScopeId(site),
                                        normalized,
                                        type,
                                        targetId,
                                        RedirectApi.Origin.MANUAL)));
                    }));
        }
    }
}
