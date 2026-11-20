package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@AutoConfigureMockMvc
@Testcontainers
class SecurityBaselineAcceptanceTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MockMvc mvc;

    @Test
    void anonymousManagementRequestReturnsTraceableProblem() throws Exception {
        mvc.perform(get("/api/v1/me").header("X-Request-Id", "acceptance-request"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("X-Request-Id", "acceptance-request"))
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                .andExpect(jsonPath("$.type").value("https://space.io/problems/authentication-required"))
                .andExpect(jsonPath("$.title").value("Authentication required"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("authentication_required"))
                .andExpect(jsonPath("$.detail").isString())
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void malformedJwtIsAnAuthenticationFailureRatherThanAServiceFailure() throws Exception {
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer eyJhbGciOiJub25lIn0.e30."))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void healthEndpointIsPublicAndReceivesGeneratedRequestId() throws Exception {
        var response = mvc.perform(get("/healthz"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Request-Id"))
                .andExpect(jsonPath("$.status").value("UP"))
                .andReturn()
                .getResponse();

        assertThat(response.getHeader("X-Request-Id")).isNotBlank();
    }

    @Test
    void publicAndProtectedPlanesHaveDifferentSecurityBoundaries() throws Exception {
        mvc.perform(get("/auth/not-yet-implemented")).andExpect(status().isNotFound());
        mvc.perform(get("/published/page")).andExpect(status().isNotFound());
        mvc.perform(get("/admin/tenants")).andExpect(status().isUnauthorized());
        mvc.perform(get("/ops/jobs")).andExpect(status().isUnauthorized());
        mvc.perform(get("/ops/domains/allowed").param("domain", "missing.acme.test"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/releases/example/report")).andExpect(status().isUnauthorized());
        mvc.perform(post("/published/page")).andExpect(status().isUnauthorized());
    }

    @Test
    void malformedIdempotencyKeyReturnsTraceableProblemBeforeDispatch() throws Exception {
        mvc.perform(post("/api/v1/not-yet-implemented")
                        .header("X-Request-Id", "idempotency-request")
                        .header("Idempotency-Key", " "))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("X-Request-Id", "idempotency-request"))
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void idempotencyKeyIsIgnoredForSafeMethods() throws Exception {
        mvc.perform(get("/auth/not-yet-implemented").header("Idempotency-Key", " "))
                .andExpect(status().isNotFound());
    }
}
