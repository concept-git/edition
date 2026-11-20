package io.space.concepts.membership.adapters.persistence;

import io.space.concepts.membership.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 以群体稳定身份访问成员事实；所有者保护、邀请竞争与租户隔离由锁及 RLS 共同守护。 */
@Mapper
interface MembershipMapper {

    @Select("select true from (select pg_advisory_xact_lock(hashtextextended(#{key}, 0))) locked")
    @Options(flushCache = Options.FlushCachePolicy.TRUE, useCache = false)
    boolean lockInvitation(@Param("key") String key);

    @Select(
            "select tenant_id::text,group_type,group_id::text,member_id::text,role from iam.memberships order by member_id,group_type,group_id")
    // 同事务可切换租户；当前 RLS 上下文不属于 MyBatis 缓存键，必须读取本次作用域。
    @Options(flushCache = Options.FlushCachePolicy.TRUE, useCache = false)
    List<SnapshotRow> snapshot();

    record SnapshotRow(String tenantId, String groupType, String groupId, String memberId, String role) {}

    // 显式写入群体的 tenant_id；RLS 按这一归属隔离成员事实。
    @Update("""
            insert into iam.memberships (tenant_id, group_type, group_id, member_id, role, created_at)
            values (#{tenantId}, #{groupType}, #{groupId}, #{memberId}, #{role}, #{joinedAt})
            on conflict (group_type, group_id, member_id) do nothing
            """)
    int insertMember(
            @Param("tenantId") UUID tenantId,
            @Param("groupType") String groupType,
            @Param("groupId") UUID groupId,
            @Param("memberId") UUID memberId,
            @Param("role") String role,
            @Param("joinedAt") Instant joinedAt);

    @Delete("""
            delete from iam.memberships
             where group_type = #{groupType} and group_id = #{groupId} and member_id = #{memberId}
            """)
    void deleteMember(
            @Param("groupType") String groupType, @Param("groupId") UUID groupId, @Param("memberId") UUID memberId);

    @Update("""
            update iam.memberships set role = #{role}
             where group_type = #{groupType} and group_id = #{groupId} and member_id = #{memberId}
            """)
    void updateRole(
            @Param("groupType") String groupType,
            @Param("groupId") UUID groupId,
            @Param("memberId") UUID memberId,
            @Param("role") String role);

    @Select("""
            select role from iam.memberships
             where group_type = #{groupType} and group_id = #{groupId} and member_id = #{memberId}
            """)
    String roleOf(
            @Param("groupType") String groupType, @Param("groupId") UUID groupId, @Param("memberId") UUID memberId);

    @Select("""
            select member_id::text, role, created_at
              from iam.memberships
             where group_type = #{groupType} and group_id = #{groupId} and member_id = #{memberId}
               for update
            """)
    MemberRow lockMembership(
            @Param("groupType") String groupType, @Param("groupId") UUID groupId, @Param("memberId") UUID memberId);

    @Select("""
            select count(*) from iam.memberships
             where group_type = #{groupType} and group_id = #{groupId} and role = 'owner'
            """)
    long ownerCount(@Param("groupType") String groupType, @Param("groupId") UUID groupId);

    @Select("select count(*) from iam.memberships where group_type = #{groupType} and group_id = #{groupId}")
    long memberCount(@Param("groupType") String groupType, @Param("groupId") UUID groupId);

    // 「至少保留一位 owner」是先查后写，必须锁住 owner 行：否则两笔并发各自读到 2 个 owner，
    // 双双通过判定，群体归零后再也无人可管（OwnerRule 在 0 时不再阻挡）。
    @Select("""
            select member_id::text from iam.memberships
             where group_type = #{groupType} and group_id = #{groupId} and role = 'owner'
               for update
            """)
    List<String> lockOwners(@Param("groupType") String groupType, @Param("groupId") UUID groupId);

    // keyset 用 (created_at, member_id)：member_id 在群体内唯一，无需暴露行 id。
    @Select("""
            select member_id::text, role, created_at
              from iam.memberships
             where group_type = #{groupType} and group_id = #{groupId}
               and (
                 #{beforeJoinedAt}::timestamptz is null
                 or (created_at, member_id) < (#{beforeJoinedAt}::timestamptz, #{beforeId}::uuid)
               )
             order by created_at desc, member_id desc
             limit #{limit}
            """)
    List<MemberRow> pageMembers(
            @Param("groupType") String groupType,
            @Param("groupId") UUID groupId,
            @Param("beforeJoinedAt") Instant beforeJoinedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit);

    @Select("""
            select group_type, group_id::text, tenant_id::text, role, created_at
              from iam.runtime_groups_of_member(#{memberId}, false)
            """)
    List<GroupRow> groupsOf(@Param("memberId") UUID memberId);

    @Select("""
            select group_type, group_id::text, tenant_id::text, role, created_at
              from iam.runtime_groups_of_member(#{memberId}, true)
            """)
    List<GroupRow> lockGroupsOf(@Param("memberId") UUID memberId);

    @Delete("delete from iam.invites where group_type = #{groupType} and group_id = #{groupId}")
    void clearGroupInvites(@Param("groupType") String groupType, @Param("groupId") UUID groupId);

    @Delete("delete from iam.memberships where group_type = #{groupType} and group_id = #{groupId}")
    void clearGroupMembers(@Param("groupType") String groupType, @Param("groupId") UUID groupId);

    @Delete("""
            delete from iam.invites
             where group_type = #{groupType} and group_id = #{groupId} and email = #{email}
            """)
    void deletePendingInvites(
            @Param("groupType") String groupType, @Param("groupId") UUID groupId, @Param("email") String email);

    @Select("select iam.runtime_delete_invites_for_email(#{email})")
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    String deletePendingInvitesForEmail(@Param("email") String email);

    @Select("""
            insert into iam.invites
              (token_hash, tenant_id, group_type, group_id, email, role, expires_at)
            values
              (#{tokenHash}, #{tenantId}, #{groupType}, #{groupId}, #{email}, #{role}, #{expiresAt})
            returning id::text, group_type, group_id::text, tenant_id::text, email::text, role, expires_at, created_at
            """)
    InviteRow insertInvite(
            @Param("tokenHash") String tokenHash,
            @Param("tenantId") UUID tenantId,
            @Param("groupType") String groupType,
            @Param("groupId") UUID groupId,
            @Param("email") String email,
            @Param("role") String role,
            @Param("expiresAt") Instant expiresAt);

    @Select("""
            select id::text, group_type, group_id::text, tenant_id::text, email, role, expires_at, created_at
              from iam.runtime_invite_by_hash(#{tokenHash})
            """)
    InviteRow findInviteByHash(@Param("tokenHash") String tokenHash);

    @Select("""
            select token_hash, group_type, group_id::text, tenant_id::text, role
              from iam.runtime_pending_invites(#{email})
            """)
    List<PendingRow> findPendingByEmail(@Param("email") String email);

    @Delete("delete from iam.invites where token_hash = #{tokenHash}")
    void deleteInviteByHash(@Param("tokenHash") String tokenHash);

    @Delete("""
            delete from iam.invites
             where id = #{inviteId} and group_type = #{groupType} and group_id = #{groupId}
            """)
    void deleteInviteById(
            @Param("groupType") String groupType, @Param("groupId") UUID groupId, @Param("inviteId") UUID inviteId);

    @Select("""
            select id::text, group_type, group_id::text, tenant_id::text, email::text, role, expires_at, created_at
              from iam.invites
             where group_type = #{groupType} and group_id = #{groupId}
               and (
                 #{beforeCreatedAt}::timestamptz is null
                 or (created_at, id) < (#{beforeCreatedAt}::timestamptz, #{beforeId}::uuid)
               )
             order by created_at desc, id desc
             limit #{limit}
            """)
    List<InviteRow> pageInvites(
            @Param("groupType") String groupType,
            @Param("groupId") UUID groupId,
            @Param("beforeCreatedAt") Instant beforeCreatedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit);

    record MemberRow(String memberId, String role, Instant createdAt) {}

    record GroupRow(String groupType, String groupId, String tenantId, String role, Instant createdAt) {}

    record InviteRow(
            String id,
            String groupType,
            String groupId,
            String tenantId,
            String email,
            String role,
            Instant expiresAt,
            Instant createdAt) {}

    record PendingRow(String tokenHash, String groupType, String groupId, String tenantId, String role) {}
}
