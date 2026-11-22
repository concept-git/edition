package io.edition.control.usecases.authoring.tagging;

import static io.edition.control.usecases.authoring.tagging.TaggingTypes.*;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.tag.api.TagApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.InvalidCursorException;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.shared.KeysetCursor;
import io.edition.shared.PageWindow;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTaggedPagesUseCase {
    private final io.edition.control.usecases.DriftFacts drift;
    private final TagApi tags;
    private final PageApi pages;
    private final SpaceApi spaces;
    private final TenantAccess tenants;

    private final TagAccess access;

    ListTaggedPagesUseCase(TaggingDependencies dependencies) {
        this.drift = dependencies.drift;
        this.tags = dependencies.tags;
        this.pages = dependencies.pages;
        this.spaces = dependencies.spaces;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
    }

    @Transactional(readOnly = true)
    public TaggedPagePage listTaggedPages(String credential, UUID tenant, String label, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Resolution resolution = access.admit(credential, tenant);
        String parsed = TagLabels.require(label, "label");
        final KeysetCursor after;
        try {
            after = KeysetCursor.decode(cursor).orElse(null);
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        return tenants.inTenant(tenant, () -> {
            Set<UUID> tagged = tags.byLabel(parsed);
            var visible = VisibleTaggedPages.assemble(tags, pages, spaces, access, resolution, tenant, tagged);
            var drifted = new java.util.HashMap<UUID, Set<UUID>>();
            List<TaggedPage> items = new ArrayList<>();
            for (UUID pageId : tagged) {
                if (!visible.readable().contains(pageId)) continue;
                PageApi.View page = visible.views().get(pageId);
                SpaceApi.Placement placement = visible.placements().get(pageId);
                SpaceApi.View space = visible.spaces().get(placement.space().value());
                items.add(TagProjection.taggedPage(
                        page,
                        placement.slug(),
                        placement.space().value(),
                        visible.labels().getOrDefault(pageId, List.of()),
                        access.pageActions(resolution, tenant, space, pageId),
                        drifted.computeIfAbsent(space.id(), drift::pageIds).contains(pageId)));
            }
            items.sort(Comparator.comparing(TaggedPage::updatedAt)
                    .reversed()
                    .thenComparing(TaggedPage::id, Comparator.reverseOrder()));
            List<TaggedPage> remaining = after == null
                    ? items
                    : items.stream()
                            .filter(item -> TagProjection.afterPage(item, after))
                            .toList();
            var window = PageWindow.of(remaining, limit, row -> KeysetCursor.encode(row.updatedAt(), row.id()));
            return new TaggedPagePage(window.items(), window.nextCursor());
        });
    }
}
