package io.space.control.compositions.releases.release;

import static io.space.control.compositions.releases.release.ReleaseTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.PageAccess;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.space.control.compositions.authoring.pageediting.PageProjection;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.resource.PageNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UnpublishPageUseCase {

    private final PageApi pages;

    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;
    private final PageAccess pageAccess;
    private final PageProjection pageProjection;
    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    private final AuthoredAutoRelease authoredAutoRelease;

    private final IdempotentFlowExecutor idempotency;

    UnpublishPageUseCase(ReleaseDependencies dependencies) {
        this.pages = dependencies.pages;
        this.tenants = dependencies.tenants;
        this.authoringWrites = dependencies.authoringWrites;
        this.pageAccess = dependencies.pageAccess;
        this.pageProjection = dependencies.pageProjection;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.authoredAutoRelease = dependencies.authoredAutoRelease;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<PublishResult> unpublishPage(
            String credential, UUID tenant, UUID space, UUID page, String key) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            pageAccess.placedPage(tenant, space, page);
            Resolution resolution = pageAccess.require(credential, tenant, space, page, TenantAccess.PUBLISH);
            PageApi.Actor actor = pageAccess.pageActor(resolution);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.unpublish",
                    IdempotentFlowExecutor.canonical(tenant, space, page),
                    200,
                    PublishResult.class,
                    () -> authoringWrites.withWorkingWrite(tenant, space, page, false, located -> {
                        PageApi.View saved = tenants.inTenant(
                                tenant,
                                () -> pages.unpublish(new PageApi.PageId(page), actor)
                                        .orElseThrow(PageNotFoundException::new));
                        PageEditingTypes.PageDetail detail =
                                pageProjection.detail(saved, located.slug(), resolution, tenant, located.space());
                        if (!located.space().autoRelease()) {
                            return new PublishResult(detail, Outcome.UNCHANGED, null);
                        }
                        PipelineResult result = authoredAutoRelease.afterCompletion(
                                tenant, located.space(), access.actorId(resolution), page.toString());
                        ReleaseDetail release = result.release() == null
                                ? null
                                : tenants.inTenant(
                                        tenant,
                                        () -> projection.detail(result.release(), resolution, tenant, located.space()));
                        return new PublishResult(detail, result.outcome(), release);
                    }));
        }
    }
}
