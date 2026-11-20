package io.space.control.compositions.authoring.attachmentbrowsing;

import static io.space.control.compositions.authoring.attachmentbrowsing.AttachmentBrowsingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.ResourceChain;

@org.springframework.stereotype.Component
final class AttachmentBrowsingDependencies {
    static final int BATCH = 100;
    static final int SCAN_BUDGET = 500;
    final PageApi pages;
    final SpaceApi spaces;
    final TenantAccess tenants;
    final ResourceChain resources;

    public AttachmentBrowsingDependencies(
            PageApi pages, SpaceApi spaces, TenantAccess tenants, ResourceChain resources) {
        this.pages = pages;
        this.spaces = spaces;
        this.tenants = tenants;
        this.resources = resources;
    }
}
