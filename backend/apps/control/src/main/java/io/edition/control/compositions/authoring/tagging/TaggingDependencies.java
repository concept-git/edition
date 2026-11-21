package io.edition.control.compositions.authoring.tagging;

import static io.edition.control.compositions.authoring.tagging.TaggingTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.tag.api.TagApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.pageediting.PageProjection;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;

@org.springframework.stereotype.Component
final class TaggingDependencies {
    final io.edition.control.compositions.DriftFacts drift;
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
            io.edition.control.compositions.DriftFacts drift) {
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
