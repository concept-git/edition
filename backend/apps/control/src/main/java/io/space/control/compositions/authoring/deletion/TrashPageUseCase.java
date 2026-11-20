package io.space.control.compositions.authoring.deletion;

import static io.space.control.compositions.authoring.deletion.DeletionTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.toc.api.TocApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.authoring.pageediting.PageAccess;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.space.control.compositions.authoring.pageediting.PageProjection;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.releases.release.AuthoredAutoRelease;
import io.space.control.compositions.resource.PageNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class TrashPageUseCase {
    private final PageApi pages;

    private final TocApi toc;

    private final AuthoringWrites authoringWrites;
    private final PageAccess pageAccess;
    private final DeletionAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;
    private final AuthoredAutoRelease authoredAutoRelease;

    TrashPageUseCase(DeletionDependencies dependencies) {
        this.pages = dependencies.pages;
        this.toc = dependencies.toc;
        this.authoringWrites = dependencies.authoringWrites;
        this.pageAccess = dependencies.pageAccess;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
        this.authoredAutoRelease = dependencies.authoredAutoRelease;
    }

    @Transactional
    public FlowResponse<PageEditingTypes.PageDetail> trashPage(
            String credential, UUID tenant, UUID space, UUID page, String key) {
        Resolution resolution = access.requireWrite(credential, tenant, space, page);
        return idempotency.execute(
                resolution.principal(),
                key,
                "page.trash",
                IdempotentFlowExecutor.canonical(tenant, space, page),
                200,
                PageEditingTypes.PageDetail.class,
                () -> authoringWrites.withLifecycleWrite(tenant, space, page, located -> {
                    PageApi.LifecycleChange result = pages.trash(
                                    new PageApi.PageId(page), pageAccess.pageActor(resolution))
                            .orElseThrow(PageNotFoundException::new);
                    PageApi.View saved = result.page();
                    if (located.space().mode() == SpaceApi.Mode.AUTHORED) {
                        for (TocApi.View entry : toc.entriesFor(page)) {
                            if (entry.spaceId().equals(space)) {
                                toc.remove(new TocApi.EntryId(entry.id()));
                            }
                        }
                    }
                    if (result.changed()
                            && located.space().mode() == SpaceApi.Mode.AUTHORED
                            && located.space().autoRelease()) {
                        authoredAutoRelease.afterCompletion(
                                tenant, located.space(), resolution.principal().id(), "trash:" + page);
                    }
                    return projection.detail(saved, located.slug(), resolution, tenant, located.space());
                }));
    }
}
