package io.edition.concepts.space.api;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/** Space 概念唯一出口。调用方负责建立 tenant scope。 */
public interface SpaceApi {
    View create(ActorId actor, UUID tenantId, String name, Mode mode);

    MutationResult rename(ActorId actor, SpaceId space, String name);

    MutationResult describe(ActorId actor, SpaceId space, Patch<IconKey> icon, Patch<String> description);

    LookupResult archive(ActorId actor, SpaceId space);

    LookupResult restore(ActorId actor, SpaceId space);

    MutationResult convert(ActorId actor, SpaceId space, Mode toMode);

    MutationResult setAutoRelease(ActorId actor, SpaceId space, boolean on);

    Optional<View> view(SpaceId space);

    List<View> listByTenant(UUID tenantId);

    Page pageByTenant(UUID tenantId, String cursor, int limit, Optional<Status> status, Optional<Mode> mode);

    Optional<UUID> tenantOf(SpaceId space);

    Optional<Status> status(SpaceId space);

    Optional<Mode> mode(SpaceId space);

    PlacementResult place(SpaceId space, UUID item, String slug);

    PlacementResult reslug(SpaceId space, UUID item, String newSlug);

    TransferResult transfer(UUID item, SpaceId toSpace, String slug);

    Optional<SpaceId> spaceOf(UUID item);

    Optional<UUID> itemAt(SpaceId space, String slug);

    List<Placement> itemsOf(SpaceId space);

    List<Placement> placementsOf(Set<UUID> items);

    record SpaceId(UUID value) {
        public SpaceId {
            Objects.requireNonNull(value, "space id");
        }
    }

    record ActorId(UUID value) {
        public ActorId {
            Objects.requireNonNull(value, "actor id");
        }
    }

    enum Mode {
        AUTHORED,
        SYNCED
    }

    enum Status {
        ACTIVE,
        ARCHIVED
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
                    .orElseThrow(() -> new IllegalArgumentException("invalid space icon"));
        }
    }

    record View(
            UUID id,
            UUID tenantId,
            String name,
            IconKey icon,
            String description,
            Mode mode,
            Status status,
            boolean autoRelease,
            Instant createdAt,
            UUID createdBy,
            Instant updatedAt,
            UUID updatedBy) {}

    record Page(List<View> items, String nextCursor) {
        public Page {
            items = List.copyOf(items);
        }
    }

    sealed interface Patch<T> {
        record Unchanged<T>() implements Patch<T> {}

        record Clear<T>() implements Patch<T> {}

        record Set<T>(T value) implements Patch<T> {
            public Set {
                Objects.requireNonNull(value, "patch value");
            }
        }

        static <T> Patch<T> unchanged() {
            return new Unchanged<>();
        }

        static <T> Patch<T> clear() {
            return new Clear<>();
        }

        static <T> Patch<T> set(T value) {
            return new Set<>(value);
        }
    }

    sealed interface LookupResult {
        record Found(View space) implements LookupResult {}

        record NotFound() implements LookupResult {}
    }

    sealed interface MutationResult {
        record Changed(View space) implements MutationResult {}

        record NotFound() implements MutationResult {}

        record Archived() implements MutationResult {}
    }

    record Placement(SpaceId space, UUID item, String slug) {}

    sealed interface PlacementResult {
        record Placed(Placement placement) implements PlacementResult {}

        record SpaceNotFound() implements PlacementResult {}

        record SpaceArchived() implements PlacementResult {}

        record SlugInvalid() implements PlacementResult {}

        record SlugTaken() implements PlacementResult {}

        record ItemAlreadyPlaced(Placement placement) implements PlacementResult {}

        record ItemNotInSpace() implements PlacementResult {}
    }

    sealed interface TransferResult {
        record Transferred(Placement from, Placement to) implements TransferResult {}

        record SpaceNotFound() implements TransferResult {}

        record SpaceArchived() implements TransferResult {}

        record SlugInvalid() implements TransferResult {}

        record SlugTaken() implements TransferResult {}

        record ItemNotPlaced() implements TransferResult {}

        record SameSpace() implements TransferResult {}
    }

    Optional<View> lock(SpaceId space);

    boolean delete(SpaceId space);

    void unplace(UUID item);
}
