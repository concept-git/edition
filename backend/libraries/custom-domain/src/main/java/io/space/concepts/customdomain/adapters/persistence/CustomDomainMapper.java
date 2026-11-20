package io.space.concepts.customdomain.adapters.persistence;

import io.space.concepts.customdomain.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
interface CustomDomainMapper {
    String COLUMNS = "host, site_id::text, verified, is_primary, dns_token, created_at";

    @Select("select " + COLUMNS + " from hosting.custom_domains where host = #{host}")
    DomainRow find(@Param("host") String host);

    @Select("select " + COLUMNS + " from hosting.custom_domains where host = #{host} for update")
    DomainRow lock(@Param("host") String host);

    @Select("""
            insert into hosting.custom_domains (host, site_id, verified, is_primary, dns_token, created_at)
            values (#{host}, #{site}, false, false, #{dnsToken}, #{createdAt})
            on conflict (host) do nothing
            returning host, site_id::text, verified, is_primary, dns_token, created_at
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    DomainRow insert(
            @Param("host") String host,
            @Param("site") UUID site,
            @Param("dnsToken") String dnsToken,
            @Param("createdAt") Instant createdAt);

    @Select("""
            update hosting.custom_domains
               set verified = #{verified}, is_primary = #{primary}
             where host = #{host}
            returning host, site_id::text, verified, is_primary, dns_token, created_at
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    DomainRow save(@Param("host") String host, @Param("verified") boolean verified, @Param("primary") boolean primary);

    @Delete("delete from hosting.custom_domains where host = #{host}")
    void delete(@Param("host") String host);

    @Select("""
            select host, site_id::text, verified, is_primary, dns_token, created_at
              from hosting.custom_domains
             where site_id = #{site}
               and (#{ttlSeconds}::bigint is null or verified or created_at + make_interval(secs => #{ttlSeconds}) >= now())
             order by created_at, host
            """)
    List<DomainRow> hostsOf(@Param("site") UUID site, @Param("ttlSeconds") Long ttlSeconds);

    @Select("""
            <script>
            select host, site_id::text, verified, is_primary, dns_token, created_at
              from hosting.custom_domains
             where site_id in
               <foreach collection="targets" item="target" open="(" separator="," close=")">
                 cast(#{target} as uuid)
               </foreach>
               <if test="afterHost != null">and host &gt; #{afterHost}</if>
               and (verified or created_at + make_interval(secs => #{ttlSeconds}) &gt;= now())
             order by host
             limit #{limit}
            </script>
            """)
    List<DomainRow> page(
            @Param("targets") List<String> targets,
            @Param("afterHost") String afterHost,
            @Param("limit") int limit,
            @Param("ttlSeconds") long ttlSeconds);

    @Update("""
            update hosting.custom_domains
               set is_primary = false
             where site_id = #{site} and is_primary
            """)
    void clearPrimary(@Param("site") UUID site);

    @Delete("""
            delete from hosting.custom_domains
             where site_id = #{site}
               and verified = false
               and created_at + make_interval(secs => #{ttlSeconds}) < now()
            """)
    void reclaimExpiredOf(@Param("site") UUID site, @Param("ttlSeconds") long ttlSeconds);

    @Select("select hosting.runtime_reclaim_expired_unverified(#{host}, make_interval(secs => #{ttlSeconds}))")
    boolean reclaimExpired(@Param("host") String host, @Param("ttlSeconds") long ttlSeconds);

    @Select("""
            select site_id::text, tenant_id::text, verified, is_primary
              from hosting.runtime_resolve_host(#{host})
            """)
    OccupancyRow lookup(@Param("host") String host);

    record DomainRow(
            String host, String siteId, boolean verified, boolean isPrimary, String dnsToken, Instant createdAt) {}

    record OccupancyRow(String siteId, String tenantId, boolean verified, boolean isPrimary) {}
}
