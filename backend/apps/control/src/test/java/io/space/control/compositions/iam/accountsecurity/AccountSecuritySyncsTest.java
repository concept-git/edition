package io.space.control.compositions.iam.accountsecurity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.iam.PasswordTooWeakException;
import io.space.control.support.FixtureDatabaseConfiguration;
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
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AccountSecuritySyncsTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    ChangePasswordUseCase changePasswordUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ForgotUseCase forgotUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResetByTokenUseCase resetByTokenUseCase;

    @Autowired
    UserApi users;

    @Autowired
    PasswordApi passwords;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void forgotIsUniformForUnknownAndInactiveUsersAndOnlyActiveUsersReceiveTokens() {
        forgotUseCase.forgot("unknown@security-sync.test");
        var inactive = createUser("inactive@security-sync.test");
        jdbc.update("update iam.users set status='deactivated' where id=?", inactive.value());
        forgotUseCase.forgot("inactive@security-sync.test");
        assertThat(jdbc.queryForObject(
                        "select reset_token_hash from iam.password_credentials where user_id=?",
                        String.class,
                        inactive.value()))
                .isNull();

        var halfRegistered =
                (UserApi.RegisterResult.Registered) users.register("half@security-sync.test", "Half Registered");
        forgotUseCase.forgot("half@security-sync.test");
        assertThat(passwords.isSet(
                        new PasswordApi.AccountId(halfRegistered.user().value())))
                .isFalse();

        var active = createUser("active@security-sync.test");
        forgotUseCase.forgot("active@security-sync.test");
        assertThat(jdbc.queryForObject(
                        "select reset_token_hash from iam.password_credentials where user_id=?",
                        String.class,
                        active.value()))
                .isNotBlank();
    }

    @Test
    void successfulChangeEndsAllSessionsWhileRejectedChangeKeepsThem() {
        var user = createUser("change@security-sync.test");
        sessions.start(new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");

        assertThatThrownBy(() -> changePasswordUseCase.changePassword(user.value(), "wrong", "better password 2"))
                .isInstanceOf(InvalidOldPasswordException.class);
        assertThat(activeSessions(user)).isOne();

        changePasswordUseCase.changePassword(user.value(), "password1", "better password 2");
        assertThat(activeSessions(user)).isZero();
    }

    @Test
    void successfulResetEndsAllSessionsAndInvalidResetKeepsThem() {
        var user = createUser("reset@security-sync.test");
        sessions.start(new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");

        assertThatThrownBy(() -> resetByTokenUseCase.resetByToken("forged", "better password 2"))
                .isInstanceOf(ResetTokenInvalidException.class);
        assertThat(activeSessions(user)).isOne();

        var token =
                passwords.requestReset(new PasswordApi.AccountId(user.value())).token();
        resetByTokenUseCase.resetByToken(token, "better password 2");
        assertThat(activeSessions(user)).isZero();
    }

    @Test
    void changeFailureSyncKeepsSessionsForWeakBadAndLockedPasswords() {
        var user = createUser("change-failures@security-sync.test");
        sessions.start(new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");

        assertThatThrownBy(() -> changePasswordUseCase.changePassword(user.value(), "password1", "weak"))
                .isInstanceOf(PasswordTooWeakException.class);
        for (int attempt = 0; attempt < 4; attempt++) {
            assertThatThrownBy(() -> changePasswordUseCase.changePassword(user.value(), "wrong", "better password 2"))
                    .isInstanceOf(InvalidOldPasswordException.class);
        }
        assertThatThrownBy(() -> changePasswordUseCase.changePassword(user.value(), "wrong", "better password 2"))
                .isInstanceOf(PasswordLockedException.class);
        assertThat(activeSessions(user)).isOne();
    }

    @Test
    void resetInvalidSyncKeepsSessionsWhenTheNewPasswordIsWeak() {
        var user = createUser("reset-weak@security-sync.test");
        sessions.start(new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");
        var token =
                passwords.requestReset(new PasswordApi.AccountId(user.value())).token();

        assertThatThrownBy(() -> resetByTokenUseCase.resetByToken(token, "weak"))
                .isInstanceOf(PasswordTooWeakException.class);
        assertThat(activeSessions(user)).isOne();
    }

    @Test
    void sessionFailureRollsBackCredentialsAndKeepsTheOriginalSessions() {
        var changeUser = createUser("change-rollback@security-sync.test");
        sessions.start(
                new SessionApi.HolderId(changeUser.value()),
                new SessionApi.Device("Change", "Test", "Test"),
                "unknown");
        rejectSessionEnd();
        try {
            assertThatThrownBy(() ->
                            changePasswordUseCase.changePassword(changeUser.value(), "password1", "better password 2"))
                    .isInstanceOf(RuntimeException.class);
        } finally {
            allowSessionEnd();
        }
        assertThat(passwords.authenticate(new PasswordApi.AccountId(changeUser.value()), "password1"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Authenticated(
                        new PasswordApi.AccountId(changeUser.value())));
        assertThat(activeSessions(changeUser)).isOne();
        assertThat(passwords.authenticate(new PasswordApi.AccountId(changeUser.value()), "better password 2"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Rejected.class);
        assertSessionsUsable(changeUser);

        var resetUser = createUser("reset-rollback@security-sync.test");
        sessions.start(
                new SessionApi.HolderId(resetUser.value()), new SessionApi.Device("Reset", "Test", "Test"), "unknown");
        var token = passwords
                .requestReset(new PasswordApi.AccountId(resetUser.value()))
                .token();
        rejectSessionEnd();
        try {
            assertThatThrownBy(() -> resetByTokenUseCase.resetByToken(token, "better password 2"))
                    .isInstanceOf(RuntimeException.class);
        } finally {
            allowSessionEnd();
        }
        assertThat(passwords.resetPending(new PasswordApi.AccountId(resetUser.value()), token))
                .isTrue();
        assertThat(passwords.authenticate(new PasswordApi.AccountId(resetUser.value()), "password1"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Authenticated.class);
        assertSessionsUsable(resetUser);
        assertThat(activeSessions(resetUser)).isOne();
    }

    private void assertSessionsUsable(UserApi.UserId user) {
        var ids = jdbc.queryForList(
                "select id from iam.sessions where principal_id=?", java.util.UUID.class, user.value());
        for (var id : ids) {
            var session = new SessionApi.SessionId(id);
            assertThat(sessions.principal(session)).contains(new SessionApi.HolderId(user.value()));
            assertThat(sessions.snapshots(java.util.Set.of(session))
                            .get(session)
                            .active())
                    .isTrue();
        }
    }

    @Autowired
    org.springframework.transaction.PlatformTransactionManager transactionManager;

    @Autowired
    @Qualifier("jdbcTemplate")
    JdbcTemplate runtime;

    @Test
    void concurrentChangeAndResetLockTheAccountBeforeCredentialsAndRecheckTheChallenge() throws Exception {
        var user = createUser("concurrent-credentials@security-sync.test");
        var account = new PasswordApi.AccountId(user.value());
        var token = passwords.requestReset(account).token();
        long issued = users.readerEpoch(user);
        sessions.start(new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");
        var locked = new java.util.concurrent.CountDownLatch(1);
        var release = new java.util.concurrent.CountDownLatch(1);
        var changingPid = new java.util.concurrent.atomic.AtomicInteger();
        try (var executor = java.util.concurrent.Executors.newFixedThreadPool(2)) {
            var change = executor.submit(() -> new org.springframework.transaction.support.TransactionTemplate(
                            transactionManager)
                    .executeWithoutResult(status -> {
                        users.lockAccountProfile(user);
                        changingPid.set(runtime.queryForObject("select pg_backend_pid()", Integer.class));
                        locked.countDown();
                        try {
                            if (!release.await(10, java.util.concurrent.TimeUnit.SECONDS))
                                throw new IllegalStateException("test did not release account lock");
                        } catch (InterruptedException interrupted) {
                            Thread.currentThread().interrupt();
                            throw new IllegalStateException(interrupted);
                        }
                        changePasswordUseCase.changePassword(user.value(), "password1", "changed password 2");
                    }));
            assertThat(locked.await(5, java.util.concurrent.TimeUnit.SECONDS)).isTrue();
            var reset = executor.submit(
                    () -> assertThatThrownBy(() -> resetByTokenUseCase.resetByToken(token, "reset password 3"))
                            .isInstanceOf(ResetTokenInvalidException.class));
            try {
                org.awaitility.Awaitility.await()
                        .atMost(java.time.Duration.ofSeconds(5))
                        .untilAsserted(() -> assertThat(jdbc.queryForObject(
                                        "select exists(select 1 from pg_stat_activity where ?=any(pg_blocking_pids(pid)))",
                                        Boolean.class,
                                        changingPid.get()))
                                .isTrue());
            } finally {
                release.countDown();
            }
            change.get(10, java.util.concurrent.TimeUnit.SECONDS);
            reset.get(10, java.util.concurrent.TimeUnit.SECONDS);
        }
        assertThat(passwords.authenticate(account, "changed password 2"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Authenticated.class);
        assertThat(users.readerEpoch(user)).isEqualTo(issued + 1);
        assertThat(activeSessions(user)).isZero();
    }

    private void rejectSessionEnd() {
        jdbc.execute("""
                create or replace function iam.reject_session_end() returns trigger language plpgsql as $$
                begin
                  if new.ended_at is distinct from old.ended_at then
                    raise exception 'injected session failure';
                  end if;
                  return new;
                end
                $$;
                """);
        jdbc.execute("""
                create trigger reject_session_end before update on iam.sessions
                for each row execute function iam.reject_session_end()
                """);
    }

    private void allowSessionEnd() {
        jdbc.execute("drop trigger if exists reject_session_end on iam.sessions");
        jdbc.execute("drop function if exists iam.reject_session_end()");
    }

    private UserApi.UserId createUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Security User");
        passwords.set(new PasswordApi.AccountId(registered.user().value()), "password1");
        return registered.user();
    }

    private Long activeSessions(UserApi.UserId user) {
        return jdbc.queryForObject(
                "select count(*) from iam.sessions where principal_id=? and ended_at is null",
                Long.class,
                user.value());
    }
}
