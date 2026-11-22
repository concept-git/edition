package io.edition.control.usecases.authoring.deletion;

import static io.edition.control.usecases.authoring.deletion.DeletionTypes.*;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.authoring.pageediting.PageAccess;
import io.edition.control.usecases.authoring.pageediting.PageEditingTypes;
import io.edition.control.usecases.authoring.pageediting.PageProjection;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.releases.release.AuthoredAutoRelease;
import io.edition.control.usecases.resource.PageNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RestorePageUseCase {
    private final PageApi pages;

    private final AuthoringWrites authoringWrites;
    private final PageAccess pageAccess;
    private final DeletionAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;
    private final AuthoredAutoRelease authoredAutoRelease;

    RestorePageUseCase(DeletionDependencies dependencies) {
        this.pages = dependencies.pages;
        this.authoringWrites = dependencies.authoringWrites;
        this.pageAccess = dependencies.pageAccess;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
        this.authoredAutoRelease = dependencies.authoredAutoRelease;
    }

    @Transactional
    public FlowResponse<PageEditingTypes.PageDetail> restorePage(
            String credential, UUID tenant, UUID space, UUID page, String key) {
        Resolution resolution = access.requireWrite(credential, tenant, space, page);
        return idempotency.execute(
                resolution.principal(),
                key,
                "page.restore",
                IdempotentFlowExecutor.canonical(tenant, space, page),
                200,
                PageEditingTypes.PageDetail.class,
                () -> authoringWrites.withLifecycleWrite(tenant, space, page, located -> {
                    PageApi.LifecycleChange result = pages.restore(
                                    new PageApi.PageId(page), pageAccess.pageActor(resolution))
                            .orElseThrow(PageNotFoundException::new);
                    PageApi.View saved = result.page();
                    if (result.changed()
                            && located.space().mode() == SpaceApi.Mode.AUTHORED
                            && located.space().autoRelease()
                            && saved.status() == PageApi.Status.PUBLISHED) {
                        authoredAutoRelease.afterCompletion(
                                tenant, located.space(), resolution.principal().id(), "restore:" + page);
                    }
                    return projection.detail(saved, located.slug(), resolution, tenant, located.space());
                }));
    }
}
