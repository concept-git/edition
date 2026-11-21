package io.edition.concepts.user.adapters.persistence;

import io.edition.concepts.user.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 全局身份的 SQL；邮箱竞争、验证挑战消费和个人信息抹除由数据库事实裁决。 */
@Mapper
interface UserMapper {
    @Select("select reader_epoch from iam.users where id=#{user}")
    long readerEpoch(@Param("user") UUID user);

    @Select("update iam.users set reader_epoch=reader_epoch+1 where id=#{user} returning reader_epoch")
    long revokeReaderSessions(@Param("user") UUID user);

    // insert…returning 走 @Select 拿回 id；on conflict do nothing 让邮箱唯一性并发安全。
    // 单列 uuid 结果 MyBatis 无内建 TypeHandler，::text 后由 repository 解析。
    @Select("""
            insert into iam.users (email, name, verify_token_hash, verify_expires_at)
            values (#{email}, #{name}, #{tokenHash}, #{expiresAt})
            on conflict (email) do nothing
            returning id::text
            """)
    String insertUser(
            @Param("email") String email,
            @Param("name") String name,
            @Param("tokenHash") String tokenHash,
            @Param("expiresAt") Instant expiresAt);

    @Select("""
            select verify_token_hash, verify_expires_at, verified
              from iam.users
             where id = #{id} and status = 'active'
            """)
    ChallengeRow findChallenge(@Param("id") UUID id);

    @Update("""
            update iam.users
               set verified = true, verify_token_hash = null, verify_expires_at = null, updated_at = now()
             where id = #{id}
            """)
    void markVerified(@Param("id") UUID id);

    @Update(
            "update iam.users set verify_token_hash=#{hash}, verify_expires_at=#{expiresAt}, updated_at=now() where id=#{id} and status='active' and not verified")
    void replaceVerification(@Param("id") UUID id, @Param("hash") String hash, @Param("expiresAt") Instant expiresAt);

    @Select("select platform_operator from iam.users where id = #{id} and status = 'active'")
    Boolean isPlatformOperator(@Param("id") UUID id);

    @Select("select id::text from iam.users where email = #{email} and status <> 'erased'")
    String findIdByEmail(@Param("email") String email);

    @Select("select name, verified from iam.users where id = #{id}")
    ProfileRow findProfile(@Param("id") UUID id);

    @Select("""
            select id::text, email::text, name, avatar_url, locale, verified, status, platform_operator
              from iam.users
             where id = #{id}
            """)
    AccountProfileRow findAccountProfile(@Param("id") UUID id);

    @Select("""
            select id::text, email::text, name, avatar_url, locale, verified, status, platform_operator
              from iam.users
             where id = #{id}
             for update
            """)
    AccountProfileRow lockAccountProfile(@Param("id") UUID id);

    @Select("""
            select id::text, email::text, name, status, platform_operator, updated_at
              from iam.users
             where (email::text ilike #{prefix} or name ilike #{prefix})
               and (#{before}::uuid is null or id < #{before}::uuid)
             order by id desc
             limit #{limit}
            """)
    List<SearchRow> search(@Param("prefix") String prefix, @Param("before") UUID before, @Param("limit") int limit);

    @Update("""
            update iam.users
               set name = #{name}, locale = #{locale}, avatar_url = #{avatar}, updated_at = now()
             where id = #{id} and status <> 'erased'
            """)
    void updateProfile(
            @Param("id") UUID id,
            @Param("name") String name,
            @Param("locale") String locale,
            @Param("avatar") String avatar);

    @Update("""
            update iam.users set status = #{status}, reader_epoch=reader_epoch+1, updated_at = now()
             where id = #{id} and status <> 'erased'
            """)
    void setStatus(@Param("id") UUID id, @Param("status") String status);

    @Update("""
            update iam.users
               set email = null, name = '已注销用户', avatar_url = null, locale = null,
                   verified = false, verify_token_hash = null, verify_expires_at = null,
                   platform_operator = false,
                   status = 'erased', reader_epoch=reader_epoch+1, updated_at = now()
             where id = #{id} and status = 'deactivated'
            """)
    int erase(@Param("id") UUID id);

    record ChallengeRow(String verifyTokenHash, Instant verifyExpiresAt, boolean verified) {}

    record ProfileRow(String name, boolean verified) {}

    record AccountProfileRow(
            String id,
            String email,
            String name,
            String avatarUrl,
            String locale,
            boolean verified,
            String status,
            boolean platformOperator) {}

    record SearchRow(
            String id, String email, String name, String status, boolean platformOperator, Instant updatedAt) {}
}
