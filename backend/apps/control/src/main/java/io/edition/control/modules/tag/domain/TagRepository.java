package io.edition.control.modules.tag.domain;

import io.edition.control.modules.tag.api.*;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/** 本模块 persistence 端口；只访问 {@code authoring.page_tags}。 */
public interface TagRepository {
    void lockVocabulary();

    Set<String> labelsOf(UUID itemId);

    Map<UUID, List<String>> labelsOf(Set<UUID> itemIds);

    Set<UUID> byLabel(String label);

    List<String> popular(int n);

    List<Row> matching(String prefix);

    boolean exists(String label);

    void insert(UUID itemId, String label);

    void delete(UUID itemId, String label);

    void rename(String from, String to);

    record Row(UUID itemId, String label) {}
}
