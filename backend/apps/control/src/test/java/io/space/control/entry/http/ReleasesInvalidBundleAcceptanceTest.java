package io.space.control.entry.http;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.releases.release.WorkspaceSnapshots;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 票 19：非法 Bundle 整单回滚（收集器自签，HTTP 需夹具）。 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ReleasesInvalidBundleAcceptanceTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MockMvc mvc;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @MockitoBean
    WorkspaceSnapshots snapshots;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void invalidBundleRollsBackThePublishMark() throws Exception {
        when(snapshots.collect(any()))
                .thenReturn(new WorkspaceSnapshots.Snapshot(new ReleaseApi.Bundle(
                        "2.0", " ", Instant.parse("2026-09-01T00:00:00Z"), List.of(), List.of(), Map.of())));
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@invalid-bundle.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser("owner@invalid-bundle.test");
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), "Invalid", "owner@invalid-bundle.test")
                .tenant()
                .id();
        String cred = credential(owner);
        UUID space = createSpaceUseCase
                .createSpace(cred, tenant, "Invalid Docs", "authored", key())
                .value()
                .id();
        String pages = "/api/v1/tenants/" + tenant + "/spaces/" + space + "/pages";
        String created = mvc.perform(post(pages)
                        .header("Authorization", "Bearer " + cred)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Guide\",\"slug\":\"guide\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID page = UUID.fromString(json.readTree(created).get("id").asText());
        mvc.perform(post(pages + "/" + page + ":publish")
                        .header("Authorization", "Bearer " + cred)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("invalid_bundle"));
        mvc.perform(get(pages + "/" + page).header("Authorization", "Bearer " + cred))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("draft"));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Author");
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        return registered.user();
    }

    private String credential(UserApi.UserId user) {
        var started = (SessionApi.StartResult.Started) sessions.start(
                new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");
        return started.credentials().accessToken();
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }
}
