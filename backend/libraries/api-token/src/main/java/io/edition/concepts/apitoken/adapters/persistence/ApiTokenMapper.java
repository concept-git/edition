package io.edition.concepts.apitoken.adapters.persistence;

import io.edition.concepts.apitoken.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
interface ApiTokenMapper {

    @Insert("""
            <script>
            insert into iam.api_tokens
                (id, owner_id, tenant_id, space_id, name, secret_hash, scopes, expires_at, created_at)
            values
                (#{id}, #{owner}, #{tenant}, #{space}, #{name}, #{hash}, ARRAY[
                  <foreach collection="scopes" item="scope" separator=",">#{scope}</foreach>
                ]::text[], #{expiry}, #{createdAt})
            </script>
            """)
    void insert(
            @Param("id") UUID id,
            @Param("owner") UUID owner,
            @Param("tenant") UUID tenant,
            @Param("space") UUID space,
            @Param("name") String name,
            @Param("hash") byte[] hash,
            @Param("scopes") List<String> scopes,
            @Param("expiry") Instant expiry,
            @Param("createdAt") Instant createdAt);

    @Select("""
            select id, tenant_id, space_id, secret_hash, scopes, expires_at, revoked_at
              from iam.runtime_token_secret(#{id})
            """)
    SecretRow secret(@Param("id") UUID id);

    @org.apache.ibatis.annotations.Options(
            useCache = false,
            flushCache = org.apache.ibatis.annotations.Options.FlushCachePolicy.TRUE)
    @Select("""
            select id, tenant_id, space_id, secret_hash, array_to_string(scopes, ',') as scopes, expires_at, revoked_at
              from iam.api_tokens where tenant_id = #{tenant} order by id
            """)
    List<SecretRow> verifiers(@Param("tenant") UUID tenant);

    @Select("""
            select id, owner_id, tenant_id, space_id, name, array_to_string(scopes, ',') as scopes,
                   expires_at, revoked_at, created_at
              from iam.api_tokens
             where id = #{id}
            """)
    MetadataRow metadata(@Param("id") UUID id);

    @Select("""
            select id, owner_id, tenant_id, space_id, name, array_to_string(scopes, ',') as scopes,
                   expires_at, revoked_at, created_at
              from iam.api_tokens
             where owner_id = #{owner} and tenant_id = #{tenant}
               and (#{includeRevoked} or revoked_at is null)
             order by created_at desc, id desc
            """)
    List<MetadataRow> ownedBy(
            @Param("owner") UUID owner, @Param("tenant") UUID tenant, @Param("includeRevoked") boolean includeRevoked);

    @Select("""
            select id, owner_id, tenant_id, space_id, name, scopes, expires_at, revoked_at, created_at
              from iam.runtime_tokens_owned_by(#{owner}, #{includeRevoked})
            """)
    List<MetadataRow> ownedByAcrossTenants(@Param("owner") UUID owner, @Param("includeRevoked") boolean includeRevoked);

    @Select("""
            select id, owner_id, tenant_id, space_id, name, array_to_string(scopes, ',') as scopes,
                   expires_at, revoked_at, created_at
              from iam.api_tokens
             where tenant_id = #{tenant} and space_id = #{space}
               and (#{includeRevoked} or revoked_at is null)
             order by created_at desc, id desc
            """)
    List<MetadataRow> inSpace(
            @Param("tenant") UUID tenant, @Param("space") UUID space, @Param("includeRevoked") boolean includeRevoked);

    @Update("""
            update iam.api_tokens
               set revoked_at = coalesce(revoked_at, #{revokedAt})
             where id = #{id}
            """)
    void revoke(@Param("id") UUID id, @Param("revokedAt") Instant revokedAt);

    @Update("""
            update iam.api_tokens
               set revoked_at = coalesce(revoked_at, #{revokedAt}),
                   name = '已注销令牌', secret_hash = #{tombstoneHash}
             where id = #{id}
            """)
    void anonymize(
            @Param("id") UUID id, @Param("revokedAt") Instant revokedAt, @Param("tombstoneHash") byte[] tombstoneHash);

    record SecretRow(
            UUID id,
            UUID tenantId,
            UUID spaceId,
            byte[] secretHash,
            String scopes,
            Instant expiresAt,
            Instant revokedAt) {}

    record MetadataRow(
            UUID id,
            UUID ownerId,
            UUID tenantId,
            UUID spaceId,
            String name,
            String scopes,
            Instant expiresAt,
            Instant revokedAt,
            Instant createdAt) {}
}
