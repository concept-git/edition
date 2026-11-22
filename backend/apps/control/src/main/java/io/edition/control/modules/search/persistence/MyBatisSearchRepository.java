package io.edition.control.modules.search.persistence;

import io.edition.control.modules.search.api.*;
import io.edition.control.modules.search.api.SearchApi;
import io.edition.control.modules.search.domain.SearchRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisSearchRepository implements SearchRepository {
    private final SearchSettingsMapper mapper;

    MyBatisSearchRepository(SearchSettingsMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public SearchApi.Boost configureBoost(SearchApi.ScopeId scope, List<String> fields) {
        var row = mapper.configureBoost(scope.value(), String.join(",", fields));
        return new SearchApi.Boost(List.of(row.fields().split(",")), row.revision());
    }

    @Override
    public SearchApi.Boost configuredBoost(SearchApi.ScopeId scope) {
        var row = mapper.boost(scope.value());
        return row == null
                ? SearchApi.Boost.defaults()
                : new SearchApi.Boost(List.of(row.fields().split(",")), row.revision());
    }

    @Override
    public void terminateScope(SearchApi.ScopeId scope) {
        mapper.deleteSettings(scope.value());
    }
}
