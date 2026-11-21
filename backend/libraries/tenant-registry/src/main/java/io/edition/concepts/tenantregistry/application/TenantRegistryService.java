package io.edition.concepts.tenantregistry.application;

import io.edition.concepts.tenantregistry.api.*;
import io.edition.concepts.tenantregistry.api.TenantEvents;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.domain.TenantName;
import io.edition.concepts.tenantregistry.domain.TenantRepository;
import io.edition.shared.KeysetCursor;
import io.edition.shared.PageWindow;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class TenantRegistryService implements TenantRegistryApi {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    private final TenantRepository repository;
    private final ApplicationEventPublisher events;

    TenantRegistryService(TenantRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    @Override
    public ProvisionResult provision(String name) {
        Optional<TenantName> parsed = TenantName.parse(name);
        if (parsed.isEmpty()) {
            return new ProvisionResult.InvalidName(
                    "name must not be blank and must be at most " + TenantName.MAX_LENGTH + " characters");
        }
        View tenant = repository.insert(parsed.orElseThrow());
        events.publishEvent(new TenantEvents.Provisioned(tenant.id(), tenant.name()));
        return new ProvisionResult.Provisioned(tenant);
    }

    @Override
    public void suspend(TenantId tenant) {
        repository.updateStatus(tenant, Status.SUSPENDED);
        events.publishEvent(new TenantEvents.Suspended(tenant));
    }

    @Override
    public void resume(TenantId tenant) {
        repository.updateStatus(tenant, Status.ACTIVE);
        events.publishEvent(new TenantEvents.Resumed(tenant));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Status> status(TenantId tenant) {
        return repository.find(tenant).map(View::status);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<View> view(TenantId tenant) {
        return repository.find(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> viewsOf(Collection<TenantId> tenants) {
        return tenants.isEmpty() ? List.of() : repository.findAll(tenants);
    }

    @Override
    @Transactional(readOnly = true)
    public Page list(String cursor, int limit) {
        int pageSize = pageSize(limit);
        Optional<KeysetCursor> position = KeysetCursor.decode(cursor);
        List<View> rows = repository.page(
                position.map(KeysetCursor::at).orElse(null),
                position.map(KeysetCursor::id).orElse(null),
                pageSize + 1);
        var window = PageWindow.of(
                rows,
                pageSize,
                row -> KeysetCursor.encode(row.createdAt(), row.id().value()));
        return new Page(window.items(), window.nextCursor());
    }

    private static int pageSize(int requested) {
        if (requested <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(requested, MAX_PAGE_SIZE);
    }
}
