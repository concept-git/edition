package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({"test", "dev"})
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ServiceHealthAcceptanceTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MockMvc mvc;

    @Autowired
    JsonMapper json;

    @Autowired
    JdbcTemplate runtime;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate fixtures;

    @Test
    void operatorSeesGlobalCountsWithoutTenantContextAndTenantRowsRemainProtected() throws Exception {
        UUID first = fixtures.queryForObject(
                "insert into shared.tenants(name) values ('Health A') returning id", UUID.class);
        UUID second = fixtures.queryForObject(
                "insert into shared.tenants(name) values ('Health B') returning id", UUID.class);
        publication(first, "queued", false);
        publication(second, "retrying", false);
        publication(first, "failed", false);
        publication(second, "failed", true);
        publication(first, "running", false);
        publication(second, "completed", false);
        fixtures.queryForObject(
                "select shared.record_service_heartbeat('space-worker', 'index-test', 'test', '{}'::jsonb)",
                Object.class);

        mvc.perform(get("/admin/health").header("Authorization", "Bearer " + login("operator")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.services[?(@.service == 'space-index')].status")
                        .value(org.hamcrest.Matchers.contains("normal")))
                .andExpect(jsonPath("$.services[?(@.service == 'space-index')].details.publicationBacklog")
                        .value(org.hamcrest.Matchers.contains(2)))
                .andExpect(jsonPath("$.services[?(@.service == 'space-index')].details.recentFailures")
                        .value(org.hamcrest.Matchers.contains(1)));

        mvc.perform(get("/admin/health").header("Authorization", "Bearer " + login("owner")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("platform_operator_required"));
        assertThatThrownBy(() -> runtime.queryForObject("select count(*) from serving.search_jobs", Long.class))
                .isInstanceOf(DataAccessException.class);
    }

    private String login(String account) throws Exception {
        var response = mvc.perform(post("/auth/login")
                        .header("Origin", "http://localhost:8088")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + account + "@dev.local\",\"password\":\"password1\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();
        return json.readTree(response.getContentAsString()).get("accessToken").asString();
    }

    private void publication(UUID tenant, String state, boolean old) {
        fixtures.update("""
                insert into serving.search_jobs(site_id,tenant_id,epoch,status,updated_at)
                values (?,?,1,?,now() - (? * interval '1 hour'))
                """, UUID.randomUUID(), tenant, state, old ? 25 : 0);
    }
}
