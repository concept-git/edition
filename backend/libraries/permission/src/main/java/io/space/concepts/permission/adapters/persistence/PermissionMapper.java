package io.space.concepts.permission.adapters.persistence;

import io.space.concepts.permission.api.*;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 授权与收窄的 SQL；版本条件写入防止并发覆盖，inactive 墓碑保留以防 ABA。 */
@Mapper
interface PermissionMapper {

    @Select(
            "select id, resource_type, resource_id, principal_type, principal_id, role from iam.permission_grants order by resource_type, resource_id, principal_type, principal_id")
    // 同事务内 RLS 上下文可变化且不属于缓存键，快照必须读取当前作用域。
    @Options(flushCache = Options.FlushCachePolicy.TRUE, useCache = false)
    List<GrantRow> allGrants();

    @Select("""
            select s.resource_type,s.resource_id,s.active,s.revision,m.principal_type,m.principal_id
            from iam.permission_restriction_scopes s left join iam.permission_restrictions m
              on m.tenant_id=s.tenant_id and m.resource_type=s.resource_type and m.resource_id=s.resource_id
            where s.active order by s.resource_type,s.resource_id,m.principal_type,m.principal_id
            """)
    @Options(flushCache = Options.FlushCachePolicy.TRUE, useCache = false)
    List<RestrictionProjectionRow> activeRestrictions();

    @Insert("""
            <script>
            insert into iam.permission_roles (role, operations)
            values (#{role}, ARRAY[
              <foreach collection="operations" item="operation" separator=",">
                #{operation}
              </foreach>
            ]::text[])
            on conflict (role) do update set operations = excluded.operations
            </script>
            """)
    void saveRole(@Param("role") String role, @Param("operations") List<String> operations);

    @Select("select unnest(operations) from iam.permission_roles where role = #{role}")
    List<String> findOperations(String role);

    @Insert("""
            insert into iam.permission_grants
                (resource_type, resource_id, principal_type, principal_id, role)
            values (#{resourceType}, #{resourceId}, #{principalType}, #{principalId}, #{role})
            on conflict (resource_type, resource_id, principal_type, principal_id)
            do update set role = excluded.role
            """)
    void saveGrant(
            @Param("resourceType") String resourceType,
            @Param("resourceId") UUID resourceId,
            @Param("principalType") String principalType,
            @Param("principalId") UUID principalId,
            @Param("role") String role);

    @Delete("""
            delete from iam.permission_grants
             where resource_type = #{resourceType}
               and resource_id = #{resourceId}
               and principal_type = #{principalType}
               and principal_id is not distinct from #{principalId}
            """)
    void deleteGrant(
            @Param("resourceType") String resourceType,
            @Param("resourceId") UUID resourceId,
            @Param("principalType") String principalType,
            @Param("principalId") UUID principalId);

    @Select("""
            select role
              from iam.permission_grants
             where resource_type = #{resourceType}
               and resource_id = #{resourceId}
               and principal_type = #{principalType}
               and principal_id is not distinct from #{principalId}
            """)
    String findGrant(
            @Param("resourceType") String resourceType,
            @Param("resourceId") UUID resourceId,
            @Param("principalType") String principalType,
            @Param("principalId") UUID principalId);

    @Select("""
            <script>
            select id, resource_type, resource_id, principal_type, principal_id, role
              from iam.permission_grants
             where
              <if test="after != null">id &gt; #{after} and</if>
              (
                <foreach collection="resources" item="resource" separator=" or ">
                  (resource_type = #{resource.resourceType}
                   and resource_id = cast(#{resource.resourceId} as uuid))
                </foreach>
              )
             order by id
             limit #{limit}
            </script>
            """)
    List<GrantRow> pageGrants(
            @Param("resources") List<ResourceRow> resources, @Param("after") UUID after, @Param("limit") int limit);

    @Select("""
            select principal_type, principal_id
              from iam.permission_restrictions
             where resource_type = #{resourceType} and resource_id = #{resourceId}
            """)
    List<PrincipalRow> findRestrictions(
            @Param("resourceType") String resourceType, @Param("resourceId") UUID resourceId);

    @Select("""
            select active, revision
              from iam.permission_restriction_scopes
             where resource_type = #{resourceType} and resource_id = #{resourceId}
            """)
    RestrictionScopeRow findRestrictionScope(
            @Param("resourceType") String resourceType, @Param("resourceId") UUID resourceId);

    @Select("""
            <script>
            select scope.resource_type,
                   scope.resource_id,
                   scope.active,
                   scope.revision,
                   member.principal_type,
                   member.principal_id
              from iam.permission_restriction_scopes as scope
              left join iam.permission_restrictions as member
                on member.tenant_id is not distinct from scope.tenant_id
               and member.resource_type = scope.resource_type
               and member.resource_id = scope.resource_id
             where
              <foreach collection="resources" item="resource" separator=" or " open="(" close=")">
                (scope.resource_type = #{resource.resourceType}
                 and scope.resource_id = cast(#{resource.resourceId} as uuid))
              </foreach>
             order by scope.resource_type, scope.resource_id, member.principal_type, member.principal_id
            </script>
            """)
    List<RestrictionProjectionRow> findRestrictionProjections(@Param("resources") List<ResourceRow> resources);

    @Insert("""
            insert into iam.permission_restriction_scopes
                (resource_type, resource_id, active, revision)
            values (#{resourceType}, #{resourceId}, true, 1)
            on conflict (resource_type, resource_id) do nothing
            """)
    int insertActiveRestrictionScope(@Param("resourceType") String resourceType, @Param("resourceId") UUID resourceId);

    @Update("""
            update iam.permission_restriction_scopes
               set active = true, revision = revision + 1
             where resource_type = #{resourceType} and resource_id = #{resourceId}
               and revision = #{expectedRevision}
            """)
    int activateRestrictionScope(
            @Param("resourceType") String resourceType,
            @Param("resourceId") UUID resourceId,
            @Param("expectedRevision") long expectedRevision);

    @Insert("""
            insert into iam.permission_restriction_scopes
                (resource_type, resource_id, active, revision)
            values (#{resourceType}, #{resourceId}, false, 0)
            on conflict (resource_type, resource_id) do nothing
            """)
    int insertInactiveRestrictionScope(
            @Param("resourceType") String resourceType, @Param("resourceId") UUID resourceId);

    @Update("""
            update iam.permission_restriction_scopes
               set active = false, revision = revision + 1
             where resource_type = #{resourceType} and resource_id = #{resourceId}
               and active and revision = #{expectedRevision}
            """)
    int deactivateRestrictionScope(
            @Param("resourceType") String resourceType,
            @Param("resourceId") UUID resourceId,
            @Param("expectedRevision") long expectedRevision);

    @Update("""
            update iam.permission_restriction_scopes
               set active = false
             where resource_type = #{resourceType} and resource_id = #{resourceId}
               and not active and revision = #{expectedRevision}
            """)
    int lockInactiveRestrictionScope(
            @Param("resourceType") String resourceType,
            @Param("resourceId") UUID resourceId,
            @Param("expectedRevision") long expectedRevision);

    @Delete("""
            delete from iam.permission_restrictions
             where resource_type = #{resourceType} and resource_id = #{resourceId}
            """)
    void deleteRestrictionMembers(@Param("resourceType") String resourceType, @Param("resourceId") UUID resourceId);

    @Delete("""
            delete from iam.permission_restriction_scopes
             where resource_type = #{resourceType} and resource_id = #{resourceId}
            """)
    void deleteRestriction(@Param("resourceType") String resourceType, @Param("resourceId") UUID resourceId);

    @Insert("""
            insert into iam.permission_restrictions
                (resource_type, resource_id, principal_type, principal_id)
            values (#{resourceType}, #{resourceId}, #{principalType}, #{principalId})
            """)
    void insertRestriction(
            @Param("resourceType") String resourceType,
            @Param("resourceId") UUID resourceId,
            @Param("principalType") String principalType,
            @Param("principalId") UUID principalId);

    @Delete("""
            delete from iam.permission_grants
             where resource_type = #{resourceType} and resource_id = #{resourceId}
            """)
    void clearResourceGrants(@Param("resourceType") String resourceType, @Param("resourceId") UUID resourceId);

    @Delete("""
            delete from iam.permission_grants
             where principal_type = #{principalType}
               and principal_id is not distinct from #{principalId}
            """)
    void clearPrincipalGrants(@Param("principalType") String principalType, @Param("principalId") UUID principalId);

    @Update("""
            with removed as (
              delete from iam.permission_restrictions
               where principal_type = #{principalType}
                 and principal_id is not distinct from #{principalId}
              returning tenant_id, resource_type, resource_id
            )
            update iam.permission_restriction_scopes as scope
               set revision = scope.revision + 1
             where exists (
               select 1
                 from removed
                where removed.tenant_id is not distinct from scope.tenant_id
                  and removed.resource_type = scope.resource_type
                  and removed.resource_id = scope.resource_id
             )
            """)
    int clearPrincipalRestrictions(
            @Param("principalType") String principalType, @Param("principalId") UUID principalId);

    @Select("""
            select tenant_id::text
              from iam.runtime_permission_tenant_ids(#{principalType}, #{principalId})
            """)
    List<String> tenantIdsOf(@Param("principalType") String principalType, @Param("principalId") UUID principalId);

    record PrincipalRow(String principalType, UUID principalId) {}

    record RestrictionScopeRow(boolean active, long revision) {}

    record ResourceRow(String resourceType, String resourceId) {}

    record GrantRow(
            UUID id, String resourceType, UUID resourceId, String principalType, UUID principalId, String role) {}

    record RestrictionProjectionRow(
            String resourceType,
            UUID resourceId,
            boolean active,
            long revision,
            String principalType,
            UUID principalId) {}
}
