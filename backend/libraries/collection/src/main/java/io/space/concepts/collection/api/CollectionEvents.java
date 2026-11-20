package io.space.concepts.collection.api;

import java.util.UUID;

/** 本概念事件：不点名 Space；消费者只按 tenantId/collectionId/itemId 协调。 */
public final class CollectionEvents {
    private CollectionEvents() {}

    public record Created(UUID tenantId, UUID collectionId) {}

    public record Renamed(UUID tenantId, UUID collectionId) {}

    public record IconChanged(UUID tenantId, UUID collectionId) {}

    public record Moved(UUID tenantId, UUID collectionId) {}

    public record Placed(UUID tenantId, UUID collectionId, UUID itemId) {}

    public record Unplaced(UUID tenantId, UUID itemId) {}

    public record Removed(UUID tenantId, UUID collectionId) {}
}
