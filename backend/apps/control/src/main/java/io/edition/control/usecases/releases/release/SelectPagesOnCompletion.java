package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.pageediting.PageAccess;
import io.edition.control.usecases.authoring.pageediting.PageEditingTypes;
import io.edition.control.usecases.authoring.pageediting.PageProjection;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.PageNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@org.springframework.stereotype.Service
public class SelectPagesOnCompletion {

    private final PageApi pages;

    private final AuthoringWrites authoringWrites;
    private final PageAccess pageAccess;
    private final PageProjection pageProjection;
    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    private final AuthoredAutoRelease authoredAutoRelease;

    private final IdempotentFlowExecutor idempotency;

    SelectPagesOnCompletion(ReleaseDependencies dependencies) {
        this.pages = dependencies.pages;
        this.authoringWrites = dependencies.authoringWrites;
        this.pageAccess = dependencies.pageAccess;
        this.pageProjection = dependencies.pageProjection;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.authoredAutoRelease = dependencies.authoredAutoRelease;
        this.idempotency = dependencies.idempotency;
    }

    private FlowResponse<BatchPublishResult> selectPages(
            String credential, UUID tenant, UUID space, List<UUID> ids, String key, boolean publish) {
        if (ids == null || ids.isEmpty() || ids.size() > 100 || ids.contains(null))
            throw new PageEditingTypes.MetadataInvalidException("ids", "invalid_size");
        if (Set.copyOf(ids).size() != ids.size())
            throw new PageEditingTypes.MetadataInvalidException("ids", "duplicate");
        List<UUID> ordered = ids.stream().sorted().toList();
        Resolution resolution = null;
        for (UUID id : ordered) {
            pageAccess.placedPage(tenant, space, id);
            resolution = pageAccess.require(credential, tenant, space, id, TenantAccess.PUBLISH);
        }
        var initial = resolution;
        return idempotency.execute(
                initial.principal(),
                key,
                publish ? "page.publishBatch" : "page.unpublishBatch",
                IdempotentFlowExecutor.canonical(tenant, space, ordered),
                200,
                BatchPublishResult.class,
                () -> authoringWrites.withSpaceWrite(tenant, space, owner -> {
                    var located = new ArrayList<io.edition.control.usecases.resource.ResourceChain.LocatedPage>();
                    for (UUID id : ordered) {
                        pages.lock(new PageApi.PageId(id)).orElseThrow(PageNotFoundException::new);
                        located.add(pageAccess.workingPage(tenant, space, id));
                        pageAccess.require(credential, tenant, space, id, TenantAccess.PUBLISH);
                    }
                    var selected = new ArrayList<PageEditingTypes.PageSummary>();
                    for (var item : located) {
                        var actor = pageAccess.pageActor(initial);
                        var id = new PageApi.PageId(item.page().id());
                        var saved = (publish ? pages.publish(id, actor) : pages.unpublish(id, actor))
                                .orElseThrow(PageNotFoundException::new);
                        selected.add(pageProjection.summary(saved, item.slug(), initial, tenant, owner));
                    }
                    PipelineResult result = authoredAutoRelease.afterCompletion(
                            tenant, owner, access.actorId(initial), publish ? "batch:publish" : "batch:unpublish");
                    var release = result.release() == null
                            ? null
                            : projection.detail(result.release(), initial, tenant, owner);
                    return new BatchPublishResult(selected, result.outcome(), release);
                }));
    }

    @org.springframework.context.event.EventListener
    public void selectPages(ReleaseSignals.SelectPages binding) {
        if (!binding.completion().claim("selectPages")) return;
        binding.completion()
                .complete(selectPages(
                        binding.credential(),
                        binding.tenant(),
                        binding.space(),
                        binding.ids(),
                        binding.key(),
                        binding.publish()));
    }
}
