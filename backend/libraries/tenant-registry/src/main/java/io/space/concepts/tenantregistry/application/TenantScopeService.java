package io.space.concepts.tenantregistry.application;

import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.tenantregistry.domain.TenantContextWriter;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class TenantScopeService implements TenantScopeApi {

    private static final Logger log = LoggerFactory.getLogger(TenantScopeService.class);

    private final TenantContextWriter context;

    TenantScopeService(TenantContextWriter context) {
        this.context = context;
    }

    @Override
    @Transactional
    public <T> T inTenant(TenantId tenant, Supplier<T> work) {
        Optional<UUID> previous = context.current();
        context.bind(tenant.value());
        boolean databaseFailed = false;
        try {
            return work.get();
        } catch (DataAccessException failure) {
            // PostgreSQL 拒绝后事务已 aborted；事务级 GUC 会随回滚自动清除，继续发 SQL 只会遮蔽根因。
            databaseFailed = true;
            throw failure;
        } finally {
            if (!databaseFailed) {
                // 同一事务内可能嵌套多个租户作用域（如级联清理），恢复上一层而非一律清空。
                previous.ifPresentOrElse(context::bind, context::clear);
            }
        }
    }

    @Override
    @Transactional
    public void inTenant(TenantId tenant, Runnable work) {
        inTenant(tenant, () -> {
            work.run();
            return null;
        });
    }

    @Override
    @Transactional
    public <T> T withoutTenant(BootstrapReason reason, Supplier<T> work) {
        Optional<UUID> previous = context.current();
        context.clear();
        boolean databaseFailed = false;
        try {
            log.atDebug()
                    .addKeyValue("event", "tenant.bootstrap-scope")
                    .addKeyValue("reason", reason.name().toLowerCase(Locale.ROOT))
                    .log("running without tenant context");
            return work.get();
        } catch (DataAccessException failure) {
            databaseFailed = true;
            throw failure;
        } finally {
            if (!databaseFailed) {
                previous.ifPresent(context::bind);
            }
        }
    }
}
