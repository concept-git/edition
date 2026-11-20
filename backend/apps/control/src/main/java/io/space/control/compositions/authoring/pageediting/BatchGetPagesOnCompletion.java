package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tag.api.TagApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.PageNotFoundException;
import io.space.control.compositions.resource.ResourceChain;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class BatchGetPagesOnCompletion {

    private final PageApi pages;

    private final SpaceApi spaces;
    private final TagApi tags;
    private final TenantAccess tenants;
    private final ResourceChain resources;

    private final PageAccess access;
    private final PageProjection projection;

    BatchGetPagesOnCompletion(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.spaces = dependencies.spaces;
        this.tags = dependencies.tags;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public BatchPages batchGetPages(String credential, UUID tenant, UUID space, List<UUID> ids, ReadView view) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            PageIds.requireIds(ids);
            if (view == null) throw new MetadataInvalidException("view", "required");
            var owner = resources.space(tenant, space).orElseThrow(PageNotFoundException::new);
            var resolution = access.requireListAccess(credential, tenant);
            return tenants.inTenant(tenant, () -> {
                var requested = Set.copyOf(ids);
                var located = spaces.placementsOf(requested).stream()
                        .filter(placement -> placement.space().value().equals(space))
                        .collect(Collectors.toMap(SpaceApi.Placement::item, SpaceApi.Placement::slug));
                var byId = pages
                        .views(requested.stream().map(PageApi.PageId::new).collect(Collectors.toSet()))
                        .stream()
                        .filter(page -> page.trashedAt() == null && located.containsKey(page.id()))
                        .collect(Collectors.toMap(PageApi.View::id, page -> page));
                var readable = access.readable(resolution, tenant, space, byId.keySet());
                var labels = view == ReadView.SUMMARY ? tags.labelsOf(readable) : Map.<UUID, List<String>>of();
                var drifted = view == ReadView.SUMMARY ? projection.driftedPages(space) : Set.<UUID>of();
                return new BatchPages(ids.stream()
                        .map(id -> {
                            var page = byId.get(id);
                            if (page == null || !readable.contains(id))
                                return new BatchPage(id, ReadStatus.NOT_FOUND, null, null);
                            return view == ReadView.CONTENT
                                    ? new BatchPage(id, ReadStatus.OK, null, ContentSnapshot.of(page))
                                    : new BatchPage(
                                            id,
                                            ReadStatus.OK,
                                            projection.summary(
                                                    page,
                                                    located.get(id),
                                                    resolution,
                                                    tenant,
                                                    owner,
                                                    labels.getOrDefault(id, List.of()),
                                                    drifted.contains(id)),
                                            null);
                        })
                        .toList());
            });
        }
    }

    @org.springframework.context.event.EventListener
    public void batchGetPages(PageEditingSignals.BatchGetPages binding) {
        if (!binding.completion().claim("batchGetPages")) return;
        binding.completion()
                .complete(batchGetPages(
                        binding.credential(), binding.tenant(), binding.space(), binding.ids(), binding.view()));
    }
}
