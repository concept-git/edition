package io.edition.control.compositions.hosting.reorganization;

import static io.edition.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.permission.api.PermissionApi.PrincipalType;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.toc.api.TocApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.PermissionDeniedException;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.pageediting.PageAccess;
import io.edition.control.compositions.authoring.pageediting.PageEditingTypes;
import io.edition.control.compositions.authoring.pageediting.PageProjection;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.releases.release.AuthoredAutoRelease;
import io.edition.control.compositions.resource.PageNotFoundException;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.ResourceWriteLocks;
import io.edition.control.compositions.resource.SpaceArchivedException;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class TransferPageUseCase {
    private final ReorganizationRelay relay;
    private final ResourceWriteLocks locks;

    private final SpaceApi spaces;
    private final TocApi toc;

    private final ResourceChain resources;
    private final TenantAccess tenants;

    private final PageAccess pageAccess;
    private final AuthoringWrites authoringWrites;
    private final IdempotentFlowExecutor idempotency;

    private final PageProjection pageProjection;
    private final AuthoredAutoRelease authoredAutoRelease;

    TransferPageUseCase(ReorganizationDependencies dependencies) {
        this.relay = dependencies.relay;
        this.locks = dependencies.locks;
        this.spaces = dependencies.spaces;
        this.toc = dependencies.toc;
        this.resources = dependencies.resources;
        this.tenants = dependencies.tenants;
        this.pageAccess = dependencies.pageAccess;
        this.authoringWrites = dependencies.authoringWrites;
        this.idempotency = dependencies.idempotency;
        this.pageProjection = dependencies.pageProjection;
        this.authoredAutoRelease = dependencies.authoredAutoRelease;
    }

    @Transactional
    public FlowResponse<PageEditingTypes.PageDetail> transferPage(
            String credential, UUID tenant, UUID sourceSpace, UUID page, UUID targetSpace, String slug, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            resources.space(tenant, sourceSpace).orElseThrow(SpaceNotFoundException::new);
            Resolution resolution = pageAccess.require(credential, tenant, sourceSpace, page, TenantAccess.WRITE);
            if (resolution.principal().type() != PrincipalType.USER) {
                throw new PermissionDeniedException();
            }
            resources.space(tenant, targetSpace).orElseThrow(SpaceNotFoundException::new);
            tenants.require(credential, tenant, PageAccess.chain(tenant, targetSpace, null), TenantAccess.WRITE);
            if (sourceSpace.equals(targetSpace)) throw new SameSpaceException();
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.transfer",
                    IdempotentFlowExecutor.canonical(tenant, sourceSpace, page, targetSpace, slug),
                    200,
                    PageEditingTypes.PageDetail.class,
                    () -> tenants.inTenant(tenant, () -> {
                        List.of(sourceSpace, targetSpace).stream().sorted().forEach(id -> locks.space(tenant, id));
                        var located = locks.locatedPage(tenant, sourceSpace, page);
                        var target = locks.space(tenant, targetSpace);
                        authoringWrites.require(located.space());
                        authoringWrites.require(target);
                        if (located.page().trashedAt() != null) throw new PageNotFoundException();
                        String oldSlug = located.slug();
                        // Same transaction as transfer: the FK requires source Toc references to be
                        // removed first; any transfer failure rolls this prune back.
                        for (TocApi.View entry : toc.entriesFor(page)) {
                            if (entry.spaceId().equals(sourceSpace)) toc.remove(new TocApi.EntryId(entry.id()));
                        }
                        SpaceApi.TransferResult.Transferred transferred =
                                switch (spaces.transfer(page, new SpaceApi.SpaceId(targetSpace), slug)) {
                                    case SpaceApi.TransferResult.Transferred ok -> ok;
                                    case SpaceApi.TransferResult.SpaceNotFound ignored ->
                                        throw new SpaceNotFoundException();
                                    case SpaceApi.TransferResult.SpaceArchived ignored ->
                                        throw new SpaceArchivedException();
                                    case SpaceApi.TransferResult.SlugInvalid ignored ->
                                        throw new SlugInvalidException("slug");
                                    case SpaceApi.TransferResult.SlugTaken ignored -> throw AddressFailures.slugTaken();
                                    case SpaceApi.TransferResult.ItemNotPlaced ignored ->
                                        throw new PageNotFoundException();
                                    case SpaceApi.TransferResult.SameSpace ignored -> throw new SameSpaceException();
                                };
                        relay.redirectOnReslug(sourceSpace, oldSlug, page);
                        UUID actor = resolution.principal().id();
                        authoredAutoRelease.afterCompletion(tenant, located.space(), actor, "transfer:" + page);
                        if (located.page().status() == PageApi.Status.PUBLISHED) {
                            authoredAutoRelease.afterCompletion(tenant, target, actor, "transfer:" + page);
                        }
                        return pageProjection.view(credential, tenant, targetSpace, page);
                    }));
        }
    }
}
