package io.edition.concepts.search.domain;

import io.edition.concepts.search.api.*;
import io.edition.concepts.search.api.SearchApi;
import java.util.List;

public interface SearchRepository {
    SearchApi.Boost configureBoost(SearchApi.ScopeId scope, List<String> fields);

    SearchApi.Boost configuredBoost(SearchApi.ScopeId scope);

    void terminateScope(SearchApi.ScopeId scope);
}
