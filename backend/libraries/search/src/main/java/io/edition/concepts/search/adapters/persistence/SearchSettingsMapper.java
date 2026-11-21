package io.edition.concepts.search.adapters.persistence;

import io.edition.concepts.search.api.*;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface SearchSettingsMapper {
    @Delete("delete from hosting.search_settings where site_id=#{site}")
    void deleteSettings(@Param("site") UUID site);

    @Select(
            "select array_to_string(fields, ',') as fields, revision from hosting.search_settings where site_id=#{site}")
    BoostRow boost(@Param("site") UUID site);

    @Select(value = """
            insert into hosting.search_settings(site_id,fields,revision)
            values(#{site},string_to_array(#{fields},','),1)
            on conflict(site_id) do update
              set fields=excluded.fields,revision=hosting.search_settings.revision+1
            returning array_to_string(fields, ',') as fields,revision
            """, affectData = true)
    @Options(flushCache = Options.FlushCachePolicy.TRUE, useCache = false)
    BoostRow configureBoost(@Param("site") UUID site, @Param("fields") String fields);

    record BoostRow(String fields, long revision) {}
}
