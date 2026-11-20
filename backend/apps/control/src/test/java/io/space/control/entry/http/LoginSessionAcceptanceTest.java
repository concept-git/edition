package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.user.api.UserApi;
import jakarta.servlet.http.Cookie;
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

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class LoginSessionAcceptanceTest {
    private static final String ORIGIN = "http://localhost:8088";

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
    void localDevelopmentAcceptsNumericLoopbackOrigin() throws Exception {
        mvc.perform(post("/auth/register")
                        .header("Origin", "http://127.0.0.1:8088")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"loopback@login.test","name":"Loopback","password":"password1"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:8088"));
    }

    @Test
    void loginRefreshLogoutUseHttpOnlyCookieAndDatabaseBackedBearer() throws Exception {
        createVerified("alice@login.test", "password1");
        var loggedIn = mvc.perform(post("/auth/login")
                        .header("Origin", ORIGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@login.test\",\"password\":\"password1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(header().string(
                                "Set-Cookie",
                                org.hamcrest.Matchers.allOf(
                                        org.hamcrest.Matchers.containsString("HttpOnly"),
                                        org.hamcrest.Matchers.containsString("Secure"),
                                        org.hamcrest.Matchers.containsString("SameSite=Lax"),
                                        org.hamcrest.Matchers.containsString("Path=/auth"))))
                .andReturn()
                .getResponse();
        var jsonBody = loggedIn.getContentAsString();
        var access = jsonBody.replaceFirst(".*\"accessToken\":\"([^\"]+)\".*", "$1");
        var refresh = cookieValue(loggedIn.getHeader("Set-Cookie"));

        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@login.test"));
        mvc.perform(
                        patch("/api/v1/me")
                                .header("Authorization", "Bearer " + access)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"name\":\"Alice Updated\",\"locale\":\"en\",\"avatar\":\"https://example.test/a.png\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice Updated"))
                .andExpect(jsonPath("$.avatar").value("https://example.test/a.png"));
        mvc.perform(get("/api/v1/me/sessions").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions[0].current").value(true))
                .andExpect(jsonPath("$.sessions[0].device.browser").isNotEmpty());

        var refreshed = mvc.perform(post("/auth/refresh")
                        .header("Origin", "http://localhost:8088")
                        .cookie(new Cookie("refresh_token", refresh)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andReturn()
                .getResponse();
        var rotated = cookieValue(refreshed.getHeader("Set-Cookie"));
        assertThat(rotated).isNotEqualTo(refresh);

        mvc.perform(post("/auth/logout")
                        .header("Origin", "http://localhost:8088")
                        .cookie(new Cookie("refresh_token", rotated)))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void profilePutRequiresExplicitNullableFieldsAndKeepsLegacyPatchReplacement() throws Exception {
        createVerified("replacement@login.test", "password1");
        var loggedIn = mvc.perform(post("/auth/login")
                        .header("Origin", ORIGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"replacement@login.test\",\"password\":\"password1\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String access = loggedIn.replaceFirst(".*\"accessToken\":\"([^\"]+)\".*", "$1");
        mvc.perform(
                        put("/api/v1/me")
                                .header("Authorization", "Bearer " + access)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"name\":\"Explicit\",\"locale\":\"zh-CN\",\"avatar\":\"https://example.test/a.png\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.locale").value("zh-CN"));
        for (String incomplete : new String[] {
            "{\"name\":\"Lost\"}", "{\"name\":\"Lost\",\"locale\":null}", "{\"name\":\"Lost\",\"avatar\":null}"
        }) {
            mvc.perform(put("/api/v1/me")
                            .header("Authorization", "Bearer " + access)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(incomplete))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access))
                .andExpect(jsonPath("$.name").value("Explicit"))
                .andExpect(jsonPath("$.locale").value("zh-CN"));
        mvc.perform(put("/api/v1/me")
                        .header("Authorization", "Bearer " + access)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Cleared\",\"locale\":null,\"avatar\":null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Cleared"))
                .andExpect(jsonPath("$.locale").isEmpty())
                .andExpect(jsonPath("$.avatar").isEmpty());
        mvc.perform(patch("/api/v1/me")
                        .header("Authorization", "Bearer " + access)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Legacy\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Legacy"))
                .andExpect(jsonPath("$.locale").isEmpty());
    }

    @Test
    void allLoginRejectionsExposeTheSameInvalidCredentialsProblem() throws Exception {
        createVerified("bob@login.test", "password1");
        for (String payload : new String[] {
            "{\"email\":\"unknown@login.test\",\"password\":\"password1\"}",
            "{\"email\":\"bob@login.test\",\"password\":\"wrong\"}"
        }) {
            mvc.perform(post("/auth/login")
                            .header("Origin", ORIGIN)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("invalid_credentials"));
        }
    }

    @Test
    void loginFromAnotherSiteIsRejectedBeforeCredentialsAreChecked() throws Exception {
        createVerified("carol@login.test", "password1");
        var body = "{\"email\":\"carol@login.test\",\"password\":\"password1\"}";
        // 跨站登录会把受害者静默登进攻击者账号；凭据正确与否都不该发出 refresh cookie。
        // 带外站 Origin 时 CORS 过滤器先行拦下（纯文本 403），到不了控制器。
        mvc.perform(post("/auth/login")
                        .header("Origin", "https://evil.test")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Set-Cookie"));
        // 同源伪装（去掉 Origin）绕不开控制器自己的判定。
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("cross_site_request_rejected"))
                .andExpect(header().doesNotExist("Set-Cookie"));
    }

    @Test
    void loopbackClientsAreNotLabelledWithAFabricatedNetwork() throws Exception {
        createVerified("dave@login.test", "password1");
        var access = mvc.perform(post("/auth/login")
                        .header("Origin", ORIGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"dave@login.test\",\"password\":\"password1\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString()
                .replaceFirst(".*\"accessToken\":\"([^\"]+)\".*", "$1");
        mvc.perform(get("/api/v1/me/sessions").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions[0].ipApproximate").value("loopback"));
    }

    @Test
    void refreshRejectsMissingOriginAndClearsInvalidCookie() throws Exception {
        mvc.perform(post("/auth/refresh").cookie(new Cookie("refresh_token", "invalid")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("cross_site_request_rejected"));
        mvc.perform(post("/auth/refresh")
                        .header("Origin", "http://localhost:8088")
                        .cookie(new Cookie("refresh_token", "invalid")))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));
    }

    @Test
    void rateLimitingHappensBeforePasswordFailureAccounting() throws Exception {
        createVerified("limited@login.test", "password1");
        for (int attempt = 0; attempt < 10; attempt++) {
            mvc.perform(post("/auth/login")
                            .header("Origin", ORIGIN)
                            .header("X-Forwarded-For", "198.51.100.23")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"missing" + attempt + "@login.test\",\"password\":\"wrong\"}"))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/auth/login")
                        .header("Origin", ORIGIN)
                        .header("X-Forwarded-For", "198.51.100.23")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"limited@login.test\",\"password\":\"wrong\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.code").value("rate_limited"));
        assertThat(jdbc.queryForObject("""
                select p.failures from iam.password_credentials p join iam.users u on u.id=p.user_id
                 where u.email='limited@login.test'
                """, Integer.class)).isZero();
    }

    private void createVerified(String email, String password) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Login User");
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        passwords.set(new PasswordApi.AccountId(registered.user().value()), password);
    }

    private String cookieValue(String setCookie) {
        return setCookie.substring("refresh_token=".length(), setCookie.indexOf(';'));
    }
}
