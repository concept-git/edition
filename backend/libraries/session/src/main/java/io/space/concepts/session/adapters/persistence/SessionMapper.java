package io.space.concepts.session.adapters.persistence;

import io.space.concepts.session.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.*;

/** 会话的条件读写与锁；结束与有效期直接由当前事实判定。 */
@Mapper
interface SessionMapper {
    @Select("""
            <script>
            select id::text,principal_id::text,expires_at,(ended_at is null and expires_at > #{now}) active
            from iam.sessions where id in
            <foreach collection="ids" item="id" open="(" separator="," close=")">cast(#{id} as uuid)</foreach>
            </script>
            """)
    List<InfoRow> snapshots(@Param("ids") List<String> ids, @Param("now") Instant now);

    record InfoRow(String id, String principalId, Instant expiresAt, boolean active) {}

    @Select("""
            insert into iam.sessions
              (principal_id, refresh_token_hash, device, ip_approximate, expires_at, created_at, last_seen_at)
            values
              (#{holder}, #{hash}, jsonb_build_object('name',#{name},'browser',#{browser},'os',#{os}),
               #{ip}, #{expiresAt}, #{now}, #{now})
            returning id::text
            """)
    String insert(
            @Param("holder") UUID holder,
            @Param("hash") String hash,
            @Param("name") String name,
            @Param("browser") String browser,
            @Param("os") String os,
            @Param("ip") String ip,
            @Param("expiresAt") Instant expiresAt,
            @Param("now") Instant now);

    @Select("""
            select id::text, principal_id::text, refresh_token_hash, previous_refresh_token_hash, rotated_at,
                   device->>'name' device_name, device->>'browser' device_browser, device->>'os' device_os,
                   ip_approximate, expires_at, created_at, last_seen_at, ended_at
              from iam.sessions
             where (refresh_token_hash = #{hash} or previous_refresh_token_hash = #{hash})
               for update
            """)
    Row lockByHash(@Param("hash") String hash);

    @Select("""
            select id::text, principal_id::text, refresh_token_hash, previous_refresh_token_hash, rotated_at,
                   device->>'name' device_name, device->>'browser' device_browser, device->>'os' device_os,
                   ip_approximate, expires_at, created_at, last_seen_at, ended_at
              from iam.sessions
             where (refresh_token_hash = #{hash} or previous_refresh_token_hash = #{hash})
            """)
    Row findByHash(@Param("hash") String hash);

    @Update("""
            update iam.sessions
               set previous_refresh_token_hash = #{oldHash}, refresh_token_hash = #{newHash}, rotated_at = #{now}
             where id = #{id} and refresh_token_hash = #{oldHash} and ended_at is null
            """)
    int rotate(
            @Param("id") UUID id,
            @Param("oldHash") String oldHash,
            @Param("newHash") String newHash,
            @Param("now") Instant now);

    @Update(
            "update iam.sessions set ended_at = coalesce(ended_at, #{now}) where id = #{id} and principal_id = #{holder}")
    void endOwned(@Param("id") UUID id, @Param("holder") UUID holder, @Param("now") Instant now);

    @Update("update iam.sessions set ended_at = coalesce(ended_at, #{now}) where id = #{id}")
    void end(@Param("id") UUID id, @Param("now") Instant now);

    @Update("update iam.sessions set ended_at = coalesce(ended_at, #{now}) where principal_id = #{holder}")
    void endAll(@Param("holder") UUID holder, @Param("now") Instant now);

    @Delete("delete from iam.sessions where principal_id = #{holder}")
    void deleteAll(@Param("holder") UUID holder);

    @Select("""
            select principal_id::text from iam.sessions
             where id = #{id} and ended_at is null and expires_at > #{now}
            """)
    String activePrincipal(@Param("id") UUID id, @Param("now") Instant now);

    @Update("""
            update iam.sessions set last_seen_at = #{now}
             where id = #{id} and ended_at is null and last_seen_at <= #{threshold}
            """)
    void touch(@Param("id") UUID id, @Param("threshold") Instant threshold, @Param("now") Instant now);

    @Select("""
            select id::text, principal_id::text, refresh_token_hash, previous_refresh_token_hash, rotated_at,
                   device->>'name' device_name, device->>'browser' device_browser, device->>'os' device_os,
                   ip_approximate, expires_at, created_at, last_seen_at, ended_at
              from iam.sessions
             where principal_id = #{holder} and ended_at is null and expires_at > #{now}
               and (
                 #{beforeSeenAt}::timestamptz is null
                 or (last_seen_at, id) < (#{beforeSeenAt}::timestamptz, #{beforeId}::uuid)
               )
             order by last_seen_at desc, id desc
             limit #{limit}
            """)
    List<Row> list(
            @Param("holder") UUID holder,
            @Param("beforeSeenAt") Instant beforeSeenAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit,
            @Param("now") Instant now);

    record Row(
            String id,
            String principalId,
            String refreshTokenHash,
            String previousRefreshTokenHash,
            Instant rotatedAt,
            String deviceName,
            String deviceBrowser,
            String deviceOs,
            String ipApproximate,
            Instant expiresAt,
            Instant createdAt,
            Instant lastSeenAt,
            Instant endedAt) {}
}
