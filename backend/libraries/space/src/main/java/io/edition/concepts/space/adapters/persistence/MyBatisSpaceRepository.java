package io.edition.concepts.space.adapters.persistence;

import io.edition.concepts.space.api.*;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.space.domain.Space;
import io.edition.concepts.space.domain.SpaceName;
import io.edition.concepts.space.domain.SpaceRepository;
import io.edition.content.ResourcePath;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@Repository
class MyBatisSpaceRepository implements SpaceRepository {
    private final SpaceMapper mapper;
    private final TransactionTemplate uniqueWrites;

    MyBatisSpaceRepository(SpaceMapper mapper, PlatformTransactionManager transactions) {
        this.mapper = mapper;
        uniqueWrites = new TransactionTemplate(transactions);
        uniqueWrites.setPropagationBehavior(TransactionDefinition.PROPAGATION_NESTED);
    }

    @Override
    public Space insert(UUID tenantId, SpaceName name, SpaceApi.Mode mode, SpaceApi.ActorId actor) {
        return space(mapper.insert(tenantId, name.value(), stored(mode), actor.value()));
    }

    @Override
    public Optional<Space> find(SpaceApi.SpaceId id) {
        return Optional.ofNullable(mapper.find(id.value())).map(MyBatisSpaceRepository::space);
    }

    @Override
    public Optional<Space> lock(SpaceApi.SpaceId id) {
        return Optional.ofNullable(mapper.lock(id.value())).map(MyBatisSpaceRepository::space);
    }

    @Override
    public Space save(Space value) {
        return space(mapper.save(
                value.id(),
                value.name(),
                value.icon(),
                value.description(),
                value.status(),
                value.mode(),
                value.autoRelease(),
                value.updatedBy()));
    }

    @Override
    public List<Space> findByTenant(UUID tenantId) {
        return mapper.findByTenant(tenantId).stream()
                .map(MyBatisSpaceRepository::space)
                .toList();
    }

    @Override
    public List<Space> pageByTenant(
            UUID tenantId,
            java.time.Instant beforeUpdatedAt,
            UUID beforeId,
            int limit,
            SpaceApi.Status status,
            SpaceApi.Mode mode) {
        return mapper
                .pageByTenant(
                        tenantId,
                        beforeUpdatedAt,
                        beforeId,
                        limit,
                        status == null ? null : stored(status),
                        mode == null ? null : stored(mode))
                .stream()
                .map(MyBatisSpaceRepository::space)
                .toList();
    }

    @Override
    public Optional<SpaceApi.Placement> insertPlacement(SpaceApi.SpaceId space, UUID item, ResourcePath path) {
        return Optional.ofNullable(mapper.insertPlacement(space.value(), item, path.value()))
                .map(MyBatisSpaceRepository::placement);
    }

    @Override
    public Optional<SpaceApi.Placement> updatePlacementSlug(SpaceApi.SpaceId space, UUID item, ResourcePath path) {
        return uniquePlacement(() -> mapper.updatePlacementSlug(space.value(), item, path.value()));
    }

    @Override
    public Optional<SpaceApi.Placement> transferPlacement(
            UUID item, SpaceApi.SpaceId from, SpaceApi.SpaceId to, ResourcePath path) {
        return uniquePlacement(() -> mapper.transferPlacement(item, from.value(), to.value(), path.value()));
    }

    /** 地址占用是有限冲突：回滚保存点后外层仍能查询旧地址或继续同事务的其他动作。 */
    private Optional<SpaceApi.Placement> uniquePlacement(java.util.function.Supplier<SpaceMapper.PlacementRow> write) {
        try {
            return Optional.ofNullable(uniqueWrites.execute(status -> write.get()))
                    .map(MyBatisSpaceRepository::placement);
        } catch (DuplicateKeyException conflict) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<SpaceApi.Placement> placementOf(UUID item) {
        return Optional.ofNullable(mapper.placementOf(item)).map(MyBatisSpaceRepository::placement);
    }

    @Override
    public Optional<SpaceApi.Placement> placementAt(SpaceApi.SpaceId space, ResourcePath path) {
        return Optional.ofNullable(mapper.placementAt(space.value(), path.value()))
                .map(MyBatisSpaceRepository::placement);
    }

    @Override
    public List<SpaceApi.Placement> placementsOf(SpaceApi.SpaceId space) {
        return mapper.placementsOf(space.value()).stream()
                .map(MyBatisSpaceRepository::placement)
                .toList();
    }

    @Override
    public List<SpaceApi.Placement> placementsOfItems(Set<UUID> items) {
        if (items.isEmpty()) return List.of();
        Set<String> ids = items.stream().map(UUID::toString).collect(Collectors.toUnmodifiableSet());
        return mapper.placementsOfItems(ids).stream()
                .map(MyBatisSpaceRepository::placement)
                .toList();
    }

    private static Space space(SpaceMapper.SpaceRow row) {
        return new Space(
                UUID.fromString(row.id()),
                UUID.fromString(row.tenantId()),
                new SpaceName(row.name()),
                row.icon() == null ? null : SpaceApi.IconKey.parse(row.icon()),
                row.description(),
                SpaceApi.Mode.valueOf(row.mode().toUpperCase(Locale.ROOT)),
                SpaceApi.Status.valueOf(row.status().toUpperCase(Locale.ROOT)),
                row.autoRelease(),
                row.createdAt(),
                uuid(row.createdBy()),
                row.updatedAt(),
                uuid(row.updatedBy()));
    }

    private static String stored(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT);
    }

    private static UUID uuid(String value) {
        return value == null ? null : UUID.fromString(value);
    }

    private static SpaceApi.Placement placement(SpaceMapper.PlacementRow row) {
        return new SpaceApi.Placement(
                new SpaceApi.SpaceId(UUID.fromString(row.spaceId())), UUID.fromString(row.pageId()), row.slug());
    }

    @Override
    public void delete(SpaceApi.SpaceId space) {
        mapper.delete(space.value());
    }

    @Override
    public void unplace(UUID item) {
        mapper.unplace(item);
    }
}
