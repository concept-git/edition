package io.edition.control.compositions.authoring.deletion;

import static io.edition.control.compositions.authoring.deletion.DeletionTypes.*;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTrashUseCase {
    private final PageApi pages;
    private final SpaceApi spaces;

    private final TenantAccess tenants;
    private final ResourceChain resources;

    private final DeletionAccess access;

    ListTrashUseCase(DeletionDependencies dependencies) {
        this.pages = dependencies.pages;
        this.spaces = dependencies.spaces;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.access = dependencies.access;
    }

    @Transactional(readOnly = true)
    public TrashPage listTrash(String credential, UUID tenant, UUID space, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        SpaceApi.View owner = resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        Resolution resolution = access.requireList(credential, tenant, space);
        var visible = new ArrayList<TrashItem>(limit);
        String scanCursor = cursor;
        String next = null;
        while (visible.size() < limit) {
            int remaining = limit - visible.size();
            final String batchCursor = scanCursor;
            final PageApi.Slice batch;
            try {
                batch = tenants.inTenant(tenant, () -> pages.trashed(batchCursor, remaining));
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            Set<UUID> candidateIds =
                    batch.items().stream().map(PageApi.View::id).collect(Collectors.toUnmodifiableSet());
            Map<UUID, String> slugs = tenants.inTenant(tenant, () -> spaces.placementsOf(candidateIds)).stream()
                    .filter(placement -> placement.space().value().equals(space))
                    .collect(Collectors.toUnmodifiableMap(SpaceApi.Placement::item, SpaceApi.Placement::slug));
            Set<UUID> inSpace = slugs.keySet();
            Set<UUID> readable = access.readable(resolution, tenant, space, inSpace);
            batch.items().stream()
                    .filter(page -> readable.contains(page.id()))
                    .map(page -> TrashProjection.item(
                            page, slugs.get(page.id()), access.itemActions(resolution, tenant, owner, page)))
                    .forEach(visible::add);
            next = batch.nextCursor();
            if (next == null || visible.size() >= limit) break;
            scanCursor = next;
        }
        return TrashProjection.page(visible, next, access.listActions(resolution, tenant, owner));
    }
}
