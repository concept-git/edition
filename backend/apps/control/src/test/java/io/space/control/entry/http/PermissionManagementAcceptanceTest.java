package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.deletion.TrashPageUseCase;
import io.space.control.compositions.authoring.pageediting.CreatePageUseCase;
import io.space.control.compositions.authoring.permission.PermissionMutationEvents;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@RecordApplicationEvents
class PermissionManagementAcceptanceTest {
    @org.springframework.beans.factory.annotation.Autowired
    TrashPageUseCase trashPageUseCase;

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

    @org.springframework.beans.factory.annotation.Autowired
    ArchiveSpaceUseCase archiveSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreatePageUseCase createPageUseCase;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    PermissionApi permissionFacts;

    @Autowired
    ApiTokenApi apiTokens;

    @Autowired
    TeamApi teams;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Autowired
    ApplicationEvents applicationEvents;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void aSpaceAdminCanGrantAndRevokeAUserButTheReaderCannotManageAcl() throws Exception {
        TenantFixture tenant = tenant("Permission HTTP", "owner@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Permissions", "authored", key())
                .value()
                .id();
        UserApi.UserId reader = verifiedUser("reader@permission-http.test");
        String readerCredential = credential(reader);
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(reader.value()),
                        MembershipApi.Role.MEMBER));
        String permissionsPath = permissionsPath(tenant.id(), space);
        String userKey = "user:" + reader.value();

        mvc.perform(get(spacesPath(tenant.id()) + "/" + space).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isForbidden());
        mvc.perform(put(permissionsPath + "/grants/{principalKey}", userKey)
                        .header("Authorization", bearer(tenant.credential()))
                        .header("X-Request-Id", "permission-grant-event")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.principal.key").value(userKey))
                .andExpect(jsonPath("$.role").value("reader"));
        assertThat(applicationEvents.stream(PermissionMutationEvents.MutationCompleted.class))
                .anySatisfy(event -> {
                    assertThat(event.actorId()).isEqualTo(tenant.owner().value());
                    assertThat(event.tenantId()).isEqualTo(tenant.id());
                    assertThat(event.action()).isEqualTo(PermissionMutationEvents.Action.GRANT_PUT);
                    assertThat(event.target()).isEqualTo(new PermissionMutationEvents.Target("space", space));
                    assertThat(event.principalKeys()).containsExactly(userKey);
                    assertThat(event.requestId()).isEqualTo("permission-grant-event");
                    assertThat(event.traceId()).isNotBlank();
                });

        mvc.perform(get(spacesPath(tenant.id()) + "/" + space).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isOk());
        mvc.perform(get(permissionsPath).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));

        String grantList = mvc.perform(get(permissionsPath).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[*].principal.key").value(hasItem(userKey)))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode inherited = java.util.stream.StreamSupport.stream(
                        json.readTree(grantList).get("items").spliterator(), false)
                .filter(item -> item.at("/resource/source").asText().equals("inherited"))
                .findFirst()
                .orElseThrow();
        assertThat(inherited.get("allowedActions").toString()).contains("override", "set_none");

        mvc.perform(delete(permissionsPath + "/grants/{principalKey}", userKey)
                        .header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isNoContent());
        mvc.perform(get(spacesPath(tenant.id()) + "/" + space).header("Authorization", bearer(readerCredential)))
                .andExpect(status().isForbidden());
    }

    @Test
    void aTenantRootAdminCanRecoverAclAfterACloserNoneRule() throws Exception {
        TenantFixture tenant = tenant("Permission Recovery", "owner-recovery@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Recovery", "authored", key())
                .value()
                .id();
        UserApi.UserId reader = verifiedUser("reader-recovery@permission-http.test");
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(reader.value()),
                        MembershipApi.Role.MEMBER));
        String grants = permissionsPath(tenant.id(), space) + "/grants/{principalKey}";

        mvc.perform(put(grants, "user:" + tenant.owner().value())
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"none\"}"))
                .andExpect(status().isOk());
        mvc.perform(get(spacesPath(tenant.id()) + "/" + space).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isForbidden());

        String readerKey = "user:" + reader.value();
        mvc.perform(put(grants, readerKey)
                        .header("Authorization", bearer(tenant.credential()))
                        .header("X-Request-Id", "permission-root-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isOk());

        assertThat(applicationEvents.stream(PermissionMutationEvents.MutationCompleted.class))
                .filteredOn(event -> event.principalKeys().contains(readerKey))
                .anySatisfy(event -> {
                    assertThat(event.rootRecovery()).isTrue();
                    assertThat(event.requestId()).isEqualTo("permission-root-recovery");
                });
    }

    @Test
    void tokenGrantsAreListedReadOnlyInsideTheTenantScope() throws Exception {
        TenantFixture tenant = tenant("Permission Token", "owner-token@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Token", "authored", key())
                .value()
                .id();
        ApiTokenApi.IssueResult.Issued issued =
                tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
                    var token = (ApiTokenApi.IssueResult.Issued) apiTokens.issue(
                            tenant.owner().value(),
                            tenant.id(),
                            space,
                            "Build reader",
                            Set.of(ApiTokenApi.Scope.READ),
                            Instant.now().plus(1, ChronoUnit.DAYS));
                    permissionFacts.grant(
                            TenantAccess.space(space),
                            new PermissionApi.Principal(
                                    PermissionApi.PrincipalType.TOKEN,
                                    token.metadata().id().value()),
                            new PermissionApi.Role("reader"));
                    return token;
                });
        String tokenKey = "token:" + issued.metadata().id().value();

        mvc.perform(get(permissionsPath(tenant.id(), space)).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[?(@.principal.key == '" + tokenKey + "')].principal.name")
                        .value(hasItem("Build reader")))
                .andExpect(jsonPath("$.items[?(@.principal.key == '" + tokenKey + "')].editable")
                        .value(hasItem(false)))
                .andExpect(jsonPath("$.items[?(@.principal.key == '" + tokenKey + "')].allowedActions[0]")
                        .isEmpty());
    }

    @Test
    void principalSearchReturnsOnlyActiveUsersAndTeamsFromTheCurrentTenant() throws Exception {
        TenantFixture tenant = tenant("Permission Search", "owner-search@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Search", "authored", key())
                .value()
                .id();
        UserApi.UserId member = verifiedUser("needle-member@permission-http.test");
        UserApi.UserId outsider = verifiedUser("needle-outsider@permission-http.test");
        tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            memberships.add(
                    MembershipApi.Group.tenant(tenant.id()),
                    new MembershipApi.MemberId(member.value()),
                    MembershipApi.Role.MEMBER);
            teams.create(tenant.id(), "Needle Team");
        });

        String base = permissionsPath(tenant.id(), space) + "/principals";
        mvc.perform(get(base + "/users")
                        .header("Authorization", bearer(tenant.credential()))
                        .queryParam("q", "needle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].key").value("user:" + member.value()));
        mvc.perform(get(base + "/teams")
                        .header("Authorization", bearer(tenant.credential()))
                        .queryParam("q", "needle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].name").value("Needle Team"));

        mvc.perform(get(base + "/users")
                        .header("Authorization", bearer(tenant.credential()))
                        .queryParam("q", "n"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"));
        // The outsider is deliberately created so a global User.search would find it; tenant filtering must not.
        assertThat(outsider.value()).isNotEqualTo(member.value());
    }

    @Test
    void pagePermissionIndexPaginatesEveryPageWithoutReturningContent() throws Exception {
        TenantFixture tenant = tenant("Permission Pages", "owner-pages@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Pages", "authored", key())
                .value()
                .id();
        UUID first = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "First", "first", key())
                .value()
                .id();
        UUID second = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "Second", "second", key())
                .value()
                .id();
        trashPageUseCase.trashPage(tenant.credential(), tenant.id(), space, first, key());
        String path = permissionsPath(tenant.id(), space) + "/pages";

        String firstPage = mvc.perform(get(path)
                        .header("Authorization", bearer(tenant.credential()))
                        .queryParam("limit", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].content").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode firstJson = json.readTree(firstPage);
        String cursor = firstJson.get("nextCursor").asText();
        String secondPage = mvc.perform(get(path)
                        .header("Authorization", bearer(tenant.credential()))
                        .queryParam("limit", "1")
                        .queryParam("cursor", cursor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.nextCursor").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(java.util.Set.of(
                        UUID.fromString(firstJson.at("/items/0/id").asText()),
                        UUID.fromString(
                                json.readTree(secondPage).at("/items/0/id").asText())))
                .containsExactlyInAnyOrder(first, second);
    }

    @Test
    void pageRestrictionUsesStrongEtagsAndRejectsAStaleReplacement() throws Exception {
        TenantFixture tenant = tenant("Permission ETag", "owner-etag@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "ETag", "authored", key())
                .value()
                .id();
        UUID page = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "Secret", "secret", key())
                .value()
                .id();
        UserApi.UserId allowed = verifiedUser("allowed-etag@permission-http.test");
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(allowed.value()),
                        MembershipApi.Role.MEMBER));
        String path = pagePermissionsPath(tenant.id(), space, page);
        String body = "{\"principals\":[\"user:" + allowed.value() + "\"]}";
        String ownerEffective =
                path + ":effective?principal=user:" + tenant.owner().value();

        mvc.perform(get(path).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", "\"permission-0\""))
                .andExpect(jsonPath("$.restriction.active").value(false));
        mvc.perform(get(ownerEffective).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowed").value(true))
                .andExpect(jsonPath("$.reason").value("direct_grant"));

        mvc.perform(put(path + "/restriction")
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "\"permission-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", "\"permission-1\""))
                .andExpect(jsonPath("$.restriction.active").value(true))
                .andExpect(jsonPath("$.restriction.principals[0].key").value("user:" + allowed.value()));
        mvc.perform(get(ownerEffective).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowed").value(false))
                .andExpect(jsonPath("$.reason").value("restriction_miss"));

        mvc.perform(put(path + "/restriction")
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "\"permission-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isPreconditionFailed())
                .andExpect(header().string("ETag", "\"permission-1\""))
                .andExpect(jsonPath("$.code").value("permission_version_conflict"));

        mvc.perform(delete(path + "/restriction")
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "\"permission-1\""))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", "\"permission-2\""))
                .andExpect(jsonPath("$.restriction.active").value(false));
    }

    @Test
    void effectiveReadExplainsATeamGrantAndChangesWhenTheUserLeavesTheTeam() throws Exception {
        TenantFixture tenant = tenant("Permission Explain", "owner-explain@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Explain", "authored", key())
                .value()
                .id();
        UUID page = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "Explain", "explain", key())
                .value()
                .id();
        UserApi.UserId reader = verifiedUser("reader-explain@permission-http.test");
        TeamApi.View team = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            memberships.add(
                    MembershipApi.Group.tenant(tenant.id()),
                    new MembershipApi.MemberId(reader.value()),
                    MembershipApi.Role.MEMBER);
            var created = (TeamApi.CreateResult.Created) teams.create(tenant.id(), "Explain Readers");
            var teamGroup =
                    MembershipApi.Group.team(tenant.id(), created.team().id().value());
            memberships.add(teamGroup, new MembershipApi.MemberId(tenant.owner().value()), MembershipApi.Role.OWNER);
            memberships.add(teamGroup, new MembershipApi.MemberId(reader.value()), MembershipApi.Role.MEMBER);
            return created.team();
        });
        String teamKey = "team:" + team.id().value();
        mvc.perform(put(permissionsPath(tenant.id(), space) + "/grants/{principalKey}", teamKey)
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isOk());
        String effective =
                pagePermissionsPath(tenant.id(), space, page) + ":effective?principal=user:" + reader.value();

        mvc.perform(get(effective).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowed").value(true))
                .andExpect(jsonPath("$.reason").value("team_grant"))
                .andExpect(jsonPath("$.effectiveOperations").value(hasItem("read")))
                .andExpect(jsonPath("$.matchedGrants[0].principalKey").value(teamKey));

        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.remove(
                        MembershipApi.Group.team(tenant.id(), team.id().value()),
                        new MembershipApi.MemberId(reader.value())));

        mvc.perform(get(effective).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowed").value(false))
                .andExpect(jsonPath("$.reason").value("no_grant"))
                .andExpect(jsonPath("$.matchedLayer").doesNotExist());
    }

    @Test
    void anArchivedSpaceAllowsOnlyMonotonicPermissionNarrowing() throws Exception {
        TenantFixture tenant = tenant("Permission Archive", "owner-archive@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Archive", "authored", key())
                .value()
                .id();
        UUID page = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "Archive", "archive", key())
                .value()
                .id();
        UserApi.UserId first = verifiedUser("first-archive@permission-http.test");
        UserApi.UserId second = verifiedUser("second-archive@permission-http.test");
        tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            memberships.add(
                    MembershipApi.Group.tenant(tenant.id()),
                    new MembershipApi.MemberId(first.value()),
                    MembershipApi.Role.MEMBER);
            memberships.add(
                    MembershipApi.Group.tenant(tenant.id()),
                    new MembershipApi.MemberId(second.value()),
                    MembershipApi.Role.MEMBER);
        });
        archiveSpaceUseCase.archiveSpace(tenant.credential(), tenant.id(), space, key());
        String grants = permissionsPath(tenant.id(), space) + "/grants/{principalKey}";

        String archivedGrants = mvc.perform(
                        get(permissionsPath(tenant.id(), space)).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode inherited = java.util.stream.StreamSupport.stream(
                        json.readTree(archivedGrants).get("items").spliterator(), false)
                .filter(item -> item.at("/resource/source").asText().equals("inherited"))
                .findFirst()
                .orElseThrow();
        assertThat(inherited.get("allowedActions").toString())
                .contains("set_none")
                .doesNotContain("override");

        mvc.perform(put(grants, "user:" + first.value())
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
        mvc.perform(put(grants, "user:" + first.value())
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"none\"}"))
                .andExpect(status().isOk());
        mvc.perform(get(pagePermissionsPath(tenant.id(), space, page) + ":effective?principal=user:" + first.value())
                        .header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowed").value(false))
                .andExpect(jsonPath("$.reason").value("explicit_none"));
        mvc.perform(delete(grants, "user:" + first.value()).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));

        String restriction = pagePermissionsPath(tenant.id(), space, page) + "/restriction";
        mvc.perform(put(restriction)
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "\"permission-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"principals\":[\"user:" + first.value() + "\"]}"))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", "\"permission-1\""));
        mvc.perform(put(restriction)
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "\"permission-1\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"principals\":[\"user:" + first.value() + "\",\"user:" + second.value() + "\"]}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
        mvc.perform(put(restriction)
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "\"permission-1\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"principals\":[]}"))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", "\"permission-2\""))
                .andExpect(jsonPath("$.restriction.active").value(true))
                .andExpect(jsonPath("$.restriction.principals").isEmpty());
        mvc.perform(delete(restriction)
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "\"permission-2\""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
    }

    @Test
    void permissionFailuresAreActionableAndRevocationCanCleanAnInactiveUser() throws Exception {
        TenantFixture tenant = tenant("Permission Errors", "owner-errors@permission-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Errors", "authored", key())
                .value()
                .id();
        UUID page = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "Errors", "errors", key())
                .value()
                .id();
        UserApi.UserId member = verifiedUser("member-errors@permission-http.test");
        UserApi.UserId outsider = verifiedUser("outsider-errors@permission-http.test");
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(member.value()),
                        MembershipApi.Role.MEMBER));
        String grants = permissionsPath(tenant.id(), space) + "/grants/{principalKey}";
        String memberKey = "user:" + member.value();

        mvc.perform(put(grants, memberKey)
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isOk());
        users.deactivate(member);
        mvc.perform(get(permissionsPath(tenant.id(), space)).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[?(@.principal.key == '" + memberKey + "')].principal.status")
                        .value(hasItem("deactivated")))
                .andExpect(jsonPath("$.items[?(@.principal.key == '" + memberKey + "')].allowedActions[0]")
                        .value(hasItem("revoke")));
        mvc.perform(delete(grants, memberKey).header("Authorization", bearer(tenant.credential())))
                .andExpect(status().isNoContent());
        mvc.perform(put(grants, memberKey)
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("permission_principal_inactive"));
        mvc.perform(put(grants, "user:" + outsider.value())
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("permission_principal_not_found"));
        mvc.perform(put(grants, "anonymous")
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("permission_principal_type_unsupported"));
        mvc.perform(put(grants, "user:" + tenant.owner().value())
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"superuser\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("permission_role_invalid"));

        String restriction = pagePermissionsPath(tenant.id(), space, page) + "/restriction";
        mvc.perform(put(restriction)
                        .header("Authorization", bearer(tenant.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"principals\":[]}"))
                .andExpect(status().isPreconditionRequired())
                .andExpect(jsonPath("$.code").value("precondition_required"));
        mvc.perform(put(restriction)
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "invalid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"principals\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_precondition"))
                .andExpect(jsonPath("$.detail").value(containsString("permission-N")));
        String repeated = java.util.stream.IntStream.range(0, 101)
                .mapToObj(ignored -> "\"user:" + tenant.owner().value() + "\"")
                .collect(java.util.stream.Collectors.joining(","));
        mvc.perform(put(restriction)
                        .header("Authorization", bearer(tenant.credential()))
                        .header("If-Match", "\"permission-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"principals\":[" + repeated + "]}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("permission_restriction_too_large"));
    }

    @Test
    void permissionManagementNeverAcceptsAPathOrPrincipalFromAnotherTenant() throws Exception {
        TenantFixture first = tenant("Permission Tenant A", "owner-a@permission-http.test");
        TenantFixture second = tenant("Permission Tenant B", "owner-b@permission-http.test");
        UUID foreignSpace = createSpaceUseCase
                .createSpace(second.credential(), second.id(), "Foreign", "authored", key())
                .value()
                .id();
        UUID foreignPage = createPageUseCase
                .createPage(second.credential(), second.id(), foreignSpace, "markdown", "Foreign", "foreign", key())
                .value()
                .id();
        String forged = permissionsPath(first.id(), foreignSpace);

        mvc.perform(get(forged).header("Authorization", bearer(first.credential())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
        mvc.perform(put(
                                forged + "/grants/{principalKey}",
                                "user:" + second.owner().value())
                        .header("Authorization", bearer(first.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
        mvc.perform(get(pagePermissionsPath(first.id(), foreignSpace, foreignPage))
                        .header("Authorization", bearer(first.credential())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));

        UUID localSpace = createSpaceUseCase
                .createSpace(first.credential(), first.id(), "Local", "authored", key())
                .value()
                .id();
        mvc.perform(put(
                                permissionsPath(first.id(), localSpace) + "/grants/{principalKey}",
                                "user:" + second.owner().value())
                        .header("Authorization", bearer(first.credential()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"reader\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("permission_principal_not_found"));
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@permission-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, owner, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Permission HTTP User");
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

    private static String permissionsPath(UUID tenant, UUID space) {
        return spacesPath(tenant) + "/" + space + "/permissions";
    }

    private static String pagePermissionsPath(UUID tenant, UUID space, UUID page) {
        return spacesPath(tenant) + "/" + space + "/pages/" + page + "/permissions";
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

    private record TenantFixture(UUID id, UserApi.UserId owner, String credential) {}
}
