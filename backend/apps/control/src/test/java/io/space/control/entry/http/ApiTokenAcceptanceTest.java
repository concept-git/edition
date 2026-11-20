package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
class ApiTokenAcceptanceTest {
    private static final Instant EXPIRY = Instant.now().plus(1, ChronoUnit.DAYS);

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

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void machineCredentialReadsBoundSpaceRequiresScopeAndBecomesInvalidAfterRevoke() throws Exception {
        Fixture fixture = fixture();
        JsonNode readable = issue(
                fixture, "read-token", "reader", "[\"read\"]", UUID.randomUUID().toString());
        String secret = readable.get("secret").asText();

        mvc.perform(get(spaces(fixture.tenant()) + "/" + fixture.space()).header("Authorization", bearer(secret)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(fixture.space().toString()));
        mvc.perform(post(spaces(fixture.tenant()))
                        .header("Authorization", bearer(fixture.ownerCredential()))
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Other Space\",\"mode\":\"authored\"}"))
                .andExpect(status().isCreated());
        mvc.perform(get(spaces(fixture.tenant())).header("Authorization", bearer(secret)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(fixture.space().toString()))
                .andExpect(jsonPath("$.allowedActions.length()").value(0));

        JsonNode noRead = issue(
                fixture,
                "publish-token",
                "maintainer",
                "[\"publish\"]",
                UUID.randomUUID().toString());
        mvc.perform(get(spaces(fixture.tenant()) + "/" + fixture.space())
                        .header("Authorization", bearer(noRead.get("secret").asText())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));

        mvc.perform(delete(tokens(fixture.tenant()) + "/" + readable.get("id").asText())
                        .header("Authorization", bearer(fixture.ownerCredential())))
                .andExpect(status().isNoContent());
        mvc.perform(get(spaces(fixture.tenant()) + "/" + fixture.space()).header("Authorization", bearer(secret)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("invalid_token"));

        // JWT 路径仍由原 resource-server provider 处理。
        mvc.perform(get(spaces(fixture.tenant()) + "/" + fixture.space())
                        .header("Authorization", bearer(fixture.ownerCredential())))
                .andExpect(status().isOk());
    }

    @Test
    void issueIsEncryptedIdempotentAndRejectsInvalidCredentialsAndEscalation() throws Exception {
        Fixture fixture = fixture();
        String key = UUID.randomUUID().toString();
        JsonNode first = issue(fixture, "replay", "reader", "[\"read\"]", key);
        JsonNode replay = issue(fixture, "replay", "reader", "[\"read\"]", key);
        assertThat(replay).isEqualTo(first);
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.api_tokens where owner_id = ? and name = 'replay'",
                        Long.class,
                        fixture.owner()))
                .isOne();
        String encrypted = jdbc.queryForObject("""
                select response_body from shared.idempotency_records
                 where operation = 'api-token.issue' and idempotency_key = ?
                """, String.class, key);
        assertThat(encrypted)
                .startsWith("v1:")
                .doesNotContain(first.get("secret").asText());

        mvc.perform(post(tokens(fixture.tenant()))
                        .header("Authorization", bearer(fixture.ownerCredential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("missing-key", fixture.space(), "reader", "[\"read\"]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"));

        mvc.perform(post(tokens(fixture.tenant()))
                        .header("Authorization", bearer(fixture.ownerCredential()))
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("admin-scope", fixture.space(), "admin", "[\"admin\"]")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("invalid_token_scope"));

        UserApi.UserId reader = verifiedUser("reader-" + UUID.randomUUID() + "@token-http.test");
        String readerJwt = credential(reader);
        jdbc.update("""
                insert into iam.permission_grants
                    (tenant_id,resource_type,resource_id,principal_type,principal_id,role)
                values (?,'space',?,'user',?,'reader')
                """, fixture.tenant(), fixture.space(), reader.value());
        mvc.perform(post(tokens(fixture.tenant()))
                        .header("Authorization", bearer(readerJwt))
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("escalate", fixture.space(), "author", "[\"read\"]")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));

        mvc.perform(get(spaces(fixture.tenant()) + "/" + fixture.space()).header("Authorization", "Bearer spc_broken"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("invalid_token"));
    }

    private JsonNode issue(Fixture fixture, String name, String role, String scopes, String key) throws Exception {
        String response = mvc.perform(post(tokens(fixture.tenant()))
                        .header("Authorization", bearer(fixture.ownerCredential()))
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(name, fixture.space(), role, scopes)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(response);
    }

    private Fixture fixture() throws Exception {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@token-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser("owner-" + UUID.randomUUID() + "@token-http.test");
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), "Token Tenant " + UUID.randomUUID(), email(owner))
                .tenant()
                .id();
        String ownerCredential = credential(owner);
        String response = mvc.perform(post(spaces(tenant))
                        .header("Authorization", bearer(ownerCredential))
                        .header("Idempotency-Key", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Machine Space\",\"mode\":\"authored\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID space = UUID.fromString(json.readTree(response).get("id").asText());
        return new Fixture(tenant, space, owner.value(), ownerCredential);
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Token User");
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        return registered.user();
    }

    private String email(UserApi.UserId user) {
        return jdbc.queryForObject("select email::text from iam.users where id = ?", String.class, user.value());
    }

    private String credential(UserApi.UserId user) {
        return ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(user.value()),
                        new SessionApi.Device("Test", "Test", "Test"),
                        "unknown"))
                .credentials()
                .accessToken();
    }

    private static String body(String name, UUID space, String role, String scopes) {
        return """
                {"name":"%s","spaceId":"%s","role":"%s","scopes":%s,"expiry":"%s"}
                """.formatted(name, space, role, scopes, EXPIRY);
    }

    private static String tokens(UUID tenant) {
        return "/api/v1/tenants/" + tenant + "/tokens";
    }

    private static String spaces(UUID tenant) {
        return "/api/v1/tenants/" + tenant + "/spaces";
    }

    private static String bearer(String credential) {
        return "Bearer " + credential;
    }

    private record Fixture(UUID tenant, UUID space, UUID owner, String ownerCredential) {}
}
