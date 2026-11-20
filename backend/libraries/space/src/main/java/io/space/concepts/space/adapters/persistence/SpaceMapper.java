package io.space.concepts.space.adapters.persistence;

import io.space.concepts.space.api.*;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface SpaceMapper {
    String COLUMNS = "id::text, tenant_id::text, name, icon, description, mode, auto_release, status, "
            + "created_at, created_by::text, updated_at, updated_by::text";

    @Select("""
            insert into authoring.spaces (tenant_id, name, mode, created_by, updated_by)
            values (#{tenantId}, #{name}, #{mode}, #{actor}, #{actor})
            returning id::text, tenant_id::text, name, icon, description, mode, auto_release, status,
                      created_at, created_by::text, updated_at, updated_by::text
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    SpaceRow insert(
            @Param("tenantId") UUID tenantId,
            @Param("name") String name,
            @Param("mode") String mode,
            @Param("actor") UUID actor);

    @Select("select " + COLUMNS + " from authoring.spaces where id = #{id}")
    SpaceRow find(@Param("id") UUID id);

    @Select("select " + COLUMNS + " from authoring.spaces where id = #{id} for update")
    @Options(flushCache = Options.FlushCachePolicy.TRUE, useCache = false)
    SpaceRow lock(@Param("id") UUID id);

    @Select("select " + COLUMNS
            + " from authoring.spaces where tenant_id = #{tenantId} order by updated_at desc, id desc")
    List<SpaceRow> findByTenant(@Param("tenantId") UUID tenantId);

    @Select("""
            update authoring.spaces
               set name = #{name}, icon = #{icon}, description = #{description}, status = #{status},
                   mode = #{mode}, auto_release = #{autoRelease},
                   updated_by = #{updatedBy}, updated_at = now()
            where id = #{id}
            returning id::text, tenant_id::text, name, icon, description, mode, auto_release, status,
                      created_at, created_by::text, updated_at, updated_by::text
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    SpaceRow save(
            @Param("id") UUID id,
            @Param("name") String name,
            @Param("icon") String icon,
            @Param("description") String description,
            @Param("status") String status,
            @Param("mode") String mode,
            @Param("autoRelease") boolean autoRelease,
            @Param("updatedBy") UUID updatedBy);

    @Select("""
            <script>
            select id::text, tenant_id::text, name, icon, description, mode, auto_release, status,
                   created_at, created_by::text, updated_at, updated_by::text
              from authoring.spaces
             where tenant_id = #{tenantId}
               <if test="status != null">and status = #{status}</if>
               <if test="mode != null">and mode = #{mode}</if>
               <if test="beforeUpdatedAt != null">
                 and (updated_at, id) &lt; (#{beforeUpdatedAt}, #{beforeId})
               </if>
             order by updated_at desc, id desc
             limit #{limit}
            </script>
            """)
    List<SpaceRow> pageByTenant(
            @Param("tenantId") UUID tenantId,
            @Param("beforeUpdatedAt") Instant beforeUpdatedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit,
            @Param("status") String status,
            @Param("mode") String mode);

    @Select("""
            insert into authoring.space_page_placements (space_id, page_id, slug)
            values (#{space}, #{item}, #{slug})
            on conflict do nothing
            returning space_id::text, page_id::text, slug
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    PlacementRow insertPlacement(@Param("space") UUID space, @Param("item") UUID item, @Param("slug") String slug);

    @Select("""
            update authoring.space_page_placements
               set slug = #{slug}
             where space_id = #{space} and page_id = #{item}
            returning space_id::text, page_id::text, slug
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    PlacementRow updatePlacementSlug(@Param("space") UUID space, @Param("item") UUID item, @Param("slug") String slug);

    @Select("""
            update authoring.space_page_placements
               set space_id = #{toSpace}, slug = #{slug}
             where page_id = #{item} and space_id = #{fromSpace}
            returning space_id::text, page_id::text, slug
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    PlacementRow transferPlacement(
            @Param("item") UUID item,
            @Param("fromSpace") UUID fromSpace,
            @Param("toSpace") UUID toSpace,
            @Param("slug") String slug);

    @Select("""
            select space_id::text, page_id::text, slug
              from authoring.space_page_placements where page_id = #{item}
            """)
    PlacementRow placementOf(@Param("item") UUID item);

    @Select("""
            select space_id::text, page_id::text, slug
              from authoring.space_page_placements
             where space_id = #{space} and slug = #{slug}
            """)
    PlacementRow placementAt(@Param("space") UUID space, @Param("slug") String slug);

    @Select("""
            select space_id::text, page_id::text, slug
              from authoring.space_page_placements
             where space_id = #{space} order by slug, page_id
            """)
    List<PlacementRow> placementsOf(@Param("space") UUID space);

    @Select("""
            <script>
            select space_id::text, page_id::text, slug
              from authoring.space_page_placements
             where page_id in
             <foreach collection="items" item="item" open="(" separator="," close=")">#{item}::uuid</foreach>
            </script>
            """)
    List<PlacementRow> placementsOfItems(@Param("items") Set<String> items);

    record SpaceRow(
            String id,
            String tenantId,
            String name,
            String icon,
            String description,
            String mode,
            boolean autoRelease,
            String status,
            Instant createdAt,
            String createdBy,
            Instant updatedAt,
            String updatedBy) {}

    record PlacementRow(String spaceId, String pageId, String slug) {}

    @org.apache.ibatis.annotations.Delete("delete from authoring.spaces where id=#{id}")
    void delete(@Param("id") UUID id);

    @org.apache.ibatis.annotations.Delete("delete from authoring.space_page_placements where page_id=#{item}")
    void unplace(@Param("item") UUID item);
}
