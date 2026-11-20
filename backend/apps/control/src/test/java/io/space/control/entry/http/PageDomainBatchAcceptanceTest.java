package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.membership.api.MembershipApi;
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
import java.util.List;
import java.util.Set;
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
class PageDomainBatchAcceptanceTest {
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

    @Autowired
    PermissionApi permissions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantScopeApi tenantScope;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void snapshotProfileWithNullVersionCanBeReusedWithoutGuessingAContentType() throws Exception {
        var f = tenant("Null profile", "owner-" + key() + "@snapshot.test");
        UUID space = space(f);
        String page = create(f, space, "nullable");
        String path = pagesPath(f.id(), space) + "/" + page + "/content";
        var snapshot = mvc.perform(get(path).header("Authorization", bearer(f.credential())))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();
        var data = json.readTree(snapshot.getContentAsString());
        var body = json.createObjectNode()
                .put("content", "# Explicit null version")
                .put("intent", "draft_only")
                .put("contentType", data.path("contentType").asText())
                .putNull("versionRef");
        body.set("interpretation", data.path("interpretation"));
        mvc.perform(put(path)
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .header("If-Match", snapshot.getHeader("ETag"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("# Explicit null version"));
    }

    @Test
    void contentSnapshotHasStableBaselineWhileDetailTracksMetadataAndLegacyTagsStillEdit() throws Exception {
        var f = tenant("Snapshot", "owner-" + key() + "@snapshot.test");
        UUID space = space(f);
        String page = create(f, space, "one");
        String path = pagesPath(f.id(), space) + "/" + page;
        var first = mvc.perform(get(path).header("Authorization", bearer(f.credential())))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();
        String detailTag = first.getHeader("ETag");
        assertThat(detailTag).matches("\\\"page-rev-0-[a-f0-9]{64}\\\"");
        mvc.perform(get(path + "/content").header("Authorization", bearer(f.credential())))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", "\"rev-0\""))
                .andExpect(jsonPath("$.id").value(page))
                .andExpect(jsonPath("$.revision").value(0));
        mvc.perform(patch(path)
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Renamed\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-ETag", "\"rev-0\""));
        var renamed = mvc.perform(get(path).header("Authorization", bearer(f.credential())))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();
        assertThat(renamed.getHeader("ETag")).isNotEqualTo(detailTag);
        mvc.perform(post(path + ":publish")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key()))
                .andExpect(status().isOk());
        var published = mvc.perform(get(path).header("Authorization", bearer(f.credential())))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();
        assertThat(published.getHeader("ETag")).isNotEqualTo(renamed.getHeader("ETag"));
        mvc.perform(get(path + "/content").header("Authorization", bearer(f.credential())))
                .andExpect(header().string("ETag", "\"rev-0\""));
        mvc.perform(put(path + "/content")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .header("If-Match", detailTag)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"saved\",\"intent\":\"draft_only\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revision").value(1));
        mvc.perform(put(path + "/content")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .header("If-Match", detailTag)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"stale\",\"intent\":\"draft_only\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.conflict.currentRevision").value(1));
        mvc.perform(get(path + "/content").header("Authorization", bearer(f.credential())))
                .andExpect(header().string("ETag", "\"rev-1\""))
                .andExpect(jsonPath("$.content").value("saved"));
    }

    @Test
    void selectedReadsFilterIdsAndHideUnreadableOrForeignPagesWithBoundedPayloads() throws Exception {
        var f = tenant("Batch Read", "owner-" + key() + "@batch-read.test");
        UUID space = space(f);
        String a = create(f, space, "a");
        String b = create(f, space, "b");
        String foreign = create(f, space(f), "foreign");
        String base = pagesPath(f.id(), space);
        mvc.perform(get(base).queryParam("ids", a).header("Authorization", bearer(f.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(a));
        mvc.perform(get(base)
                        .queryParam("ids", a)
                        .queryParam("status", "draft")
                        .header("Authorization", bearer(f.credential())))
                .andExpect(status().is(422));
        mvc.perform(get(base)
                        .queryParam("ids", a)
                        .queryParam("limit", "1")
                        .header("Authorization", bearer(f.credential())))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.violations[0].field").value("ids"));
        var reader = verifiedUser("reader-" + key() + "@batch-read.test");
        tenantScope.inTenant(new TenantRegistryApi.TenantId(f.id()), () -> {
            memberships.add(
                    MembershipApi.Group.tenant(f.id()),
                    new MembershipApi.MemberId(reader.value()),
                    MembershipApi.Role.MEMBER);
            permissions.grant(
                    new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, space),
                    new PermissionApi.Principal(PermissionApi.PrincipalType.USER, reader.value()),
                    new PermissionApi.Role("reader"));
            permissions.restrict(
                    new PermissionApi.Resource(PermissionApi.ResourceType.PAGE, UUID.fromString(b)),
                    Set.of(new PermissionApi.Principal(PermissionApi.PrincipalType.USER, f.owner())),
                    0);
            return null;
        });
        String missing = key();
        mvc.perform(post(base + ":batchGet")
                        .header("Authorization", bearer(credential(reader)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(
                                java.util.Map.of("ids", List.of(a, b, foreign, missing), "view", "content"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("ok"))
                .andExpect(jsonPath("$.items[0].content.id").value(a))
                .andExpect(jsonPath("$.items[0].etag").value("\"rev-0\""))
                .andExpect(jsonPath("$.items[1].status").value("not_found"))
                .andExpect(jsonPath("$.items[2].status").value("not_found"))
                .andExpect(jsonPath("$.items[3].status").value("not_found"));
        mvc.perform(post(base + ":batchGet")
                        .header("Authorization", bearer(f.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[\"" + a + "\",\"" + a + "\"],\"view\":\"content\"}"))
                .andExpect(status().is(422));
        for (String id : List.of(a, b)) {
            mvc.perform(put(base + "/" + id + "/content")
                            .header("Authorization", bearer(f.credential()))
                            .header("Idempotency-Key", key())
                            .header("If-Match", "\"rev-0\"")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json.writeValueAsString(
                                    java.util.Map.of("content", "\n".repeat(1_100_000), "intent", "draft_only"))))
                    .andExpect(status().isOk());
        }
        mvc.perform(post(base + ":batchGet")
                        .header("Authorization", bearer(f.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", List.of(a, b), "view", "content"))))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.violations[0].field").value("response"));
        mvc.perform(post(base + ":batchGet")
                        .header("Authorization", bearer(f.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", List.of(a, b), "view", "summary"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));
    }

    @Test
    void batchPublicationHasOneCommonReleaseAndReplaysWithoutAnotherEffect() throws Exception {
        var f = tenant("Batch Publish", "owner-" + key() + "@batch-publish.test");
        UUID space = space(f);
        String a = create(f, space, "a"), b = create(f, space, "b");
        String base = pagesPath(f.id(), space);
        String body = json.writeValueAsString(java.util.Map.of("ids", List.of(a, b)));
        String intent = key();
        String first = mvc.perform(post(base + ":publish")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", intent)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pages.length()").value(2))
                .andExpect(jsonPath("$.outcome").value("promoted"))
                .andExpect(jsonPath("$.release.pageCount").value(2))
                .andReturn()
                .getResponse()
                .getContentAsString();
        mvc.perform(post(base + ":publish")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", intent)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", List.of(b, a)))))
                .andExpect(status().isOk())
                .andExpect(result ->
                        assertThat(result.getResponse().getContentAsString()).isEqualTo(first));
        String releases = "/api/v1/tenants/" + f.id() + "/spaces/" + space + "/releases";
        mvc.perform(get(releases).header("Authorization", bearer(f.credential())))
                .andExpect(jsonPath("$.items.length()").value(1));
        String c = create(f, space, "c");
        mvc.perform(post(base + ":publish")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", List.of(c, key())))))
                .andExpect(status().isNotFound());
        mvc.perform(get(base + "/" + c).header("Authorization", bearer(f.credential())))
                .andExpect(jsonPath("$.status").value("draft"));
        mvc.perform(post(base + ":unpublish")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pages[0].status").value("draft"))
                .andExpect(jsonPath("$.release.pageCount").value(0));
        mvc.perform(get(releases).header("Authorization", bearer(f.credential())))
                .andExpect(jsonPath("$.items.length()").value(2));
    }

    @Test
    void explicitDraftOnlyRejectsSyncedBeforeAnyEffectAndExplicitHotfixIsModeBound() throws Exception {
        var f = tenant("Intent", "owner-" + key() + "@content-intent.test");
        UUID space = space(f);
        String page = create(f, space, "intent");
        String base = pagesPath(f.id(), space), path = base + "/" + page;
        mvc.perform(put(path + "/content")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"bad mode\",\"intent\":\"hotfix\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
        mvc.perform(post(base + ":publish")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", List.of(page)))))
                .andExpect(status().isOk());
        mvc.perform(post("/api/v1/tenants/" + f.id() + "/spaces/" + space + ":convert")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"synced\"}"))
                .andExpect(status().isOk());
        mvc.perform(put(path + "/content")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"must not save\",\"intent\":\"draft_only\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
        mvc.perform(get(path + "/content").header("Authorization", bearer(f.credential())))
                .andExpect(header().string("ETag", "\"rev-0\""))
                .andExpect(jsonPath("$.content").value(""));
        mvc.perform(put(path + "/content")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"hotfix\",\"intent\":\"hotfix\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revision").value(1));
    }

    @Test
    void batchWritesRecheckEachPageAndOversizedSelectionsNeverProducePartialEffects() throws Exception {
        var f = tenant("Batch Auth", "owner-" + key() + "@batch-auth.test");
        UUID space = space(f);
        String a = create(f, space, "a"), b = create(f, space, "b");
        String base = pagesPath(f.id(), space);
        var maintainer = verifiedUser("maintainer-" + key() + "@batch-auth.test");
        tenantScope.inTenant(new TenantRegistryApi.TenantId(f.id()), () -> {
            memberships.add(
                    MembershipApi.Group.tenant(f.id()),
                    new MembershipApi.MemberId(maintainer.value()),
                    MembershipApi.Role.MEMBER);
            permissions.grant(
                    new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, space),
                    new PermissionApi.Principal(PermissionApi.PrincipalType.USER, maintainer.value()),
                    new PermissionApi.Role("maintainer"));
            permissions.restrict(
                    new PermissionApi.Resource(PermissionApi.ResourceType.PAGE, UUID.fromString(b)),
                    Set.of(new PermissionApi.Principal(PermissionApi.PrincipalType.USER, f.owner())),
                    0);
            return null;
        });
        mvc.perform(post(base + ":publish")
                        .header("Authorization", bearer(credential(maintainer)))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", List.of(a, b)))))
                .andExpect(status().isForbidden());
        for (String id : List.of(a, b))
            mvc.perform(get(base + "/" + id).header("Authorization", bearer(f.credential())))
                    .andExpect(jsonPath("$.status").value("draft"));
        var excessive = java.util.stream.IntStream.range(0, 101)
                .mapToObj(i -> UUID.randomUUID())
                .toList();
        mvc.perform(post(base + ":batchGet")
                        .header("Authorization", bearer(f.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", excessive, "view", "summary"))))
                .andExpect(status().is(422));
        mvc.perform(post(base + ":publish")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", excessive))))
                .andExpect(status().is(422));
    }

    @Test
    void corsAllowsTheContentPreconditionAndExposesItsSeparateBaseline() throws Exception {
        var f = tenant("Content CORS", "owner-" + key() + "@content-cors.test");
        UUID space = space(f);
        String path = pagesPath(f.id(), space) + "/" + create(f, space, "cors");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options(path + "/content")
                        .header("Origin", "http://localhost:8088")
                        .header("Access-Control-Request-Method", "PUT")
                        .header(
                                "Access-Control-Request-Headers",
                                "authorization,content-type,if-match,idempotency-key"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                                "Access-Control-Allow-Headers", org.hamcrest.Matchers.containsString("if-match")));
        mvc.perform(get(path).header("Authorization", bearer(f.credential())).header("Origin", "http://localhost:8088"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                                "Access-Control-Expose-Headers",
                                org.hamcrest.Matchers.containsString("X-Content-ETag")));
    }

    @Test
    void postBatchReadUsesReadCapabilityAndCannotBorrowWriteOrPublishScopes() throws Exception {
        var f = tenant("Batch Read Scope", "owner-" + key() + "@batch-read-scope.test");
        UUID space = space(f);
        String page = create(f, space, "scope");
        String base = pagesPath(f.id(), space);
        String readOnly = managementToken(f, "content:read");
        String writeOnly = managementToken(f, "content:write");
        String request = json.writeValueAsString(java.util.Map.of("ids", List.of(page), "view", "content"));
        mvc.perform(post(base + ":batchGet")
                        .header("Authorization", bearer(readOnly))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].content.revision").value(0));
        mvc.perform(post(base + ":batchGet")
                        .header("Authorization", bearer(writeOnly))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("management_scope_required"))
                .andExpect(jsonPath("$.violations[0].code").value("content:read"));
        mvc.perform(post(base + ":publish")
                        .header("Authorization", bearer(readOnly))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("ids", List.of(page)))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.violations[0].code").value("content:publish"));
        mvc.perform(get(base + "/" + page + "/content").header("Authorization", bearer(readOnly)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revision").value(0));
    }

    private String managementToken(TenantFixture f, String scope) throws Exception {
        var response = mvc.perform(post("/api/v1/me/access-tokens")
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of(
                                "name",
                                "Batch scope fixture",
                                "scopes",
                                List.of(scope),
                                "tenantId",
                                f.id(),
                                "expiry",
                                java.time.Instant.now().plusSeconds(86400).toString()))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse();
        return json.readTree(response.getContentAsString()).get("secret").asText();
    }

    private UUID space(TenantFixture f) {
        return createSpaceUseCase
                .createSpace(f.credential(), f.id(), "Docs " + key(), "authored", key())
                .value()
                .id();
    }

    private String create(TenantFixture f, UUID space, String slug) throws Exception {
        var response = mvc.perform(post(pagesPath(f.id(), space))
                        .header("Authorization", bearer(f.credential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(
                                java.util.Map.of("format", "markdown", "title", slug, "slug", slug))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse();
        return json.readTree(response.getContentAsString()).get("id").asText();
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@authoring-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner), owner.value());
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

    private static String pagesPath(UUID tenant, UUID space) {
        return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/pages";
    }

    private static String bearer(String credential) {
        return "Bearer " + credential;
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record TenantFixture(UUID id, String credential, UUID owner) {}
}
