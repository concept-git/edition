package io.edition.control.modules.collection.persistence;

import io.edition.control.modules.collection.api.*;
import io.edition.control.modules.collection.api.CollectionApi;
import io.edition.control.modules.collection.domain.CollectionRepository;
import io.edition.control.modules.collection.domain.CollectionTree;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/** UUID 以 text 进出以免驱动/MyBatis 在 RLS 角色下丢类型。 */
@Repository
class MyBatisCollectionRepository implements CollectionRepository {
    private final CollectionMapper mapper;

    MyBatisCollectionRepository(CollectionMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public List<CollectionTree.StoredCollection> lockTenant(UUID tenantId) {
        // Row locks alone cannot serialize first writes into an empty tree.
        mapper.lockScope(tenantId);
        return mapper.lockTenant(tenantId).stream().map(this::collection).toList();
    }

    @Override
    public List<CollectionTree.StoredMembership> lockMemberships(UUID tenantId) {
        return mapper.lockMemberships(tenantId).stream().map(this::membership).toList();
    }

    @Override
    public List<CollectionTree.StoredCollection> list(UUID tenantId) {
        return mapper.list(tenantId).stream().map(this::collection).toList();
    }

    @Override
    public List<CollectionTree.StoredMembership> memberships(UUID tenantId) {
        return mapper.memberships(tenantId).stream().map(this::membership).toList();
    }

    @Override
    public Optional<CollectionTree.StoredCollection> find(UUID collectionId) {
        return Optional.ofNullable(mapper.find(collectionId)).map(this::collection);
    }

    @Override
    public Optional<CollectionTree.StoredMembership> membershipOf(UUID spaceId) {
        return Optional.ofNullable(mapper.membershipOf(spaceId)).map(this::membership);
    }

    @Override
    public void insert(CollectionTree.StoredCollection collection) {
        mapper.insert(
                collection.id(),
                collection.tenantId(),
                collection.parentId(),
                collection.position(),
                collection.name(),
                stored(collection.icon()));
    }

    @Override
    public void updatePlacement(UUID id, UUID parentId, int position) {
        mapper.updatePlacement(id, parentId, position);
    }

    @Override
    public void updateName(UUID id, String name) {
        mapper.updateName(id, name);
    }

    @Override
    public void updateIcon(UUID id, String icon) {
        mapper.updateIcon(id, icon);
    }

    @Override
    public void delete(UUID id) {
        mapper.delete(id);
    }

    @Override
    public void upsertMembership(CollectionTree.StoredMembership membership) {
        mapper.upsertMembership(membership.spaceId(), membership.collectionId(), membership.position());
    }

    @Override
    public void deleteMembership(UUID spaceId) {
        mapper.deleteMembership(spaceId);
    }

    private CollectionTree.StoredCollection collection(CollectionMapper.CollectionRow row) {
        return new CollectionTree.StoredCollection(
                UUID.fromString(row.id()),
                UUID.fromString(row.tenantId()),
                row.parentId() == null ? null : UUID.fromString(row.parentId()),
                row.position(),
                row.name(),
                row.icon() == null
                        ? null
                        : CollectionApi.IconKey.parse(row.icon().toLowerCase(Locale.ROOT)));
    }

    private CollectionTree.StoredMembership membership(CollectionMapper.MembershipRow row) {
        return new CollectionTree.StoredMembership(
                UUID.fromString(row.spaceId()), UUID.fromString(row.collectionId()), row.position());
    }

    private static String stored(CollectionApi.IconKey icon) {
        return icon == null ? null : icon.value();
    }
}
