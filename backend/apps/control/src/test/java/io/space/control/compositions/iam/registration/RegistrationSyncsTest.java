package io.space.control.compositions.iam.registration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.iam.PasswordTooWeakException;
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

/** 每条 sync 一条测试（spec.md 通用 DoD）。 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class RegistrationSyncsTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    RegisterUseCase registerUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    VerifyEmailUseCase verifyEmailUseCase;

    @Autowired
    UserApi users;

    @Autowired
    PasswordApi passwords;

    @Autowired
    JdbcTemplate jdbc;

    // sync register: then User.register : (u), Password.set (u, password), respond (created)
    @Test
    void registerCreatesTheUserAndSetsThePasswordInOneFlow() {
        UUID userId = registerUseCase.register("gina@registration-syncs.test", "Gina", "password1");

        assertThat(users.byEmail("gina@registration-syncs.test")).contains(new UserApi.UserId(userId));
        assertThat(passwords.isSet(new PasswordApi.AccountId(userId))).isTrue();
    }

    @Test
    void aFailureAfterPasswordSetRollsBackTheUserCredentialAndMailTogether() {
        var before = fixtures.queryForList("select user_id from iam.password_credentials", UUID.class);
        fixtures.execute("""
                create function shared.reject_registration_mail() returns trigger language plpgsql as $$
                begin raise exception 'injected registration failure'; end $$;
                create trigger reject_registration_mail before insert on shared.mail_outbox
                for each row execute function shared.reject_registration_mail();
                """);
        try {
            assertThatThrownBy(() -> registerUseCase.register("orphan@registration-syncs.test", "Orphan", "password1"))
                    .isInstanceOf(RuntimeException.class);
        } finally {
            fixtures.execute("drop trigger reject_registration_mail on shared.mail_outbox");
            fixtures.execute("drop function shared.reject_registration_mail()");
        }
        assertThat(users.byEmail("orphan@registration-syncs.test")).isEmpty();
        assertThat(fixtures.queryForList("select user_id from iam.password_credentials", UUID.class))
                .containsExactlyInAnyOrderElementsOf(before);
        assertThat(fixtures.queryForObject("select to_regclass('shared.identity_provisioning') is null", Boolean.class))
                .isTrue();
    }

    // mediator branch registerTaken: when User.register : (error) then respond (409)
    @Test
    void registerTakenRespondsConflictForAClaimedEmail() {
        registerUseCase.register("henry@registration-syncs.test", "Henry", "password1");

        assertThatExceptionOfType(EmailTakenException.class)
                .isThrownBy(() -> registerUseCase.register("henry@registration-syncs.test", "Henry II", "password1"));
    }

    // mediator branch passwordTooWeak: 弱密码拒绝回滚源侧身份、邀请接纳与邮件 outbox。
    @Test
    void passwordTooWeakRollsBackTheWholeRegistration() {
        assertThatExceptionOfType(PasswordTooWeakException.class)
                .isThrownBy(() -> registerUseCase.register("iris@registration-syncs.test", "Iris", "weak"));

        assertThat(users.byEmail("iris@registration-syncs.test")).isEmpty();
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.mail_outbox where recipient = ?",
                        Long.class,
                        "iris@registration-syncs.test"))
                .isZero();
    }

    // sync acceptInviteOnRegister: 受邀注册自动入租；owner 同步获得租户根 admin
    @Test
    void acceptInviteOnRegisterSeatsEveryPendingOwnerInviteAndGrantsRootAccess() {
        UUID firstTenant = tenant("Registration Invite One");
        UUID secondTenant = tenant("Registration Invite Two");
        var email = "invited-owner@registration-syncs.test";
        invite(firstTenant, email);
        invite(secondTenant, email);

        UUID user = registerUseCase.register(email, "Invited Owner", "password1");

        assertThat(memberships.groupsOf(new MembershipApi.MemberId(user)))
                .extracting(membership -> membership.group().tenantId())
                .containsExactlyInAnyOrder(firstTenant, secondTenant);
        assertThat(fixtures.queryForList(
                        "select tenant_id from iam.permission_grants where principal_id = ?", UUID.class, user))
                .containsExactlyInAnyOrder(firstTenant, secondTenant);
        assertThat(memberships.pendingFor(email)).isEmpty();
    }

    // sync verifyEmail: when Requesting.verifyEmail (user, token) then User.verify (user, token)
    @Test
    void verifyEmailRedeemsTheTokenAndRejectsInvalidOnes() {
        var registered = (UserApi.RegisterResult.Registered) users.register("judy@registration-syncs.test", "Judy");

        verifyEmailUseCase.verifyEmail(registered.user().value(), registered.verifyToken());
        assertThat(users.profile(registered.user())).contains(new UserApi.Profile("Judy", true));

        assertThatExceptionOfType(EmailVerificationException.class)
                .isThrownBy(
                        () -> verifyEmailUseCase.verifyEmail(registered.user().value(), registered.verifyToken()));
    }

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate fixtures;

    /** Membership 是租户作用域概念：绕过 flow 直接签发也必须先进入该租户上下文（RLS）。 */
    private void invite(UUID tenant, String email) {
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> memberships.invite(MembershipApi.Group.tenant(tenant), email, MembershipApi.Role.OWNER));
    }

    private UUID tenant(String name) {
        UUID id = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", id, name);
        return id;
    }
}
