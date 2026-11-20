package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class UserErasureAcceptanceTest {
    private static final String ORIGIN = "http://localhost:8088";
    private static final String PASSWORD = "password1";

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
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void selfEraseRequiresServerConfirmationImmediatelySignsOutAndReleasesEmail() throws Exception {
        String email = "self-erase@http.test";
        UserApi.UserId original = createVerified(email, false);
        String access = login(email);

        mvc.perform(post("/api/v1/me:erase")
                        .header("Authorization", "Bearer " + access)
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"confirmationEmail":"self-erase@http.test","currentPassword":"wrong"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("erase_confirmation_invalid"));
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk());

        mvc.perform(post("/api/v1/me:erase")
                        .header("Authorization", "Bearer " + access)
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"confirmationEmail":"self-erase@http.test","currentPassword":"password1"}
                                """))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));

        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/auth/login")
                        .header("Origin", ORIGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"self-erase@http.test","password":"password1"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("invalid_credentials"));

        UserApi.RegisterResult.Registered replacement =
                (UserApi.RegisterResult.Registered) users.register(email, "Replacement");
        assertThat(replacement.user()).isNotEqualTo(original);
        assertThat(users.accountProfile(original).orElseThrow().name()).isEqualTo("已注销用户");
    }

    @Test
    void platformSearchAndLifecycleAreClosedToTenantUsersAndRequireIdempotency() throws Exception {
        String operatorEmail = "operator-user-admin@http.test";
        createVerified(operatorEmail, true);
        String operator = login(operatorEmail);
        String targetEmail = "target-user-admin@http.test";
        UserApi.UserId target = createVerified(targetEmail, false);
        String targetAccess = login(targetEmail);

        mvc.perform(get("/admin/users").param("q", "target-user").header("Authorization", "Bearer " + targetAccess))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("platform_operator_required"));
        mvc.perform(get("/admin/users").param("q", "target-user").header("Authorization", "Bearer " + operator))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users[0].id").value(target.value().toString()))
                .andExpect(jsonPath("$.users[0].status").value("active"));
        mvc.perform(get("/admin/users").param("q", "  ta  ").header("Authorization", "Bearer " + operator))
                .andExpect(status().isUnprocessableContent());

        mvc.perform(post("/admin/users/" + target.value() + ":deactivate")
                        .header("Authorization", "Bearer " + operator)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(confirm(targetEmail)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"));
        mvc.perform(post("/admin/users/" + target.value() + ":deactivate")
                        .header("Authorization", "Bearer " + operator)
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(confirm(targetEmail)))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + targetAccess))
                .andExpect(status().isUnauthorized());

        mvc.perform(post("/admin/users/" + target.value() + ":erase")
                        .header("Authorization", "Bearer " + operator)
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(confirm(targetEmail)))
                .andExpect(status().isNoContent());
        mvc.perform(get("/admin/users/" + target.value()).header("Authorization", "Bearer " + operator))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.name").value("已注销用户"))
                .andExpect(jsonPath("$.status").value("erased"));
    }

    @Test
    void platformEraseOfAnActiveUserReturnsTheStableConflict() throws Exception {
        String operatorEmail = "operator-active-reject@http.test";
        createVerified(operatorEmail, true);
        String operator = login(operatorEmail);
        String targetEmail = "active-reject@http.test";
        UserApi.UserId target = createVerified(targetEmail, false);

        mvc.perform(post("/admin/users/" + target.value() + ":erase")
                        .header("Authorization", "Bearer " + operator)
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(confirm(targetEmail)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("user_must_be_deactivated"));
        assertThat(users.accountProfile(target).orElseThrow().status()).isEqualTo(UserApi.Status.ACTIVE);
    }

    private UserApi.UserId createVerified(String email, boolean operator) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "HTTP User");
        passwords.set(new PasswordApi.AccountId(registered.user().value()), PASSWORD);
        jdbc.update(
                "update iam.users set verified=true, platform_operator=? where id=?",
                operator,
                registered.user().value());
        return registered.user();
    }

    private String login(String email) throws Exception {
        return mvc.perform(post("/auth/login")
                        .header("Origin", ORIGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString()
                .replaceFirst(".*\"accessToken\":\"([^\"]+)\".*", "$1");
    }

    private static String confirm(String targetEmail) {
        return "{\"confirmationEmail\":\"" + targetEmail + "\",\"currentPassword\":\"" + PASSWORD + "\"}";
    }
}
