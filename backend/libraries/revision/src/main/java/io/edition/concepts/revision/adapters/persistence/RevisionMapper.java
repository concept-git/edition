package io.edition.concepts.revision.adapters.persistence;

import io.edition.concepts.revision.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface RevisionMapper {
    @Select("select true from (select pg_advisory_xact_lock(hashtextextended(#{item}::text, 0))) locked")
    boolean lock(@Param("item") UUID item);

    @Select("""
            select n, content, content_profile::text, actor_type, author_id::text, created_at, note,
                   octet_length(content) as size_bytes
              from authoring.revisions
             where page_id = #{item}
             order by n desc limit 1
            """)
    RevisionRow latest(@Param("item") UUID item);

    @Select("""
            insert into authoring.revisions (
              page_id, n, content, content_profile, content_sha, actor_type, author_id, note)
            values (#{item}, #{n}, #{content}, #{profile}::jsonb, #{contentSha}, #{actorType}, #{actorId}, #{note})
            returning n, content, content_profile::text, actor_type, author_id::text, created_at, note,
                      octet_length(content) as size_bytes
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    RevisionRow insert(
            @Param("item") UUID item,
            @Param("n") int n,
            @Param("content") String content,
            @Param("contentSha") String contentSha,
            @Param("actorType") String actorType,
            @Param("actorId") UUID actorId,
            @Param("note") String note,
            @Param("profile") String profile);

    @Select("""
            select n, content, content_profile::text, actor_type, author_id::text, created_at, note,
                   octet_length(content) as size_bytes
              from authoring.revisions
             where page_id = #{item} and n = #{n}
            """)
    RevisionRow find(@Param("item") UUID item, @Param("n") int n);

    @Select("""
            <script>
            select revision.n, revision.actor_type, revision.author_id::text, revision.created_at, revision.note,
                   octet_length(revision.content) as size_bytes,
                   octet_length(revision.content) - coalesce(octet_length(previous.content), 0) as size_delta
              from authoring.revisions revision
              left join authoring.revisions previous
                on previous.page_id = revision.page_id and previous.n = revision.n - 1
             where revision.page_id = #{item}
               <if test="before != null">and revision.n &lt; #{before}</if>
             order by revision.n desc limit #{limit}
            </script>
            """)
    List<EntryRow> page(@Param("item") UUID item, @Param("before") Integer before, @Param("limit") int limit);

    @Select("select count(*) from authoring.revisions where page_id = #{item}")
    long count(@Param("item") UUID item);

    record RevisionRow(
            int n,
            String content,
            String contentProfile,
            String actorType,
            String authorId,
            Instant createdAt,
            String note,
            long sizeBytes) {}

    record EntryRow(
            int n, String actorType, String authorId, Instant createdAt, String note, long sizeBytes, long sizeDelta) {}

    @org.apache.ibatis.annotations.Delete(
            "delete from authoring.revisions where page_id=#{item} and n not in (select n from authoring.revisions where page_id=#{item} order by n desc limit #{keep})")
    void prune(@Param("item") UUID item, @Param("keep") int keep);
}
