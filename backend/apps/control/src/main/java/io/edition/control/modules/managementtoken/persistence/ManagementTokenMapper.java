package io.edition.control.modules.managementtoken.persistence;

import io.edition.control.modules.managementtoken.api.*;
import io.edition.control.modules.managementtoken.api.ManagementTokenApi.Metadata;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.*;

@Mapper
interface ManagementTokenMapper {
    @Insert("""
            <script>
            insert into iam.management_tokens(id,owner_id,name,secret_hash,scopes,tenant_id,expires_at,created_at)
            values(#{token.id},#{token.ownerId},#{token.name},#{hash},ARRAY[
            <foreach collection="scopes" item="scope" separator=",">#{scope}</foreach>
            ]::text[],#{token.tenantId},#{token.expiry},#{token.createdAt})
            </script>
            """)
    void insert(@Param("token") Metadata token, @Param("hash") byte[] hash, @Param("scopes") List<String> scopes);

    @Select(
            "select id,owner_id,name,secret_hash,array_to_string(scopes,',') scopes,tenant_id,expires_at,created_at,last_used_at,revoked_at from iam.management_tokens where id=#{id}")
    Row secret(@Param("id") UUID id);

    @Select("""
            <script>
            select id,owner_id,name,null::bytea secret_hash,array_to_string(scopes,',') scopes,tenant_id,expires_at,created_at,last_used_at,revoked_at
              from iam.management_tokens where owner_id=#{owner}
            <if test="at != null">and (created_at,id) &lt; (#{at},#{id})</if>
            order by created_at desc,id desc limit #{limit}
            </script>
            """)
    List<Row> ownedBy(
            @Param("owner") UUID owner, @Param("at") Instant at, @Param("id") UUID id, @Param("limit") int limit);

    @Update(
            "update iam.management_tokens set revoked_at=coalesce(revoked_at,#{now}) where id=#{id} and owner_id=#{owner}")
    void revoke(@Param("id") UUID id, @Param("owner") UUID owner, @Param("now") Instant now);

    @Update("update iam.management_tokens set revoked_at=coalesce(revoked_at,#{now}) where owner_id=#{owner}")
    void revokeAll(@Param("owner") UUID owner, @Param("now") Instant now);

    @Update(
            "update iam.management_tokens set revoked_at=coalesce(revoked_at,#{now}),name='已注销管理令牌',secret_hash=#{hash} where owner_id=#{owner}")
    void eraseAll(@Param("owner") UUID owner, @Param("now") Instant now, @Param("hash") byte[] hash);

    @Update(
            "update iam.management_tokens set last_used_at=#{now} where id=#{id} and revoked_at is null and expires_at>#{now} and (last_used_at is null or last_used_at<cast(#{now} as timestamptz)-interval '1 minute')")
    void touch(@Param("id") UUID id, @Param("now") Instant now);

    record Row(
            UUID id,
            UUID ownerId,
            String name,
            byte[] secretHash,
            String scopes,
            UUID tenantId,
            Instant expiresAt,
            Instant createdAt,
            Instant lastUsedAt,
            Instant revokedAt) {}
}
