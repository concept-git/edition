package io.edition.control.modules.page.persistence;

import io.edition.control.modules.page.api.*;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface PageMapper {
    String COLUMNS = "id::text, title, format, content, content_profile::text as content_profile, revision, status, "
            + "seo_title, seo_description, seo_keywords, og_image_url, no_index, icon, properties::text as properties, "
            + "trashed_at, created_at, created_by_type, created_by::text, updated_at, updated_by_type, updated_by::text";

    @Select("""
            insert into authoring.pages (
              tenant_id, title, format, content_profile, created_by_type, created_by, updated_by_type, updated_by)
            values (
              shared.require_tenant_id(), #{title}, #{format}, #{contentProfile}::jsonb, #{actorType}, #{actorId}, #{actorType}, #{actorId})
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    PageRow insert(
            @Param("title") String title,
            @Param("format") String format,
            @Param("actorType") String actorType,
            @Param("actorId") UUID actorId,
            @Param("contentProfile") String contentProfile);

    @Select("""
            insert into authoring.pages (
              id, tenant_id, title, format, created_by_type, created_by, updated_by_type, updated_by)
            values (
              #{id}, shared.require_tenant_id(), #{title}, #{format}, #{actorType}, #{actorId}, #{actorType}, #{actorId})
            on conflict (id) do nothing
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    PageRow insertWithId(
            @Param("id") UUID id,
            @Param("title") String title,
            @Param("format") String format,
            @Param("actorType") String actorType,
            @Param("actorId") UUID actorId);

    @Select("""
            insert into authoring.pages (
              id, tenant_id, title, format, content, revision, seo_title, seo_description, seo_keywords,
              og_image_url, no_index, properties, content_profile, created_by_type, created_by, updated_by_type, updated_by)
            values (#{page.id}, shared.require_tenant_id(), #{page.title}, #{format}, #{page.content},
              #{page.revision}, #{page.seo.title}, #{page.seo.description}, #{page.seo.keywords},
              #{page.seo.ogImage}, #{page.seo.noIndex}, #{properties}::jsonb, #{contentProfile}::jsonb,
              #{actorType}, #{page.createdBy.id}, #{actorType}, #{page.updatedBy.id})
            on conflict (id) do nothing
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    PageRow insertInitial(
            @Param("page") io.edition.control.modules.page.api.PageApi.View page,
            @Param("format") String format,
            @Param("actorType") String actorType,
            @Param("properties") String properties,
            @Param("contentProfile") String contentProfile);

    @Select("select " + COLUMNS + " from authoring.pages where id = #{id}")
    PageRow find(@Param("id") UUID id);

    @Select("select " + COLUMNS + " from authoring.pages where id = #{id} for update")
    @Options(flushCache = Options.FlushCachePolicy.TRUE, useCache = false)
    PageRow lock(@Param("id") UUID id);

    @Select("""
            update authoring.pages
               set title = #{title}, content = #{content}, content_profile = #{contentProfile}::jsonb, revision = #{revision}, status = #{status},
                   seo_title = #{seoTitle}, seo_description = #{seoDescription}, seo_keywords = #{seoKeywords},
                   og_image_url = #{ogImage}, no_index = #{noIndex}, icon = #{icon},
                   properties = #{properties}::jsonb, trashed_at = #{trashedAt},
                   updated_by_type = #{actorType}, updated_by = #{actorId}, updated_at = now()
             where id = #{id}
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    PageRow save(
            @Param("id") UUID id,
            @Param("title") String title,
            @Param("content") String content,
            @Param("contentProfile") String contentProfile,
            @Param("revision") int revision,
            @Param("status") String status,
            @Param("seoTitle") String seoTitle,
            @Param("seoDescription") String seoDescription,
            @Param("seoKeywords") String seoKeywords,
            @Param("ogImage") String ogImage,
            @Param("noIndex") boolean noIndex,
            @Param("icon") String icon,
            @Param("properties") String properties,
            @Param("trashedAt") Instant trashedAt,
            @Param("actorType") String actorType,
            @Param("actorId") UUID actorId);

    @Select("""
            <script>
            select\s""" + COLUMNS + """

              from authoring.pages
             where id in
             <foreach collection="ids" item="id" open="(" separator="," close=")">#{id}::uuid</foreach>
             order by updated_at desc, id desc
            </script>
            """)
    // Chunked callers must not retain every prior page body in the transaction-local MyBatis cache.
    @Options(useCache = false, flushCache = Options.FlushCachePolicy.TRUE)
    List<PageRow> findAll(@Param("ids") Set<String> ids);

    @Select("""
            select\s""" + COLUMNS + """

              from authoring.pages
             where tenant_id = shared.require_tenant_id()
               and (#{includeTrashed} or trashed_at is null)
               and (#{status}::text is null or status = #{status})
               and (#{format}::text is null or format = #{format})
               and (#{beforeUpdatedAt}::timestamptz is null
                    or updated_at < #{beforeUpdatedAt}
                    or (updated_at = #{beforeUpdatedAt} and id < #{beforeId}))
             order by updated_at desc, id desc
             limit #{limit}
            """)
    List<PageRow> page(
            @Param("beforeUpdatedAt") Instant beforeUpdatedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit,
            @Param("status") String status,
            @Param("format") String format,
            @Param("includeTrashed") boolean includeTrashed);

    @Select("""
            select\s""" + COLUMNS + """

              from authoring.pages
             where tenant_id = shared.require_tenant_id()
               and trashed_at is not null
               and (#{beforeTrashedAt}::timestamptz is null
                    or trashed_at < #{beforeTrashedAt}
                    or (trashed_at = #{beforeTrashedAt} and id < #{beforeId}))
             order by trashed_at desc, id desc
             limit #{limit}
            """)
    List<PageRow> trashed(
            @Param("beforeTrashedAt") Instant beforeTrashedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit);

    record PageRow(
            String id,
            String title,
            String format,
            String content,
            String contentProfile,
            int revision,
            String status,
            String seoTitle,
            String seoDescription,
            String seoKeywords,
            String ogImageUrl,
            boolean noIndex,
            String icon,
            String properties,
            Instant trashedAt,
            Instant createdAt,
            String createdByType,
            String createdBy,
            Instant updatedAt,
            String updatedByType,
            String updatedBy) {}

    @org.apache.ibatis.annotations.Delete("delete from authoring.pages where id=#{id}")
    int delete(@Param("id") UUID id);

    @Select(
            "select id::text from authoring.pages where trashed_at < #{before} and (#{after}::uuid is null or id>#{after}) order by id limit #{limit}")
    List<String> expired(
            @Param("before") java.time.Instant before, @Param("after") UUID after, @Param("limit") int limit);

    @Select("""
        <script>
        select count(*) filter(where trashed_at is null) working_pages,count(*) filter(where trashed_at is not null) trashed_pages,
        count(*) filter(where trashed_at is null and status='published') published_pages,
        coalesce(sum(octet_length(content)) filter(where trashed_at is null),0) working_text_bytes,
        coalesce(sum(octet_length(content)) filter(where trashed_at is not null),0) trashed_text_bytes,
        coalesce(sum((select count(*) from authoring.attachments a where a.page_id=p.id)),0) attachment_count,
        coalesce(sum((select sum(size_bytes) from authoring.attachments a where a.page_id=p.id)),0) attachment_bytes
        from authoring.pages p where p.id in
        <foreach collection="ids" item="id" open="(" separator="," close=")">#{id}::uuid</foreach>
        </script>
        """)
    io.edition.control.modules.page.api.PageApi.Usage usage(@Param("ids") Set<String> ids);
}
