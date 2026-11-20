package io.space.testing;

import static org.assertj.core.api.Assertions.*;

import com.zaxxer.hikari.HikariDataSource;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
class DatabaseScopeTest {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    static HikariDataSource pool;
    static JdbcTemplate runtime;
    static DatabaseScope scope;

    @BeforeAll
    static void database() {
        var owner = new JdbcTemplate(
                new DriverManagerDataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()));
        owner.execute("create role scope_runtime login password 'scope-test'");
        owner.execute("create table scope_records(id uuid primary key,tenant_id uuid not null)");
        owner.execute("alter table scope_records enable row level security");
        owner.execute("alter table scope_records force row level security");
        owner.execute(
                "create policy tenant_scope on scope_records using(tenant_id=nullif(current_setting('app.tenant_id',true),'')::uuid) with check(tenant_id=nullif(current_setting('app.tenant_id',true),'')::uuid)");
        owner.execute("grant select,insert on scope_records to scope_runtime");
        pool = new HikariDataSource();
        pool.setJdbcUrl(postgres.getJdbcUrl());
        pool.setUsername("scope_runtime");
        pool.setPassword("scope-test");
        pool.setMaximumPoolSize(1);
        runtime = new JdbcTemplate(pool);
        scope = new DatabaseScope(runtime, new DataSourceTransactionManager(pool));
    }

    @AfterAll
    static void close() {
        pool.close();
    }

    @Test
    void nestedScopesRestoreTheirCallerAndPooledConnectionsNeverRetainATenant() {
        UUID outer = UUID.randomUUID(), inner = UUID.randomUUID();
        scope.inTenant(outer, () -> {
            assertThat(current()).isEqualTo(outer);
            assertThat(scope.inTenant(inner, () -> current())).isEqualTo(inner);
            assertThat(current()).isEqualTo(outer);
            assertThat(runtime.queryForObject(
                            "select rolbypassrls from pg_roles where rolname=current_user", Boolean.class))
                    .isFalse();
        });
        assertThat(current()).isNull();
    }

    @Test
    void aRejectedRlsWriteRetainsItsOriginalFailureAndTheNextScopeStillWorks() {
        UUID tenant = UUID.randomUUID(), other = UUID.randomUUID(), record = UUID.randomUUID();
        var original = new java.util.concurrent.atomic.AtomicReference<org.springframework.dao.DataAccessException>();
        var propagated = catchThrowable(() -> scope.inTenant(tenant, () -> {
            try {
                return runtime.update("insert into scope_records values(?,?)", record, other);
            } catch (org.springframework.dao.DataAccessException failure) {
                original.set(failure);
                throw failure;
            }
        }));
        assertThat(propagated).isSameAs(original.get());
        assertThat(propagated).rootCause().hasMessageContaining("row-level security policy");
        assertThat(current()).isNull();
        scope.inTenant(tenant, () -> runtime.update("insert into scope_records values(?,?)", record, tenant));
        assertThat(scope.inTenant(
                        other, () -> runtime.queryForObject("select count(*) from scope_records", Long.class)))
                .isZero();
        assertThat(scope.inTenant(
                        tenant,
                        () -> runtime.queryForObject(
                                "select count(*) from scope_records where id=?", Long.class, record)))
                .isOne();
    }

    private UUID current() {
        return runtime.queryForObject("select nullif(current_setting('app.tenant_id',true),'')::uuid", UUID.class);
    }
}
