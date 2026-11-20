package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 票 16：空间分组 HTTP 验收。组 mutation 回整棵 CollectionView；place/unplace 回 SpaceDetail。 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class CollectionManagementAcceptanceTest {
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
    ApiTokenApi apiTokens;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void createsNestsPlacesAndRemovesOnlyWhenEmpty() throws Exception {
        Fixture f = fixture("Arrange", "owner@collection-http.test");

        mvc.perform(get(f.collections()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections").isEmpty())
                .andExpect(jsonPath("$.allowedActions", containsInAnyOrder("read", "edit")));

        String replayKey = key();
        String created = mvc.perform(authed(post(f.collections()), f, replayKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"产品文档\",\"icon\":\"book\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.collections.length()").value(1))
                .andExpect(jsonPath("$.collections[0].name").value("产品文档"))
                .andExpect(jsonPath("$.collections[0].icon").value("book"))
                .andExpect(jsonPath("$.collections[0].depth").value(1))
                .andExpect(jsonPath("$.collections[0].spaceCount").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();
        mvc.perform(authed(post(f.collections()), f, replayKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"产品文档\",\"icon\":\"book\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.collections.length()").value(1));
        UUID product = UUID.fromString(
                json.readTree(created).get("collections").get(0).get("id").asText());

        String nested = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + product + "\",\"name\":\"平台\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.collections[0].children.length()").value(1))
                .andExpect(jsonPath("$.collections[0].children[0].depth").value(2))
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID platform = UUID.fromString(json.readTree(nested)
                .get("collections")
                .get(0)
                .get("children")
                .get(0)
                .get("id")
                .asText());

        mvc.perform(authed(patch(f.collections() + "/" + product), f)
                        .contentType("application/merge-patch+json")
                        .content("{\"name\":\"  产品  \",\"icon\":\"guide\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections[0].name").value("产品"))
                .andExpect(jsonPath("$.collections[0].icon").value("guide"));

        mvc.perform(authed(put(f.collections() + "/" + platform + "/spaces/" + f.alpha), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(f.alpha.toString()))
                .andExpect(jsonPath("$.collectionId").value(platform.toString()))
                .andExpect(jsonPath("$.collectionPath", org.hamcrest.Matchers.contains("产品", "平台")));

        mvc.perform(authed(put(f.collections() + "/" + product + "/spaces/" + f.alpha), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"position\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectionId").value(product.toString()))
                .andExpect(jsonPath("$.collectionPath", org.hamcrest.Matchers.contains("产品")));

        mvc.perform(get(f.collections()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections[0].spaceCount").value(1))
                .andExpect(jsonPath("$.collections[0].children[0].spaceCount").value(0));

        mvc.perform(authed(delete(f.collections() + "/" + product), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("collection_not_empty"));

        mvc.perform(authed(delete(f.collections() + "/" + platform + "/spaces/" + f.alpha), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectionId").value(product.toString()));

        mvc.perform(authed(delete(f.collections() + "/" + product + "/spaces/" + f.alpha), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectionId").value(nullValue()))
                .andExpect(jsonPath("$.collectionPath").isEmpty());
        assertThat(jdbc.queryForObject("select count(*) from authoring.spaces where id = ?", Long.class, f.alpha))
                .isEqualTo(1L);

        mvc.perform(authed(delete(f.collections() + "/" + platform), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections[0].children").isEmpty());
        mvc.perform(authed(delete(f.collections() + "/" + product), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections").isEmpty());
    }

    @Test
    void fourthLevelCycleNameAndPositionAreRejected() throws Exception {
        Fixture f = fixture("Depth", "owner@collection-depth-http.test");
        UUID parent = null;
        for (int level = 1; level <= 3; level++) {
            String body =
                    "{\"name\":\"L" + level + "\"" + (parent == null ? "" : ",\"parentId\":\"" + parent + "\"") + "}";
            String response = mvc.perform(authed(post(f.collections()), f)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isCreated())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();
            parent = deepestId(json.readTree(response).get("collections"));
        }
        mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + parent + "\",\"name\":\"L4\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("depth_exceeded"));

        String rootBody = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"父\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID root = namedId(json.readTree(rootBody).get("collections"), "父");
        String childBody = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + root + "\",\"name\":\"子\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID child = namedId(json.readTree(childBody).get("collections"), "子");
        mvc.perform(authed(post(f.collections() + "/" + root + ":move"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + child + "\",\"position\":0}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("cycle_detected"));
        mvc.perform(authed(post(f.collections() + "/" + child + ":move"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":null,\"position\":99}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("position_invalid"));
        mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"父\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("collection_name_taken"));
        mvc.perform(authed(patch(f.collections() + "/" + root), f)
                        .contentType("application/merge-patch+json")
                        .content("{}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"));
        mvc.perform(authed(post(f.collections() + "/" + UUID.randomUUID() + ":move"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":null,\"position\":0}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("collection_not_found"));
        mvc.perform(authed(put(f.collections() + "/" + root + "/spaces/" + UUID.randomUUID()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("space_not_found"));
    }

    @Test
    void listsSpacesByCollectionAndLeavesUngroupedWithoutSeq() throws Exception {
        Fixture f = fixture("Filter", "owner@collection-filter-http.test");
        String created = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"一组\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID group = UUID.fromString(
                json.readTree(created).get("collections").get(0).get("id").asText());
        mvc.perform(authed(put(f.collections() + "/" + group + "/spaces/" + f.alpha), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
        mvc.perform(authed(put(f.collections() + "/" + group + "/spaces/" + f.beta), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"position\":0}"))
                .andExpect(status().isOk());

        mvc.perform(get(f.spaces() + "?collectionId=" + group).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].id").value(f.beta.toString()))
                .andExpect(jsonPath("$.items[1].id").value(f.alpha.toString()))
                .andExpect(jsonPath("$.items[0].collectionId").value(group.toString()));
        mvc.perform(get(f.spaces() + "?collectionId=ungrouped").header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(f.gamma.toString()))
                .andExpect(jsonPath("$.items[0].collectionId").value(nullValue()));
        mvc.perform(get(f.spaces()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(3));
        mvc.perform(get(f.spaces() + "?collectionId=" + UUID.randomUUID()).header("Authorization", f.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("collection_not_found"));
    }

    @Test
    void memberCanReadButNotWriteAndMissingCollectionIsHiddenFromOtherTenants() throws Exception {
        Fixture f = fixture("Acl", "owner@collection-acl-http.test");
        String created = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"可见\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID group = UUID.fromString(
                json.readTree(created).get("collections").get(0).get("id").asText());

        UserApi.UserId reader = verifiedUser("reader@collection-acl-http.test");
        String readerCredential = credential(reader);
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant),
                () -> memberships.add(
                        MembershipApi.Group.tenant(f.tenant),
                        new MembershipApi.MemberId(reader.value()),
                        MembershipApi.Role.MEMBER));

        mvc.perform(get(f.collections()).header("Authorization", "Bearer " + readerCredential))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowedActions", hasItem("read")))
                .andExpect(jsonPath("$.allowedActions", not(hasItem("edit"))))
                .andExpect(jsonPath("$.collections[0].name").value("可见"));
        mvc.perform(authed(put(f.collections() + "/" + group + "/spaces/" + f.alpha), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
        mvc.perform(get(f.collections()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections[0].spaceCount").value(1));
        mvc.perform(get(f.collections()).header("Authorization", "Bearer " + readerCredential))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections[0].spaceCount").value(0));
        mvc.perform(post(f.collections())
                        .header("Authorization", "Bearer " + readerCredential)
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"不可\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));

        Fixture other = fixture("Other", "owner@collection-other-http.test");
        mvc.perform(authed(patch(other.collections() + "/" + group), other)
                        .contentType("application/merge-patch+json")
                        .content("{\"name\":\"偷\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("collection_not_found"));
    }

    @Test
    void movesAChildToTheRootAndRejectsAnOutOfRangePlace() throws Exception {
        Fixture f = fixture("Move", "owner@collection-move-http.test");
        String parentBody = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"产品线\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID parent = namedId(json.readTree(parentBody).get("collections"), "产品线");
        String childBody = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":\"" + parent + "\",\"name\":\"平台\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID child = namedId(json.readTree(childBody).get("collections"), "平台");
        mvc.perform(authed(post(f.collections() + "/" + child + ":move"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"parentId\":null,\"position\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections.length()").value(2))
                .andExpect(jsonPath("$.collections[0].name").value("平台"))
                .andExpect(jsonPath("$.collections[0].parentId").value(nullValue()))
                .andExpect(jsonPath("$.collections[0].depth").value(1));
        mvc.perform(authed(put(f.collections() + "/" + parent + "/spaces/" + f.alpha), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"position\":99}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("position_invalid"));
    }

    @Test
    void archivedSpaceCanBePlacedAndUnplaced() throws Exception {
        Fixture f = fixture("Archive", "owner@collection-archive-http.test");
        String created = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"归档组\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID group = UUID.fromString(
                json.readTree(created).get("collections").get(0).get("id").asText());
        archiveSpaceUseCase.archiveSpace(f.credential, f.tenant, f.alpha, key());
        mvc.perform(authed(put(f.collections() + "/" + group + "/spaces/" + f.alpha), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("archived"))
                .andExpect(jsonPath("$.collectionId").value(group.toString()));
        mvc.perform(authed(delete(f.collections() + "/" + group + "/spaces/" + f.alpha), f))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectionId").value(nullValue()))
                .andExpect(jsonPath("$.status").value("archived"));
    }

    @Test
    void tokenMayReadCollectionsButCannotWrite() throws Exception {
        Fixture f = fixture("Token", "owner@collection-token-http.test");
        mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"令牌可见\"}"))
                .andExpect(status().isCreated());
        ApiTokenApi.IssueResult.Issued issued = tenantScope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant), () -> (ApiTokenApi.IssueResult.Issued) apiTokens.issue(
                        f.owner.value(),
                        f.tenant,
                        f.alpha,
                        "Collection reader",
                        Set.of(ApiTokenApi.Scope.READ, ApiTokenApi.Scope.WRITE),
                        Instant.now().plus(1, ChronoUnit.DAYS)));
        mvc.perform(get(f.collections()).header("Authorization", "Bearer " + issued.secret()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collections[0].name").value("令牌可见"))
                .andExpect(jsonPath("$.allowedActions", hasItem("read")))
                .andExpect(jsonPath("$.allowedActions", not(hasItem("edit"))));
        mvc.perform(post(f.collections())
                        .header("Authorization", "Bearer " + issued.secret())
                        .header("Idempotency-Key", key())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"令牌不可写\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("permission_denied"));
    }

    @Test
    void deletingACollectionReplaysTheOriginalResponseAfterItIsGone() throws Exception {
        Fixture f = fixture("Replay", "owner@collection-delete-replay.test");
        String created = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Empty\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID group = namedId(json.readTree(created).get("collections"), "Empty");
        String operationKey = key();
        String original = mvc.perform(authed(delete(f.collections() + "/" + group), f, operationKey))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String replay = mvc.perform(authed(delete(f.collections() + "/" + group), f, operationKey))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(replay).isEqualTo(original);
    }

    @Test
    void placingAnExistingMemberWithoutPositionAppendsItToTheGroup() throws Exception {
        Fixture f = fixture("Append", "owner@collection-append.test");
        String created = mvc.perform(authed(post(f.collections()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ordered\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID group = namedId(json.readTree(created).get("collections"), "Ordered");
        for (UUID space : java.util.List.of(f.alpha, f.beta, f.gamma, f.alpha)) {
            mvc.perform(authed(put(f.collections() + "/" + group + "/spaces/" + space), f)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isOk());
        }
        mvc.perform(get(f.spaces() + "?collectionId=" + group).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                        "$.items[*].id",
                        org.hamcrest.Matchers.contains(f.beta.toString(), f.gamma.toString(), f.alpha.toString())));
    }

    @Test
    void concurrentFirstGroupsHaveDistinctContiguousPositions() throws Exception {
        Fixture f = fixture("Concurrent", "owner@collection-concurrent.test");
        int count = 8;
        var start = new java.util.concurrent.CountDownLatch(1);
        try (var executor = java.util.concurrent.Executors.newFixedThreadPool(count)) {
            var pending = new java.util.ArrayList<java.util.concurrent.Future<Integer>>();
            for (int i = 0; i < count; i++) {
                int index = i;
                pending.add(executor.submit(() -> {
                    start.await();
                    return mvc.perform(authed(post(f.collections()), f)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("{\"name\":\"Group " + index + "\"}"))
                            .andReturn()
                            .getResponse()
                            .getStatus();
                }));
            }
            start.countDown();
            for (var result : pending)
                assertThat(result.get(20, java.util.concurrent.TimeUnit.SECONDS))
                        .isEqualTo(201);
        }
        assertThat(jdbc.queryForList(
                        "select position from authoring.collections where tenant_id = ? order by position",
                        Integer.class,
                        f.tenant))
                .containsExactly(0, 1, 2, 3, 4, 5, 6, 7);
    }

    private static UUID deepestId(JsonNode collections) {
        JsonNode node = collections.get(0);
        while (node.has("children") && node.get("children").size() > 0) {
            node = node.get("children").get(0);
        }
        return UUID.fromString(node.get("id").asText());
    }

    private static UUID namedId(JsonNode collections, String name) {
        JsonNode found = findNamed(collections, name);
        assertThat(found).isNotNull();
        return UUID.fromString(found.get("id").asText());
    }

    private static JsonNode findNamed(JsonNode collections, String name) {
        for (JsonNode node : collections) {
            if (name.equals(node.path("name").asText())) return node;
            JsonNode nested = findNamed(node.path("children"), name);
            if (nested != null) return nested;
        }
        return null;
    }

    private Fixture fixture(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@collection-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        String cred = credential(owner);
        UUID alpha = createSpaceUseCase
                .createSpace(cred, tenant, name + " Alpha", "authored", key())
                .value()
                .id();
        UUID beta = createSpaceUseCase
                .createSpace(cred, tenant, name + " Beta", "authored", key())
                .value()
                .id();
        UUID gamma = createSpaceUseCase
                .createSpace(cred, tenant, name + " Gamma", "authored", key())
                .value()
                .id();
        return new Fixture(tenant, owner, alpha, beta, gamma, cred);
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

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record Fixture(UUID tenant, UserApi.UserId owner, UUID alpha, UUID beta, UUID gamma, String credential) {
        String collections() {
            return "/api/v1/tenants/" + tenant + "/collections";
        }

        String spaces() {
            return "/api/v1/tenants/" + tenant + "/spaces";
        }

        String authorization() {
            return "Bearer " + credential;
        }
    }
}
