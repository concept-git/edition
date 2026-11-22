package io.edition;

import static org.junit.jupiter.api.Assertions.*;

import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.modules.tenantregistry.api.TenantScopeApi;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

class TenantDirectoryTest extends PlatformBehaviorSuite {
    @Autowired
    TenantRegistryApi directory;

    @Autowired
    TenantScopeApi scopes;

    @Autowired
    JdbcTemplate sql;

    @Test
    void similarlyNamedTenantsRemainDistinctAcrossDirectoryPages() {
        var first = provision("  Editorial  ");
        var second = provision("Editorial");
        assertNotEquals(first.id(), second.id());
        assertEquals("Editorial", first.name());
        assertEquals(List.of(), directory.viewsOf(List.of()));
        var latest = directory.list(null, 1);
        assertEquals(second.id(), latest.tenants().getFirst().id());
        var older = directory.list(latest.nextCursor(), 1);
        assertEquals(first.id(), older.tenants().getFirst().id());
        assertFalse(directory.list(null, 0).tenants().isEmpty());
    }

    @Test
    void invalidNamesCannotCreateDirectoryEntries() {
        for (String name : new String[] {null, "  ", "x".repeat(121)}) {
            assertInstanceOf(TenantRegistryApi.ProvisionResult.InvalidName.class, directory.provision(name));
        }
    }

    @Test
    void aFailedTransactionDoesNotLeakItsTenantIntoTheNextRequest() {
        var tenant = provision("Transaction isolation").id();
        assertThrows(
                DataAccessException.class,
                () -> scopes.inTenant(tenant, () -> sql.queryForObject("select 1/0", Integer.class)));
        assertThrows(
                DataAccessException.class,
                () -> scopes.withoutTenant(
                        TenantScopeApi.BootstrapReason.TENANT_PROVISIONING,
                        () -> sql.queryForObject("select 1/0", Integer.class)));
        var independent = new TenantRegistryApi.TenantId(UUID.randomUUID());
        scopes.inTenant(
                independent,
                () -> assertEquals(
                        independent.value().toString(),
                        sql.queryForObject("select current_setting('app.tenant_id')", String.class)));
    }

    private TenantRegistryApi.View provision(String name) {
        return assertInstanceOf(TenantRegistryApi.ProvisionResult.Provisioned.class, directory.provision(name))
                .tenant();
    }
}
