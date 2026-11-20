package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.objectstore.api.ObjectStoreApi;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.revision.api.RevisionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tag.api.TagApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@org.springframework.stereotype.Component
final class PageEditingDependencies {
    final PageEditingRelay relay;
    static final Logger log = LoggerFactory.getLogger(ListPagesUseCase.class);
    static final Duration ATTACHMENT_LINK_TTL = Duration.ofMinutes(15);
    final PageApi pages;
    final io.space.control.compositions.resource.ContentTypes contentTypes;
    final RevisionApi revisions;
    final SpaceApi spaces;
    final TagApi tags;
    final TenantAccess tenants;
    final ResourceChain resources;
    final AuthoringWrites authoringWrites;
    final PageAccess access;
    final PageProjection projection;
    final IdempotentFlowExecutor idempotency;
    final PageRenderer renderer;
    final ObjectStoreApi objectStore;
    final HotfixSnapshots hotfixSnapshots;

    PageEditingDependencies(
            PageApi pages,
            RevisionApi revisions,
            SpaceApi spaces,
            TagApi tags,
            TenantAccess tenants,
            ResourceChain resources,
            AuthoringWrites authoringWrites,
            PageAccess access,
            PageProjection projection,
            IdempotentFlowExecutor idempotency,
            PageRenderer renderer,
            ObjectStoreApi objectStore,
            HotfixSnapshots hotfixSnapshots,
            io.space.control.compositions.resource.ContentTypes contentTypes,
            PageEditingRelay relay) {
        this.relay = relay;
        this.contentTypes = contentTypes;
        this.pages = pages;
        this.revisions = revisions;
        this.spaces = spaces;
        this.tags = tags;
        this.tenants = tenants;
        this.resources = resources;
        this.authoringWrites = authoringWrites;
        this.access = access;
        this.projection = projection;
        this.idempotency = idempotency;
        this.renderer = renderer;
        this.objectStore = objectStore;
        this.hotfixSnapshots = hotfixSnapshots;
    }
}
