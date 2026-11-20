package io.space.control.entry.http;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.user.api.UserApi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = {"io.space.auth.forgot-ip-capacity=2", "io.space.auth.forgot-email-capacity=2"})
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PasswordSecurityAcceptanceTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MockMvc mvc;

    @Autowired
    UserApi users;

    @Autowired
    PasswordApi passwords;

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void changeUsesBearerReturnsActionableErrorsAndClearsRefreshCookieOnSuccess() throws Exception {
        var access = createVerifiedAndLogin("change@password-http.test");
        var endpoint = post("/api/v1/me/password:change")
                .header("Authorization", "Bearer " + access)
                .contentType(MediaType.APPLICATION_JSON);

        mvc.perform(endpoint.content("{\"oldPassword\":\"wrong\",\"newPassword\":\"better password 2\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_old_password"))
                .andExpect(header().doesNotExist("Set-Cookie"));
        mvc.perform(endpoint.content("{\"oldPassword\":\"password1\",\"newPassword\":\"weak\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("password_too_weak"))
                .andExpect(jsonPath("$.violations[0].field").value("newPassword"))
                .andExpect(jsonPath("$.violations[0].code").value("password_too_short"));
        mvc.perform(endpoint.content("{\"oldPassword\":\"password1\",\"newPassword\":\"better password 2\"}"))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));
    }

    @Test
    void fifthWrongOldPasswordReturnsLockedWithRetryAfterWithoutEndingTheSession() throws Exception {
        var access = createVerifiedAndLogin("locked@password-http.test");
        for (int attempt = 0; attempt < 4; attempt++) {
            mvc.perform(post("/api/v1/me/password:change")
                            .header("Authorization", "Bearer " + access)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"oldPassword\":\"wrong\",\"newPassword\":\"better password 2\"}"))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/v1/me/password:change")
                        .header("Authorization", "Bearer " + access)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\":\"wrong\",\"newPassword\":\"better password 2\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.code").value("password_locked"));
        mvc.perform(post("/api/v1/me/password:change")
                        .header("Authorization", "Bearer " + access)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\":\"password1\",\"newPassword\":\"better password 2\"}"))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void forgotIsUniformValidatedAndRateLimitedBeforeUserLookup() throws Exception {
        mvc.perform(post("/auth/password:forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"unknown@password-http.test\"}"))
                .andExpect(status().isAccepted());
        mvc.perform(post("/auth/password:forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"other@password-http.test\"}"))
                .andExpect(status().isAccepted());
        mvc.perform(post("/auth/password:forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"third@password-http.test\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
        mvc.perform(post("/auth/password:forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"invalid\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("validation_failed"));
    }

    @Test
    void resetMapsInvalidAndWeakTokensAndClearsCookieOnSuccess() throws Exception {
        var user = createVerified("reset@password-http.test");
        var token =
                passwords.requestReset(new PasswordApi.AccountId(user.value())).token();
        mvc.perform(post("/auth/password:reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"forged\",\"newPassword\":\"better password 2\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("reset_token_invalid"));
        mvc.perform(post("/auth/password:reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\",\"newPassword\":\"weak\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("password_too_weak"));
        mvc.perform(post("/auth/password:reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\",\"newPassword\":\"better password 2\"}"))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));
    }

    private String createVerifiedAndLogin(String email) throws Exception {
        createVerified(email);
        return mvc.perform(post("/auth/login")
                        .header("Origin", "http://localhost:8088")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"password1\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString()
                .replaceFirst(".*\"accessToken\":\"([^\"]+)\".*", "$1");
    }

    private UserApi.UserId createVerified(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Password User");
        jdbc.update(
                "update iam.users set verified=true where id=?",
                registered.user().value());
        passwords.set(new PasswordApi.AccountId(registered.user().value()), "password1");
        return registered.user();
    }
}
