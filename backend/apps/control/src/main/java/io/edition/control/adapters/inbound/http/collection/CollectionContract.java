package io.edition.control.adapters.inbound.http.collection;

import io.edition.control.usecases.authoring.collection.CollectionTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** 分组端点的 OpenAPI 形态：flow 记录 → 契约 DTO；allowedActions 以线值字符串暴露。 */
final class CollectionContract {
    private CollectionContract() {}

    private static Set<String> actions(Set<CollectionTypes.Action> actions) {
        return actions.stream().map(CollectionTypes.Action::value).collect(Collectors.toSet());
    }

    @Schema(name = "CollectionView")
    record CollectionResponse(List<NodeResponse> collections, Set<String> allowedActions) {
        static CollectionResponse from(CollectionTypes.CollectionView value) {
            return new CollectionResponse(
                    value.collections().stream().map(NodeResponse::from).toList(), actions(value.allowedActions()));
        }
    }

    @Schema(name = "CollectionNode")
    record NodeResponse(
            UUID id,
            UUID parentId,
            int position,
            String name,
            String icon,
            int depth,
            long spaceCount,
            List<NodeResponse> children) {
        static NodeResponse from(CollectionTypes.NodeView value) {
            return new NodeResponse(
                    value.id(),
                    value.parentId(),
                    value.position(),
                    value.name(),
                    value.icon(),
                    value.depth(),
                    value.spaceCount(),
                    value.children().stream().map(NodeResponse::from).toList());
        }
    }
}
