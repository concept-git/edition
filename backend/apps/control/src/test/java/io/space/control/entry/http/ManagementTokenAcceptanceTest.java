package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import io.space.concepts.managementtoken.api.ManagementTokenApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import io.space.control.support.FixturePostgres;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@org.springframework.test.context.TestExecutionListeners(
        listeners = ManagementTokenAcceptanceTest.DatabaseCleanup.class,
        mergeMode = org.springframework.test.context.TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
class ManagementTokenAcceptanceTest {
    static final FixturePostgres postgres = new FixturePostgres();

    @org.junit.jupiter.api.BeforeAll
    static void startDatabase() throws Exception {
        postgres.start();
    }

    public static class DatabaseCleanup extends org.springframework.test.context.support.AbstractTestExecutionListener {
        @Override
        public int getOrder() {
            return Integer.MIN_VALUE;
        }

        @Override
        public void afterTestClass(org.springframework.test.context.TestContext context) throws Exception {
            // afterTestClass runs in reverse order: DirtiesContext closes pools before the database.
            postgres.close();
        }
    }

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @org.springframework.boot.test.web.server.LocalServerPort
    int port;

    @Autowired
    MockMvc mvc;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    PasswordApi passwords;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    PermissionApi permissions;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    ManagementTokenApi tokens;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void listUsesStableCursorPagesAndKeepsRevokedMetadata() throws Exception {
        var f = fixture();
        var first = issue(f, Set.of("content:read"), f.tenant());
        issue(f, Set.of("content:read"), f.tenant());
        issue(f, Set.of("content:read"), f.tenant());
        mvc.perform(delete("/api/v1/me/access-tokens/" + first.id())
                        .header("Authorization", "Bearer " + f.ownerCredential()))
                .andExpect(status().isNoContent());
        var mapper = tools.jackson.databind.json.JsonMapper.builder().build();
        String page = mvc.perform(get("/api/v1/me/access-tokens")
                        .param("limit", "2")
                        .header("Authorization", "Bearer " + f.ownerCredential()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        var json = mapper.readTree(page);
        assertThat(json.get("items").size()).isEqualTo(2);
        String cursor = json.get("nextCursor").asString();
        mvc.perform(get("/api/v1/me/access-tokens")
                        .param("limit", "2")
                        .param("cursor", cursor)
                        .header("Authorization", "Bearer " + f.ownerCredential()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(first.id().toString()))
                .andExpect(jsonPath("$.items[0].status").value("revoked"));
    }

    @Test
    void unknownManagementScopeAndExcessiveExpiryHaveActionableCodes() throws Exception {
        var f = fixture();
        mvc.perform(post("/api/v1/me/access-tokens")
                        .header("Authorization", "Bearer " + f.ownerCredential())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(issueBody(Set.of("unsupported:scope"), null)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("invalid_management_token_scope"));
        mvc.perform(post("/api/v1/me/access-tokens")
                        .header("Authorization", "Bearer " + f.ownerCredential())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(issueBody(Set.of("account:read"), f.tenant())))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("invalid_management_token_scope"));
        String body = tools.jackson.databind.json.JsonMapper.builder()
                .build()
                .writeValueAsString(java.util.Map.of(
                        "name",
                        "too long",
                        "scopes",
                        Set.of("content:read"),
                        "expiry",
                        Instant.now().plusSeconds(366L * 86400).toString()));
        mvc.perform(post("/api/v1/me/access-tokens")
                        .header("Authorization", "Bearer " + f.ownerCredential())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("invalid_token_expiry"));
    }

    @Test
    void bearerManagementDoesNotRequireCookiesOrBrowserOrigin() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read"), f.tenant());
        mvc.perform(get(spacePath(f)).header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist("Set-Cookie"));
        mvc.perform(get("/api/v1/auth/context").header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.credentialType").value("management_token"))
                .andExpect(jsonPath("$.actorId").value(f.owner().value().toString()))
                .andExpect(jsonPath("$.credentialId").value(token.id().toString()))
                .andExpect(jsonPath("$.secret").doesNotExist());
        assertThat(jdbc.queryForObject(
                        "select last_used_at is not null from iam.management_tokens where id=?",
                        Boolean.class,
                        token.id()))
                .isTrue();
    }

    @Test
    void taskScopesCoverResourceAndUserOnlyEndpoints() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read"), null);
        mvc.perform(post("/api/v1/tenants/" + f.tenant() + "/spaces")
                        .header("Authorization", "Bearer " + token.secret())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Should not create\",\"mode\":\"authored\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("management_scope_required"))
                .andExpect(jsonPath("$.violations[0].code").value("content:write"));
        mvc.perform(get("/api/v1/tenants/" + f.tenant() + "/members")
                        .header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isForbidden());
        var memberToken = issue(f, Set.of("members:read"), f.tenant());
        mvc.perform(get("/api/v1/tenants/" + f.tenant() + "/members")
                        .header("Authorization", "Bearer " + memberToken.secret()))
                .andExpect(status().isOk());
    }

    @Test
    void tenantRestrictionRejectsAnotherTenantEvenWhenUserOwnsBoth() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read"), f.tenant());
        UUID other = provisionTenantUseCase
                .provisionTenant(f.operatorCredential(), "Other " + UUID.randomUUID(), f.email())
                .tenant()
                .id();
        mvc.perform(get("/api/v1/tenants/" + other + "/spaces").header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isForbidden());
    }

    @Test
    void currentResourcePermissionIsEvaluatedForEveryPatRequest() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read", "content:write"), f.tenant());
        String body = "{\"format\":\"markdown\",\"title\":\"PAT page\",\"slug\":\"pat-page\"}";
        mvc.perform(post(spacePath(f) + "/pages")
                        .header("Authorization", "Bearer " + token.secret())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.audit_log where actor_id=? and credential_id=? and action='Page.create'",
                        Long.class,
                        f.owner().value(),
                        token.id()))
                .isPositive();
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant()),
                () -> permissions.grant(
                        new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, f.space()),
                        new PermissionApi.Principal(
                                PermissionApi.PrincipalType.USER, f.owner().value()),
                        new PermissionApi.Role("reader")));
        mvc.perform(post(spacePath(f) + "/pages")
                        .header("Authorization", "Bearer " + token.secret())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("pat-page", "another-page")))
                .andExpect(status().isForbidden());
    }

    @Test
    void patCannotMintAnotherCredentialOrChangePasswordOrEraseSelf() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("account:write", "permissions:write", "content:write"), null);
        for (String path : ListPaths.SESSION_ONLY) {
            mvc.perform(post(path)
                            .header("Authorization", "Bearer " + token.secret())
                            .header("Idempotency-Key", UUID.randomUUID().toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.code").value("permission_denied"));
        }
        mvc.perform(post("/api/v1/tenants/" + f.tenant() + "/tokens")
                        .header("Authorization", "Bearer " + token.secret())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void ownRevocationAndExpiryReturnInvalidTokenImmediately() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read"), f.tenant());
        mvc.perform(delete("/api/v1/me/access-tokens/" + token.id())
                        .header("Authorization", "Bearer " + f.ownerCredential()))
                .andExpect(status().isNoContent());
        mvc.perform(get(spacePath(f)).header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("invalid_token"));
        var expired = issue(f, Set.of("content:read"), f.tenant());
        jdbc.update(
                "update iam.management_tokens set created_at=now()-interval '2 days',expires_at=now()-interval '1 day' where id=?",
                expired.id());
        mvc.perform(get(spacePath(f)).header("Authorization", "Bearer " + expired.secret()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("invalid_token"));
    }

    @Test
    void anotherUserCannotSeeOrRevokeTheCredential() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read"), f.tenant());
        mvc.perform(get("/api/v1/me/access-tokens").header("Authorization", "Bearer " + f.operatorCredential()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
        mvc.perform(delete("/api/v1/me/access-tokens/" + token.id())
                        .header("Authorization", "Bearer " + f.operatorCredential()))
                .andExpect(status().isNoContent());
        mvc.perform(get(spacePath(f)).header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isOk());
    }

    @Test
    void issuanceReplaysWithoutDuplicateAndListNeverReturnsSecrets() throws Exception {
        var f = fixture();
        String key = UUID.randomUUID().toString();
        String body = issueBody(Set.of("content:read"), f.tenant());
        String first = mvc.perform(post("/api/v1/me/access-tokens")
                        .header("Authorization", "Bearer " + f.ownerCredential())
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String second = mvc.perform(post("/api/v1/me/access-tokens")
                        .header("Authorization", "Bearer " + f.ownerCredential())
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(first.equals(second)).isTrue();
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.management_tokens where owner_id=?",
                        Long.class,
                        f.owner().value()))
                .isEqualTo(1);
        mvc.perform(get("/api/v1/me/access-tokens").header("Authorization", "Bearer " + f.ownerCredential()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].secret").doesNotExist())
                .andExpect(jsonPath("$.items[0].status").value("active"));
    }

    @Test
    void platformScopeDoesNotCreatePlatformOperatorPrivilege() throws Exception {
        var f = fixture();
        mvc.perform(post("/api/v1/me/access-tokens")
                        .header("Authorization", "Bearer " + f.ownerCredential())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(issueBody(Set.of("platform:read"), null)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("platform_operator_required"));
        var issued = (ManagementTokenApi.IssueResult.Issued) tokens.issue(
                f.operator().value(),
                "operator",
                Set.of(ManagementTokenApi.Scope.PLATFORM_READ),
                null,
                Instant.now().plusSeconds(86400));
        mvc.perform(get("/admin/tenants").header("Authorization", "Bearer " + issued.secret()))
                .andExpect(status().isOk());
        mvc.perform(post("/admin/tenants/" + f.tenant() + ":suspend")
                        .header("Authorization", "Bearer " + issued.secret()))
                .andExpect(status().isForbidden());
        jdbc.update(
                "update iam.users set platform_operator=false where id=?",
                f.operator().value());
        mvc.perform(get("/admin/tenants").header("Authorization", "Bearer " + issued.secret()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deactivationAndReactivationNeverRestoreAnOldPat() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read"), f.tenant());
        passwords.set(new PasswordApi.AccountId(f.operator().value()), "Agent-pat-42!");
        mvc.perform(post("/admin/users/" + f.owner().value() + ":deactivate")
                        .header("Authorization", "Bearer " + f.operatorCredential())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"confirmationEmail\":\"" + f.email() + "\",\"currentPassword\":\"Agent-pat-42!\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(get(spacePath(f)).header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/admin/users/" + f.owner().value() + ":reactivate")
                        .header("Authorization", "Bearer " + f.operatorCredential())
                        .header("Idempotency-Key", UUID.randomUUID().toString()))
                .andExpect(status().isNoContent());
        mvc.perform(get(spacePath(f)).header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject(
                        "select revoked_at is not null from iam.management_tokens where id=?",
                        Boolean.class,
                        token.id()))
                .isTrue();
    }

    private Issued issue(Fixture f, Set<String> scopes, UUID tenant) throws Exception {
        String result = mvc.perform(post("/api/v1/me/access-tokens")
                        .header("Authorization", "Bearer " + f.ownerCredential())
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(issueBody(scopes, tenant)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        var json = tools.jackson.databind.json.JsonMapper.builder().build().readTree(result);
        return new Issued(
                UUID.fromString(json.get("token").get("id").asString()),
                json.get("secret").asString());
    }

    private String issueBody(Set<String> scopes, UUID tenant) {
        return "{\"name\":\"PAT fixture\",\"scopes\":["
                + scopes.stream().sorted().map(s -> "\"" + s + "\"").collect(java.util.stream.Collectors.joining(","))
                + "],\"tenantId\":" + (tenant == null ? "null" : "\"" + tenant + "\"") + ",\"expiry\":\""
                + Instant.now().plusSeconds(86400) + "\"}";
    }

    private Fixture fixture() {
        var operator = user("operator-" + UUID.randomUUID() + "@pat.test");
        jdbc.update("update iam.users set platform_operator=true where id=?", operator.value());
        String email = "owner-" + UUID.randomUUID() + "@pat.test";
        var owner = user(email);
        String operatorCredential = credential(operator), ownerCredential = credential(owner);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(operatorCredential, "PAT " + UUID.randomUUID(), email)
                .tenant()
                .id();
        UUID space = createSpaceUseCase
                .createSpace(
                        ownerCredential,
                        tenant,
                        "PAT Space",
                        "authored",
                        UUID.randomUUID().toString())
                .value()
                .id();
        return new Fixture(owner, operator, email, ownerCredential, operatorCredential, tenant, space);
    }

    private UserApi.UserId user(String email) {
        var user = ((UserApi.RegisterResult.Registered) users.register(email, "PAT User")).user();
        jdbc.update("update iam.users set verified=true where id=?", user.value());
        return user;
    }

    private String credential(UserApi.UserId user) {
        return ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(user.value()),
                        new SessionApi.Device("PAT Test", "Test", "Test"),
                        "unknown"))
                .credentials()
                .accessToken();
    }

    private String spacePath(Fixture f) {
        return "/api/v1/tenants/" + f.tenant() + "/spaces/" + f.space();
    }

    @Test
    void readOnlyPatProjectsOnlyActionsItCanExecuteAndSiteDeleteRequiresHosting() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read", "hosting:read"), f.tenant());
        mvc.perform(get(spacePath(f)).header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions.length()").value(1))
                .andExpect(jsonPath("$.allowedActions[0]").value("read"));
        mvc.perform(delete("/api/v1/tenants/" + f.tenant() + "/sites/" + UUID.randomUUID())
                        .header(
                                "Authorization",
                                "Bearer "
                                        + issue(f, Set.of("content:write"), f.tenant())
                                                .secret())
                        .header("Idempotency-Key", UUID.randomUUID().toString()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.violations[0].code").value("hosting:write"));
    }

    @Test
    void terminationPlanSharesExecutionPrerequisitesAndMakesNoBusinessMutation() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read", "content:write"), f.tenant());
        String plan = spacePath(f) + ":deletion-plan";
        mvc.perform(get(plan)
                        .param("confirmationName", "PAT Space")
                        .header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_not_archived"));
        mvc.perform(post(spacePath(f) + ":archive")
                        .header("Authorization", "Bearer " + token.secret())
                        .header("Idempotency-Key", UUID.randomUUID().toString()))
                .andExpect(status().isOk());
        long before =
                jdbc.queryForObject("select count(*) from shared.audit_log where tenant_id=?", Long.class, f.tenant());
        mvc.perform(get(plan).param("confirmationName", "wrong").header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("deletion_confirmation_invalid"));
        mvc.perform(get(plan)
                        .param("confirmationName", "PAT Space")
                        .header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.validationLevel").value("server-validated"))
                .andExpect(jsonPath("$.counts.pages").value(0))
                .andExpect(jsonPath("$.effects").isNotEmpty());
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.audit_log where tenant_id=?", Long.class, f.tenant()))
                .isEqualTo(before);
        mvc.perform(get(spacePath(f)).header("Authorization", "Bearer " + token.secret()))
                .andExpect(status().isOk());
    }

    @Test
    void nativeCliPreservesBaselineAndIntentAndProjectsActualHttpResponses() throws Exception {
        var f = fixture();
        var token = issue(f, Set.of("content:read", "content:write"), f.tenant());
        var home = java.nio.file.Files.createTempDirectory("spacectl-native-live-");
        var json = tools.jackson.databind.json.JsonMapper.builder().build();
        try {
            assertThat(cli(
                                    home,
                                    token.secret(),
                                    "configure",
                                    "--base-url",
                                    "http://127.0.0.1:" + port,
                                    "--allow-http-loopback",
                                    "--token-env",
                                    "SPACE_PAT")
                            .exit())
                    .isZero();
            var params = json.createObjectNode()
                    .put("tenantId", f.tenant().toString())
                    .put("spaceId", f.space().toString());
            var created = cli(
                    home,
                    token.secret(),
                    "control",
                    "spaces",
                    "pages",
                    "create",
                    "--params",
                    params.toString(),
                    "--json",
                    "{\"format\":\"markdown\",\"title\":\"Agent DX\",\"slug\":\"agent-dx\"}");
            assertThat(created.exit())
                    .withFailMessage(created.out() + created.err())
                    .isZero();
            String pageId = json.readTree(created.out()).path("id").asString();
            params.put("pageId", pageId);
            var observed =
                    cli(home, token.secret(), "control", "spaces", "pages", "+inspect", "--params", params.toString());
            assertThat(observed.exit())
                    .withFailMessage(observed.out() + observed.err())
                    .isZero();
            String etag = json.readTree(observed.out()).at("/headers/etag").asString();
            var editParams =
                    params.deepCopy().put("If-Match", etag).put("Idempotency-Key", "native-edit-" + UUID.randomUUID());
            String content = "# 中文正文\n\nhttps://example.com/path?x=1\n" + "content ".repeat(3000);
            String body = json.createObjectNode()
                    .put("content", content)
                    .put("intent", "draft_only")
                    .toString();
            var preview = cli(
                    home,
                    token.secret(),
                    "control",
                    "spaces",
                    "pages",
                    "edit",
                    "--params",
                    editParams.toString(),
                    "--json",
                    body,
                    "--dry-run");
            assertThat(preview.exit())
                    .withFailMessage(preview.out() + preview.err())
                    .isZero();
            assertThat(json.readTree(preview.out()).path("dry_run").asBoolean()).isTrue();
            assertThat(json.readTree(cli(
                                            home,
                                            token.secret(),
                                            "control",
                                            "spaces",
                                            "pages",
                                            "get",
                                            "--params",
                                            params.toString())
                                    .out())
                            .path("content")
                            .asString())
                    .isEmpty();
            var edited = cli(
                    home,
                    token.secret(),
                    "control",
                    "spaces",
                    "pages",
                    "edit",
                    "--params",
                    editParams.toString(),
                    "--json",
                    body,
                    "--yes");
            assertThat(edited.exit())
                    .withFailMessage(edited.out() + edited.err())
                    .isZero();
            var replay = cli(
                    home,
                    token.secret(),
                    "control",
                    "spaces",
                    "pages",
                    "edit",
                    "--params",
                    editParams.toString(),
                    "--json",
                    body,
                    "--yes");
            assertThat(replay.exit()).isZero();
            assertThat(json.readTree(replay.out()).path("revision"))
                    .isEqualTo(json.readTree(edited.out()).path("revision"));
            var conflict = cli(
                    home,
                    token.secret(),
                    "control",
                    "spaces",
                    "pages",
                    "edit",
                    "--params",
                    editParams
                            .deepCopy()
                            .put("Idempotency-Key", "changed-" + UUID.randomUUID())
                            .toString(),
                    "--json",
                    json.createObjectNode()
                            .put("content", "revised intent")
                            .put("intent", "draft_only")
                            .toString(),
                    "--yes");
            assertThat(conflict.exit()).isEqualTo(1);
            assertThat(json.readTree(conflict.out()).at("/error/code").asInt()).isIn(409, 412, 428);
            var selected = params.deepCopy().put("fields", "id,revision");
            var partial =
                    cli(home, token.secret(), "control", "spaces", "pages", "get", "--params", selected.toString());
            assertThat(partial.exit())
                    .withFailMessage(partial.out() + partial.err())
                    .isZero();
            assertThat(json.readTree(partial.out()).size()).isEqualTo(2);
            assertThat(partial.out().length()).isLessThan(edited.out().length() / 5);
            var denied = cli(
                    home,
                    token.secret(),
                    "control",
                    "spaces",
                    "pages",
                    "get",
                    "--params",
                    params.deepCopy().put("fields", "notAField").toString());
            assertThat(denied.exit()).isEqualTo(3);
            assertThat(json.readTree(denied.out()).at("/error/code").asInt()).isEqualTo(400);
            var uri = "http://127.0.0.1:" + port + spacePath(f) + "/pages/" + pageId;
            var client = java.net.http.HttpClient.newHttpClient();
            var fullWire = client.send(
                    java.net.http.HttpRequest.newBuilder(java.net.URI.create(uri))
                            .header("Authorization", "Bearer " + token.secret())
                            .GET()
                            .build(),
                    java.net.http.HttpResponse.BodyHandlers.ofByteArray());
            var smallWire = client.send(
                    java.net.http.HttpRequest.newBuilder(java.net.URI.create(uri + "?fields=id,revision"))
                            .header("Authorization", "Bearer " + token.secret())
                            .GET()
                            .build(),
                    java.net.http.HttpResponse.BodyHandlers.ofByteArray());
            assertThat(smallWire.statusCode()).isEqualTo(200);
            assertThat(smallWire.body().length).isLessThan(fullWire.body().length / 5);
            assertThat(smallWire.headers().firstValue("ETag"))
                    .isEqualTo(fullWire.headers().firstValue("ETag"));
            assertThat(created.out() + edited.out() + edited.err() + partial.out() + denied.out())
                    .doesNotContain(token.secret());
        } finally {
            try (var paths = java.nio.file.Files.walk(home)) {
                for (var path :
                        paths.sorted(java.util.Comparator.reverseOrder()).toList())
                    java.nio.file.Files.deleteIfExists(path);
            }
        }
    }

    private CliResult cli(java.nio.file.Path home, String token, String... args) throws Exception {
        java.nio.file.Path root =
                java.nio.file.Path.of(System.getProperty("user.dir")).toAbsolutePath();
        while (!java.nio.file.Files.exists(root.resolve("contracts/openapi.json"))) root = root.getParent();
        var distribution = root.resolve("clients/control/build/install/spacectl/lib");
        if ("true".equals(System.getenv("SPACECTL_REQUIRE_CLI")))
            assertThat(java.nio.file.Files.isDirectory(distribution))
                    .withFailMessage("Build clients/control installDist before CLI process acceptance")
                    .isTrue();
        else
            org.junit.jupiter.api.Assumptions.assumeTrue(
                    java.nio.file.Files.isDirectory(distribution),
                    "Build independent CLI installDist to run process acceptance");
        var command = new java.util.ArrayList<String>(java.util.List.of(
                java.nio.file.Path.of(System.getProperty("java.home"), "bin", "java")
                        .toString(),
                "-cp",
                root.resolve("clients/control/build/install/spacectl/lib/*").toString(),
                "io.space.cli.Main"));
        command.addAll(java.util.List.of(args));
        var pb = new ProcessBuilder(command);
        pb.environment().put("SPACECTL_HOME", home.toString());
        pb.environment().put("SPACE_PAT", token);
        var process = pb.start();
        process.getOutputStream().close();
        var stdout = java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            try {
                return new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            } catch (java.io.IOException e) {
                throw new RuntimeException(e);
            }
        });
        var stderr = java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            try {
                return new String(process.getErrorStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            } catch (java.io.IOException e) {
                throw new RuntimeException(e);
            }
        });
        if (!process.waitFor(30, java.util.concurrent.TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new AssertionError("CLI hung without a TTY");
        }
        return new CliResult(process.exitValue(), stdout.get(), stderr.get());
    }

    private record CliResult(int exit, String out, String err) {}

    private record Fixture(
            UserApi.UserId owner,
            UserApi.UserId operator,
            String email,
            String ownerCredential,
            String operatorCredential,
            UUID tenant,
            UUID space) {}

    private record Issued(UUID id, String secret) {
        @Override
        public String toString() {
            return "Issued[id=" + id + ",secret=REDACTED]";
        }
    }

    private static class ListPaths {
        static final String[] SESSION_ONLY = {
            "/api/v1/me/access-tokens", "/api/v1/me/password:change", "/api/v1/me:erase"
        };
    }
}
