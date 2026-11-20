package io.space.control.compositions.authoring.tagging;

import static io.space.control.compositions.authoring.tagging.TaggingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tag.api.TagApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.PageProjection;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;

@org.springframework.stereotype.Component
final class TaggingDependencies {
    final io.space.control.compositions.DriftFacts drift;
    final TagApi tags;
    final PageApi pages;
    final SpaceApi spaces;
    final TenantAccess tenants;
    final ResourceChain resources;
    final AuthoringWrites authoringWrites;
    final TagAccess access;
    final IdempotentFlowExecutor idempotency;
    final PageProjection pageProjection;

    TaggingDependencies(
            TagApi tags,
            PageApi pages,
            SpaceApi spaces,
            TenantAccess tenants,
            ResourceChain resources,
            AuthoringWrites authoringWrites,
            TagAccess access,
            IdempotentFlowExecutor idempotency,
            PageProjection pageProjection,
            io.space.control.compositions.DriftFacts drift) {
        this.drift = drift;
        this.tags = tags;
        this.pages = pages;
        this.spaces = spaces;
        this.tenants = tenants;
        this.resources = resources;
        this.authoringWrites = authoringWrites;
        this.access = access;
        this.idempotency = idempotency;
        this.pageProjection = pageProjection;
    }
}
