package io.edition.control.modules.revision.api;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** Revision 概念唯一出口；Item 与 Actor 均为不透明实例化值。 */
public interface RevisionApi {
    Entry record(ItemId item, int n, String content, Actor actor, String note);

    Entry record(
            ItemId item, int n, String content, Actor actor, String note, io.edition.content.ContentProfile profile);

    Optional<Detail> detail(ItemId item, int n);

    Page page(ItemId item, String cursor, int limit);

    Optional<Diff> diff(ItemId item, int from, int to);

    long count(ItemId item);

    record ItemId(UUID value) {
        public ItemId {
            Objects.requireNonNull(value, "item id");
        }
    }

    record Actor(ActorType type, UUID id) {
        public Actor {
            Objects.requireNonNull(type, "actor type");
            if (type != ActorType.SYSTEM) Objects.requireNonNull(id, "actor id");
            if (type == ActorType.SYSTEM && id != null) {
                throw new IllegalArgumentException("system actor must not have an id");
            }
        }
    }

    enum ActorType {
        USER,
        API_TOKEN,
        SYSTEM
    }

    record Entry(int n, Actor actor, Instant createdAt, String note, long sizeBytes, long sizeDelta) {}

    record Detail(Entry entry, String content, io.edition.content.ContentProfile contentProfile) {
        public Detail(Entry entry, String content) {
            this(entry, content, null);
        }
    }

    record Page(List<Entry> items, String nextCursor) {
        public Page {
            items = List.copyOf(items);
        }
    }

    record Diff(int from, int to, List<DiffHunk> hunks) {
        public Diff {
            hunks = List.copyOf(hunks);
        }
    }

    record DiffHunk(int oldStart, int oldLines, int newStart, int newLines, List<DiffLine> lines) {
        public DiffHunk {
            lines = List.copyOf(lines);
        }
    }

    record DiffLine(DiffLineType type, String content) {}

    enum DiffLineType {
        CONTEXT,
        ADD,
        DELETE
    }

    void prune(ItemId item, int keep);
}
