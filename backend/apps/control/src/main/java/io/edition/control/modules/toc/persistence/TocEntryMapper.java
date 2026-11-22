package io.edition.control.modules.toc.persistence;

import io.edition.control.modules.toc.api.*;
import java.util.List;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 复用 V1 {@code authoring.toc_entries}；无 ON DELETE CASCADE，删除必须先列出子孙。 */
@Mapper
interface TocEntryMapper {
    @Select("select true from (select pg_advisory_xact_lock(hashtextextended('toc:' || #{spaceId}::text, 0))) locked")
    @org.apache.ibatis.annotations.Options(
            flushCache = org.apache.ibatis.annotations.Options.FlushCachePolicy.TRUE,
            useCache = false)
    boolean lockScope(@Param("spaceId") UUID spaceId);

    String COLUMNS = "id::text, space_id::text as space_id, parent_id::text as parent_id, position, "
            + "label, kind, target_page_id::text as target_page_id, url";

    @Select("select " + COLUMNS + " from authoring.toc_entries where space_id = #{spaceId} for update")
    List<TocEntryRow> lockSpace(@Param("spaceId") UUID spaceId);

    @Select("select " + COLUMNS + " from authoring.toc_entries where space_id = #{spaceId} "
            + "order by parent_id nulls first, position, id")
    List<TocEntryRow> list(@Param("spaceId") UUID spaceId);

    @Select("select " + COLUMNS + " from authoring.toc_entries where id = #{id}")
    TocEntryRow find(@Param("id") UUID id);

    @Insert("""
            insert into authoring.toc_entries (
              id, space_id, parent_id, position, label, kind, target_page_id, url)
            values (
              #{id}, #{spaceId}, #{parentId}, #{position}, #{label}, #{kind}, #{targetPageId}, #{url})
            """)
    void insert(
            @Param("id") UUID id,
            @Param("spaceId") UUID spaceId,
            @Param("parentId") UUID parentId,
            @Param("position") int position,
            @Param("label") String label,
            @Param("kind") String kind,
            @Param("targetPageId") UUID targetPageId,
            @Param("url") String url);

    @Update("""
            update authoring.toc_entries
               set parent_id = #{parentId}, position = #{position}
             where id = #{id}
            """)
    void updatePlacement(@Param("id") UUID id, @Param("parentId") UUID parentId, @Param("position") int position);

    @Update("""
            update authoring.toc_entries
               set label = #{label}
             where id = #{id}
            """)
    void updateLabel(@Param("id") UUID id, @Param("label") String label);

    @Delete("""
            <script>
            delete from authoring.toc_entries
             where id in
             <foreach collection="ids" item="id" open="(" separator="," close=")">#{id}::uuid</foreach>
            </script>
            """)
    void delete(@Param("ids") List<String> ids);

    @Delete("delete from authoring.toc_entries where space_id = #{spaceId}")
    void deleteSpace(@Param("spaceId") UUID spaceId);

    @Select("select " + COLUMNS + " from authoring.toc_entries where target_page_id = #{targetId}")
    List<TocEntryRow> entriesFor(@Param("targetId") UUID targetId);

    record TocEntryRow(
            String id,
            String spaceId,
            String parentId,
            int position,
            String label,
            String kind,
            String targetPageId,
            String url) {}
}
