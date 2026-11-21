package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.edition.concepts.objectstore.api.ObjectStoreApi;
import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.revision.api.RevisionApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.tag.api.TagApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@org.springframework.stereotype.Component
final class PageEditingDependencies {
    final PageEditingRelay relay;
    static final Logger log = LoggerFactory.getLogger(ListPagesUseCase.class);
    static final Duration ATTACHMENT_LINK_TTL = Duration.ofMinutes(15);
    final PageApi pages;
    final io.edition.control.compositions.resource.ContentTypes contentTypes;
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
            io.edition.control.compositions.resource.ContentTypes contentTypes,
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
