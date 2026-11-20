package io.space.control.entry.http;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

/** 票 17：回收/还原 HTTP 验收。authored 摘目录；restore 未编目；synced 409。 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class DeletionAcceptanceTest {
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
    void trashLeavesWorkingSetAndTocThenRestoreReturnsUnlisted() throws Exception {
        Fixture f = fixture("Trash", "owner@trash-http.test");

        mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"Guide\",\"kind\":\"target\",\"targetId\":\"" + f.page + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entries[0].targetId").value(f.page.toString()));

        String trashKey = key();
        String trashedBody = mvc.perform(authed(post(f.resource() + ":trash"), f, trashKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(f.page.toString()))
                .andExpect(jsonPath("$.trashedAt").isNotEmpty())
                .andExpect(jsonPath("$.revision").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String trashedAt = json.readTree(trashedBody).get("trashedAt").asText();
        mvc.perform(authed(post(f.resource() + ":trash"), f, trashKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt").value(trashedAt));

        mvc.perform(get(f.pages()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[*].id", not(hasItem(f.page.toString()))));
        mvc.perform(get(f.resource()).header("Authorization", f.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("page_not_found"));
        mvc.perform(authed(patch(f.resource()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Gone\"}"))
                .andExpect(status().isNotFound());
        mvc.perform(get(f.toc()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries").isEmpty());
        mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"Guide\",\"kind\":\"target\",\"targetId\":\"" + f.page + "\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("page_not_found"));
        mvc.perform(get(f.trash()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(f.page.toString()))
                .andExpect(jsonPath("$.items[0].trashedAt").value(trashedAt))
                .andExpect(jsonPath("$.total", nullValue()))
                .andExpect(jsonPath("$.allowedActions", containsInAnyOrder("read", "edit")));

        mvc.perform(authed(post(f.resource() + ":trash"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt").value(trashedAt));

        String restoreKey = key();
        mvc.perform(authed(post(f.resource() + ":restore"), f, restoreKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt", nullValue()))
                .andExpect(jsonPath("$.revision").value(0));
        mvc.perform(authed(post(f.resource() + ":restore"), f, restoreKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt", nullValue()));
        mvc.perform(authed(post(f.resource() + ":restore"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt", nullValue()));

        mvc.perform(get(f.pages()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(f.page.toString()));
        mvc.perform(get(f.resource()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt", nullValue()));
        mvc.perform(get(f.toc()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries").isEmpty());
        mvc.perform(get(f.trash()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void syncedArchivedAndMissingKeyAreFiniteOutputs() throws Exception {
        Fixture f = fixture("Modes", "owner@trash-modes-http.test");

        mvc.perform(post(f.resource() + ":trash")
                        .header("Authorization", f.authorization())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"));

        UUID synced = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Synced", "synced", key())
                .value()
                .id();
        UUID syncedPage = createSyncedPage(f.tenant, synced);
        mvc.perform(authed(post(pagePath(f.tenant, synced, syncedPage) + ":trash"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
        mvc.perform(authed(post(pagePath(f.tenant, synced, syncedPage) + ":restore"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));

        archiveSpaceUseCase.archiveSpace(f.credential, f.tenant, f.space, key());
        mvc.perform(authed(post(f.resource() + ":trash"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
    }

    @Test
    void readerCanListTrashButCannotWrite() throws Exception {
        Fixture f = fixture("Acl", "owner@trash-acl-http.test");
        mvc.perform(authed(post(f.resource() + ":trash"), f)).andExpect(status().isOk());

        UserApi.UserId reader = verifiedUser("reader@trash-acl-http.test");
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

        mvc.perform(get(f.trash()).header("Authorization", "Bearer " + readerCredential))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions", contains("read")))
                .andExpect(jsonPath("$.items[0].allowedActions", contains("read")));
        mvc.perform(post(f.resource() + ":restore")
                        .header("Authorization", "Bearer " + readerCredential)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));

        Fixture other = fixture("Other", "owner@trash-other-http.test");
        mvc.perform(get(trashPath(other.tenant, f.space)).header("Authorization", other.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
        mvc.perform(get(pagePath(other.tenant, f.space, f.page)).header("Authorization", other.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("page_not_found"));
    }

    private UUID createSyncedPage(UUID tenant, UUID space) {
        UUID page = UUID.randomUUID();
        jdbc.update("""
                insert into authoring.pages (
                  id, tenant_id, title, format, created_by_type, updated_by_type)
                values (?, ?, 'Imported', 'markdown', 'system', 'system')
                """, page, tenant);
        jdbc.update(
                "insert into authoring.space_page_placements (space_id, page_id, slug) values (?, ?, 'imported')",
                space,
                page);
        return page;
    }

    private Fixture fixture(String name, String ownerEmail) throws Exception {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@trash-http.test");
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
        String created = mvc.perform(post(pagesPath(tenant, space))
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

    private static String pagesPath(UUID tenant, UUID space) {
        return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/pages";
    }

    private static String pagePath(UUID tenant, UUID space, UUID page) {
        return pagesPath(tenant, space) + "/" + page;
    }

    private static String trashPath(UUID tenant, UUID space) {
        return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/trash";
    }

    private static String tocPath(UUID tenant, UUID space) {
        return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/toc/entries";
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record Fixture(UUID tenant, UUID space, UUID page, String credential) {
        String pages() {
            return pagesPath(tenant, space);
        }

        String resource() {
            return pagePath(tenant, space, page);
        }

        String trash() {
            return trashPath(tenant, space);
        }

        String toc() {
            return tocPath(tenant, space);
        }

        String authorization() {
            return "Bearer " + credential;
        }
    }
}
