package io.edition.concepts.tenantregistry.domain;

import io.edition.concepts.tenantregistry.api.*;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi.Status;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi.View;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository {

    View insert(TenantName name);

    Optional<View> find(TenantId tenant);

    void updateStatus(TenantId tenant, Status status);

    List<View> findAll(Collection<TenantId> tenants);

    /** keyset 分页：createdAt/id 同时为 null 表示第一页。 */
    List<View> page(Instant beforeCreatedAt, UUID beforeId, int limit);
}
