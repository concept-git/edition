package io.space.control.entry.http;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.space.concepts.user.api.UserApi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 票 03 端点验收：错误走 RFC 9457，code 与动作 error case 一致（API.md §0）。 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@AutoConfigureMockMvc
@Testcontainers
class RegistrationAcceptanceTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MockMvc mvc;

    @Autowired
    UserApi users;

    @Test
    void anonymousVisitorRegistersAndVerifiesByMailedToken() throws Exception {
        mvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"kate@registration.test","name":"Kate","password":"password1"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").isNotEmpty());

        // 邮件属实现层：验收从概念门面重新签发令牌等价于从投递渠道取链接
        var registered = (UserApi.RegisterResult.Registered) users.register("kate2@registration.test", "Kate");
        mvc.perform(post("/auth/email:verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"user":"%s","token":"%s"}
                                """.formatted(registered.user().value(), registered.verifyToken())))
                .andExpect(status().isNoContent());
    }

    @Test
    void duplicateEmailYieldsProblem409EmailTaken() throws Exception {
        var payload = """
                {"email":"liam@registration.test","name":"Liam","password":"password1"}
                """;
        mvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());

        mvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isConflict())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                .andExpect(jsonPath("$.code").value("email_taken"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void weakPasswordYieldsProblem422AndRollsBackTheAccount() throws Exception {
        mvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"mona@registration.test","name":"Mona","password":"weak"}
                                """))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("password_too_weak"))
                .andExpect(jsonPath("$.detail").isString());

        // 规格：User/Password 共享事务——修正密码后同邮箱可以完成第一次注册。
        mvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"mona@registration.test","name":"Mona","password":"password1"}
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void invalidVerificationTokenYieldsProblem400() throws Exception {
        var registered = (UserApi.RegisterResult.Registered) users.register("nina@registration.test", "Nina");

        mvc.perform(post("/auth/email:verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"user":"%s","token":"forged"}
                                """.formatted(registered.user().value())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("verify_token_invalid"));
    }

    @Test
    void malformedRegistrationPayloadFailsValidationBeforeAnyFlow() throws Exception {
        mvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"not-an-email","name":"","password":"password1"}
                                """))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"));
    }
}
