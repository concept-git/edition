package io.space.control.compositions.authoring.collection;

import io.space.concepts.collection.api.CollectionApi;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** 概念嵌套树 → flow CollectionView；spaceCount 只计当前主体 read 得过的直接成员。 */
final class CollectionProjection {
    private CollectionProjection() {}

    static CollectionTypes.CollectionView of(
            CollectionApi collections, Resolution resolution, UUID tenant, CollectionAccess access) {
        return view(collections.tree(tenant), resolution, tenant, collections, access);
    }

    static CollectionTypes.CollectionView view(
            List<CollectionApi.View> tree,
            Resolution resolution,
            UUID tenant,
            CollectionApi collections,
            CollectionAccess access) {
        Set<UUID> placed = collections.placed(tenant);
        Set<UUID> readable = access.readableSpaces(resolution, tenant, placed);
        return new CollectionTypes.CollectionView(
                nodes(tree, collections, readable), access.allowedActions(resolution, tenant));
    }

    private static List<CollectionTypes.NodeView> nodes(
            List<CollectionApi.View> tree, CollectionApi collections, Set<UUID> readable) {
        return tree.stream().map(node -> node(node, collections, readable)).toList();
    }

    private static CollectionTypes.NodeView node(
            CollectionApi.View value, CollectionApi collections, Set<UUID> readable) {
        long spaceCount = collections.itemsIn(new CollectionApi.CollectionId(value.id())).stream()
                .filter(readable::contains)
                .count();
        return new CollectionTypes.NodeView(
                value.id(),
                value.parentId(),
                value.position(),
                value.name(),
                value.icon() == null ? null : value.icon().value(),
                value.depth(),
                spaceCount,
                nodes(value.children(), collections, readable));
    }
}
