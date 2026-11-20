package io.space.concepts.space.domain;

import io.space.concepts.space.api.*;
import io.space.concepts.space.api.SpaceApi;
import io.space.content.ResourcePath;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface SpaceRepository {
    Space insert(UUID tenantId, SpaceName name, SpaceApi.Mode mode, SpaceApi.ActorId actor);

    Optional<Space> find(SpaceApi.SpaceId id);

    Optional<Space> lock(SpaceApi.SpaceId id);

    Space save(Space space);

    List<Space> findByTenant(UUID tenantId);

    List<Space> pageByTenant(
            UUID tenantId,
            java.time.Instant beforeUpdatedAt,
            UUID beforeId,
            int limit,
            SpaceApi.Status status,
            SpaceApi.Mode mode);

    Optional<SpaceApi.Placement> insertPlacement(SpaceApi.SpaceId space, UUID item, ResourcePath path);

    Optional<SpaceApi.Placement> updatePlacementSlug(SpaceApi.SpaceId space, UUID item, ResourcePath path);

    Optional<SpaceApi.Placement> transferPlacement(
            UUID item, SpaceApi.SpaceId from, SpaceApi.SpaceId to, ResourcePath path);

    Optional<SpaceApi.Placement> placementOf(UUID item);

    Optional<SpaceApi.Placement> placementAt(SpaceApi.SpaceId space, ResourcePath path);

    List<SpaceApi.Placement> placementsOf(SpaceApi.SpaceId space);

    List<SpaceApi.Placement> placementsOfItems(Set<UUID> items);

    void delete(SpaceApi.SpaceId space);

    void unplace(UUID item);
}
