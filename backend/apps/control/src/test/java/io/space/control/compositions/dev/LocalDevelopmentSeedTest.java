package io.space.control.bootstrap.dev;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.Role;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi.BootstrapReason;
import io.space.concepts.user.api.UserApi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@org.springframework.test.context.event.RecordApplicationEvents
@ActiveProfiles({"test", "dev"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class LocalDevelopmentSeedTest {
    @Autowired
    org.springframework.test.context.event.ApplicationEvents events;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier(
            io.space.control.support.FixtureDatabaseConfiguration.FIXTURE_JDBC)
    org.springframework.jdbc.core.JdbcTemplate fixtureJdbc;

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    LocalDevelopmentSeed seed;

    @Autowired
    UserApi users;

    @Autowired
    PasswordApi passwords;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantRegistryApi tenants;

    @Autowired
    TenantScopeApi tenantScope;

    @Test
    void seedVerifiesThroughAConsumableChallengeAndDoesNotRepeatVerification() {
        var user = users.byEmail(LocalDevelopmentSeed.MEMBER_EMAIL).orElseThrow();
        fixtureJdbc.update("update iam.users set verified=false where id=?", user.value());
        var previous = users.requestVerification(user).orElseThrow();
        seed.ensure();
        assertThat(users.profile(user).orElseThrow().verified()).isTrue();
        assertThat(users.verificationPending(user, previous.token())).isFalse();
        assertThat(events.stream(io.space.concepts.user.api.UserEvents.Verified.class)
                        .filter(event -> event.user().equals(user)))
                .hasSize(1);
        seed.ensure();
        assertThat(events.stream(io.space.concepts.user.api.UserEvents.Verified.class)
                        .filter(event -> event.user().equals(user)))
                .hasSize(1);
        assertThat(fixtureJdbc.queryForObject(
                        "select verify_token_hash is null and verify_expires_at is null" + " from iam.users where id=?",
                        Boolean.class,
                        user.value()))
                .isTrue();
    }

    @Test
    void ensureIsIdempotentAndRestoresLoginMembershipsWithoutTouchingOtherTenants() {
        seed.ensure();

        UserApi.UserId operator =
                users.byEmail(LocalDevelopmentSeed.OPERATOR_EMAIL).orElseThrow();
        UserApi.UserId owner = users.byEmail(LocalDevelopmentSeed.OWNER_EMAIL).orElseThrow();
        UserApi.UserId member = users.byEmail(LocalDevelopmentSeed.MEMBER_EMAIL).orElseThrow();
        UserApi.UserId multi = users.byEmail(LocalDevelopmentSeed.MULTI_EMAIL).orElseThrow();

        assertThat(users.isPlatformOperator(operator)).isTrue();
        assertThat(users.isPlatformOperator(owner)).isFalse();
        assertThat(memberships.groupsOf(new MemberId(operator.value()))).isEmpty();

        var extra = tenantScope.withoutTenant(
                BootstrapReason.TENANT_PROVISIONING, () -> switch (tenants.provision("验收旁路租户")) {
                    case TenantRegistryApi.ProvisionResult.Provisioned ok -> ok.tenant();
                    case TenantRegistryApi.ProvisionResult.InvalidName invalid ->
                        throw new IllegalStateException(invalid.reason());
                });

        Group compute =
                Group.tenant(tenantId(LocalDevelopmentSeed.COMPUTE_TENANT).value());
        tenantScope.inTenant(
                tenantId(LocalDevelopmentSeed.COMPUTE_TENANT),
                () -> memberships.remove(compute, new MemberId(member.value())));
        passwords.set(new PasswordApi.AccountId(owner.value()), "changed9");

        seed.ensure();
        seed.ensure();

        assertThat(named(LocalDevelopmentSeed.COMPUTE_TENANT)).hasSize(1);
        assertThat(named(LocalDevelopmentSeed.STORAGE_TENANT)).hasSize(1);
        assertThat(tenants.view(extra.id())).isPresent();

        authenticate(owner, LocalDevelopmentSeed.PASSWORD);
        authenticate(member, LocalDevelopmentSeed.PASSWORD);
        authenticate(multi, LocalDevelopmentSeed.PASSWORD);
        authenticate(operator, LocalDevelopmentSeed.PASSWORD);

        // Membership 是租户作用域概念：每次读都要处在对应租户上下文内，否则 RLS 直接 42501。
        Group storage =
                Group.tenant(tenantId(LocalDevelopmentSeed.STORAGE_TENANT).value());
        assertThat(roleIn(compute, owner)).contains(Role.OWNER);
        assertThat(roleIn(compute, member)).contains(Role.MEMBER);
        assertThat(roleIn(compute, multi)).contains(Role.MEMBER);
        assertThat(roleIn(storage, multi)).contains(Role.OWNER);
        assertThat(roleIn(storage, owner)).isEmpty();
        assertThat(memberships.groupsOf(new MemberId(operator.value()))).isEmpty();
    }

    private void authenticate(UserApi.UserId user, String password) {
        assertThat(passwords.authenticate(new PasswordApi.AccountId(user.value()), password))
                .isInstanceOf(PasswordApi.AuthenticateResult.Authenticated.class);
    }

    private java.util.Optional<Role> roleIn(Group group, UserApi.UserId user) {
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(group.tenantId()),
                () -> memberships.roleOf(group, new MemberId(user.value())));
    }

    private TenantRegistryApi.TenantId tenantId(String name) {
        return named(name).getFirst().id();
    }

    private java.util.List<TenantRegistryApi.View> named(String name) {
        var found = new java.util.ArrayList<TenantRegistryApi.View>();
        String cursor = null;
        do {
            var page = tenants.list(cursor, 100);
            page.tenants().stream().filter(tenant -> tenant.name().equals(name)).forEach(found::add);
            cursor = page.nextCursor();
        } while (cursor != null);
        return found;
    }
}
