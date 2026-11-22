package io.edition.control.modules.tag.persistence;

import io.edition.control.modules.tag.api.*;
import io.edition.control.modules.tag.domain.TagRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisTagRepository implements TagRepository {
    private final PageTagMapper mapper;

    MyBatisTagRepository(PageTagMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void lockVocabulary() {
        mapper.lockVocabulary();
    }

    @Override
    public Set<String> labelsOf(UUID itemId) {
        return Set.copyOf(mapper.labelsOf(itemId));
    }

    @Override
    public Map<UUID, List<String>> labelsOf(Set<UUID> itemIds) {
        if (itemIds.isEmpty()) return Map.of();
        Set<String> ids = itemIds.stream().map(UUID::toString).collect(Collectors.toUnmodifiableSet());
        Map<UUID, List<String>> grouped = new LinkedHashMap<>();
        for (PageTagMapper.TagRow row : mapper.labelsOfItems(ids)) {
            grouped.computeIfAbsent(UUID.fromString(row.pageId()), ignored -> new ArrayList<>())
                    .add(row.label());
        }
        return grouped;
    }

    @Override
    public Set<UUID> byLabel(String label) {
        return mapper.byLabel(label).stream().map(UUID::fromString).collect(Collectors.toUnmodifiableSet());
    }

    @Override
    public List<String> popular(int n) {
        return List.copyOf(mapper.popular(n));
    }

    @Override
    public List<Row> matching(String prefix) {
        String escaped = prefix == null
                ? null
                : prefix.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return mapper.matching(escaped).stream()
                .map(row -> new Row(UUID.fromString(row.pageId()), row.label()))
                .toList();
    }

    @Override
    public boolean exists(String label) {
        return mapper.exists(label);
    }

    @Override
    public void insert(UUID itemId, String label) {
        mapper.insert(itemId, label);
    }

    @Override
    public void delete(UUID itemId, String label) {
        mapper.delete(itemId, label);
    }

    @Override
    public void rename(String from, String to) {
        mapper.deleteOverlaps(from, to);
        mapper.relabel(from, to);
    }
}
