package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.session.api.SessionApi;
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
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PageAuthoringAcceptanceTest {
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
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void createsEditsConflictsDiffsAndRestoresWithoutLosingHistory() throws Exception {
        TenantFixture tenant = tenant("Authoring", "owner@authoring-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Docs", "authored", key())
                .value()
                .id();
        String base = pagesPath(tenant.id(), space);
        String authorization = bearer(tenant.credential());

        String createKey = key();
        String createBody = "{\"format\":\"markdown\",\"title\":\"Guide\",\"slug\":\"Ｇuide-中文\"}";
        String createdBody = mvc.perform(post(base)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", createKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(header().string("X-Content-ETag", "\"rev-0\""))
                .andExpect(jsonPath("$.slug").value("Ｇuide-中文"))
                .andExpect(jsonPath("$.tags").isEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode created = json.readTree(createdBody);
        UUID page = UUID.fromString(created.get("id").asText());
        String resource = base + "/" + page;

        mvc.perform(post(base)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", createKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(page.toString()));

        mvc.perform(put(resource + "/content")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"# First\\n\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-ETag", "\"rev-1\""))
                .andExpect(jsonPath("$.revision").value(1));

        mvc.perform(put(resource + "/content")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"mine\"}"))
                .andExpect(status().isConflict())
                .andExpect(header().string("ETag", "\"rev-1\""))
                .andExpect(jsonPath("$.code").value("edit_conflict"))
                .andExpect(jsonPath("$.conflict.theirs").value("# First\n"));

        mvc.perform(put(resource + "/content")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-1\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"# Second\\n\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-ETag", "\"rev-2\""));

        mvc.perform(get(resource + "/revisions:diff?from=1&to=2").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hunks[0].lines[0].type").value("delete"))
                .andExpect(jsonPath("$.hunks[0].lines[1].type").value("add"));

        mvc.perform(post(resource + ":revert")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-1\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"n\":1}"))
                .andExpect(status().isConflict())
                .andExpect(header().string("ETag", "\"rev-2\""))
                .andExpect(jsonPath("$.code").value("edit_conflict"))
                .andExpect(jsonPath("$.conflict.theirs").value("# Second\n"));
        mvc.perform(get(resource + "/revisions").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));

        mvc.perform(post(resource + ":revert")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-2\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"n\":1}"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-ETag", "\"rev-3\""))
                .andExpect(jsonPath("$.content").value("# First\n"));
        mvc.perform(get(resource + "/revisions").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.items[0].note").value("restored-from:1"));
    }

    @Test
    void previewSanitizesDangerousHtmlAndModesRemainReadOnly() throws Exception {
        TenantFixture tenant = tenant("Modes", "owner@modes-http.test");
        UUID authored = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Authored", "authored", key())
                .value()
                .id();
        UUID synced = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Synced", "synced", key())
                .value()
                .id();
        String authorization = bearer(tenant.credential());

        String createdBody = mvc.perform(post(pagesPath(tenant.id(), authored))
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Archived Page\",\"slug\":\"archived\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID archivedPage = UUID.fromString(json.readTree(createdBody).get("id").asText());
        String archivedResource = pagesPath(tenant.id(), authored) + "/" + archivedPage;
        mvc.perform(put(archivedResource + "/content")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-0\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"revision one\"}"))
                .andExpect(status().isOk());

        mvc.perform(post(pagesPath(tenant.id(), authored) + ":preview")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"html\",\"content\":\"<h1>Safe</h1><script>alert(1)</script>\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.html").value("<h1>Safe</h1>"));

        mvc.perform(post(pagesPath(tenant.id(), synced))
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Blocked\",\"slug\":\"blocked\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));

        archiveSpaceUseCase.archiveSpace(tenant.credential(), tenant.id(), authored, key());
        mvc.perform(post(pagesPath(tenant.id(), authored))
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Blocked\",\"slug\":\"blocked\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));

        mvc.perform(put(archivedResource + "/content")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-1\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"blocked edit\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
        mvc.perform(post(archivedResource + ":revert")
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .header("If-Match", "\"rev-1\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"n\":1}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));

        TenantFixture other = tenant("Other Tenant", "owner-other@modes-http.test");
        mvc.perform(get(pagesPath(other.id(), authored) + "/" + archivedPage)
                        .header("Authorization", bearer(other.credential())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("page_not_found"));
    }

    @Test
    void filtersReadablePagesByTitleOrSlugFragment() throws Exception {
        TenantFixture tenant = tenant("Query", "owner@query-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Query Docs", "authored", key())
                .value()
                .id();
        String authorization = bearer(tenant.credential());
        String base = pagesPath(tenant.id(), space);

        mvc.perform(post(base)
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Guide\",\"slug\":\"guide\"}"))
                .andExpect(status().isCreated());
        mvc.perform(
                        post(base)
                                .header("Authorization", authorization)
                                .header("Idempotency-Key", key())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"format\":\"markdown\",\"title\":\"陕西考古博物馆\",\"slug\":\"shaanxi-archaeology-museum\"}"))
                .andExpect(status().isCreated());

        mvc.perform(get(base + "?q=archae").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].slug").value("shaanxi-archaeology-museum"));
        mvc.perform(get(base + "?q=GUIDE").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].slug").value("guide"));
        mvc.perform(get(base + "?q=/shaanxi").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].title").value("陕西考古博物馆"));
        mvc.perform(get(base + "?q=missing").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
        mvc.perform(get(base).header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));
        mvc.perform(get(base + "?q=" + "x".repeat(201)).header("Authorization", authorization))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"));
    }

    @Test
    void revisionFailureRollsBackThePageEditAndIdempotencyRecord() throws Exception {
        TenantFixture tenant = tenant("Rollback", "owner@rollback-http.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Rollback Docs", "authored", key())
                .value()
                .id();
        String authorization = bearer(tenant.credential());
        String createdBody = mvc.perform(post(pagesPath(tenant.id(), space))
                        .header("Authorization", authorization)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Rollback\",\"slug\":\"rollback\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID page = UUID.fromString(json.readTree(createdBody).get("id").asText());
        String resource = pagesPath(tenant.id(), space) + "/" + page;
        String editKey = key();

        jdbc.execute("""
                create or replace function authoring.reject_revision_insert() returns trigger
                language plpgsql as $$ begin raise exception 'injected revision failure'; end $$
                """);
        jdbc.execute("""
                create trigger reject_revision_insert before insert on authoring.revisions
                for each row execute function authoring.reject_revision_insert()
                """);
        try {
            mvc.perform(put(resource + "/content")
                            .header("Authorization", authorization)
                            .header("Idempotency-Key", editKey)
                            .header("If-Match", "\"rev-0\"")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"content\":\"must roll back\"}"))
                    // P0001 is an injected invariant failure, not a lost database connection.
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.code").value("unexpected_error"));
        } finally {
            jdbc.execute("drop trigger if exists reject_revision_insert on authoring.revisions");
            jdbc.execute("drop function if exists authoring.reject_revision_insert()");
        }

        mvc.perform(get(resource).header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-ETag", "\"rev-0\""))
                .andExpect(jsonPath("$.content").value(""));
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.idempotency_records where idempotency_key = ?",
                        Long.class,
                        editKey))
                .isZero();
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@authoring-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
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

    private record TenantFixture(UUID id, String credential) {}
}
