package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
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
class SpaceManagementAcceptanceTest {
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
    PermissionApi permissions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TeamApi teams;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    ReleaseApi releases;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void createSupportsBothModesAndEnforcesTheIdempotencyContract() throws Exception {
        TenantFixture tenant = tenant("HTTP Create", "owner-create@space-http.test");
        String base = spacesPath(tenant.id());

        mvc.perform(post(base)
                        .header("Authorization", bearer(tenant.ownerCredential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"No key\",\"mode\":\"authored\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"));

        String replayKey = key();
        String request = "{\"name\":\"Authoring\",\"mode\":\"authored\"}";
        String first = mvc.perform(post(base)
                        .header("Authorization", bearer(tenant.ownerCredential()))
                        .header("Idempotency-Key", replayKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mode").value("authored"))
                .andExpect(jsonPath("$.allowedActions").value(hasItem("manage_permissions")))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String replay = mvc.perform(post(base)
                        .header("Authorization", bearer(tenant.ownerCredential()))
                        .header("Idempotency-Key", replayKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(replay).isEqualTo(first);
        assertThat(jdbc.queryForObject(
                        "select count(*) from authoring.spaces where tenant_id = ? and name = 'Authoring'",
                        Long.class,
                        tenant.id()))
                .isOne();

        mvc.perform(post(base)
                        .header("Authorization", bearer(tenant.ownerCredential()))
                        .header("Idempotency-Key", replayKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Reused\",\"mode\":\"synced\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("idempotency_key_reused"));

        mvc.perform(post(base)
                        .header("Authorization", bearer(tenant.ownerCredential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Mirror\",\"mode\":\"synced\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mode").value("synced"));

        UserApi.UserId outsider = verifiedUser("outsider-create@space-http.test");
        mvc.perform(post(base)
                        .header("Authorization", bearer(credential(outsider)))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Forbidden\",\"mode\":\"authored\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));
    }

    @Test
    void detailUsesReadAndListFiltersTenantCandidates() throws Exception {
        TenantFixture tenant = tenant("HTTP Read", "owner-read@space-http.test");
        JsonNode visible = create(tenant, "Visible", "authored");
        JsonNode hidden = create(tenant, "Hidden", "authored");
        UserApi.UserId reader = verifiedUser("reader@space-http.test");
        String readerCredential = credential(reader);
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(reader.value()),
                        MembershipApi.Role.MEMBER));

        mvc.perform(get(spacesPath(tenant.id()) + "/" + visible.get("id").asText())
                        .header("Authorization", bearer(readerCredential)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));

        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> permissions.grant(
                        new PermissionApi.Resource(
                                PermissionApi.ResourceType.SPACE,
                                UUID.fromString(visible.get("id").asText())),
                        new PermissionApi.Principal(PermissionApi.PrincipalType.USER, reader.value()),
                        new PermissionApi.Role("reader")));

        mvc.perform(get(spacesPath(tenant.id()) + "/" + visible.get("id").asText())
                        .header("Authorization", bearer(readerCredential)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Visible"))
                .andExpect(jsonPath("$.allowedActions", not(hasItem("manage_permissions"))));
        mvc.perform(get(spacesPath(tenant.id())).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(visible.get("id").asText()))
                .andExpect(jsonPath("$.total").doesNotExist());
        assertThat(hidden.get("id").asText()).isNotEqualTo(visible.get("id").asText());
    }

    @Test
    void aTeamGrantFollowsCurrentMembershipAcrossDetailAndFilteredLists() throws Exception {
        TenantFixture tenant = tenant("HTTP Team Grant", "owner-team-grant@space-http.test");
        JsonNode visible = create(tenant, "Team Visible", "authored");
        UserApi.UserId reader = verifiedUser("reader-team-grant@space-http.test");
        String readerCredential = credential(reader);
        UUID space = UUID.fromString(visible.get("id").asText());

        TeamApi.View team = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            memberships.add(
                    MembershipApi.Group.tenant(tenant.id()),
                    new MembershipApi.MemberId(reader.value()),
                    MembershipApi.Role.MEMBER);
            var created = (TeamApi.CreateResult.Created) teams.create(tenant.id(), "Readers");
            var teamGroup =
                    MembershipApi.Group.team(tenant.id(), created.team().id().value());
            memberships.add(teamGroup, new MembershipApi.MemberId(tenant.owner().value()), MembershipApi.Role.OWNER);
            memberships.add(teamGroup, new MembershipApi.MemberId(reader.value()), MembershipApi.Role.MEMBER);
            permissions.grant(
                    new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, space),
                    new PermissionApi.Principal(
                            PermissionApi.PrincipalType.TEAM,
                            created.team().id().value()),
                    new PermissionApi.Role("reader"));
            return created.team();
        });

        mvc.perform(get(spacesPath(tenant.id()) + "/" + space).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Team Visible"));
        mvc.perform(get(spacesPath(tenant.id())).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(space.toString()));

        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.remove(
                        MembershipApi.Group.team(tenant.id(), team.id().value()),
                        new MembershipApi.MemberId(reader.value())));

        mvc.perform(get(spacesPath(tenant.id()) + "/" + space).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));
        mvc.perform(get(spacesPath(tenant.id())).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void archiveBlocksRenameAndDescribeUntilRestoreAndMissingIs404() throws Exception {
        TenantFixture tenant = tenant("HTTP Lifecycle", "owner-life@space-http.test");
        JsonNode created = create(tenant, "Lifecycle", "authored");
        String resource = spacesPath(tenant.id()) + "/" + created.get("id").asText();
        String authorization = bearer(tenant.ownerCredential());

        mvc.perform(post(resource + ":archive")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("archived"));
        mvc.perform(get(spacesPath(tenant.id())).header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("archived"));

        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Blocked\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"icon\":\"lock\",\"description\":\"Blocked\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));

        mvc.perform(post(resource + ":restore")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("active"));
        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Writable\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Writable"));

        String missing = spacesPath(tenant.id()) + "/" + UUID.randomUUID();
        mvc.perform(get(missing).header("Authorization", authorization))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
        mvc.perform(post(missing + ":archive")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
    }

    @Test
    void tenantPathCannotReadOrMutateAnotherTenantSpace() throws Exception {
        TenantFixture first = tenant("HTTP First", "owner-first@space-http.test");
        TenantFixture second = tenant("HTTP Second", "owner-second@space-http.test");
        JsonNode foreign = create(second, "Foreign", "authored");
        String forged = spacesPath(first.id()) + "/" + foreign.get("id").asText();
        String authorization = bearer(first.ownerCredential());

        mvc.perform(get(forged).header("Authorization", authorization))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
        mvc.perform(patch(forged)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType("application/merge-patch+json")
                        .content("{\"name\":\"Compromised\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
    }

    @Test
    void mergePatchPreservesOmittedFieldsAndRejectsBlankName() throws Exception {
        TenantFixture tenant = tenant("HTTP Patch", "owner-patch@space-http.test");
        JsonNode created = create(tenant, "Patch", "authored");
        String resource = spacesPath(tenant.id()) + "/" + created.get("id").asText();
        String authorization = bearer(tenant.ownerCredential());

        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType("application/merge-patch+json")
                        .content("{\"icon\":\"book\",\"description\":\"Keep me\"}"))
                .andExpect(status().isOk());
        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType("application/merge-patch+json")
                        .content("{\"icon\":\"code\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.icon").value("code"))
                .andExpect(jsonPath("$.description").value("Keep me"));
        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType("application/merge-patch+json")
                        .content("{\"name\":\"   \"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("space_name_invalid"));
        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType("application/merge-patch+json")
                        .content("{\"icon\":\"unknown\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("space_icon_invalid"))
                .andExpect(jsonPath("$.violations[0].field").value("icon"));
        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType("application/merge-patch+json")
                        .content("{\"autoRelease\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.autoRelease").value(false));
        mvc.perform(patch(resource)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType("application/merge-patch+json")
                        .content("{\"autoRelease\":null}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"));
    }

    @Test
    void convertRequiresLiveForAuthoredToSyncedAndRejectsArchived() throws Exception {
        TenantFixture tenant = tenant("HTTP Convert", "owner-convert@space-http.test");
        JsonNode authored = create(tenant, "Authored", "authored");
        JsonNode synced = create(tenant, "Synced", "synced");
        String authoredPath = spacesPath(tenant.id()) + "/" + authored.get("id").asText();
        String syncedPath = spacesPath(tenant.id()) + "/" + synced.get("id").asText();
        String authorization = bearer(tenant.ownerCredential());

        mvc.perform(get(authoredPath).header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions", not(hasItem("convert"))))
                .andExpect(jsonPath("$.lastReleaseAt").value(nullValue()))
                .andExpect(jsonPath("$.retention").value(7));
        mvc.perform(get(syncedPath).header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions", hasItem("convert")))
                .andExpect(jsonPath("$.autoRelease").value(nullValue()));

        mvc.perform(post(authoredPath + ":convert")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"synced\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"));
        mvc.perform(post(authoredPath + ":convert")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"synced\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("live_release_required"));
        mvc.perform(get(authoredPath).header("Authorization", authorization))
                .andExpect(jsonPath("$.mode").value("authored"));

        mvc.perform(post(syncedPath + ":convert")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"authored\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("authored"))
                .andExpect(jsonPath("$.autoRelease").value(true))
                .andExpect(jsonPath("$.allowedActions", not(hasItem("convert"))));

        mvc.perform(post(syncedPath + ":convert")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"authored\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("authored"));

        mvc.perform(post(authoredPath + ":archive")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isOk());
        mvc.perform(post(authoredPath + ":convert")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"synced\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
    }

    @Test
    void convertAuthoredToSyncedAfterLiveAndThenRejectsPageCreate() throws Exception {
        TenantFixture tenant = tenant("HTTP Convert Live", "owner-convert-live@space-http.test");
        JsonNode authored = create(tenant, "Has Live", "authored");
        UUID space = UUID.fromString(authored.get("id").asText());
        String resource = spacesPath(tenant.id()) + "/" + space;
        String authorization = bearer(tenant.ownerCredential());
        plantLive(tenant.id(), space);

        mvc.perform(get(resource).header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions", hasItem("convert")))
                .andExpect(jsonPath("$.lastReleaseAt").isNotEmpty())
                .andExpect(jsonPath("$.retention").value(7));

        mvc.perform(post(resource + ":convert")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"synced\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("synced"))
                .andExpect(jsonPath("$.autoRelease").value(nullValue()))
                .andExpect(jsonPath("$.allowedActions", hasItem("convert")));

        mvc.perform(post(resource + "/pages")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Blocked\",\"slug\":\"blocked\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
    }

    @Test
    void convertWrongTenantIsNotFound() throws Exception {
        TenantFixture first = tenant("HTTP Convert First", "owner-convert-first@space-http.test");
        TenantFixture second = tenant("HTTP Convert Second", "owner-convert-second@space-http.test");
        JsonNode foreign = create(second, "Foreign", "synced");
        mvc.perform(post(spacesPath(first.id()) + "/" + foreign.get("id").asText() + ":convert")
                        .header("Authorization", bearer(first.ownerCredential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"authored\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
    }

    private void plantLive(UUID tenant, UUID space) {
        tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant), () -> {
            var drafted = releases.draft(
                    new ReleaseApi.ScopeId(space),
                    new ReleaseApi.Source(ReleaseApi.SourceKind.BUILD, "convert-test", UUID.randomUUID()));
            var id = new ReleaseApi.ReleaseId(drafted.id());
            var loaded = releases.load(
                    id,
                    new ReleaseApi.Bundle(
                            "1.0",
                            "space",
                            java.time.Instant.parse("2026-09-01T00:00:00Z"),
                            java.util.List.of(),
                            java.util.List.of(),
                            java.util.Map.of()));
            if (!(loaded instanceof ReleaseApi.LoadResult.Loaded)) {
                throw new IllegalStateException("expected loaded bundle, got " + loaded);
            }
            var validated = releases.validate(id, java.util.List.of());
            if (!(validated instanceof ReleaseApi.ValidateResult.Ok)) {
                throw new IllegalStateException("expected validated release, got " + validated);
            }
            releases.promote(id);
        });
    }

    private JsonNode create(TenantFixture tenant, String name, String mode) throws Exception {
        String response = mvc.perform(post(spacesPath(tenant.id()))
                        .header("Authorization", bearer(tenant.ownerCredential()))
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new CreateBody(name, mode))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(response);
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@space-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, owner, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Space HTTP User");
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

    private static String spacesPath(UUID tenant) {
        return "/api/v1/tenants/" + tenant + "/spaces";
    }

    private static String bearer(String credential) {
        return "Bearer " + credential;
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record CreateBody(String name, String mode) {}

    private record TenantFixture(UUID id, UserApi.UserId owner, String ownerCredential) {}
}
