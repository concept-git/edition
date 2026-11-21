package io.edition.control.compositions.authoring.deletion;

import static io.edition.control.compositions.authoring.deletion.DeletionTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.toc.api.TocApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.pageediting.PageAccess;
import io.edition.control.compositions.authoring.pageediting.PageProjection;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.releases.release.AuthoredAutoRelease;
import io.edition.control.compositions.resource.ResourceChain;

@org.springframework.stereotype.Component
final class DeletionDependencies {
    final PageApi pages;
    final SpaceApi spaces;
    final TocApi toc;
    final TenantAccess tenants;
    final ResourceChain resources;
    final AuthoringWrites authoringWrites;
    final PageAccess pageAccess;
    final DeletionAccess access;
    final PageProjection projection;
    final IdempotentFlowExecutor idempotency;
    final AuthoredAutoRelease authoredAutoRelease;

    DeletionDependencies(
            PageApi pages,
            SpaceApi spaces,
            TocApi toc,
            TenantAccess tenants,
            ResourceChain resources,
            AuthoringWrites authoringWrites,
            PageAccess pageAccess,
            DeletionAccess access,
            PageProjection projection,
            IdempotentFlowExecutor idempotency,
            AuthoredAutoRelease authoredAutoRelease) {
        this.pages = pages;
        this.spaces = spaces;
        this.toc = toc;
        this.tenants = tenants;
        this.resources = resources;
        this.authoringWrites = authoringWrites;
        this.pageAccess = pageAccess;
        this.access = access;
        this.projection = projection;
        this.idempotency = idempotency;
        this.authoredAutoRelease = authoredAutoRelease;
    }
}
