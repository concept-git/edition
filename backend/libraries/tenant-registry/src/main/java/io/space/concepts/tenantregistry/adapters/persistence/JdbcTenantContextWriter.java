package io.space.concepts.tenantregistry.adapters.persistence;

import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.tenantregistry.domain.TenantContextWriter;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * `set_config(..., true)` 是事务级设置：事务结束自动回落，无需手工清理。
 * 因此本写入口坚持要求活动事务——没有事务的"设置"只会作用在一条借来的连接上，然后凭空消失。
 */
@Repository
class JdbcTenantContextWriter implements TenantContextWriter {

    private static final String SETTING = "app.tenant_id";

    private final JdbcTemplate jdbc;

    JdbcTenantContextWriter(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Optional<UUID> current() {
        requireTransaction();
        String value = jdbc.queryForObject("select current_setting(?, true)", String.class, SETTING);
        return value == null || value.isBlank() ? Optional.empty() : Optional.of(UUID.fromString(value));
    }

    @Override
    public void bind(UUID tenant) {
        requireTransaction();
        jdbc.queryForObject("select set_config(?, ?, true)", String.class, SETTING, tenant.toString());
    }

    @Override
    public void clear() {
        requireTransaction();
        jdbc.queryForObject("select set_config(?, '', true)", String.class, SETTING);
    }

    private static void requireTransaction() {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException("tenant context requires an active transaction");
        }
    }
}
