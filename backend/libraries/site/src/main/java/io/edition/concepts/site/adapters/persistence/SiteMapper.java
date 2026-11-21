package io.edition.concepts.site.adapters.persistence;

import io.edition.concepts.site.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface SiteMapper {
    String COLUMNS = "id::text, tenant_id::text, name, path_rule, title_template, branding::text, locale, "
            + "analytics_id, robots_policy, home_space_id::text, "
            + "created_at, created_by::text, updated_at, updated_by::text";

    @Select("""
            insert into hosting.sites (tenant_id, name, created_by, updated_by)
            values (#{tenantId}, #{name}, #{actor}, #{actor})
            returning id::text, tenant_id::text, name, path_rule, title_template, branding::text, locale,
                      analytics_id, robots_policy, home_space_id::text,
                      created_at, created_by::text, updated_at, updated_by::text
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    SiteRow insert(@Param("tenantId") UUID tenantId, @Param("name") String name, @Param("actor") UUID actor);

    @Select("select " + COLUMNS + " from hosting.sites where id = #{id}")
    SiteRow find(@Param("id") UUID id);

    @Select("select " + COLUMNS + " from hosting.sites where id = #{id} for update")
    SiteRow lock(@Param("id") UUID id);

    @Select("select " + COLUMNS + " from hosting.sites where tenant_id = #{tenantId} order by updated_at desc, id desc")
    List<SiteRow> findByTenant(@Param("tenantId") UUID tenantId);

    @Select("""
            update hosting.sites
               set name = #{name}, path_rule = #{rule}, title_template = #{titleTemplate},
                   branding = #{branding}::jsonb, locale = #{locale}, analytics_id = #{analyticsId},
                   robots_policy = #{robots}, home_space_id = #{home}::uuid,
                   updated_by = #{updatedBy}, updated_at = now()
             where id = #{id}
            returning id::text, tenant_id::text, name, path_rule, title_template, branding::text, locale,
                      analytics_id, robots_policy, home_space_id::text,
                      created_at, created_by::text, updated_at, updated_by::text
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    SiteRow save(
            @Param("id") UUID id,
            @Param("name") String name,
            @Param("rule") String rule,
            @Param("titleTemplate") String titleTemplate,
            @Param("branding") String branding,
            @Param("locale") String locale,
            @Param("analyticsId") String analyticsId,
            @Param("robots") String robots,
            @Param("home") String home,
            @Param("updatedBy") UUID updatedBy);

    @Delete("delete from hosting.sites where id = #{id}")
    void delete(@Param("id") UUID id);

    @Select("""
            <script>
            select id::text, tenant_id::text, name, path_rule, title_template, branding::text, locale,
                   analytics_id, robots_policy, home_space_id::text,
                   created_at, created_by::text, updated_at, updated_by::text
              from hosting.sites
             where tenant_id = #{tenantId}
               <if test="beforeUpdatedAt != null">
                 and (updated_at, id) &lt; (#{beforeUpdatedAt}, #{beforeId})
               </if>
             order by updated_at desc, id desc
             limit #{limit}
            </script>
            """)
    List<SiteRow> pageByTenant(
            @Param("tenantId") UUID tenantId,
            @Param("beforeUpdatedAt") Instant beforeUpdatedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit);

    @Select("""
            select site_id::text, slug, space_id::text, position
              from hosting.site_mounts
             where site_id = #{site}
             order by position, slug
            """)
    List<MountRow> mounts(@Param("site") UUID site);

    @Select("""
            <script>
            select site_id::text, slug, space_id::text, position
              from hosting.site_mounts
             where site_id in
             <foreach collection="sites" item="site" open="(" separator="," close=")">#{site}::uuid</foreach>
             order by site_id, position, slug
            </script>
            """)
    List<MountRow> mountsOfSites(@Param("sites") List<String> sites);

    @Delete("delete from hosting.site_mounts where site_id = #{site}")
    void clearMounts(@Param("site") UUID site);

    @Insert("""
            insert into hosting.site_mounts (site_id, slug, space_id, position)
            values (#{site}, #{slug}, #{target}, #{position})
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    void insertMount(
            @Param("site") UUID site,
            @Param("slug") String slug,
            @Param("target") UUID target,
            @Param("position") int position);

    @Select("""
            select site_id::text, slug
              from hosting.site_mounts
             where space_id = #{target}
             order by site_id, slug
            """)
    List<OccurrenceRow> mountsOf(@Param("target") UUID target);

    record SiteRow(
            String id,
            String tenantId,
            String name,
            String pathRule,
            String titleTemplate,
            String branding,
            String locale,
            String analyticsId,
            String robotsPolicy,
            String homeSpaceId,
            Instant createdAt,
            String createdBy,
            Instant updatedAt,
            String updatedBy) {}

    record MountRow(String siteId, String slug, String spaceId, int position) {}

    record OccurrenceRow(String siteId, String slug) {}
}
