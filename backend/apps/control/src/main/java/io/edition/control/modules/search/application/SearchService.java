package io.edition.control.modules.search.application;

import io.edition.control.modules.search.api.*;
import io.edition.control.modules.search.api.SearchApi;
import io.edition.control.modules.search.api.SearchEvents;
import io.edition.control.modules.search.domain.SearchRepository;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class SearchService implements SearchApi {
    private final SearchRepository repository;
    private final ApplicationEventPublisher events;

    SearchService(SearchRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    @Override
    public Boost configureBoost(ScopeId scope, List<String> fields) {
        var valid = new Boost(fields, 0);
        var result = repository.configureBoost(scope, valid.fields());
        events.publishEvent(new SearchEvents.BoostConfigured(scope, result));
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Boost configuredBoost(ScopeId scope) {
        return repository.configuredBoost(scope);
    }

    @Override
    public void terminateScope(ScopeId scope) {
        repository.terminateScope(scope);
    }
}
