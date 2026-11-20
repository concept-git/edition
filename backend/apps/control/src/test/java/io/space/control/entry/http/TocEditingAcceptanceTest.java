package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 票 14：目录编排 HTTP 验收。写接口一律回整棵 TocView；摘条目不删页面。 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class TocEditingAcceptanceTest {
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

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    PermissionApi permissions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void arrangesGroupPageAndLinkThenMovesRelabelsAndRemovesWithoutDeletingThePage() throws Exception {
        Fixture f = fixture("Arrange", "owner@toc-http.test");

        mvc.perform(get(f.toc()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries").isEmpty())
                .andExpect(jsonPath("$.allowedActions", containsInAnyOrder("read", "edit")));

        String addKey = key();
        String groupBody = mvc.perform(authed(post(f.toc()), f, addKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"指南\",\"kind\":\"group\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entries.length()").value(1))
                .andExpect(jsonPath("$.entries[0].label").value("指南"))
                .andExpect(jsonPath("$.entries[0].kind").value("group"))
                .andExpect(jsonPath("$.entries[0].depth").value(1))
                .andReturn()
                .getResponse()
                .getContentAsString();
        mvc.perform(authed(post(f.toc()), f, addKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"指南\",\"kind\":\"group\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entries.length()").value(1));
        UUID group = UUID.fromString(
                json.readTree(groupBody).get("entries").get(0).get("id").asText());

        String pageBody = mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + group
                                + "\",\"label\":\"快速开始\",\"kind\":\"target\",\"targetId\":\"" + f.page + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entries[0].children.length()").value(1))
                .andExpect(jsonPath("$.entries[0].children[0].kind").value("target"))
                .andExpect(jsonPath("$.entries[0].children[0].targetId").value(f.page.toString()))
                .andExpect(jsonPath("$.entries[0].children[0].depth").value(2))
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID pageEntry = UUID.fromString(json.readTree(pageBody)
                .get("entries")
                .get(0)
                .get("children")
                .get(0)
                .get("id")
                .asText());

        mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"手册\",\"kind\":\"link\",\"url\":\"https://example.com/docs\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entries.length()").value(2))
                .andExpect(jsonPath("$.entries[1].kind").value("link"))
                .andExpect(jsonPath("$.entries[1].url").value("https://example.com/docs"));

        mvc.perform(authed(patch(f.toc() + "/" + group), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"  入门  \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries[0].label").value("入门"));

        mvc.perform(authed(post(f.toc() + "/" + pageEntry + ":move"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":null,\"position\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries.length()").value(3))
                .andExpect(jsonPath("$.entries[0].label").value("入门"))
                .andExpect(jsonPath("$.entries[1].label").value("快速开始"))
                .andExpect(jsonPath("$.entries[2].kind").value("link"));

        mvc.perform(authed(delete(f.toc() + "/" + group), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries.length()").value(2))
                .andExpect(jsonPath("$.entries[0].label").value("快速开始"));
        mvc.perform(get("/api/v1/tenants/" + f.tenant + "/spaces/" + f.space + "/pages/" + f.page)
                        .header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(f.page.toString()));

        mvc.perform(get(f.toc()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries[0].position").value(0))
                .andExpect(jsonPath("$.entries[1].position").value(1));
    }

    @Test
    void eighthLevelCycleAndInvalidPositionAreUnprocessable() throws Exception {
        Fixture f = fixture("Depth", "owner@toc-depth-http.test");
        UUID parent = null;
        for (int level = 1; level <= 7; level++) {
            String body = "{\"label\":\"L" + level + "\",\"kind\":\"group\""
                    + (parent == null ? "" : ",\"parentId\":\"" + parent + "\"") + "}";
            String response = mvc.perform(authed(post(f.toc()), f)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();
            parent = deepestId(json.readTree(response).get("entries"));
        }
        mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + parent + "\",\"label\":\"L8\",\"kind\":\"group\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("depth_exceeded"));

        Fixture cycle = fixture("Cycle", "owner@toc-cycle-http.test");
        String groupBody = mvc.perform(authed(post(cycle.toc()), cycle)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"父\",\"kind\":\"group\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID group = UUID.fromString(
                json.readTree(groupBody).get("entries").get(0).get("id").asText());
        String childBody = mvc.perform(authed(post(cycle.toc()), cycle)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + group + "\",\"label\":\"子\",\"kind\":\"group\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID child = UUID.fromString(json.readTree(childBody)
                .get("entries")
                .get(0)
                .get("children")
                .get(0)
                .get("id")
                .asText());
        mvc.perform(authed(post(cycle.toc() + "/" + group + ":move"), cycle)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + child + "\",\"position\":0}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("cycle_detected"));
        mvc.perform(authed(post(cycle.toc() + "/" + child + ":move"), cycle)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":null,\"position\":9}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("position_invalid"));
        mvc.perform(authed(post(cycle.toc() + "/" + UUID.randomUUID() + ":move"), cycle)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":null,\"position\":0}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("toc_entry_not_found"));
        mvc.perform(authed(post(cycle.toc()), cycle)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"失踪\",\"kind\":\"target\",\"targetId\":\"" + UUID.randomUUID() + "\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("page_not_found"));
    }

    @Test
    void syncedAndArchivedRejectWritesWhileEmptyTreeStaysReadable() throws Exception {
        Fixture f = fixture("Modes", "owner@toc-modes-http.test");
        UUID synced = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Synced", "synced", key())
                .value()
                .id();
        String syncedToc = tocPath(f.tenant, synced);
        mvc.perform(get(syncedToc).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries").isEmpty())
                .andExpect(jsonPath("$.allowedActions", contains("read")))
                .andExpect(jsonPath("$.allowedActions", not(hasItem("edit"))));
        mvc.perform(authed(post(syncedToc), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"不可\",\"kind\":\"group\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));

        archiveSpaceUseCase.archiveSpace(f.credential, f.tenant, f.space, key());
        mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"归档\",\"kind\":\"group\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
        mvc.perform(get(f.toc()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions", contains("read")));
    }

    @Test
    void readerHasNoEditActionAndForeignTenantDoesNotSeeTheTree() throws Exception {
        Fixture f = fixture("Acl", "owner@toc-acl-http.test");
        UserApi.UserId reader = verifiedUser("reader@toc-acl-http.test");
        String readerCredential = credential(reader);
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant),
                () -> memberships.add(
                        MembershipApi.Group.tenant(f.tenant),
                        new MembershipApi.MemberId(reader.value()),
                        MembershipApi.Role.MEMBER));
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant),
                () -> permissions.grant(
                        new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, f.space),
                        new PermissionApi.Principal(PermissionApi.PrincipalType.USER, reader.value()),
                        new PermissionApi.Role("reader")));

        mvc.perform(get(f.toc()).header("Authorization", "Bearer " + readerCredential))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions", contains("read")));
        mvc.perform(post(f.toc())
                        .header("Authorization", "Bearer " + readerCredential)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"不可\",\"kind\":\"group\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));

        Fixture other = fixture("Other", "owner@toc-other-http.test");
        mvc.perform(get(tocPath(other.tenant, f.space)).header("Authorization", other.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
    }

    @Test
    void rejectsInvalidLinksAndEnforcesIdempotency() throws Exception {
        Fixture f = fixture("Keys", "owner@toc-keys-http.test");

        mvc.perform(post(f.toc())
                        .header("Authorization", f.authorization())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"手册\",\"kind\":\"link\",\"url\":\"https://example.com/docs\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"));

        mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"脚本\",\"kind\":\"link\",\"url\":\"javascript:alert(1)\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"))
                .andExpect(jsonPath("$.violations[0].field").value("url"));

        String replayKey = key();
        String request = "{\"label\":\"手册\",\"kind\":\"link\",\"url\":\"https://example.com/docs\"}";
        String first = mvc.perform(authed(post(f.toc()), f, replayKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entries[0].kind").value("link"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String replay = mvc.perform(authed(post(f.toc()), f, replayKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(replay).isEqualTo(first);
        assertThat(json.readTree(replay).get("entries").size()).isEqualTo(1);

        String entry = json.readTree(first).get("entries").get(0).get("id").asText();
        String deleteKey = key();
        String deleted = mvc.perform(authed(delete(f.toc() + "/" + entry), f, deleteKey))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String deletedReplay = mvc.perform(authed(delete(f.toc() + "/" + entry), f, deleteKey))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(deletedReplay).isEqualTo(deleted);

        mvc.perform(authed(post(f.toc()), f, replayKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"另一本\",\"kind\":\"link\",\"url\":\"https://example.com/other\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("idempotency_key_reused"));
    }

    private static UUID deepestId(JsonNode entries) {
        JsonNode node = entries.get(0);
        while (node.has("children") && node.get("children").size() > 0) {
            node = node.get("children").get(0);
        }
        return UUID.fromString(node.get("id").asText());
    }

    private Fixture fixture(String name, String ownerEmail) throws Exception {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@toc-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        String cred = credential(owner);
        UUID space = createSpaceUseCase
                .createSpace(cred, tenant, name + " Docs", "authored", key())
                .value()
                .id();
        String created = mvc.perform(post("/api/v1/tenants/" + tenant + "/spaces/" + space + "/pages")
                        .header("Authorization", "Bearer " + cred)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Guide\",\"slug\":\"guide\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return new Fixture(
                tenant, space, UUID.fromString(json.readTree(created).get("id").asText()), cred);
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

    private static MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, Fixture f) {
        return authed(builder, f, key());
    }

    private static MockHttpServletRequestBuilder authed(
            MockHttpServletRequestBuilder builder, Fixture f, String idempotencyKey) {
        return builder.header("Authorization", f.authorization()).header("Idempotency-Key", idempotencyKey);
    }

    private static String tocPath(UUID tenant, UUID space) {
        return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/toc/entries";
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record Fixture(UUID tenant, UUID space, UUID page, String credential) {
        String toc() {
            return tocPath(tenant, space);
        }

        String authorization() {
            return "Bearer " + credential;
        }
    }
}
