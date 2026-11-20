package io.space.control.integration;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.password.api.PasswordApi.AccountId;
import io.space.concepts.password.api.PasswordApi.SetResult;
import io.space.concepts.password.api.PasswordEvents;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@org.springframework.context.annotation.Import(io.space.control.support.FixtureDatabaseConfiguration.class)
@org.springframework.boot.test.context.SpringBootTest
@org.springframework.test.context.event.RecordApplicationEvents
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class PasswordTransactionTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    PasswordApi passwords;

    @Autowired
    org.springframework.test.context.event.ApplicationEvents events;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @Qualifier(io.space.control.support.FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate credentials;

    // OP: after set (u, p) : (ok) —— hash 已更新且绝非明文（authenticate 的兑现随票 04）
    @Test
    void settingAStrongPasswordStoresAnArgon2HashAndPublishesTheEvent() {
        var account = new AccountId(insertUser("erin@password-module.test"));

        var result = passwords.set(account, "correct horse 1");

        assertThat(result).isEqualTo(new SetResult.Ok(account));
        var hash = credentials.queryForObject(
                "select password_hash from iam.password_credentials where user_id = ?", String.class, account.value());
        assertThat(hash).startsWith("$argon2id$").doesNotContain("correct horse 1");
        assertThat(events.stream(PasswordEvents.PasswordSet.class)).hasSize(1);
    }

    // error case: set : (error) —— 强度不达标，无状态变更
    @Test
    void aWeakPasswordIsRejectedWithoutStateChange() {
        var account = new AccountId(insertUser("frank@password-module.test"));

        var result = passwords.set(account, "short1");

        assertThat(result).isInstanceOf(SetResult.TooWeak.class);
        var count = credentials.queryForObject(
                "select count(*) from iam.password_credentials where user_id = ? and password_hash is not null",
                Long.class,
                account.value());
        assertThat(count).isZero();
        assertThat(events.stream(PasswordEvents.PasswordSet.class)).isEmpty();
    }

    @Test
    void fiveConsecutiveFailuresLockAuthenticationAndSuccessClearsFailures() {
        var account = new AccountId(insertUser("lock@password-module.test"));
        passwords.set(account, "correct horse 1");

        for (int attempt = 0; attempt < 5; attempt++) {
            assertThat(passwords.authenticate(account, "wrong password"))
                    .isInstanceOf(PasswordApi.AuthenticateResult.Rejected.class);
        }
        assertThat(passwords.authenticate(account, "correct horse 1"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Rejected(PasswordApi.AuthenticateResult.Reason.LOCKED));

        credentials.update(
                "update iam.password_credentials set locked_until = now() - interval '1 second' where user_id = ?",
                account.value());
        assertThat(passwords.authenticate(account, "correct horse 1"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Authenticated(account));
        assertThat(credentials.queryForObject(
                        "select failures from iam.password_credentials where user_id = ?",
                        Integer.class,
                        account.value()))
                .isZero();
    }

    // 锁定期满即重新计数：否则 failures 停在阈值上，此后每一次错密都立刻重新上锁（永久一击即锁）
    @Test
    void anElapsedLockRestartsTheFailureCountInsteadOfRelockingOnTheNextMiss() {
        var account = new AccountId(insertUser("relock@password-module.test"));
        passwords.set(account, "correct horse 1");
        for (int attempt = 0; attempt < 5; attempt++) {
            passwords.authenticate(account, "wrong password");
        }
        credentials.update(
                "update iam.password_credentials set locked_until = now() - interval '1 second' where user_id = ?",
                account.value());

        assertThat(passwords.authenticate(account, "wrong password"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Rejected(
                        PasswordApi.AuthenticateResult.Reason.BAD_PASSWORD));
        assertThat(passwords.authenticate(account, "correct horse 1"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Authenticated(account));
    }

    @Test
    void weakNewPasswordIsRejectedBeforeCheckingOldPasswordOrChangingFailures() {
        var account = new AccountId(insertUser("weak-change@password-module.test"));
        passwords.set(account, "correct horse 1");

        var result = passwords.change(account, "wrong password", "weak");

        assertThat(result).isInstanceOf(PasswordApi.ChangeResult.TooWeak.class);
        assertThat(credentials.queryForObject(
                        "select failures from iam.password_credentials where user_id = ?",
                        Integer.class,
                        account.value()))
                .isZero();
    }

    @Test
    void changeVerifiesOldPasswordAndAppliesBruteForceLocking() {
        var account = new AccountId(insertUser("change@password-module.test"));
        passwords.set(account, "correct horse 1");

        assertThat(passwords.change(account, "wrong password", "better password 2"))
                .isInstanceOf(PasswordApi.ChangeResult.BadPassword.class);
        for (int attempt = 1; attempt < 5; attempt++) {
            passwords.change(account, "wrong password", "better password 2");
        }
        assertThat(passwords.change(account, "correct horse 1", "better password 2"))
                .isInstanceOf(PasswordApi.ChangeResult.Locked.class);
    }

    @Test
    void changeStoresTheNewPasswordAndPublishesASecretFreeEvent() {
        var account = new AccountId(insertUser("change-ok@password-module.test"));
        passwords.set(account, "correct horse 1");

        assertThat(passwords.change(account, "correct horse 1", "better password 2"))
                .isEqualTo(new PasswordApi.ChangeResult.Ok(account));
        assertThat(passwords.authenticate(account, "better password 2"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Authenticated(account));
        assertThat(events.stream(PasswordEvents.PasswordChanged.class)).hasSize(1);
    }

    @Test
    void resetRequestsReplaceOldTokensAndTokensAreSingleUse() {
        var account = new AccountId(insertUser("reset@password-module.test"));
        passwords.set(account, "correct horse 1");

        var first = passwords.requestReset(account);
        var second = passwords.requestReset(account);

        assertThat(first.token()).isNotEqualTo(second.token());
        assertThat(first.expiresAt()).isAfter(java.time.Instant.now());
        assertThat(credentials.queryForObject(
                        "select reset_token_hash from iam.password_credentials where user_id=?",
                        String.class,
                        account.value()))
                .isNotEqualTo(second.token());
        assertThat(passwords.reset(first.token(), "better password 2"))
                .isInstanceOf(PasswordApi.ResetResult.TokenInvalid.class);
        assertThat(passwords.reset(second.token(), "better password 2"))
                .isEqualTo(new PasswordApi.ResetResult.Ok(account));
        assertThat(passwords.reset(second.token(), "another password 3"))
                .isInstanceOf(PasswordApi.ResetResult.TokenInvalid.class);
        assertThat(events.stream(PasswordEvents.PasswordReset.class)).hasSize(1);
    }

    @Test
    void resetRejectsExpiredTokensAndSuccessfulResetClearsLock() {
        var account = new AccountId(insertUser("reset-lock@password-module.test"));
        passwords.set(account, "correct horse 1");
        for (int attempt = 0; attempt < 5; attempt++) {
            passwords.authenticate(account, "wrong password");
        }
        var request = passwords.requestReset(account);
        credentials.update(
                "update iam.password_credentials set reset_expires_at = now() - interval '1 second' where user_id = ?",
                account.value());
        assertThat(passwords.reset(request.token(), "better password 2"))
                .isInstanceOf(PasswordApi.ResetResult.TokenInvalid.class);

        var replacement = passwords.requestReset(account);
        assertThat(passwords.reset(replacement.token(), "better password 2"))
                .isEqualTo(new PasswordApi.ResetResult.Ok(account));
        assertThat(passwords.authenticate(account, "better password 2"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Authenticated(account));
    }

    // 未知邮箱走的假验证必须真正跑满 KDF，否则耗时差会重新成为账号存在性 oracle
    @Test
    void fakeAuthenticationRunsTheRealKeyDerivation() {
        var account = new AccountId(insertUser("timing@password-module.test"));
        passwords.set(account, "correct horse 1");

        var realStart = System.nanoTime();
        passwords.authenticate(account, "wrong password");
        var realCost = System.nanoTime() - realStart;

        var fakeStart = System.nanoTime();
        passwords.fakeAuthenticate("wrong password");
        var fakeCost = System.nanoTime() - fakeStart;

        assertThat(fakeCost).isGreaterThan(realCost / 4);
    }

    // Password[User] 的类型参数是不透明 id；模块测试不建 User，直接铺行以避免跨模块依赖。
    private UUID insertUser(String email) {
        var user = jdbc.queryForObject(
                "insert into iam.users (email, name) values (?, ?) returning id", UUID.class, email, email);
        return user;
    }
}
