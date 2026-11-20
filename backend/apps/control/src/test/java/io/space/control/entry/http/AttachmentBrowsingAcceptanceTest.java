package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.DetachUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
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
class AttachmentBrowsingAcceptanceTest {
    @org.springframework.beans.factory.annotation.Autowired
    DetachUseCase detachUseCase;

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
    SpaceApi spaceApi;

    @Autowired
    PageApi pages;

    @Autowired
    PermissionApi permissions;

    @Autowired
    TenantAccess tenants;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void listsReferencesWithoutContentOrObjectsAndFiltersLiteralNames() throws Exception {
        var f = fixture();
        UUID first = page(f, f.space());
        UUID second = page(f, f.space());
        UUID a = attachment(first, "Guide_100%.PDF", "application/pdf");
        UUID b = attachment(second, "Guide_100%.PDF", "application/pdf");
        attachment(first, "guideX100X.png", "image/png");
        var response = list(f, null, "  GUIDE_100%  ", "pdf", 30);
        assertThat(response.path("items")).hasSize(2);
        assertThat(response.toString()).doesNotContain("storageKey", "content", "url", "total");
        assertThat(response.path("items").findValuesAsText("id")).containsExactlyInAnyOrder(a.toString(), b.toString());
        assertThat(list(f, null, "", "image", 30).path("items")).hasSize(1);
        tenants.inTenant(f.tenant(), () -> pages.trash(new PageApi.PageId(first), PageApi.Actor.system()));
        assertThat(list(f, null, "", "all", 30).path("items")).hasSize(1);
        tenants.inTenant(f.tenant(), () -> pages.restore(new PageApi.PageId(first), PageApi.Actor.system()));
        tenants.inTenant(f.tenant(), () -> pages.detach(new PageApi.PageId(second), b, PageApi.Actor.system()));
        assertThat(list(f, null, "", "all", 30).path("items")).hasSize(2);
        jdbc.update("update authoring.spaces set mode='synced',status='archived' where id=?", f.space());
        assertThat(list(f, null, "", "all", 30).path("items")).hasSize(2);
    }

    @Test
    void stablePaginationDoesNotSkipRemainderOfBatchAndBindsConditions() throws Exception {
        var f = fixture();
        var page = page(f, f.space());
        for (int i = 0; i < 35; i++) attachment(page, "file.pdf", "application/pdf");
        Set<String> seen = new HashSet<>();
        String cursor = null;
        do {
            var result = list(f, cursor, "", "all", 7);
            for (var item : result.path("items"))
                assertThat(seen.add(item.path("id").asText())).isTrue();
            cursor = result.path("nextCursor").isNull()
                    ? null
                    : result.path("nextCursor").asText();
        } while (cursor != null);
        assertThat(seen).hasSize(35);
        String bound = list(f, null, "", "all", 1).path("nextCursor").asText();
        mvc.perform(get(f.path())
                        .header("Authorization", f.auth())
                        .param("cursor", bound)
                        .param("q", "changed"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_cursor"));
        mvc.perform(get(f.path()).header("Authorization", f.auth()).param("cursor", "broken"))
                .andExpect(status().isBadRequest());
        mvc.perform(get(f.path()).header("Authorization", f.auth()).param("limit", "101"))
                .andExpect(status().isUnprocessableContent());
        mvc.perform(get(f.path()).header("Authorization", f.auth()).param("type", "video"))
                .andExpect(status().isUnprocessableContent());
        mvc.perform(get(f.path())).andExpect(status().isUnauthorized());
    }

    @Test
    void boundedScanContinuesAcrossOtherSpacesAndNoMatchWindows() throws Exception {
        var f = fixture();
        var target = page(f, f.space());
        UUID wanted = attachment(target, "wanted.pdf", "application/pdf");
        jdbc.update("update authoring.attachments set created_at='2025-01-01' where id=?", wanted);
        UUID other = createSpaceUseCase
                .createSpace(
                        f.credential(),
                        f.tenant(),
                        "Other",
                        "authored",
                        UUID.randomUUID().toString())
                .value()
                .id();
        for (int n = 0; n < 11; n++) {
            UUID p = page(f, other);
            jdbc.update(
                    "insert into authoring.attachments(page_id,filename,mime,size_bytes,storage_key,created_at) "
                            + "select ?, 'noise.pdf','application/pdf',12,'shared-object','2026-01-01'::timestamptz from generate_series(1,50)",
                    p);
        }
        var first = list(f, null, "", "all", 30);
        assertThat(first.path("items")).isEmpty();
        assertThat(first.path("nextCursor").isTextual()).isTrue();
        var next = list(f, first.path("nextCursor").asText(), "", "all", 30);
        assertThat(next.path("items").get(0).path("id").asText()).isEqualTo(wanted.toString());
        assertThat(next.path("nextCursor").isNull()).isTrue();
        var noMatch = list(f, null, "wanted", "pdf", 30);
        assertThat(noMatch.path("items")).isEmpty();
        assertThat(list(f, noMatch.path("nextCursor").asText(), "wanted", "pdf", 30)
                        .path("items"))
                .hasSize(1);
    }

    @Test
    void currentRestrictionsTransfersAndTenantIsolationApplyOnEveryRequest() throws Exception {
        var f = fixture();
        UUID p = page(f, f.space());
        UUID ref = attachment(p, "secret.pdf", "application/pdf");
        tenants.inTenant(f.tenant(), () -> permissions.restrict(TenantAccess.page(p), Set.of(), 0));
        assertThat(list(f, null, "", "all", 30).path("items")).isEmpty();
        mvc.perform(get(f.path().replace("/attachments", "/pages/" + p + "/attachments/" + ref + "/content"))
                        .header("Authorization", f.auth()))
                .andExpect(status().isForbidden());
        tenants.inTenant(f.tenant(), () -> permissions.unrestrict(TenantAccess.page(p), 1));
        assertThat(list(f, null, "", "all", 30).path("items")).hasSize(1);
        var other = fixture();
        UUID otherPage = page(other, other.space());
        attachment(otherPage, "foreign.pdf", "application/pdf");
        assertThat(list(f, null, "", "all", 30).toString()).doesNotContain("foreign.pdf");
        mvc.perform(get(f.path()).header("Authorization", other.auth())).andExpect(status().isForbidden());
        UUID moved = createSpaceUseCase
                .createSpace(
                        f.credential(),
                        f.tenant(),
                        "Moved",
                        "authored",
                        UUID.randomUUID().toString())
                .value()
                .id();
        tenants.inTenant(f.tenant(), () -> spaceApi.transfer(p, new SpaceApi.SpaceId(moved), "moved"));
        assertThat(list(f, null, "", "all", 30).path("items")).isEmpty();
    }

    @Test
    void aBlockedCandidateQueryTimesOutInsteadOfReportingAnEmptyList() throws Exception {
        var f = fixture();
        attachment(page(f, f.space()), "locked.pdf", "application/pdf");
        try (var connection =
                java.util.Objects.requireNonNull(jdbc.getDataSource()).getConnection()) {
            connection.setAutoCommit(false);
            try (var statement = connection.createStatement()) {
                statement.execute("lock table authoring.attachments in access exclusive mode");
                mvc.perform(get(f.path()).header("Authorization", f.auth()))
                        .andExpect(status().isGatewayTimeout())
                        .andExpect(jsonPath("$.code").value("dependency_timeout"))
                        .andExpect(jsonPath("$.traceId").isNotEmpty());
            } finally {
                connection.rollback();
            }
        }
        assertThat(list(f, null, "", "all", 30).path("items")).hasSize(1);
    }

    private JsonNode list(Fixture f, String cursor, String q, String type, int limit) throws Exception {
        var request = get(f.path())
                .header("Authorization", f.auth())
                .param("q", q)
                .param("type", type)
                .param("limit", "" + limit);
        if (cursor != null) request.param("cursor", cursor);
        return json.readTree(mvc.perform(request)
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());
    }

    private UUID page(Fixture f, UUID space) {
        return tenants.inTenant(f.tenant(), () -> {
            var created = (PageApi.CreateResult.Created)
                    pages.create(PageApi.Actor.system(), PageApi.Format.MARKDOWN, "Guide");
            spaceApi.place(
                    new SpaceApi.SpaceId(space),
                    created.page().id(),
                    UUID.randomUUID().toString());
            return created.page().id();
        });
    }

    private UUID attachment(UUID page, String name, String mime) {
        UUID id = UUID.randomUUID();
        jdbc.update(
                "insert into authoring.attachments(id,page_id,filename,mime,size_bytes,storage_key,created_at) values(?,?,?,?,12,'shared-object','2026-01-01')",
                id,
                page,
                name,
                mime);
        return id;
    }

    private Fixture fixture() {
        var operator = verifiedUser();
        jdbc.update("update iam.users set platform_operator=true where id=?", operator.value());
        String email = "owner-" + UUID.randomUUID() + "@browse.test";
        var owner = ((UserApi.RegisterResult.Registered) users.register(email, "Owner")).user();
        jdbc.update("update iam.users set verified=true where id=?", owner.value());
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), "Browse", email)
                .tenant()
                .id();
        String token = credential(owner);
        UUID space = createSpaceUseCase
                .createSpace(
                        token, tenant, "Docs", "authored", UUID.randomUUID().toString())
                .value()
                .id();
        return new Fixture(tenant, space, token);
    }

    private UserApi.UserId verifiedUser() {
        var user =
                ((UserApi.RegisterResult.Registered) users.register(UUID.randomUUID() + "@browse.test", "User")).user();
        jdbc.update("update iam.users set verified=true where id=?", user.value());
        return user;
    }

    private String credential(UserApi.UserId user) {
        return ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(user.value()),
                        new SessionApi.Device("Test", "Test", "Test"),
                        "unknown"))
                .credentials()
                .accessToken();
    }

    private record Fixture(UUID tenant, UUID space, String credential) {
        String path() {
            return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/attachments";
        }

        String auth() {
            return "Bearer " + credential;
        }
    }
}
