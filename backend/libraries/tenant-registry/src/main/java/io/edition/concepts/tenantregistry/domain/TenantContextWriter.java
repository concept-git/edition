package io.edition.concepts.tenantregistry.domain;

import io.edition.concepts.tenantregistry.api.*;
import java.util.Optional;
import java.util.UUID;

/** 事务级租户上下文的写入口；实现属 adapter（GUC 是持久化细节）。 */
public interface TenantContextWriter {

    Optional<UUID> current();

    void bind(UUID tenant);

    void clear();
}
