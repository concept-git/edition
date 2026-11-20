package io.space.concepts.toc.adapters.persistence;

import io.space.concepts.toc.api.*;
import io.space.concepts.toc.api.TocApi;
import io.space.concepts.toc.domain.TocRepository;
import io.space.concepts.toc.domain.TocTree;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/** kind 线值小写落库；UUID 以 text 进出以免驱动/MyBatis 在 RLS 角色下丢类型。 */
@Repository
class MyBatisTocRepository implements TocRepository {
    private final TocEntryMapper mapper;

    MyBatisTocRepository(TocEntryMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public List<TocTree.StoredEntry> lockSpace(UUID spaceId) {
        mapper.lockScope(spaceId);
        return mapper.lockSpace(spaceId).stream().map(this::entry).toList();
    }

    @Override
    public List<TocTree.StoredEntry> list(UUID spaceId) {
        return mapper.list(spaceId).stream().map(this::entry).toList();
    }

    @Override
    public Optional<TocTree.StoredEntry> find(UUID entryId) {
        return Optional.ofNullable(mapper.find(entryId)).map(this::entry);
    }

    @Override
    public void insert(TocTree.StoredEntry entry) {
        mapper.insert(
                entry.id(),
                entry.spaceId(),
                entry.parentId(),
                entry.position(),
                entry.label(),
                stored(entry.kind()),
                entry.targetId(),
                entry.url());
    }

    @Override
    public void updatePlacement(UUID id, UUID parentId, int position) {
        mapper.updatePlacement(id, parentId, position);
    }

    @Override
    public void updateLabel(UUID id, String label) {
        mapper.updateLabel(id, label);
    }

    @Override
    public void delete(List<UUID> ids) {
        if (ids.isEmpty()) return;
        mapper.delete(ids.stream().map(UUID::toString).toList());
    }

    @Override
    public void deleteSpace(UUID spaceId) {
        mapper.deleteSpace(spaceId);
    }

    @Override
    public List<TocTree.StoredEntry> entriesFor(UUID targetId) {
        return mapper.entriesFor(targetId).stream().map(this::entry).toList();
    }

    private TocTree.StoredEntry entry(TocEntryMapper.TocEntryRow row) {
        return new TocTree.StoredEntry(
                UUID.fromString(row.id()),
                UUID.fromString(row.spaceId()),
                row.parentId() == null ? null : UUID.fromString(row.parentId()),
                row.position(),
                row.label(),
                TocApi.Kind.valueOf(row.kind().toUpperCase(Locale.ROOT)),
                row.targetPageId() == null ? null : UUID.fromString(row.targetPageId()),
                row.url());
    }

    private static String stored(TocApi.Kind kind) {
        return kind.name().toLowerCase(Locale.ROOT);
    }
}
