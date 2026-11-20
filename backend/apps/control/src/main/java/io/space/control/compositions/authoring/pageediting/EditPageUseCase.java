package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.PageNotFoundException;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceModeRestrictedException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class EditPageUseCase {
    private final PageEditingRelay relay;

    private final io.space.control.compositions.resource.ContentTypes contentTypes;

    private final ResourceChain resources;
    private final AuthoringWrites authoringWrites;
    private final PageAccess access;
    private final PageProjection projection;
    private final IdempotentFlowExecutor idempotency;

    EditPageUseCase(PageEditingDependencies dependencies) {
        this.relay = dependencies.relay;
        this.contentTypes = dependencies.contentTypes;
        this.resources = dependencies.resources;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<PageDetail> editPage(
            String credential, UUID tenant, UUID space, UUID page, String content, int baseRevision, String key) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            return editPage(credential, tenant, space, page, content, baseRevision, key, null);
        }
    }

    @Transactional
    public FlowResponse<PageDetail> editPage(
            String credential,
            UUID tenant,
            UUID space,
            UUID page,
            String content,
            int baseRevision,
            String key,
            io.space.content.ContentProfile profile) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            return editPage(credential, tenant, space, page, content, baseRevision, key, profile, null);
        }
    }

    @Transactional
    public FlowResponse<PageDetail> editPage(
            String credential,
            UUID tenant,
            UUID space,
            UUID page,
            String content,
            int baseRevision,
            String key,
            io.space.content.ContentProfile profile,
            EditIntent intent) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
            var resolution = access.require(credential, tenant, space, page, TenantAccess.WRITE);
            String fingerprint = intent == null
                    ? IdempotentFlowExecutor.canonical(
                            tenant,
                            space,
                            page,
                            baseRevision,
                            content,
                            profile == null ? null : profile.fingerprintMaterial())
                    : IdempotentFlowExecutor.canonical(
                            tenant,
                            space,
                            page,
                            baseRevision,
                            content,
                            profile == null ? null : profile.fingerprintMaterial(),
                            intent.value());
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "page.edit",
                    fingerprint,
                    200,
                    PageDetail.class,
                    () -> authoringWrites.withWorkingWrite(tenant, space, page, true, located -> {
                        if ((intent == EditIntent.DRAFT_ONLY && located.space().mode() != SpaceApi.Mode.AUTHORED)
                                || (intent == EditIntent.HOTFIX
                                        && located.space().mode() != SpaceApi.Mode.SYNCED))
                            throw new SpaceModeRestrictedException();
                        PageApi.View edited = relay.editAndRecord(
                                page,
                                content,
                                baseRevision,
                                resolution,
                                null,
                                contentTypes.bind(
                                        located.page().format().name(),
                                        profile,
                                        located.page().contentProfile()));
                        if (located.space().mode() == SpaceApi.Mode.SYNCED) {
                            relay.hotfixAutoPromote(
                                    tenant,
                                    located.space(),
                                    edited,
                                    access.pageActor(resolution).id());
                        }
                        return projection.detail(edited, located.slug(), resolution, tenant, located.space());
                    }));
        }
    }
}
