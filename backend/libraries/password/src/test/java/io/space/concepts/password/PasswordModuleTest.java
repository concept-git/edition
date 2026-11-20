package io.space.concepts.password;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.password.api.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@org.springframework.test.annotation.DirtiesContext(
        classMode = org.springframework.test.annotation.DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@SpringBootTest(classes = PasswordModuleTest.Assembly.class)
class PasswordModuleTest {
    @org.springframework.boot.SpringBootConfiguration
    @org.springframework.boot.autoconfigure.EnableAutoConfiguration(
            exclude = org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration.class)
    @org.springframework.context.annotation.Import(io.space.concepts.password.adapters.PasswordConfiguration.class)
    static class Assembly {}

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    static JdbcTemplate owner;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry properties) throws Exception {
        owner = new JdbcTemplate(
                new DriverManagerDataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()));
        owner.execute("create schema iam; create role space_app nologin; grant usage on schema iam to space_app");
        owner.execute(Files.readString(Path.of(
                System.getProperty("space.backend.root"),
                "apps/control/src/main/resources/db/migration/V9__password_credentials.sql")));
        owner.execute("create role password_test_runtime login password 'password-test' in role space_app");
        properties.add("spring.datasource.url", postgres::getJdbcUrl);
        properties.add("spring.datasource.username", () -> "password_test_runtime");
        properties.add("spring.datasource.password", () -> "password-test");
    }

    @Autowired
    PasswordApi passwords;

    @Autowired
    JdbcTemplate runtime;

    @Test
    void businessConnectionCannotWriteAnotherConcept() {
        assertThat(runtime.queryForObject("select current_user", String.class)).isEqualTo("password_test_runtime");
        assertThat(runtime.queryForObject(
                        "select rolbypassrls from pg_roles where rolname=current_user", Boolean.class))
                .isFalse();
        assertThatThrownBy(() -> runtime.update("create table iam.forbidden(value text)"))
                .isInstanceOf(org.springframework.dao.DataAccessException.class);
    }

    @Test
    void weakPasswordsLeaveNoCredentialState() {
        var user = account();
        assertThat(((PasswordApi.SetResult.TooWeak) passwords.set(user, "weak")).violations())
                .extracting(io.space.shared.ValidationViolation::code)
                .containsExactly("password_too_short", "password_digit_required");
        assertThat(passwords.isSet(user)).isFalse();
    }

    @Test
    void setThenAuthenticateUsesAHashAndFiveFailuresLockTheAccount() {
        var user = account();
        assertThat(passwords.set(user, "strong-password1")).isInstanceOf(PasswordApi.SetResult.Ok.class);
        assertThat(owner.queryForObject(
                        "select password_hash from iam.password_credentials where user_id=?",
                        String.class,
                        user.value()))
                .startsWith("$argon2id$")
                .doesNotContain("strong-password1");
        assertThat(passwords.authenticate(user, "strong-password1"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Authenticated.class);
        for (int i = 0; i < 4; i++)
            assertThat(passwords.authenticate(user, "wrong1"))
                    .isEqualTo(new PasswordApi.AuthenticateResult.Rejected(
                            PasswordApi.AuthenticateResult.Reason.BAD_PASSWORD));
        assertThat(passwords.authenticate(user, "wrong1"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Rejected(PasswordApi.AuthenticateResult.Reason.LOCKED));
        assertThat(passwords.authenticate(user, "strong-password1"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Rejected(PasswordApi.AuthenticateResult.Reason.LOCKED));
        owner.update(
                "update iam.password_credentials set locked_until=now()-interval '1 second' where user_id=?",
                user.value());
        assertThat(passwords.authenticate(user, "wrong1"))
                .isEqualTo(new PasswordApi.AuthenticateResult.Rejected(
                        PasswordApi.AuthenticateResult.Reason.BAD_PASSWORD));
        assertThat(passwords.authenticate(user, "strong-password1"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Authenticated.class);
        assertThat(owner.queryForObject(
                        "select failures from iam.password_credentials where user_id=?", Integer.class, user.value()))
                .isZero();
    }

    @Test
    void changingPasswordInvalidatesResetWithoutOwningSessionState() {
        var user = account();
        passwords.set(user, "strong-password1");
        var token = passwords.requestReset(user);
        assertThat(passwords.change(user, "wrong", "weak")).isInstanceOf(PasswordApi.ChangeResult.TooWeak.class);
        assertThat(owner.queryForObject(
                        "select failures from iam.password_credentials where user_id=?", Integer.class, user.value()))
                .isZero();
        assertThat(passwords.change(user, "strong-password1", "new-password2"))
                .isInstanceOf(PasswordApi.ChangeResult.Ok.class);
        assertThat(passwords.reset(token.token(), "third-password3"))
                .isInstanceOf(PasswordApi.ResetResult.TokenInvalid.class);
        assertThat(passwords.authenticate(user, "new-password2"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Authenticated.class);
    }

    @Test
    void resetChallengesReplaceExpireAndAreConsumedExactlyOnce() {
        var user = account();
        passwords.set(user, "strong-password1");
        var first = passwords.requestReset(user);
        var second = passwords.requestReset(user);
        assertThat(passwords.reset(first.token(), "new-password2"))
                .isInstanceOf(PasswordApi.ResetResult.TokenInvalid.class);
        assertThat(passwords.resetPending(user, second.token())).isTrue();
        assertThat(passwords.reset(second.token(), "weak")).isInstanceOf(PasswordApi.ResetResult.TooWeak.class);
        assertThat(passwords.resetPending(user, second.token())).isTrue();
        assertThat(passwords.reset(second.token(), "new-password2")).isInstanceOf(PasswordApi.ResetResult.Ok.class);
        assertThat(passwords.reset(second.token(), "third-password3"))
                .isInstanceOf(PasswordApi.ResetResult.TokenInvalid.class);
        var expired = passwords.requestReset(user);
        owner.update(
                "update iam.password_credentials set reset_expires_at=now()-interval '1 second' where user_id=?",
                user.value());
        assertThat(passwords.reset(expired.token(), "third-password3"))
                .isInstanceOf(PasswordApi.ResetResult.TokenInvalid.class);
    }

    @Autowired
    org.springframework.transaction.PlatformTransactionManager transactions;

    @Test
    void subsequentFailureRollsBackPasswordAndResetChallengeTogether() {
        var user = account();
        passwords.set(user, "strong-password1");
        var challenge = passwords.requestReset(user);
        var transaction = new org.springframework.transaction.support.TransactionTemplate(transactions);
        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> {
                    assertThat(passwords.reset(challenge.token(), "new-password2"))
                            .isInstanceOf(PasswordApi.ResetResult.Ok.class);
                    throw new IllegalStateException("later action failed");
                }))
                .isInstanceOf(IllegalStateException.class);
        assertThat(passwords.resetPending(user, challenge.token())).isTrue();
        assertThat(passwords.authenticate(user, "strong-password1"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Authenticated.class);
        assertThat(passwords.authenticate(user, "new-password2"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Rejected.class);
    }

    @Test
    void terminateRemovesAllCredentialStateAndIsIdempotent() {
        var user = account();
        passwords.set(user, "strong-password1");
        var challenge = passwords.requestReset(user);
        passwords.terminate(user);
        passwords.terminate(user);
        assertThat(passwords.isSet(user)).isFalse();
        assertThat(passwords.resetPending(user, challenge.token())).isFalse();
        assertThat(passwords.authenticate(user, "strong-password1"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Rejected.class);
    }

    @Test
    void credentialsDoNotWaitForASeparateAccountProjection() {
        var user = account();
        passwords.set(user, "strong-password1");
        assertThat(passwords.authenticate(user, "strong-password1"))
                .isInstanceOf(PasswordApi.AuthenticateResult.Authenticated.class);
    }

    private PasswordApi.AccountId account() {
        return new PasswordApi.AccountId(UUID.randomUUID());
    }
}
