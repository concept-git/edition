package io.space.control.compositions.authoring.tocediting;

import static io.space.control.compositions.authoring.tocediting.TocEditingTypes.*;

import io.space.concepts.toc.api.TocApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;

@org.springframework.stereotype.Component
final class TocEditingDependencies {
    final TocApi toc;
    final TenantAccess tenants;
    final ResourceChain resources;
    final AuthoringWrites authoringWrites;
    final TocAccess access;
    final IdempotentFlowExecutor idempotency;
    final TocLivePromotion live;

    TocEditingDependencies(
            TocApi toc,
            TenantAccess tenants,
            ResourceChain resources,
            AuthoringWrites authoringWrites,
            TocAccess access,
            IdempotentFlowExecutor idempotency,
            TocLivePromotion live) {
        this.toc = toc;
        this.tenants = tenants;
        this.resources = resources;
        this.authoringWrites = authoringWrites;
        this.access = access;
        this.idempotency = idempotency;
        this.live = live;
    }
}
