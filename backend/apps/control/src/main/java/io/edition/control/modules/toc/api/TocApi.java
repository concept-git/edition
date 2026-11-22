package io.edition.control.modules.toc.api;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Toc 概念唯一出口；身份 = 空间稳定 id，无独立头表。
 * Target 在本概念只是 UUID，页面是否本空间未回收由 sync 用 {@code SpaceApi.spaceOf} 核对。
 * 有限结果类型，不抛 HTTP；{@code replace} 无管理面入口（票 20 导入调用）。
 */
public interface TocApi {
    int MAX_DEPTH = 7;
    int MAX_LABEL_CODE_POINTS = 200;
    int MAX_URL_LENGTH = 2048;

    /** {@code parent} 空 = 根；{@code pos} 空 = 追加。 */
    AddResult addEntry(TocId toc, EntryId parent, String label, Kind kind, UUID targetId, String url, Integer pos);

    MoveResult move(EntryId entry, EntryId newParent, int pos);

    RelabelResult relabel(EntryId entry, String label);
    /** 级联摘子树；不删 target 页面或外链。 */
    RemoveResult remove(EntryId entry);
    /** 同一事务清空再装入；超深失败且不留半棵树。无管理面入口。 */
    ReplaceResult replace(TocId toc, List<Draft> tree);

    List<View> tree(TocId toc);
    /** 指向该 target 的扁平条目（depth 未派生）；供导入摘除悬挂。 */
    List<View> entriesFor(UUID target);

    Optional<Integer> depth(EntryId entry);

    record TocId(UUID spaceId) {
        public TocId {
            Objects.requireNonNull(spaceId, "space id");
        }
    }

    record EntryId(UUID value) {
        public EntryId {
            Objects.requireNonNull(value, "entry id");
        }
    }

    enum Kind {
        TARGET,
        GROUP,
        LINK
    }

    /** 嵌套 {@code children}；{@code depth} 派生，根为 1。 */
    record View(
            UUID id,
            UUID spaceId,
            UUID parentId,
            int position,
            String label,
            Kind kind,
            UUID targetId,
            String url,
            int depth,
            List<View> children) {
        public View {
            children = List.copyOf(children);
        }
    }

    record Draft(String label, Kind kind, UUID targetId, String url, List<Draft> children) {
        public Draft {
            children = children == null ? List.of() : List.copyOf(children);
        }
    }

    sealed interface AddResult {
        record Added(View entry) implements AddResult {}

        record DepthExceeded() implements AddResult {}

        record PositionInvalid() implements AddResult {}

        record ParentNotFound() implements AddResult {}

        record Invalid(String field, String code) implements AddResult {}
    }

    sealed interface MoveResult {
        record Moved(List<View> tree) implements MoveResult {}

        record DepthExceeded() implements MoveResult {}

        record CycleDetected() implements MoveResult {}

        record PositionInvalid() implements MoveResult {}

        record NotFound() implements MoveResult {}
    }

    sealed interface RelabelResult {
        record Relabeled(List<View> tree) implements RelabelResult {}

        record NotFound() implements RelabelResult {}

        record Invalid(String field, String code) implements RelabelResult {}
    }

    sealed interface RemoveResult {
        record Removed(List<View> tree) implements RemoveResult {}

        record NotFound() implements RemoveResult {}
    }

    sealed interface ReplaceResult {
        record Replaced(List<View> tree) implements ReplaceResult {}

        record DepthExceeded() implements ReplaceResult {}

        record Invalid(String field, String code) implements ReplaceResult {}
    }
}
