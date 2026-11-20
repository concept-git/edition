package io.space.testing;

import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Test-only transaction/tenant context; it has no concept dependency or business lookup. */
@org.springframework.stereotype.Component
public final class DatabaseScope {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;

    public DatabaseScope(JdbcTemplate jdbc, PlatformTransactionManager manager) {
        this.jdbc = jdbc;
        this.transactions = new TransactionTemplate(manager);
    }

    public <T> T inTenant(UUID tenant, Supplier<T> body) {
        return transactions.execute(status -> {
            String prior = jdbc.queryForObject("select current_setting('app.tenant_id', true)", String.class);
            jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
            boolean databaseFailure = false;
            try {
                return body.get();
            } catch (org.springframework.dao.DataAccessException
                    | org.springframework.transaction.TransactionException failure) {
                databaseFailure = true;
                status.setRollbackOnly();
                throw failure;
            } finally {
                // PostgreSQL rejects cleanup SQL in an aborted transaction; rollback clears LOCAL state.
                if (!databaseFailure)
                    jdbc.queryForObject(
                            "select set_config('app.tenant_id', ?, true)", String.class, prior == null ? "" : prior);
            }
        });
    }

    public void inTenant(UUID tenant, Runnable body) {
        inTenant(tenant, () -> {
            body.run();
            return null;
        });
    }
}
