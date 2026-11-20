package io.space.control.entry.http;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.release.api.ReleaseApi;
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

/** 票 19：wiki 进版 / 发布制构建 / 回滚 / 权限 HTTP 验收。 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ReleasesAcceptanceTest {
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
    PermissionApi permissions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    ReleaseApi releases;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void wikiPublishUnpublishAndTrashChangeLive() throws Exception {
        Fixture f = fixture("Wiki", "owner@wiki-publish-http.test");
        JsonNode published = publish(f, f.page);
        org.junit.jupiter.api.Assertions.assertEquals(
                "promoted", published.get("outcome").asText());
        org.junit.jupiter.api.Assertions.assertEquals(
                "published", published.get("page").get("status").asText());
        org.junit.jupiter.api.Assertions.assertEquals(
                "live", published.get("release").get("status").asText());
        UUID live = UUID.fromString(published.get("release").get("id").asText());
        mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", nullValue()))
                .andExpect(jsonPath("$.items[0].id").value(live.toString()))
                .andExpect(jsonPath("$.items[0].status").value("live"))
                .andExpect(jsonPath("$.items[0].pageCount").value(1))
                .andExpect(jsonPath("$.allowedActions", hasItem("build")));
        var bundle = snapshot(f, live);
        org.junit.jupiter.api.Assertions.assertEquals("space/1.0", bundle.generator());
        org.junit.jupiter.api.Assertions.assertEquals(
                "guide", bundle.pages().getFirst().slug());
        org.junit.jupiter.api.Assertions.assertEquals(
                f.page.toString(), bundle.pages().getFirst().externalId());

        JsonNode unpublished = unpublish(f, f.page);
        org.junit.jupiter.api.Assertions.assertEquals(
                "promoted", unpublished.get("outcome").asText());
        org.junit.jupiter.api.Assertions.assertEquals(
                "draft", unpublished.get("page").get("status").asText());
        org.junit.jupiter.api.Assertions.assertEquals(
                0, unpublished.get("release").get("pageCount").asInt());
        UUID emptyLive = UUID.fromString(unpublished.get("release").get("id").asText());
        org.junit.jupiter.api.Assertions.assertNotEquals(live, emptyLive);

        JsonNode again = publish(f, f.page);
        org.junit.jupiter.api.Assertions.assertEquals(
                "promoted", again.get("outcome").asText());
        mvc.perform(authed(post(f.resource() + ":trash"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt").isNotEmpty());
        mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("live"))
                .andExpect(jsonPath("$.items[0].pageCount").value(0));
    }

    @Test
    void republishAfterEditPromotesAndUnchangedPublishSkips() throws Exception {
        Fixture f = fixture("Skip", "owner@skip-publish-http.test");
        JsonNode first = publish(f, f.page);
        UUID live = UUID.fromString(first.get("release").get("id").asText());

        JsonNode skipped = publish(f, f.page);
        org.junit.jupiter.api.Assertions.assertEquals(
                "skipped", skipped.get("outcome").asText());
        org.junit.jupiter.api.Assertions.assertTrue(missing(skipped, "release"));
        mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(live.toString()));

        edit(f, f.page, "# Second\n", "\"rev-0\"");
        JsonNode updated = publish(f, f.page);
        org.junit.jupiter.api.Assertions.assertEquals(
                "promoted", updated.get("outcome").asText());
        org.junit.jupiter.api.Assertions.assertNotEquals(
                live.toString(), updated.get("release").get("id").asText());
        mvc.perform(get(f.releases() + "/" + updated.get("release").get("id").asText())
                        .header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("live"))
                .andExpect(jsonPath("$.pageCount").value(1))
                .andExpect(jsonPath("$.diffSummary.added").value(0))
                .andExpect(jsonPath("$.diffSummary.changed").value(0))
                .andExpect(jsonPath("$.diffSummary.removed").value(0));
        mvc.perform(get(f.releases() + "/" + live).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("archived"))
                .andExpect(jsonPath("$.diffSummary.changed").value(1));
    }

    @Test
    void restorePromotesPublishedPageBackToLive() throws Exception {
        Fixture f = fixture("Restore", "owner@restore-publish-http.test");
        publish(f, f.page);
        mvc.perform(authed(post(f.resource() + ":trash"), f)).andExpect(status().isOk());
        String liveAfterTrash = mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String emptyLive =
                json.readTree(liveAfterTrash).get("items").get(0).get("id").asText();
        org.junit.jupiter.api.Assertions.assertEquals(
                0,
                json.readTree(liveAfterTrash)
                        .get("items")
                        .get(0)
                        .get("pageCount")
                        .asInt());
        mvc.perform(authed(post(f.resource() + ":restore"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt", nullValue()))
                .andExpect(jsonPath("$.status").value("published"));
        String afterRestore = mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("live"))
                .andExpect(jsonPath("$.items[0].pageCount").value(1))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String liveId =
                json.readTree(afterRestore).get("items").get(0).get("id").asText();
        org.junit.jupiter.api.Assertions.assertNotEquals(emptyLive, liveId);
        org.junit.jupiter.api.Assertions.assertEquals(
                "guide", snapshot(f, UUID.fromString(liveId)).pages().getFirst().slug());
    }

    @Test
    void hangingPublishedPageOnTocPromotesLiveToc() throws Exception {
        Fixture f = fixture("TocLive", "owner@toc-live-publish-http.test");
        JsonNode first = publish(f, f.page);
        UUID live = UUID.fromString(first.get("release").get("id").asText());
        mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"快速开始\",\"kind\":\"target\",\"targetId\":\"" + f.page + "\"}"))
                .andExpect(status().isCreated());
        String listed = mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("live"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String nextLive = json.readTree(listed).get("items").get(0).get("id").asText();
        org.junit.jupiter.api.Assertions.assertNotEquals(live.toString(), nextLive);
        var toc = snapshot(f, UUID.fromString(nextLive)).toc();
        org.junit.jupiter.api.Assertions.assertEquals(1, toc.size());
        org.junit.jupiter.api.Assertions.assertEquals("快速开始", toc.getFirst().label());
        org.junit.jupiter.api.Assertions.assertEquals(
                ReleaseApi.TocKind.TARGET, toc.getFirst().kind());
        org.junit.jupiter.api.Assertions.assertEquals(
                f.page.toString(), toc.getFirst().ref());
    }

    @Test
    void autoReleaseOffMarksOnlyUntilBuildPromotes() throws Exception {
        Fixture f = fixture("Manual", "owner@manual-publish-http.test");
        mvc.perform(authed(patch(f.spacePath()), f)
                        .contentType("application/merge-patch+json")
                        .content("{\"autoRelease\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.autoRelease").value(false));
        JsonNode marked = publish(f, f.page);
        org.junit.jupiter.api.Assertions.assertEquals(
                "unchanged", marked.get("outcome").asText());
        org.junit.jupiter.api.Assertions.assertTrue(missing(marked, "release"));
        org.junit.jupiter.api.Assertions.assertEquals(
                "published", marked.get("page").get("status").asText());
        mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));

        String builtBody = mvc.perform(authed(post(f.releases() + ":build"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.outcome").value("promoted"))
                .andExpect(jsonPath("$.release.status").value("live"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID live = UUID.fromString(
                json.readTree(builtBody).get("release").get("id").asText());

        mvc.perform(authed(post(f.releases() + ":build"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.outcome").value("skipped"));
        mvc.perform(get(f.releases() + "/" + UUID.randomUUID()).header("Authorization", f.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("release_not_found"));
        mvc.perform(authed(post(f.releases() + "/" + live + ":rollback"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("release_not_archived"));
    }

    @Test
    void brokenLinkHoldsWhileUnpublishedTocTargetDoesNot() throws Exception {
        Fixture f = fixture("Held", "owner@held-publish-http.test");
        UUID other = createPage(f, "Other", "other");
        mvc.perform(authed(post(f.toc()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"Other\",\"kind\":\"target\",\"targetId\":\"" + other + "\"}"))
                .andExpect(status().isCreated());
        JsonNode ok = publish(f, f.page);
        org.junit.jupiter.api.Assertions.assertEquals(
                "promoted", ok.get("outcome").asText());

        edit(f, f.page, "[missing](absent-slug)\n", "\"rev-0\"");
        JsonNode held = publish(f, f.page);
        org.junit.jupiter.api.Assertions.assertEquals(
                "held", held.get("outcome").asText());
        org.junit.jupiter.api.Assertions.assertEquals(
                "published", held.get("page").get("status").asText());
        org.junit.jupiter.api.Assertions.assertEquals(
                "draft", held.get("release").get("status").asText());
        org.junit.jupiter.api.Assertions.assertEquals(
                "broken_link",
                held.get("release")
                        .get("report")
                        .get("errors")
                        .get(0)
                        .get("code")
                        .asText());
        UUID heldId = UUID.fromString(held.get("release").get("id").asText());
        UUID liveId = UUID.fromString(ok.get("release").get("id").asText());
        mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("draft"));
        mvc.perform(get(f.releases() + "/" + liveId).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("live"));
        mvc.perform(authed(post(f.releases() + "/" + liveId + ":discard"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("release_not_discardable"));
        mvc.perform(authed(post(f.releases() + "/" + heldId + ":promote"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("release_not_promotable"));
        mvc.perform(authed(post(f.releases() + "/" + heldId + ":discard"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(heldId.toString()));
        mvc.perform(authed(post(f.releases() + "/" + heldId + ":discard"), f))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("release_not_found"));
    }

    @Test
    void rollbackAndRetentionPruneArchived() throws Exception {
        Fixture f = fixture("Rollback", "owner@rollback-publish-http.test");
        JsonNode first = publish(f, f.page);
        UUID v1 = UUID.fromString(first.get("release").get("id").asText());
        edit(f, f.page, "# Two\n", "\"rev-0\"");
        JsonNode second = publish(f, f.page);
        UUID v2 = UUID.fromString(second.get("release").get("id").asText());
        mvc.perform(get(f.releases() + ":diff?from=" + v1 + "&to=" + v2).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.changed.length()").value(1));
        mvc.perform(authed(patch(f.releases() + "/" + v2), f)
                        .contentType("application/merge-patch+json")
                        .content("{\"label\":\"main\",\"notes\":\"ok\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("main"))
                .andExpect(jsonPath("$.notes").value("ok"));
        mvc.perform(authed(post(f.releases() + "/" + v1 + ":rollback"), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(v1.toString()))
                .andExpect(jsonPath("$.status").value("live"));

        mvc.perform(authed(put(f.spacePath() + "/retention"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"keep\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.retention").value(1));
        edit(f, f.page, "# Three\n", "\"rev-1\"");
        publish(f, f.page);
        edit(f, f.page, "# Four\n", "\"rev-2\"");
        publish(f, f.page);
        String listed = mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode items = json.readTree(listed).get("items");
        org.junit.jupiter.api.Assertions.assertEquals(2, items.size());
        boolean sawV1 = false;
        for (JsonNode item : items) {
            if (item.get("id").asText().equals(v1.toString())) sawV1 = true;
        }
        org.junit.jupiter.api.Assertions.assertFalse(sawV1);
        String remaining = items.get(0).get("id").asText();
        mvc.perform(authed(post(f.spacePath() + ":archive"), f)).andExpect(status().isOk());
        mvc.perform(authed(patch(f.releases() + "/" + remaining), f)
                        .contentType("application/merge-patch+json")
                        .content("{\"notes\":\"archived\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
    }

    @Test
    void syncedAuthorMissingKeyAndForeignReleaseAreFiniteOutputs() throws Exception {
        Fixture f = fixture("Acl", "owner@acl-publish-http.test");
        publish(f, f.page);

        mvc.perform(post(f.resource() + ":publish")
                        .header("Authorization", f.authorization())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_idempotency_key"));

        UUID synced = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Synced", "synced", key())
                .value()
                .id();
        UUID syncedPage = createSyncedPage(f.tenant, synced);
        mvc.perform(authed(post(pagePath(f.tenant, synced, syncedPage) + ":publish"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
        mvc.perform(authed(post(releasesPath(f.tenant, synced) + ":build"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
        mvc.perform(authed(patch("/api/v1/tenants/" + f.tenant + "/spaces/" + synced), f)
                        .contentType("application/merge-patch+json")
                        .content("{\"autoRelease\":true}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));

        UserApi.UserId author = verifiedUser("author@acl-publish-http.test");
        String authorCred = credential(author);
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant),
                () -> memberships.add(
                        MembershipApi.Group.tenant(f.tenant),
                        new MembershipApi.MemberId(author.value()),
                        MembershipApi.Role.MEMBER));
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant),
                () -> permissions.grant(
                        new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, f.space),
                        new PermissionApi.Principal(PermissionApi.PrincipalType.USER, author.value()),
                        new PermissionApi.Role("author")));
        mvc.perform(post(f.resource() + ":publish")
                        .header("Authorization", "Bearer " + authorCred)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));
        mvc.perform(post(f.resource() + ":trash")
                        .header("Authorization", "Bearer " + authorCred)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trashedAt").isNotEmpty());
        mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("live"))
                .andExpect(jsonPath("$.items[0].pageCount").value(0));
    }

    private static boolean missing(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() || value.isMissingNode();
    }

    private JsonNode publish(Fixture f, UUID page) throws Exception {
        String body = mvc.perform(authed(post(pagePath(f.tenant, f.space, page) + ":publish"), f))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", containsString("rev-")))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(body);
    }

    private JsonNode unpublish(Fixture f, UUID page) throws Exception {
        String body = mvc.perform(authed(post(pagePath(f.tenant, f.space, page) + ":unpublish"), f))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(body);
    }

    private void edit(Fixture f, UUID page, String content, String etag) throws Exception {
        mvc.perform(authed(put(pagePath(f.tenant, f.space, page) + "/content"), f)
                        .header("If-Match", etag)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":" + json.writeValueAsString(content) + "}"))
                .andExpect(status().isOk());
    }

    private UUID createPage(Fixture f, String title, String slug) throws Exception {
        String created = mvc.perform(authed(post(f.pages()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"" + title + "\",\"slug\":\"" + slug + "\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return UUID.fromString(json.readTree(created).get("id").asText());
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
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@publish-http.test");
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

    private static String releasesPath(UUID tenant, UUID space) {
        return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/releases";
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private ReleaseApi.Bundle snapshot(Fixture fixture, UUID release) {
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(fixture.tenant()),
                () -> releases.export(new ReleaseApi.ReleaseId(release)).orElseThrow());
    }

    private record Fixture(UUID tenant, UUID space, UUID page, String credential) {
        String pages() {
            return pagesPath(tenant, space);
        }

        String resource() {
            return pagePath(tenant, space, page);
        }

        String releases() {
            return releasesPath(tenant, space);
        }

        String spacePath() {
            return "/api/v1/tenants/" + tenant + "/spaces/" + space;
        }

        String toc() {
            return "/api/v1/tenants/" + tenant + "/spaces/" + space + "/toc/entries";
        }

        String authorization() {
            return "Bearer " + credential;
        }
    }
}
