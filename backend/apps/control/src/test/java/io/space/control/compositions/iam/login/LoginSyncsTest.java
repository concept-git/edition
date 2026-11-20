package io.space.control.compositions.iam.login;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.user.api.UserApi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
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
class LoginSyncsTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    LoginUseCase loginUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RefreshUseCase refreshUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    LogoutUseCase logoutUseCase;

    @Autowired
    UserApi users;

    @Autowired
    PasswordApi passwords;

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void loginAndLoginSucceededStartADeviceSession() {
        createUser("success@login-sync.test", true);
        var result = loginUseCase.login("SUCCESS@login-sync.test", "password1", device(), "192.0.2.0/24");
        assertThat(result.accessToken()).isNotBlank();
        assertThat(result.refreshToken()).isNotBlank();
    }

    @Test
    void loginUnknownEmailUsesTheUniformRejection() {
        assertThatThrownBy(() -> loginUseCase.login("unknown@login-sync.test", "password1", device(), "unknown"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void loginFailedUsesTheUniformRejection() {
        createUser("bad@login-sync.test", true);
        assertThatThrownBy(() -> loginUseCase.login("bad@login-sync.test", "wrong", device(), "unknown"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void loginIneligibleUsesTheUniformRejection() {
        createUser("unverified@login-sync.test", false);
        assertThatThrownBy(() -> loginUseCase.login("unverified@login-sync.test", "password1", device(), "unknown"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void refreshRotatesTheCredential() {
        createUser("refresh@login-sync.test", true);
        var first = loginUseCase.login("refresh@login-sync.test", "password1", device(), "unknown");
        var renewed = refreshUseCase.refresh(first.refreshToken());
        assertThat(renewed.refreshToken()).isNotEqualTo(first.refreshToken());
    }

    @Test
    void refreshExpiredRejectsUnknownCredentials() {
        assertThatThrownBy(() -> refreshUseCase.refresh("not-a-refresh-token"))
                .isInstanceOf(InvalidRefreshException.class);
    }

    @Test
    void logoutIsIdempotentAndRevokesRefresh() {
        createUser("logout@login-sync.test", true);
        var credentials = loginUseCase.login("logout@login-sync.test", "password1", device(), "unknown");
        logoutUseCase.logout(credentials.refreshToken());
        logoutUseCase.logout(credentials.refreshToken());
        assertThatThrownBy(() -> refreshUseCase.refresh(credentials.refreshToken()))
                .isInstanceOf(InvalidRefreshException.class);
    }

    private void createUser(String email, boolean verified) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Sync User");
        if (verified)
            jdbc.update(
                    "update iam.users set verified = true where id = ?",
                    registered.user().value());
        passwords.set(new PasswordApi.AccountId(registered.user().value()), "password1");
    }

    private LoginTypes.Device device() {
        return new LoginTypes.Device("Test", "Browser", "OS");
    }
}
