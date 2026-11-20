package io.space.concepts.release.adapters.persistence;

import io.space.concepts.release.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
interface ReleaseMapper {
    String COLUMNS = "id::text, space_id::text, status, label, notes, source_kind, source_ref, "
            + "source_actor_id::text, page_count, report::text as report, created_at, promoted_at, "
            + "bundle_version, generator, generated_at";

    @Select("""
            insert into releases.releases (
              space_id, status, label, source_kind, source_ref, source_actor_id)
            values (#{scopeId}, 'draft', #{label}, #{sourceKind}, #{sourceRef}, #{sourceActor})
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    ReleaseRow insert(
            @Param("scopeId") UUID scopeId,
            @Param("label") String label,
            @Param("sourceKind") String sourceKind,
            @Param("sourceRef") String sourceRef,
            @Param("sourceActor") UUID sourceActor);

    @Insert(
            "insert into releases.release_pins(tenant_id,reservation,release_id,expires_at) values(shared.require_tenant_id(),#{reservation},#{id},#{until}) on conflict(reservation) do update set expires_at=greatest(releases.release_pins.expires_at,excluded.expires_at) where releases.release_pins.release_id=excluded.release_id")
    void pin(@Param("id") UUID id, @Param("reservation") UUID reservation, @Param("until") Instant until);

    @Select("select " + COLUMNS + " from releases.releases where id = #{id}")
    ReleaseRow find(@Param("id") UUID id);

    @Select("select " + COLUMNS + " from releases.releases where id = #{id} for update")
    ReleaseRow lock(@Param("id") UUID id);

    @Select("select " + COLUMNS + """
              from releases.releases
             where space_id = #{scopeId} and status = 'live'
             for update
            """)
    ReleaseRow lockLive(@Param("scopeId") UUID scopeId);

    @Select("""
            update releases.releases
               set status = #{status}, label = #{label}, notes = #{notes},
                   page_count = #{pageCount}, report = #{report}::jsonb, promoted_at = #{promotedAt}
             where id = #{id}
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    ReleaseRow save(
            @Param("id") UUID id,
            @Param("status") String status,
            @Param("label") String label,
            @Param("notes") String notes,
            @Param("pageCount") int pageCount,
            @Param("report") String report,
            @Param("promotedAt") Instant promotedAt);

    @Select("select exists(select 1 from releases.release_toc where release_id = #{id})")
    boolean hasSnapshot(@Param("id") UUID id);

    @Insert("""
            <script>
            insert into releases.release_contents (tenant_id, content_hash, body)
            values
            <foreach collection="rows" item="row" separator=",">
              (shared.require_tenant_id(), #{row.contentHash}, #{row.body})
            </foreach>
            on conflict (tenant_id, content_hash) do nothing
            </script>
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    int insertContents(@Param("rows") List<SnapshotRow> rows);

    @Insert("""
            <script>
            insert into releases.release_pages (
              tenant_id, release_id, page_id, slug, title, format, seo, icon, properties,
              external_id, attachments, content_hash, seq, content_profile, content_definition)
            values
            <foreach collection="rows" item="row" separator=",">
              (shared.require_tenant_id(), #{releaseId}, #{row.pageId}::uuid, #{row.slug}, #{row.title}, #{row.format},
               #{row.seo}::jsonb, #{row.icon}, #{row.properties}::jsonb, #{row.externalId},
               #{row.attachments}::jsonb, #{row.contentHash}, #{row.seq}, #{row.contentProfile}::jsonb, #{row.contentDefinition}::jsonb)
            </foreach>
            </script>
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    int insertPages(@Param("releaseId") UUID releaseId, @Param("rows") List<SnapshotRow> rows);

    record SnapshotRow(
            String pageId,
            String slug,
            String title,
            String format,
            String seo,
            String icon,
            String properties,
            String externalId,
            String attachments,
            String contentHash,
            String body,
            int seq,
            String contentProfile,
            String contentDefinition) {}

    @Insert("""
            insert into releases.release_toc (release_id, tree)
            values (#{releaseId}, #{tree}::jsonb)
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    int insertToc(@Param("releaseId") UUID releaseId, @Param("tree") String tree);

    @Update("""
            update releases.releases
               set bundle_version = #{bundleVersion}, generator = #{generator}, generated_at = #{generatedAt}
             where id = #{id}
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    int saveBundleMeta(
            @Param("id") UUID id,
            @Param("bundleVersion") String bundleVersion,
            @Param("generator") String generator,
            @Param("generatedAt") Instant generatedAt);

    @Select("""
            select p.page_id::text, p.slug, p.title, p.format, c.body, p.seo::text as seo, p.icon,
                   p.properties::text as properties, p.external_id, p.attachments::text as attachments, p.seq, p.content_profile::text as content_profile, p.content_definition::text as content_definition
              from releases.release_pages p
              join releases.release_contents c
                on c.tenant_id = p.tenant_id and c.content_hash = p.content_hash
             where p.release_id = #{id}
             order by p.seq, p.page_id
            """)
    List<PageRow> pages(@Param("id") UUID id);

    @Select("""
            select p.page_id::text, p.slug, p.title, p.format, c.body, p.seo::text as seo, p.icon,
                   p.properties::text as properties, p.external_id, p.attachments::text as attachments, p.seq, p.content_profile::text as content_profile, p.content_definition::text as content_definition
              from releases.release_pages p
              join releases.release_contents c
                on c.tenant_id = p.tenant_id and c.content_hash = p.content_hash
             where p.release_id = #{id} and p.page_id = #{pageId}
            """)
    PageRow page(@Param("id") UUID id, @Param("pageId") UUID pageId);

    @Select("""
            select page_id::text, slug, title, seo::text as seo, seq
              from releases.release_pages
             where release_id = #{id}
             order by seq, page_id
            """)
    List<PageHeaderRow> pageHeaders(@Param("id") UUID id);

    @Select("select tree::text from releases.release_toc where release_id = #{id}")
    String toc(@Param("id") UUID id);

    @Select(
            "select page_id::text, content_hash || coalesce(content_profile::text, '') || coalesce(content_definition::text, '') as content_hash from releases.release_pages where release_id = #{id}")
    List<FingerprintRow> fingerprints(@Param("id") UUID id);

    @Delete("delete from releases.releases where id = #{id}")
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    int delete(@Param("id") UUID id);

    @Select("select " + COLUMNS + """
              from releases.releases
             where space_id = #{scopeId} and status = 'live'
            """)
    ReleaseRow live(@Param("scopeId") UUID scopeId);

    @Select("select " + COLUMNS + """
              from releases.releases
             where space_id = #{scopeId}
             order by created_at desc, id desc
            """)
    List<ReleaseRow> list(@Param("scopeId") UUID scopeId);

    @Select("""
            <script>
            select r.id::text, r.space_id::text, r.status, r.label, r.notes, r.source_kind, r.source_ref,
                   r.source_actor_id::text, r.page_count, r.report::text as report, r.created_at, r.promoted_at,
                   r.bundle_version, r.generator, r.generated_at,
                   exists(select 1 from releases.release_toc t where t.release_id = r.id) as loaded
              from releases.releases r
             where r.space_id in
               <foreach collection="scopes" item="scope" open="(" separator="," close=")">
                 cast(#{scope} as uuid)
               </foreach>
               <if test="status != null">and r.status = #{status}</if>
               <if test="beforeCreatedAt != null">
                 and (r.created_at, r.id) &lt; (#{beforeCreatedAt}, #{beforeId})
               </if>
             order by r.created_at desc, r.id desc
             limit #{limit}
            </script>
            """)
    List<ListedRow> pageScopes(
            @Param("scopes") List<String> scopes,
            @Param("status") String status,
            @Param("beforeCreatedAt") Instant beforeCreatedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit);

    @Select("select " + COLUMNS + """
              from releases.releases
             where space_id = #{scopeId} and source_kind = #{kind}
             order by created_at desc, id desc
             limit 1
            """)
    ReleaseRow lastOf(@Param("scopeId") UUID scopeId, @Param("kind") String kind);

    @Select("select count(*) from releases.releases where space_id = #{scopeId}")
    int count(@Param("scopeId") UUID scopeId);

    @Insert("""
            insert into releases.release_retention (space_id, keep)
            values (#{scopeId}, #{keep})
            on conflict (space_id) do nothing
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    int ensureRetention(@Param("scopeId") UUID scopeId, @Param("keep") int keep);

    @Select("select keep from releases.release_retention where space_id = #{scopeId} for update")
    Integer lockKeep(@Param("scopeId") UUID scopeId);

    @Select("select keep from releases.release_retention where space_id = #{scopeId}")
    Integer keep(@Param("scopeId") UUID scopeId);

    @Insert("""
            insert into releases.release_retention (space_id, keep)
            values (#{scopeId}, #{keep})
            on conflict (space_id) do update set keep = excluded.keep
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    int setKeep(@Param("scopeId") UUID scopeId, @Param("keep") int keep);

    @Select("""
            select r.id::text from (select id from releases.releases
             where space_id = #{scopeId} and status = 'archived'
             order by promoted_at desc nulls last, created_at desc, id desc
             offset #{keep}) r where not exists(select 1 from releases.release_pins p where p.release_id=r.id and p.expires_at>now())
            """)
    List<String> archivedBeyondKeep(@Param("scopeId") UUID scopeId, @Param("keep") int keep);

    @Delete("""
            delete from releases.release_contents as contents
             where contents.tenant_id = shared.require_tenant_id()
               and not exists (
                 select 1 from releases.release_pages as pages
                  where pages.tenant_id = contents.tenant_id
                    and pages.content_hash = contents.content_hash)
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    int recycleOrphanContents();

    record ReleaseRow(
            String id,
            String spaceId,
            String status,
            String label,
            String notes,
            String sourceKind,
            String sourceRef,
            String sourceActorId,
            Integer pageCount,
            String report,
            Instant createdAt,
            Instant promotedAt,
            String bundleVersion,
            String generator,
            Instant generatedAt) {}

    /** 列表行自带 loaded，避免逐行回查快照表。 */
    record ListedRow(
            String id,
            String spaceId,
            String status,
            String label,
            String notes,
            String sourceKind,
            String sourceRef,
            String sourceActorId,
            Integer pageCount,
            String report,
            Instant createdAt,
            Instant promotedAt,
            String bundleVersion,
            String generator,
            Instant generatedAt,
            boolean loaded) {
        ReleaseRow row() {
            return new ReleaseRow(
                    id,
                    spaceId,
                    status,
                    label,
                    notes,
                    sourceKind,
                    sourceRef,
                    sourceActorId,
                    pageCount,
                    report,
                    createdAt,
                    promotedAt,
                    bundleVersion,
                    generator,
                    generatedAt);
        }
    }

    record PageRow(
            String pageId,
            String slug,
            String title,
            String format,
            String body,
            String seo,
            String icon,
            String properties,
            String externalId,
            String attachments,
            int seq,
            String contentProfile,
            String contentDefinition) {}

    record PageHeaderRow(String pageId, String slug, String title, String seo, int seq) {}

    record FingerprintRow(String pageId, String contentHash) {}

    @Delete("delete from releases.releases where space_id=#{scope}")
    void deleteScope(@Param("scope") UUID scope);

    @Delete("delete from releases.release_retention where space_id=#{scope}")
    void deleteRetention(@Param("scope") UUID scope);

    @Select("select exists(select 1 from releases.release_pages where page_id=#{page})")
    boolean referencesPage(@Param("page") UUID page);

    @Select(
            "select exists(select 1 from releases.release_pages p, jsonb_array_elements(p.attachments) a where coalesce(a->>'storageKey',a->>'storage_key')=#{key})")
    boolean referencesObject(@Param("key") String key);

    @Select(
            "select distinct coalesce(a->>'storageKey',a->>'storage_key') from releases.release_pages p join releases.releases r on r.id=p.release_id, jsonb_array_elements(p.attachments) a where r.space_id=#{scope}")
    java.util.Set<String> objectKeys(@Param("scope") UUID scope);

    @Select(
            "select (select count(*) from releases.releases where space_id=#{scope}) as releases,count(p.page_id) as snapshot_pages,coalesce(sum(octet_length(c.body)),0) as text_bytes from releases.releases r join releases.release_pages p on p.release_id=r.id join releases.release_contents c on c.tenant_id=p.tenant_id and c.content_hash=p.content_hash where r.space_id=#{scope}")
    io.space.concepts.release.api.ReleaseApi.Usage usage(@Param("scope") UUID scope);
}
