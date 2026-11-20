package io.space.control.compositions.releases.release;

import static io.space.control.compositions.releases.release.ReleaseTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.PageAccess;
import io.space.control.compositions.authoring.pageediting.PageProjection;
import io.space.control.compositions.authoring.space.SpaceProjection;
import io.space.control.compositions.flow.IdempotentFlowExecutor;

@org.springframework.stereotype.Component
final class ReleaseDependencies {
    final ReleaseRelay relay;
    final PageApi pages;
    final ReleaseApi releases;
    final TenantAccess tenants;
    final AuthoringWrites authoringWrites;
    final PageAccess pageAccess;
    final PageProjection pageProjection;
    final ReleaseAccess access;
    final ReleaseProjection projection;
    final ReleasePipeline pipeline;
    final AuthoredAutoRelease authoredAutoRelease;
    final TenantReleaseListing tenantListing;
    final IdempotentFlowExecutor idempotency;
    final SpaceProjection spaceProjection;

    ReleaseDependencies(
            PageApi pages,
            ReleaseApi releases,
            TenantAccess tenants,
            AuthoringWrites authoringWrites,
            PageAccess pageAccess,
            PageProjection pageProjection,
            ReleaseAccess access,
            ReleaseProjection projection,
            ReleasePipeline pipeline,
            AuthoredAutoRelease authoredAutoRelease,
            TenantReleaseListing tenantListing,
            IdempotentFlowExecutor idempotency,
            SpaceProjection spaceProjection,
            ReleaseRelay relay) {
        this.relay = relay;
        this.tenantListing = tenantListing;
        this.pages = pages;
        this.releases = releases;
        this.tenants = tenants;
        this.authoringWrites = authoringWrites;
        this.pageAccess = pageAccess;
        this.pageProjection = pageProjection;
        this.access = access;
        this.projection = projection;
        this.pipeline = pipeline;
        this.authoredAutoRelease = authoredAutoRelease;
        this.idempotency = idempotency;
        this.spaceProjection = spaceProjection;
    }
}
