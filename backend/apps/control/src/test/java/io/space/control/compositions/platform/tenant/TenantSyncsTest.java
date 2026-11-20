package io.space.control.compositions.platform.tenant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PlatformOperatorRequiredException;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class TenantSyncsTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantRegistryApi tenants;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void provisionTenantSeatsASeatableOwnerAndListTenantsReportsTheOwner() {
        String operator = operator("operator-seat@provisioning-syncs.test");
        UserApi.UserId owner = verifiedUser("owner-seat@provisioning-syncs.test");

        var result =
                provisionTenantUseCase.provisionTenant(operator, "Seated Tenant", "owner-seat@provisioning-syncs.test");

        assertThat(result.ownerInviteToken()).isNull();
        // Membership 是租户作用域概念：读它必须先进入该租户上下文，否则 RLS 直接 42501。
        assertThat(tenantScope.inTenant(
                        new TenantRegistryApi.TenantId(result.tenant().id()),
                        () -> memberships.roleOf(
                                MembershipApi.Group.tenant(result.tenant().id()),
                                new MembershipApi.MemberId(owner.value()))))
                .contains(MembershipApi.Role.OWNER);
        assertThat(jdbc.queryForObject("""
                select count(*) from iam.permission_grants
                 where resource_type = 'tenant' and resource_id = ? and principal_id = ?
                """, Long.class, result.tenant().id(), owner.value()))
                .isOne();
        assertThat(listTenantsUseCase.listTenants(operator, null, 20).tenants())
                .extracting(TenantTypes.TenantView::name)
                .contains("Seated Tenant");
    }

    @Test
    void provisionTenantInvitesAnOwnerWhoCannotYetLogIn() {
        String operator = operator("operator-invite@provisioning-syncs.test");

        var result = provisionTenantUseCase.provisionTenant(
                operator, "Invited Tenant", "future-owner@provisioning-syncs.test");

        assertThat(result.ownerInviteToken()).isNotBlank();
        assertThat(result.tenant().ownerCount()).isZero();
        assertThat(memberships.pendingFor("future-owner@provisioning-syncs.test"))
                .singleElement()
                .satisfies(invite -> {
                    assertThat(invite.group().tenantId())
                            .isEqualTo(result.tenant().id());
                    assertThat(invite.role()).isEqualTo(MembershipApi.Role.OWNER);
                });
    }

    @Test
    void operatorAndTenantNameErrorSyncsRejectBeforeProvisioning() {
        String ordinary = credential(verifiedUser("ordinary@provisioning-syncs.test"));
        assertThatExceptionOfType(PlatformOperatorRequiredException.class)
                .isThrownBy(() -> provisionTenantUseCase.provisionTenant(
                        ordinary, "Forbidden Tenant", "owner@provisioning-syncs.test"));

        String operator = operator("operator-invalid@provisioning-syncs.test");
        assertThatExceptionOfType(TenantNameInvalidException.class)
                .isThrownBy(
                        () -> provisionTenantUseCase.provisionTenant(operator, "   ", "owner@provisioning-syncs.test"));
        assertThat(listTenantsUseCase.listTenants(operator, null, 100).tenants())
                .noneMatch(tenant -> tenant.name().equals("Forbidden Tenant"));
    }

    @Test
    void suspendAndResumeAreIdempotentAndUnknownTenantsUseTheNotFoundSync() {
        String operator = operator("operator-status@provisioning-syncs.test");
        var tenant = provisionTenantUseCase
                .provisionTenant(operator, "Status Tenant", "future-status-owner@provisioning-syncs.test")
                .tenant()
                .id();

        suspendTenantUseCase.suspendTenant(operator, tenant);
        suspendTenantUseCase.suspendTenant(operator, tenant);
        assertThat(tenants.status(new TenantRegistryApi.TenantId(tenant))).contains(TenantRegistryApi.Status.SUSPENDED);

        resumeTenantUseCase.resumeTenant(operator, tenant);
        resumeTenantUseCase.resumeTenant(operator, tenant);
        assertThat(tenants.status(new TenantRegistryApi.TenantId(tenant))).contains(TenantRegistryApi.Status.ACTIVE);

        assertThatExceptionOfType(TenantNotFoundException.class)
                .isThrownBy(() -> suspendTenantUseCase.suspendTenant(operator, UUID.randomUUID()));
    }

    private String operator(String email) {
        UserApi.UserId user = verifiedUser(email);
        jdbc.update("update iam.users set platform_operator = true where id = ?", user.value());
        return credential(user);
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Provisioning User");
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        return registered.user();
    }

    private String credential(UserApi.UserId user) {
        var started = (SessionApi.StartResult.Started) sessions.start(
                new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");
        return started.credentials().accessToken();
    }
}
