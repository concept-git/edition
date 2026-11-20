package io.space.control.compositions.iam;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.awaitility.Awaitility.await;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.OwnerRootAccess;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.iam.apitoken.IssueTokenUseCase;
import io.space.control.compositions.iam.usererasure.DeactivateUserUseCase;
import io.space.control.compositions.iam.usererasure.EraseSelfUseCase;
import io.space.control.compositions.iam.usererasure.EraseUserUseCase;
import io.space.control.compositions.iam.usererasure.UserErasureTypes;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
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
class TokenOwnerCascadeTest {
    private static final String PASSWORD = "password1";

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    DeactivateUserUseCase deactivateUserUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    EraseSelfUseCase eraseSelfUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    EraseUserUseCase eraseUserUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    IssueTokenUseCase issueTokenUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    ApiTokenApi tokens;

    @Autowired
    UserApi users;

    @Autowired
    PasswordApi passwords;

    @Autowired
    SessionApi sessions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    OwnerRootAccess ownerRootAccess;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void deactivateSynchronouslyEndsSessionsAndRevokesEveryOwnedToken() {
        Fixture fixture = fixture("deactivate", true);
        Issued first = issue(fixture, "one");
        Issued second = issue(fixture, "two");

        deactivateUserUseCase.deactivateUser(
                fixture.operatorCredential(),
                fixture.target().value(),
                fixture.targetEmail(),
                PASSWORD,
                UUID.randomUUID().toString());

        assertThat(activeSessions(fixture.target())).isZero();
        assertThat(tokens.authenticate(first.secret())).isInstanceOf(ApiTokenApi.Authentication.Invalid.class);
        assertThat(tokens.authenticate(second.secret())).isInstanceOf(ApiTokenApi.Authentication.Invalid.class);
        assertThat(activeTokens(fixture.target())).isZero();
        assertThat(tokenGrants(first.id()) + tokenGrants(second.id())).isZero();
        assertThat(users.accountProfile(fixture.target()).orElseThrow().status())
                .isEqualTo(UserApi.Status.DEACTIVATED);
    }

    @Test
    void eraseIsAtomicLeavesTombstonesAndReleasesTheEmail() {
        Fixture fixture = fixture("erase", true);
        Issued issued = issue(fixture, "contains Alice personal note");

        deactivateUserUseCase.deactivateUser(
                fixture.operatorCredential(),
                fixture.target().value(),
                fixture.targetEmail(),
                PASSWORD,
                UUID.randomUUID().toString());
        eraseUserUseCase.eraseUser(
                fixture.operatorCredential(),
                fixture.target().value(),
                fixture.targetEmail(),
                PASSWORD,
                UUID.randomUUID().toString());

        UserApi.AccountProfile tombstone =
                users.accountProfile(fixture.target()).orElseThrow();
        assertThat(tombstone.status()).isEqualTo(UserApi.Status.ERASED);
        assertThat(tombstone.email()).isNull();
        assertThat(tombstone.name()).isEqualTo("已注销用户");
        assertThat(tombstone.platformOperator()).isFalse();
        assertThat(activeSessions(fixture.target())).isZero();
        await().atMost(java.time.Duration.ofSeconds(5))
                .untilAsserted(() -> assertThat(passwords.isSet(
                                new PasswordApi.AccountId(fixture.target().value())))
                        .isFalse());
        assertThat(rowCount("iam.memberships", "member_id", fixture.target().value()))
                .isZero();
        assertThat(userGrants(fixture.target())).isZero();
        assertThat(tokens.authenticate(issued.secret())).isInstanceOf(ApiTokenApi.Authentication.Invalid.class);
        assertThat(jdbc.queryForObject("select name from iam.api_tokens where id = ?", String.class, issued.id()))
                .isEqualTo("已注销令牌");
        assertThat(rowCount("iam.api_tokens", "id", issued.id())).isOne();

        UserApi.UserId replacement = user(fixture.targetEmail());
        assertThat(replacement).isNotEqualTo(fixture.target());
        assertThat(users.accountProfile(fixture.target()).orElseThrow().name()).isEqualTo("已注销用户");

        eraseUserUseCase.eraseUser(
                fixture.operatorCredential(),
                fixture.target().value(),
                fixture.targetEmail(),
                PASSWORD,
                UUID.randomUUID().toString());
    }

    @Test
    void erasureRollbackPreservesCredentialsAndCommitRemovesThemAtomically() {
        Fixture fixture = fixture("erasure-rollback", true);
        var user = fixture.target();
        var account = new PasswordApi.AccountId(user.value());
        deactivateUserUseCase.deactivateUser(
                fixture.operatorCredential(),
                user.value(),
                fixture.targetEmail(),
                PASSWORD,
                UUID.randomUUID().toString());
        var hash = jdbc.queryForObject(
                "select password_hash from iam.password_credentials where user_id=?", String.class, user.value());
        assertThat(hash).isNotBlank();
        jdbc.execute("""
                create function iam.reject_user_erasure() returns trigger language plpgsql as $$
                begin
                  if new.status='erased' then raise exception 'injected erasure rollback'; end if;
                  return new;
                end $$;
                create constraint trigger reject_user_erasure after update on iam.users
                deferrable initially deferred for each row execute function iam.reject_user_erasure();
                """);
        try {
            assertThatThrownBy(() -> eraseUserUseCase.eraseUser(
                            fixture.operatorCredential(),
                            user.value(),
                            fixture.targetEmail(),
                            PASSWORD,
                            UUID.randomUUID().toString()))
                    .isInstanceOf(RuntimeException.class);
        } finally {
            jdbc.execute("drop trigger reject_user_erasure on iam.users");
            jdbc.execute("drop function iam.reject_user_erasure()");
        }
        assertThat(users.accountProfile(user).orElseThrow().status()).isEqualTo(UserApi.Status.DEACTIVATED);
        assertThat(jdbc.queryForObject(
                        "select password_hash from iam.password_credentials where user_id=?",
                        String.class,
                        user.value()))
                .isEqualTo(hash);
        assertThat(passwords.authenticate(account, PASSWORD))
                .isEqualTo(new PasswordApi.AuthenticateResult.Authenticated(account));

        eraseUserUseCase.eraseUser(
                fixture.operatorCredential(),
                user.value(),
                fixture.targetEmail(),
                PASSWORD,
                UUID.randomUUID().toString());
        assertThat(passwords.isSet(account)).isFalse();
        assertThat(jdbc.queryForObject("select status from iam.users where id=?", String.class, user.value()))
                .isEqualTo("erased");
    }

    @Test
    void soleOwnerSelfEraseIsRejectedAndRollsBackTheTemporaryDeactivation() {
        Fixture fixture = fixture("sole-owner", false);

        assertThatThrownBy(() -> eraseSelfUseCase.eraseSelf(
                        fixture.targetCredential(),
                        fixture.targetEmail(),
                        PASSWORD,
                        UUID.randomUUID().toString()))
                .isInstanceOf(UserErasureTypes.OwnershipTransferRequiredException.class);

        assertThat(users.accountProfile(fixture.target()).orElseThrow().status())
                .isEqualTo(UserApi.Status.ACTIVE);
        assertThat(activeSessions(fixture.target())).isOne();
        assertThat(passwords.isSet(new PasswordApi.AccountId(fixture.target().value())))
                .isTrue();
        assertThat(rowCount("iam.memberships", "member_id", fixture.target().value()))
                .isOne();
    }

    @Test
    void platformEraseRequiresPriorDeactivation() {
        Fixture fixture = fixture("active-reject", true);

        assertThatThrownBy(() -> eraseUserUseCase.eraseUser(
                        fixture.operatorCredential(),
                        fixture.target().value(),
                        fixture.targetEmail(),
                        PASSWORD,
                        UUID.randomUUID().toString()))
                .isInstanceOf(UserErasureTypes.UserMustBeDeactivatedException.class);

        assertThat(users.accountProfile(fixture.target()).orElseThrow().status())
                .isEqualTo(UserApi.Status.ACTIVE);
        assertThat(activeSessions(fixture.target())).isOne();
    }

    private Issued issue(Fixture fixture, String name) {
        var result = issueTokenUseCase.issueToken(
                fixture.targetCredential(),
                UUID.randomUUID().toString(),
                fixture.tenant(),
                name,
                fixture.space(),
                "reader",
                Set.of("read"),
                Instant.now().plus(1, ChronoUnit.DAYS));
        return new Issued(result.value().id(), result.value().secret());
    }

    private Fixture fixture(String suffix, boolean addKeeper) {
        UserApi.UserId operator = user("operator-" + UUID.randomUUID() + "@cascade.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        String operatorCredential = credential(operator);
        UserApi.UserId target = user("target-" + UUID.randomUUID() + "@cascade.test");
        UUID tenant = provisionTenantUseCase
                .provisionTenant(operatorCredential, "Cascade " + suffix + UUID.randomUUID(), email(target))
                .tenant()
                .id();
        String targetCredential = credential(target);
        UUID space = createSpaceUseCase
                .createSpace(
                        targetCredential,
                        tenant,
                        "Cascade Space",
                        "authored",
                        UUID.randomUUID().toString())
                .value()
                .id();
        if (addKeeper) {
            UserApi.UserId keeper = user("keeper-" + UUID.randomUUID() + "@cascade.test");
            MembershipApi.Group group = MembershipApi.Group.tenant(tenant);
            tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant), () -> {
                memberships.add(group, new MembershipApi.MemberId(keeper.value()), MembershipApi.Role.OWNER);
                ownerRootAccess.grant(group, new MembershipApi.MemberId(keeper.value()), MembershipApi.Role.OWNER);
            });
        }
        return new Fixture(target, tenant, space, targetCredential, operatorCredential, email(target));
    }

    private UserApi.UserId user(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Cascade User");
        passwords.set(new PasswordApi.AccountId(registered.user().value()), PASSWORD);
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        return registered.user();
    }

    private String credential(UserApi.UserId user) {
        return ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(user.value()),
                        new SessionApi.Device("Test", "Test", "Test"),
                        "unknown"))
                .credentials()
                .accessToken();
    }

    private String email(UserApi.UserId user) {
        return jdbc.queryForObject("select email::text from iam.users where id = ?", String.class, user.value());
    }

    private long activeSessions(UserApi.UserId user) {
        return jdbc.queryForObject(
                "select count(*) from iam.sessions where principal_id = ? and ended_at is null",
                Long.class,
                user.value());
    }

    private long activeTokens(UserApi.UserId owner) {
        return jdbc.queryForObject(
                "select count(*) from iam.api_tokens where owner_id = ? and revoked_at is null",
                Long.class,
                owner.value());
    }

    private long tokenGrants(UUID token) {
        return jdbc.queryForObject(
                "select count(*) from iam.permission_grants where principal_type = 'token' and principal_id = ?",
                Long.class,
                token);
    }

    private long userGrants(UserApi.UserId user) {
        return jdbc.queryForObject(
                "select count(*) from iam.permission_grants where principal_type = 'user' and principal_id = ?",
                Long.class,
                user.value());
    }

    private long rowCount(String table, String column, UUID id) {
        return jdbc.queryForObject("select count(*) from " + table + " where " + column + " = ?", Long.class, id);
    }

    private record Fixture(
            UserApi.UserId target,
            UUID tenant,
            UUID space,
            String targetCredential,
            String operatorCredential,
            String targetEmail) {}

    private record Issued(UUID id, String secret) {}
}
