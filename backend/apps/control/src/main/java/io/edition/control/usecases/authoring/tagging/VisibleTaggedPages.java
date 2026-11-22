package io.edition.control.usecases.authoring.tagging;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.permission.api.PermissionApi.Resource;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.tag.api.TagApi;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 标签目录 / 聚合列表的可见页装配：未回收、挂在本租户空间、且请求者 read 得过。
 * 无批量 ResourceChain API，故一次 placementsOf + listByTenant + Permission.filter。
 */
final class VisibleTaggedPages {
    private VisibleTaggedPages() {}

    static VisiblePages assemble(
            TagApi tags,
            PageApi pages,
            SpaceApi spaces,
            TagAccess access,
            Resolution resolution,
            UUID tenant,
            Set<UUID> itemIds) {
        if (itemIds.isEmpty()) {
            return new VisiblePages(Set.of(), Map.of(), Map.of(), Map.of(), Map.of());
        }
        Map<UUID, SpaceApi.Placement> placements = spaces.placementsOf(itemIds).stream()
                .collect(Collectors.toUnmodifiableMap(SpaceApi.Placement::item, Function.identity()));
        Set<PageApi.PageId> pageIds = itemIds.stream().map(PageApi.PageId::new).collect(Collectors.toUnmodifiableSet());
        Map<UUID, PageApi.View> views = pages.views(pageIds).stream()
                .collect(Collectors.toUnmodifiableMap(PageApi.View::id, Function.identity()));
        Map<UUID, SpaceApi.View> spaceViews = spaces.listByTenant(tenant).stream()
                .collect(Collectors.toUnmodifiableMap(SpaceApi.View::id, Function.identity()));
        Set<List<Resource>> chains = new HashSet<>();
        Set<UUID> candidates = new HashSet<>();
        for (UUID pageId : itemIds) {
            SpaceApi.Placement placement = placements.get(pageId);
            PageApi.View page = views.get(pageId);
            if (placement == null || page == null || page.trashedAt() != null) continue;
            if (!spaceViews.containsKey(placement.space().value())) continue;
            candidates.add(pageId);
            chains.add(TagAccess.pageChain(tenant, placement.space().value(), pageId));
        }
        Set<UUID> readable = access.readable(resolution, tenant, chains).stream()
                .filter(candidates::contains)
                .collect(Collectors.toUnmodifiableSet());
        Map<UUID, List<String>> labels = tags.labelsOf(readable);
        return new VisiblePages(readable, placements, views, spaceViews, labels);
    }

    record VisiblePages(
            Set<UUID> readable,
            Map<UUID, SpaceApi.Placement> placements,
            Map<UUID, PageApi.View> views,
            Map<UUID, SpaceApi.View> spaces,
            Map<UUID, List<String>> labels) {}
}
