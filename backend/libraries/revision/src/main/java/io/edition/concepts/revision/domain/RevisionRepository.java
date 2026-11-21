package io.edition.concepts.revision.domain;

import io.edition.concepts.revision.api.*;
import io.edition.concepts.revision.api.RevisionApi;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RevisionRepository {
    void lock(RevisionApi.ItemId item);

    Optional<Stored> latest(RevisionApi.ItemId item);

    Stored insert(
            RevisionApi.ItemId item,
            int n,
            String content,
            String contentSha,
            RevisionApi.Actor actor,
            String note,
            io.edition.content.ContentProfile profile);

    Optional<Stored> find(RevisionApi.ItemId item, int n);

    /** 摘要与相邻修订字节差由同一次查询取得，不将正文带入列表。 */
    List<RevisionApi.Entry> page(RevisionApi.ItemId item, Integer before, int limit);

    long count(RevisionApi.ItemId item);

    record Stored(
            int n,
            String content,
            RevisionApi.Actor actor,
            Instant createdAt,
            String note,
            long sizeBytes,
            io.edition.content.ContentProfile contentProfile) {}

    void prune(RevisionApi.ItemId item, int keep);
}
