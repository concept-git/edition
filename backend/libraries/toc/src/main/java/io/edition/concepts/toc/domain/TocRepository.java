package io.edition.concepts.toc.domain;

import io.edition.concepts.toc.api.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** 本模块 persistence 端口；只访问 {@code authoring.toc_entries}。 */
public interface TocRepository {
    List<TocTree.StoredEntry> lockSpace(UUID spaceId);

    List<TocTree.StoredEntry> list(UUID spaceId);

    Optional<TocTree.StoredEntry> find(UUID entryId);

    void insert(TocTree.StoredEntry entry);

    void updatePlacement(UUID id, UUID parentId, int position);

    void updateLabel(UUID id, String label);

    void delete(List<UUID> ids);

    void deleteSpace(UUID spaceId);

    List<TocTree.StoredEntry> entriesFor(UUID targetId);
}
