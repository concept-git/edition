package io.space.control.compositions.authoring.attachmentbrowsing;

import static io.space.control.compositions.authoring.attachmentbrowsing.AttachmentBrowsingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.PageNotFoundException;
import io.space.control.compositions.resource.ResourceChain;
import io.space.shared.KeysetCursor;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListAttachmentsUseCase {
    private static final int BATCH = AttachmentBrowsingDependencies.BATCH;
    private static final int SCAN_BUDGET = AttachmentBrowsingDependencies.SCAN_BUDGET;
    private final PageApi pages;
    private final SpaceApi spaces;
    private final TenantAccess tenants;
    private final ResourceChain resources;

    ListAttachmentsUseCase(AttachmentBrowsingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.spaces = dependencies.spaces;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public Result listAttachments(
            String credential, UUID tenant, UUID space, String cursor, int limit, String q, String type) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("attachment limit");
        var resolution = tenants.require(
                credential, tenant, List.of(TenantAccess.tenant(tenant), TenantAccess.space(space)), TenantAccess.READ);
        resources.space(tenant, space).orElseThrow(PageNotFoundException::new);
        String query = q == null ? "" : q.strip();
        String kind = type == null ? "all" : type;
        var binding = AttachmentCursor.forQuery(tenant, space, query, kind);
        String position = binding.decode(cursor);
        var result = new ArrayList<Entry>(limit);
        int scanned = 0;
        do {
            String start = position;
            int count = Math.min(BATCH, SCAN_BUDGET - scanned);
            var batch = tenants.inTenant(tenant, () -> pages.scanAttachments(start, count, query, kind));
            scanned += batch.scanned();
            Set<UUID> ids =
                    batch.items().stream().map(PageApi.AttachmentEntry::pageId).collect(Collectors.toSet());
            var placements = tenants.inTenant(tenant, () -> spaces.placementsOf(ids));
            var chains = placements.stream()
                    .filter(p -> p.space().value().equals(space))
                    .map(p -> List.of(
                            TenantAccess.tenant(tenant), TenantAccess.space(space), TenantAccess.page(p.item())))
                    .collect(Collectors.toSet());
            var readable = tenants.filter(resolution, tenant, chains, TenantAccess.READ).stream()
                    .map(chain -> chain.getLast().id())
                    .collect(Collectors.toSet());
            for (var item : batch.items()) {
                if (!readable.contains(item.pageId())) continue;
                result.add(new Entry(
                        item.ref(),
                        item.pageId(),
                        item.pageTitle(),
                        item.filename(),
                        item.mime(),
                        item.sizeBytes(),
                        item.createdAt()));
                if (result.size() == limit) {
                    return new Result(result, binding.encode(KeysetCursor.encode(item.createdAt(), item.ref())));
                }
            }
            position = batch.nextCursor();
        } while (position != null && scanned < SCAN_BUDGET);
        return new Result(result, binding.encode(position));
    }
}
