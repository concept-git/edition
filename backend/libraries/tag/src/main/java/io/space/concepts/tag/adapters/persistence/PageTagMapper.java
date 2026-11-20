package io.space.concepts.tag.adapters.persistence;

import io.space.concepts.tag.api.*;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 复用 V1 {@code authoring.page_tags}；只访问本表。 */
@Mapper
interface PageTagMapper {
    @Update("""
            select pg_advisory_xact_lock(hashtextextended(
                'tag-vocabulary:' || coalesce(current_setting('app.tenant_id', true), ''), 0))
            """)
    void lockVocabulary();

    @Select("select label from authoring.page_tags where page_id = #{pageId} order by label")
    List<String> labelsOf(@Param("pageId") UUID pageId);

    @Select("""
            <script>
            select page_id::text as page_id, label
              from authoring.page_tags
             where page_id in
             <foreach collection="ids" item="id" open="(" separator="," close=")">#{id}::uuid</foreach>
            </script>
            """)
    List<TagRow> labelsOfItems(@Param("ids") Set<String> ids);

    @Select("select page_id::text from authoring.page_tags where label = #{label}")
    List<String> byLabel(@Param("label") String label);

    @Select("""
            select label
              from authoring.page_tags
             group by label
             order by count(*) desc, label
             limit #{n}
            """)
    List<String> popular(@Param("n") int n);

    @Select("""
            select page_id::text as page_id, label
              from authoring.page_tags
             where #{prefix}::text is null or label like #{prefix} || '%' escape '\\'
             order by label, page_id
            """)
    List<TagRow> matching(@Param("prefix") String prefix);

    @Select("select exists(select 1 from authoring.page_tags where label = #{label})")
    boolean exists(@Param("label") String label);

    @Insert("""
            insert into authoring.page_tags (page_id, label)
            values (#{pageId}, #{label})
            on conflict do nothing
            """)
    void insert(@Param("pageId") UUID pageId, @Param("label") String label);

    @Delete("delete from authoring.page_tags where page_id = #{pageId} and label = #{label}")
    void delete(@Param("pageId") UUID pageId, @Param("label") String label);

    @Delete("""
            delete from authoring.page_tags as source
             using authoring.page_tags as target
             where source.page_id = target.page_id
               and source.label = #{from}
               and target.label = #{to}
            """)
    void deleteOverlaps(@Param("from") String from, @Param("to") String to);

    @Update("update authoring.page_tags set label = #{to} where label = #{from}")
    void relabel(@Param("from") String from, @Param("to") String to);

    record TagRow(String pageId, String label) {}
}
