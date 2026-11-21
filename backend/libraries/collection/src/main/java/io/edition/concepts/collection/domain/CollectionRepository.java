package io.edition.concepts.collection.domain;

import io.edition.concepts.collection.api.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** 本模块 persistence 端口；只访问 {@code authoring.collections} 与 {@code authoring.collection_spaces}。 */
public interface CollectionRepository {
    List<CollectionTree.StoredCollection> lockTenant(UUID tenantId);

    List<CollectionTree.StoredMembership> lockMemberships(UUID tenantId);

    List<CollectionTree.StoredCollection> list(UUID tenantId);

    List<CollectionTree.StoredMembership> memberships(UUID tenantId);

    Optional<CollectionTree.StoredCollection> find(UUID collectionId);

    Optional<CollectionTree.StoredMembership> membershipOf(UUID spaceId);

    void insert(CollectionTree.StoredCollection collection);

    void updatePlacement(UUID id, UUID parentId, int position);

    void updateName(UUID id, String name);

    void updateIcon(UUID id, String icon);

    void delete(UUID id);

    void upsertMembership(CollectionTree.StoredMembership membership);

    void deleteMembership(UUID spaceId);
}
