package io.edition.concepts.search.api;

public final class SearchEvents {
    private SearchEvents() {}

    public record BoostConfigured(SearchApi.ScopeId scope, SearchApi.Boost boost) {}
}
