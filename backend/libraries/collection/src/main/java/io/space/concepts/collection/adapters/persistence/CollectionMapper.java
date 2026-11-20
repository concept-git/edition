package io.space.concepts.collection.adapters.persistence;

import io.space.concepts.collection.api.*;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 集合持久层；序与唯一名约束由 authoring 基线维护。 */
@Mapper
interface CollectionMapper {
    String COLUMNS = "id::text, tenant_id::text as tenant_id, parent_id::text as parent_id, position, name, icon";
    String MEMBERS = "space_id::text as space_id, collection_id::text as collection_id, position";

    @Select(
            "select true from (select pg_advisory_xact_lock(hashtextextended('collection:' || #{tenantId}::text, 0))) locked")
    boolean lockScope(@Param("tenantId") UUID tenantId);

    @Select("select " + COLUMNS + " from authoring.collections where tenant_id = #{tenantId} for update")
    List<CollectionRow> lockTenant(@Param("tenantId") UUID tenantId);

    @Select("select " + MEMBERS + " from authoring.collection_spaces "
            + "where collection_id in (select id from authoring.collections where tenant_id = #{tenantId}) "
            + "for update")
    List<MembershipRow> lockMemberships(@Param("tenantId") UUID tenantId);

    @Select("select " + COLUMNS + " from authoring.collections where tenant_id = #{tenantId} "
            + "order by parent_id nulls first, position, id")
    List<CollectionRow> list(@Param("tenantId") UUID tenantId);

    @Select("select " + MEMBERS + " from authoring.collection_spaces "
            + "where collection_id in (select id from authoring.collections where tenant_id = #{tenantId}) "
            + "order by collection_id, position, space_id")
    List<MembershipRow> memberships(@Param("tenantId") UUID tenantId);

    @Select("select " + COLUMNS + " from authoring.collections where id = #{id}")
    CollectionRow find(@Param("id") UUID id);

    @Select("select " + MEMBERS + " from authoring.collection_spaces where space_id = #{spaceId}")
    MembershipRow membershipOf(@Param("spaceId") UUID spaceId);

    @Insert("""
            insert into authoring.collections (id, tenant_id, parent_id, position, name, icon)
            values (#{id}, #{tenantId}, #{parentId}, #{position}, #{name}, #{icon})
            """)
    void insert(
            @Param("id") UUID id,
            @Param("tenantId") UUID tenantId,
            @Param("parentId") UUID parentId,
            @Param("position") int position,
            @Param("name") String name,
            @Param("icon") String icon);

    @Update("""
            update authoring.collections
               set parent_id = #{parentId}, position = #{position}, updated_at = now()
             where id = #{id}
            """)
    void updatePlacement(@Param("id") UUID id, @Param("parentId") UUID parentId, @Param("position") int position);

    @Update("update authoring.collections set name = #{name}, updated_at = now() where id = #{id}")
    void updateName(@Param("id") UUID id, @Param("name") String name);

    @Update("update authoring.collections set icon = #{icon}, updated_at = now() where id = #{id}")
    void updateIcon(@Param("id") UUID id, @Param("icon") String icon);

    @Delete("delete from authoring.collections where id = #{id}")
    void delete(@Param("id") UUID id);

    @Insert("""
            insert into authoring.collection_spaces (space_id, collection_id, position)
            values (#{spaceId}, #{collectionId}, #{position})
            on conflict (space_id) do update
               set collection_id = excluded.collection_id, position = excluded.position
            """)
    void upsertMembership(
            @Param("spaceId") UUID spaceId, @Param("collectionId") UUID collectionId, @Param("position") int position);

    @Delete("delete from authoring.collection_spaces where space_id = #{spaceId}")
    void deleteMembership(@Param("spaceId") UUID spaceId);

    record CollectionRow(String id, String tenantId, String parentId, int position, String name, String icon) {}

    record MembershipRow(String spaceId, String collectionId, int position) {}
}
