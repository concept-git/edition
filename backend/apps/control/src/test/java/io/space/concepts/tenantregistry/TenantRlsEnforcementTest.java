package io.space.concepts.tenantregistry;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.iam.registration.RegisterUseCase;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = "io.space.rls.enabled=true")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class TenantRlsEnforcementTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    JdbcTemplate runtime;

    @Autowired
    TenantScopeApi tenantScope;

    @org.springframework.beans.factory.annotation.Autowired
    RegisterUseCase registerUseCase;

    @Autowired
    UserApi users;

    @Autowired
    TenantRegistryApi tenants;

    @Autowired
    MembershipApi memberships;

    @Autowired
    PermissionApi permissions;

    @Autowired
    @Qualifier("migrationDataSource")
    DataSource migrationDataSource;

    @Test
    @Transactional
    void runtimeConnectionsUseTheRestrictedRoleAndRequireContext() {
        assertThat(runtime.queryForObject("select current_user", String.class)).isEqualTo("space_app");
        assertThatThrownBy(() -> runtime.queryForObject("select count(*) from iam.memberships", Long.class))
                .rootCause()
                .hasMessageContaining("tenant context is required");
    }

    @Test
    @Transactional
    void tenantContextCannotReadOrWriteAnotherTenant() {
        UUID tenantA = UUID.randomUUID();
        UUID tenantB = UUID.randomUUID();
        UUID member = UUID.randomUUID();
        UUID otherMember = UUID.randomUUID();
        var migration = new JdbcTemplate(migrationDataSource);
        migration.update(
                "insert into shared.tenants (id, name) values (?, ?), (?, ?)",
                tenantA,
                "Tenant A",
                tenantB,
                "Tenant B");
        migration.update(
                "insert into iam.users (id, email, name) values (?, ?, ?), (?, ?, ?)",
                member,
                "member-a@example.invalid",
                "Member A",
                otherMember,
                "member-b@example.invalid",
                "Member B");
        migration.update(
                "insert into iam.memberships "
                        + "(tenant_id, group_type, group_id, member_id, role) values (?, 'tenant', ?, ?, 'owner')",
                tenantB,
                tenantB,
                member);

        tenantScope.inTenant(new TenantRegistryApi.TenantId(tenantA), () -> {
            assertThat(runtime.queryForObject(
                            "select count(*) from iam.memberships where tenant_id = ?", Long.class, tenantB))
                    .isZero();
        });
        assertThatThrownBy(() -> tenantScope.inTenant(
                        new TenantRegistryApi.TenantId(tenantA),
                        () -> runtime.update(
                                "insert into iam.memberships "
                                        + "(tenant_id, group_type, group_id, member_id, role) "
                                        + "values (?, 'tenant', ?, ?, 'member')",
                                tenantB,
                                tenantB,
                                otherMember)))
                .rootCause()
                .hasMessageContaining("row-level security policy");
    }

    @Test
    void bootstrapLookupAllowsRegistrationWithoutBypassingTenantTables() {
        UUID user = registerUseCase.register("rls-registration@example.invalid", "RLS Registration", "password1");

        assertThat(users.byEmail("rls-registration@example.invalid")).contains(new UserApi.UserId(user));
    }

    @Test
    void narrowBootstrapFunctionsSupportPlatformAndUserSecurityFlows() {
        var provisioned = (TenantRegistryApi.ProvisionResult.Provisioned) tenants.provision("RLS Platform Tenant");
        var tenant = provisioned.tenant();
        assertThat(tenants.view(tenant.id())).contains(tenant);
        tenants.suspend(tenant.id());
        assertThat(tenants.status(tenant.id())).contains(TenantRegistryApi.Status.SUSPENDED);

        UUID user = UUID.randomUUID();
        var migration = new JdbcTemplate(migrationDataSource);
        migration.update(
                "insert into iam.users (id, email, name) values (?, ?, ?)", user, "cascade@example.invalid", "Cascade");
        migration.update(
                "insert into iam.memberships "
                        + "(tenant_id, group_type, group_id, member_id, role) values (?, 'tenant', ?, ?, 'owner')",
                tenant.id().value(),
                tenant.id().value(),
                user);
        migration.update(
                "insert into iam.permission_grants "
                        + "(tenant_id, resource_type, resource_id, principal_type, principal_id, role) "
                        + "values (?, 'tenant', ?, 'user', ?, 'reader')",
                tenant.id().value(),
                tenant.id().value(),
                user);

        var member = new MembershipApi.MemberId(user);
        assertThat(memberships.groupsOf(member))
                .singleElement()
                .extracting(value -> value.group().tenantId())
                .isEqualTo(tenant.id().value());
        assertThat(memberships.lockGroupsOf(member)).hasSize(1);
        assertThat(permissions.tenantIdsOf(new PermissionApi.Principal(PermissionApi.PrincipalType.USER, user)))
                .containsExactly(tenant.id().value());
    }
}
