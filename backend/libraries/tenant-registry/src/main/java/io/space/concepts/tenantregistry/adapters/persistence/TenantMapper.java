package io.space.concepts.tenantregistry.adapters.persistence;

import io.space.concepts.tenantregistry.api.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface TenantMapper {

    // 名字不要求唯一（租户以稳定 id 指代），故无 on conflict 分支。
    @Select("""
            select id::text, name, status, created_at
              from shared.runtime_provision_tenant(#{name})
            """)
    Row insert(@Param("name") String name);

    @Select("select id::text, name, status, created_at from shared.runtime_tenant(#{id})")
    Row find(@Param("id") UUID id);

    @Select("select shared.runtime_set_tenant_status(#{id}, #{status})")
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    String updateStatus(@Param("id") UUID id, @Param("status") String status);

    // foreach 内的 UUID 参数没有内建 TypeHandler，故传 text 再由 PG 转型。
    @Select("""
            <script>
            select id::text, name, status, created_at
              from shared.runtime_tenants(ARRAY[
            <foreach item="id" collection="ids" separator=",">#{id}::uuid</foreach>
              ]::uuid[])
            </script>
            """)
    List<Row> findAll(@Param("ids") List<String> ids);

    @Select("""
            select id::text, name, status, created_at
              from shared.runtime_tenant_page(#{beforeCreatedAt}, #{beforeId}, #{limit})
            """)
    List<Row> page(
            @Param("beforeCreatedAt") Instant beforeCreatedAt,
            @Param("beforeId") UUID beforeId,
            @Param("limit") int limit);

    record Row(String id, String name, String status, Instant createdAt) {}
}
