package io.space.concepts.tenantregistry.adapters.persistence;

import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.Status;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.View;
import io.space.concepts.tenantregistry.domain.TenantName;
import io.space.concepts.tenantregistry.domain.TenantRepository;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisTenantRepository implements TenantRepository {

    private final TenantMapper mapper;

    MyBatisTenantRepository(TenantMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public View insert(TenantName name) {
        return view(mapper.insert(name.value()));
    }

    @Override
    public Optional<View> find(TenantId tenant) {
        return Optional.ofNullable(mapper.find(tenant.value())).map(MyBatisTenantRepository::view);
    }

    @Override
    public void updateStatus(TenantId tenant, Status status) {
        mapper.updateStatus(tenant.value(), status.name().toLowerCase(Locale.ROOT));
    }

    @Override
    public List<View> findAll(Collection<TenantId> tenants) {
        List<String> ids = tenants.stream()
                .map(tenant -> tenant.value().toString())
                .distinct()
                .toList();
        return ids.isEmpty()
                ? List.of()
                : mapper.findAll(ids).stream()
                        .map(MyBatisTenantRepository::view)
                        .toList();
    }

    @Override
    public List<View> page(Instant beforeCreatedAt, UUID beforeId, int limit) {
        return mapper.page(beforeCreatedAt, beforeId, limit).stream()
                .map(MyBatisTenantRepository::view)
                .toList();
    }

    private static View view(TenantMapper.Row row) {
        return new View(
                new TenantId(UUID.fromString(row.id())),
                row.name(),
                Status.valueOf(row.status().toUpperCase(Locale.ROOT)),
                row.createdAt());
    }
}
