package io.space.concepts.toc.api;

import java.util.UUID;

/** 本概念事件：不点名 Page/Space；消费者只按 spaceId/entryId 协调。 */
public final class TocEvents {
    private TocEvents() {}

    public record EntryAdded(UUID spaceId, UUID entryId) {}

    public record EntryMoved(UUID spaceId, UUID entryId) {}

    public record EntryRelabeled(UUID spaceId, UUID entryId) {}

    public record EntryRemoved(UUID spaceId, UUID entryId) {}

    public record Replaced(UUID spaceId) {}
}
