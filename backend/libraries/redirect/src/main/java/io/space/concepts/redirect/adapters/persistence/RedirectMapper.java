package io.space.concepts.redirect.adapters.persistence;

import io.space.concepts.redirect.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface RedirectMapper {
    String COLUMNS = "site_id::text, path, target_type, target_id::text, origin, created_at";

    @Select("""
            insert into hosting.redirects (site_id, path, target_type, target_id, origin, created_at)
            values (#{site}, #{path}, #{targetType}, #{targetId}, #{origin}, #{createdAt})
            on conflict (site_id, path) do nothing
            returning site_id::text, path, target_type, target_id::text, origin, created_at
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    RuleRow insert(
            @Param("site") UUID site,
            @Param("path") String path,
            @Param("targetType") String targetType,
            @Param("targetId") UUID targetId,
            @Param("origin") String origin,
            @Param("createdAt") Instant createdAt);

    @Select("""
            update hosting.redirects
               set target_type = #{targetType}, target_id = #{targetId}, origin = #{origin},
                   created_at = #{createdAt}
             where site_id = #{site} and path = #{path}
            returning site_id::text, path, target_type, target_id::text, origin, created_at
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    RuleRow save(
            @Param("site") UUID site,
            @Param("path") String path,
            @Param("targetType") String targetType,
            @Param("targetId") UUID targetId,
            @Param("origin") String origin,
            @Param("createdAt") Instant createdAt);

    @Delete("delete from hosting.redirects where site_id = #{site} and path = #{path}")
    void delete(@Param("site") UUID site, @Param("path") String path);

    @Select("select " + COLUMNS + " from hosting.redirects where site_id = #{site} and path = #{path}")
    RuleRow find(@Param("site") UUID site, @Param("path") String path);

    @Select("select " + COLUMNS + " from hosting.redirects where site_id = #{site} and path = #{path} for update")
    RuleRow lock(@Param("site") UUID site, @Param("path") String path);

    @Select("""
            select site_id::text, path, target_type, target_id::text, origin, created_at
              from hosting.redirects
             where site_id = #{site}
               and (
                    path = #{request}
                 or (
                      path like '%/*'
                      and (
                           #{request} = left(path, char_length(path) - 2)
                        or starts_with(#{request}, left(path, char_length(path) - 2) || '/')
                      )
                 )
               )
             order by case when path = #{request} then 0 else 1 end,
                      char_length(path) desc
             limit 1
            """)
    RuleRow lookup(@Param("site") UUID site, @Param("request") String request);

    @Select("""
            <script>
            select site_id::text, path, target_type, target_id::text, origin, created_at
              from hosting.redirects
             where site_id = #{site}
               <if test="origin != null">and origin = #{origin}</if>
               <if test="beforeCreatedAt != null">
                 and (created_at, path) &lt; (#{beforeCreatedAt}, #{beforePath})
               </if>
             order by created_at desc, path desc
             limit #{limit}
            </script>
            """)
    List<RuleRow> page(
            @Param("site") UUID site,
            @Param("origin") String origin,
            @Param("beforeCreatedAt") Instant beforeCreatedAt,
            @Param("beforePath") String beforePath,
            @Param("limit") int limit);

    record RuleRow(String siteId, String path, String targetType, String targetId, String origin, Instant createdAt) {}
}
