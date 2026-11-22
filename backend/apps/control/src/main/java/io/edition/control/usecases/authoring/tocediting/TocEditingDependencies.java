package io.edition.control.usecases.authoring.tocediting;

import static io.edition.control.usecases.authoring.tocediting.TocEditingTypes.*;

import io.edition.control.modules.toc.api.TocApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.ResourceChain;

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
