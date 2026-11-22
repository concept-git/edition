package io.edition.control.modules.page.persistence;

import io.edition.control.modules.page.api.*;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/** authoring.attachments：Page 的附件引用（ref → storage_key）；二进制不在库内。 */
@Mapper
interface AttachmentMapper {
    String COLUMNS = "id::text, page_id::text, filename, mime, size_bytes, storage_key, created_at";

    @Insert("""
            insert into authoring.attachments (id, page_id, filename, mime, size_bytes, storage_key, created_at, created_by)
            values (#{id}, #{pageId}, #{filename}, #{mime}, #{sizeBytes}, #{storageKey}, #{createdAt}, #{createdBy})
            """)
    void insert(
            @Param("id") UUID id,
            @Param("pageId") UUID pageId,
            @Param("filename") String filename,
            @Param("mime") String mime,
            @Param("sizeBytes") long sizeBytes,
            @Param("storageKey") String storageKey,
            @Param("createdAt") Instant createdAt,
            @Param("createdBy") UUID createdBy);

    @Delete("delete from authoring.attachments where page_id = #{pageId} and id = #{id}")
    int delete(@Param("pageId") UUID pageId, @Param("id") UUID id);

    @Select("select " + COLUMNS + " from authoring.attachments where page_id = #{pageId} order by created_at, id")
    List<AttachmentRow> findByPage(@Param("pageId") UUID pageId);

    @Select("""
            <script>
            select\s""" + COLUMNS + """

              from authoring.attachments
             where page_id in
             <foreach collection="pageIds" item="id" open="(" separator="," close=")">#{id}::uuid</foreach>
             order by created_at, id
            </script>
            """)
    List<AttachmentRow> findByPages(@Param("pageIds") Set<String> pageIds);

    @Select("""
            <script>
            with candidates as materialized (
              select a.id, a.page_id, p.title as page_title, a.filename, a.mime, a.size_bytes, a.created_at
              from authoring.attachments a join authoring.pages p on p.id=a.page_id
              where p.trashed_at is null
              <if test="before != null">and (a.created_at,a.id) &lt; (#{before},#{id})</if>
              order by a.created_at desc,a.id desc limit #{limit}
            )
            select id::text,page_id::text,page_title,filename,mime,size_bytes,created_at,
              (position(lower(#{q}) in lower(filename)) &gt; 0
               and (#{type}='all' or (#{type}='image' and mime like 'image/%')
                    or (#{type}='pdf' and mime='application/pdf'))) as matches
            from candidates order by created_at desc,id desc
            </script>
            """)
    @org.apache.ibatis.annotations.Options(timeout = 2)
    List<CandidateRow> candidates(
            @Param("before") Instant before,
            @Param("id") UUID id,
            @Param("limit") int limit,
            @Param("q") String q,
            @Param("type") String type);

    record CandidateRow(
            String id,
            String pageId,
            String pageTitle,
            String filename,
            String mime,
            long sizeBytes,
            Instant createdAt,
            boolean matches) {}

    record AttachmentRow(
            String id,
            String pageId,
            String filename,
            String mime,
            long sizeBytes,
            String storageKey,
            Instant createdAt) {}

    @Delete("delete from authoring.attachments where page_id=#{page}")
    void deleteAll(@Param("page") UUID page);

    @Select("select exists(select 1 from authoring.attachments where storage_key=#{key})")
    boolean referencesObject(@Param("key") String key);
}
