package io.edition.control.usecases.authoring.pageediting;

import static io.edition.control.usecases.authoring.pageediting.PageEditingTypes.*;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SpaceArchivedException;
import java.util.Locale;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CreatePageUseCase {

    private final PageApi pages;
    private final io.edition.control.usecases.resource.ContentTypes contentTypes;

    private final SpaceApi spaces;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final PageAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;

    CreatePageUseCase(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.contentTypes = dependencies.contentTypes;
        this.spaces = dependencies.spaces;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<PageDetail> createPage(
            String credential, UUID tenant, UUID space, String format, String title, String slug, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            return createPage(credential, tenant, space, format, title, slug, key, null);
        }
    }

    @Transactional
    public FlowResponse<PageDetail> createPage(
            String credential,
            UUID tenant,
            UUID space,
            String format,
            String title,
            String slug,
            String key,
            io.edition.content.ContentProfile profile) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            resources.space(tenant, space).orElseThrow(PageNotFoundException::new);
            var resolution = access.requireSpace(credential, tenant, space, TenantAccess.WRITE);
            PageApi.Actor actor = access.pageActor(resolution);
            final PageApi.Format parsedFormat;
            try {
                parsedFormat = PageApi.Format.valueOf(format.strip().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException | NullPointerException invalid) {
                throw new FormatInvalidException();
            }
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.create",
                    IdempotentFlowExecutor.canonical(
                            tenant,
                            space,
                            format,
                            title.strip(),
                            slug,
                            profile == null ? null : profile.fingerprintMaterial()),
                    201,
                    PageDetail.class,
                    () -> authoringWrites.withSpaceWrite(tenant, space, owner -> {
                        PageApi.View created =
                                switch (pages.create(
                                        actor, parsedFormat, title, contentTypes.bind(format, profile, null))) {
                                    case PageApi.CreateResult.Created value -> value.page();
                                    case PageApi.CreateResult.InvalidTitle ignored ->
                                        throw new PageTitleInvalidException();
                                    case PageApi.CreateResult.IdTaken ignored ->
                                        throw new IllegalStateException("generated page id collided");
                                };
                        String placedSlug =
                                switch (spaces.place(new SpaceApi.SpaceId(space), created.id(), slug)) {
                                    case SpaceApi.PlacementResult.Placed value ->
                                        value.placement().slug();
                                    case SpaceApi.PlacementResult.SlugInvalid ignored ->
                                        throw new SlugInvalidException();
                                    case SpaceApi.PlacementResult.SlugTaken ignored -> throw new SlugTakenException();
                                    case SpaceApi.PlacementResult.SpaceArchived ignored ->
                                        throw new SpaceArchivedException();
                                    case SpaceApi.PlacementResult.SpaceNotFound ignored ->
                                        throw new PageNotFoundException();
                                    case SpaceApi.PlacementResult.ItemAlreadyPlaced ignored ->
                                        throw new IllegalStateException("new page was already placed");
                                    case SpaceApi.PlacementResult.ItemNotInSpace ignored ->
                                        throw new IllegalStateException("place does not return item-not-in-space");
                                };
                        return projection.detail(created, placedSlug, resolution, tenant, owner);
                    }));
        }
    }
}
