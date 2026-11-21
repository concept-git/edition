package io.edition.control.compositions.releases.release;

import static io.edition.control.compositions.releases.release.ReleaseTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.pageediting.PageAccess;
import io.edition.control.compositions.authoring.pageediting.PageEditingTypes;
import io.edition.control.compositions.authoring.pageediting.PageProjection;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.PageNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PublishPageUseCase {

    private final PageApi pages;

    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;
    private final PageAccess pageAccess;
    private final PageProjection pageProjection;
    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    private final AuthoredAutoRelease authoredAutoRelease;

    private final IdempotentFlowExecutor idempotency;

    PublishPageUseCase(ReleaseDependencies dependencies) {
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
    public FlowResponse<PublishResult> publishPage(String credential, UUID tenant, UUID space, UUID page, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            pageAccess.placedPage(tenant, space, page);
            Resolution resolution = pageAccess.require(credential, tenant, space, page, TenantAccess.PUBLISH);
            PageApi.Actor actor = pageAccess.pageActor(resolution);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.publish",
                    IdempotentFlowExecutor.canonical(tenant, space, page),
                    200,
                    PublishResult.class,
                    () -> authoringWrites.withWorkingWrite(tenant, space, page, false, located -> {
                        PageApi.View saved = tenants.inTenant(
                                tenant,
                                () -> pages.publish(new PageApi.PageId(page), actor)
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
