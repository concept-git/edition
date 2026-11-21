package io.edition.control.compositions.hosting.reorganization;

import static io.edition.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.edition.concepts.permission.api.PermissionApi.PrincipalType;
import io.edition.concepts.space.api.SpaceApi;
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
import io.edition.control.compositions.resource.SpaceArchivedException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ReslugPageUseCase {
    private final ReorganizationRelay relay;

    private final SpaceApi spaces;

    private final PageAccess pageAccess;
    private final AuthoringWrites authoringWrites;
    private final IdempotentFlowExecutor idempotency;

    private final PageProjection pageProjection;
    private final AuthoredAutoRelease authoredAutoRelease;

    ReslugPageUseCase(ReorganizationDependencies dependencies) {
        this.relay = dependencies.relay;
        this.spaces = dependencies.spaces;
        this.pageAccess = dependencies.pageAccess;
        this.authoringWrites = dependencies.authoringWrites;
        this.idempotency = dependencies.idempotency;
        this.pageProjection = dependencies.pageProjection;
        this.authoredAutoRelease = dependencies.authoredAutoRelease;
    }

    @Transactional
    public FlowResponse<PageEditingTypes.PageDetail> reslugPage(
            String credential, UUID tenant, UUID space, UUID page, String newSlug, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            pageAccess.placedPage(tenant, space, page);
            Resolution resolution = pageAccess.require(credential, tenant, space, page, TenantAccess.WRITE);
            if (resolution.principal().type() != PrincipalType.USER) {
                throw new PermissionDeniedException();
            }
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.reslug",
                    IdempotentFlowExecutor.canonical(tenant, space, page, newSlug),
                    200,
                    PageEditingTypes.PageDetail.class,
                    () -> authoringWrites.withWorkingWrite(tenant, space, page, false, located -> {
                        String oldSlug = located.slug();
                        SpaceApi.Placement placed =
                                switch (spaces.reslug(new SpaceApi.SpaceId(space), page, newSlug)) {
                                    case SpaceApi.PlacementResult.Placed ok -> ok.placement();
                                    case SpaceApi.PlacementResult.SpaceNotFound ignored ->
                                        throw new PageNotFoundException();
                                    case SpaceApi.PlacementResult.ItemNotInSpace ignored ->
                                        throw new PageNotFoundException();
                                    case SpaceApi.PlacementResult.SpaceArchived ignored ->
                                        throw new SpaceArchivedException();
                                    case SpaceApi.PlacementResult.SlugInvalid ignored ->
                                        throw new SlugInvalidException("slug");
                                    case SpaceApi.PlacementResult.SlugTaken ignored ->
                                        throw AddressFailures.slugTaken();
                                    case SpaceApi.PlacementResult.ItemAlreadyPlaced ignored ->
                                        throw new IllegalStateException("reslug returned an impossible placement");
                                };
                        if (!oldSlug.equals(placed.slug())) {
                            relay.redirectOnReslug(space, oldSlug, page);
                            authoredAutoRelease.afterCompletion(
                                    tenant,
                                    located.space(),
                                    resolution.principal().id(),
                                    "reslug:" + page);
                        }
                        return pageProjection.view(credential, tenant, space, page);
                    }));
        }
    }
}
