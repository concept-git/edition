package io.edition.control.modules.collection.api;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Collection 概念唯一出口。调用方负责建立 tenant scope。
 * Item 在本概念只是 UUID；空间是否本租户由 sync 用 {@code SpaceApi} / {@code ResourceChain} 核对。
 */
public interface CollectionApi {
    int MAX_DEPTH = 3;
    int MAX_NAME_CODE_POINTS = 200;

    CreateResult create(UUID tenant, CollectionId parent, String name, IconKey icon, Integer pos);

    RenameResult rename(CollectionId col, String name);

    SetIconResult setIcon(CollectionId col, IconKey icon);

    MoveResult move(CollectionId col, CollectionId newParent, int pos);

    PlaceResult place(UUID item, CollectionId col, Integer pos);

    UnplaceResult unplace(UUID item);

    RemoveResult remove(CollectionId col);

    List<View> tree(UUID tenant);

    List<UUID> itemsIn(CollectionId col);

    List<String> pathOf(UUID item);

    Optional<UUID> collectionOf(UUID item);

    Optional<UUID> tenantOf(CollectionId col);

    Set<UUID> placed(UUID tenant);

    record CollectionId(UUID value) {
        public CollectionId {
            Objects.requireNonNull(value, "collection id");
        }
    }

    enum IconKey {
        BOOK("book"),
        CODE("code"),
        API("api"),
        GUIDE("guide"),
        REFERENCE("reference");
        private final String value;

        IconKey(String value) {
            this.value = value;
        }

        public String value() {
            return value;
        }

        public static IconKey parse(String value) {
            return java.util.Arrays.stream(values())
                    .filter(item -> item.value.equals(value))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("invalid collection icon"));
        }
    }

    /** 嵌套 {@code children}；{@code depth} 派生，根为 1。不含空间叶子。 */
    record View(
            UUID id,
            UUID tenantId,
            UUID parentId,
            int position,
            String name,
            IconKey icon,
            int depth,
            List<View> children) {
        public View {
            children = List.copyOf(children);
        }
    }

    sealed interface CreateResult {
        record Created(View collection) implements CreateResult {}

        record DepthExceeded() implements CreateResult {}

        record PositionInvalid() implements CreateResult {}

        record NameTaken() implements CreateResult {}

        record ParentNotFound() implements CreateResult {}

        record Invalid(String field, String code) implements CreateResult {}
    }

    sealed interface RenameResult {
        record Renamed(List<View> tree) implements RenameResult {}

        record NameTaken() implements RenameResult {}

        record NotFound() implements RenameResult {}

        record Invalid(String field, String code) implements RenameResult {}
    }

    sealed interface SetIconResult {
        record Changed(List<View> tree) implements SetIconResult {}

        record NotFound() implements SetIconResult {}

        record Invalid(String field, String code) implements SetIconResult {}
    }

    sealed interface MoveResult {
        record Moved(List<View> tree) implements MoveResult {}

        record DepthExceeded() implements MoveResult {}

        record CycleDetected() implements MoveResult {}

        record PositionInvalid() implements MoveResult {}

        record NameTaken() implements MoveResult {}

        record NotFound() implements MoveResult {}
    }

    sealed interface PlaceResult {
        record Placed(List<UUID> items) implements PlaceResult {}

        record PositionInvalid() implements PlaceResult {}

        record NotFound() implements PlaceResult {}
    }

    sealed interface UnplaceResult {
        record Unplaced() implements UnplaceResult {}
    }

    sealed interface RemoveResult {
        record Removed(List<View> tree) implements RemoveResult {}

        record NotEmpty() implements RemoveResult {}

        record NotFound() implements RemoveResult {}
    }
}
