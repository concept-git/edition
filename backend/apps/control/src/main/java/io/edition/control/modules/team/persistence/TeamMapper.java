package io.edition.control.modules.team.persistence;

import io.edition.control.modules.team.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.*;

/** 群体行与租户内唯一名称的 SQL；lock 持锁至调用方事务结束。 */
@Mapper
interface TeamMapper {

    @Select("""
            insert into iam.teams (tenant_id, name, normalized_name)
            values (#{scope}, #{name}, #{normalized})
            on conflict (tenant_id, normalized_name) do nothing
            returning id, tenant_id, name, created_at, updated_at
            """)
    TeamRow insert(@Param("scope") UUID scope, @Param("name") String name, @Param("normalized") String normalized);

    @Select("""
            update iam.teams set name = #{name}, normalized_name = #{normalized}
             where id = #{id}
            returning id, tenant_id, name, created_at, updated_at
            """)
    TeamRow update(@Param("id") UUID id, @Param("name") String name, @Param("normalized") String normalized);

    @Select("select id, tenant_id, name, created_at, updated_at from iam.teams where id = #{id}")
    TeamRow find(@Param("id") UUID id);

    @Select("select id, tenant_id, name, created_at, updated_at from iam.teams where id = #{id} for update")
    TeamRow lock(@Param("id") UUID id);

    @Delete("delete from iam.teams where id = #{id}")
    int delete(@Param("id") UUID id);

    @Select("""
            <script>
            select id, tenant_id, name, created_at, updated_at
              from iam.teams
             where tenant_id = #{scope}
            <if test="beforeCreatedAt != null">
               and (created_at, id) &lt; (#{beforeCreatedAt}, #{beforeId})
            </if>
             order by created_at desc, id desc
             limit #{limit}
            </script>
            """)
    List<TeamRow> page(
            @Param("scope") UUID scope,
            @Param("beforeCreatedAt") Instant beforeCreatedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit);

    record TeamRow(UUID id, UUID tenantId, String name, Instant createdAt, Instant updatedAt) {}
}
