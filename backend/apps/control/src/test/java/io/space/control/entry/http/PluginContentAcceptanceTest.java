package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.pageediting.CreatePageUseCase;
import io.space.control.compositions.authoring.pageediting.EditPageUseCase;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.space.control.compositions.authoring.pageediting.RevertPageUseCase;
import io.space.control.compositions.authoring.pageediting.ViewPageUseCase;
import io.space.control.compositions.authoring.pageediting.ViewRevisionUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.releases.release.PublishPageUseCase;
import io.space.control.compositions.releases.release.ReleaseTypes;
import io.space.control.support.*;
import io.space.shared.Sha256;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PluginContentAcceptanceTest {
    static final FixturePostgres postgres = new FixturePostgres();

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) throws Exception {
        postgres.start();
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @AfterAll
    static void close() throws Exception {
        postgres.close();
    }

    @Autowired
    JdbcTemplate runtime;

    @Autowired
    MockMvc mvc;

    @Autowired
    JsonMapper json;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    MembershipApi membership;

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
    TenantScopeApi scope;

    @org.springframework.beans.factory.annotation.Autowired
    ViewPageUseCase viewPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreatePageUseCase createPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    EditPageUseCase editPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewRevisionUseCase viewRevisionUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RevertPageUseCase revertPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PublishPageUseCase publishPageUseCase;

    @Autowired
    ReleaseApi releases;

    @Autowired
    io.space.concepts.page.api.PageApi directPages;

    @Autowired
    io.space.concepts.space.api.SpaceApi directSpaces;

    @Autowired
    io.space.concepts.revision.api.RevisionApi revisions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate owner;

    @Autowired
    io.space.control.compositions.resource.ContentTypes typeBindings;

    static final String FIXTURES =
            "[{\"id\":\"plain\",\"label\":\"Plain JSON\",\"contentType\":\"json\",\"value\":\"{\\\"ok\\\":true}\"}]";

    Map<String, Object> source() {
        return Map.of(
                "files",
                Map.of("src/main.ts", "export default { id: 'demo' };"),
                "manifest",
                "{\"id\":\"dev.example\",\"name\":\"Example\",\"version\":\"1.0.0\",\"apiVersion\":1,\"contentTypes\":[\"json\"],\"editors\":[],\"renderers\":[{\"id\":\"preview\",\"label\":\"Preview\",\"tagName\":\"demo-json\",\"contentTypes\":[\"json\"]}]}",
                "configuration",
                "{}",
                "fixtures",
                FIXTURES,
                "dependencyLock",
                "{}",
                "baselineRef",
                "builtin:json@1.0.0");
    }

    @Test
    void creatingProfilesDoesNotRecordAnEmptyEdit() throws Exception {
        var f = fixture();
        UUID space = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Initial profiles", "authored", key())
                .value()
                .id();
        String pagesUrl = f.base() + "/spaces/" + space + "/pages";
        for (String type : List.of("markdown", "json-schema", "a2ui")) {
            String format = type.equals("markdown") ? "markdown" : "json";
            Map<String, String> interpretation = type.equals("a2ui")
                    ? Map.of(
                            "catalogId",
                            "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
                            "protocolVersion",
                            "v0.9.1")
                    : Map.of();
            var created = request(
                    post(pagesUrl),
                    f,
                    Map.of(
                            "format",
                            format,
                            "title",
                            type,
                            "slug",
                            type,
                            "contentType",
                            type,
                            "interpretation",
                            interpretation),
                    key(),
                    201);
            assertThat(created.path("revision").asInt())
                    .as(type + " creation baseline")
                    .isZero();
            assertThat(created.path("content").asString()).isEmpty();
            assertThat(created.path("contentType").asString()).isEqualTo(type);
            UUID id = UUID.fromString(created.path("id").asString());
            assertThat(scope.inTenant(
                            new TenantRegistryApi.TenantId(f.tenant),
                            () -> revisions.count(new io.space.concepts.revision.api.RevisionApi.ItemId(id))))
                    .isZero();
            assertThat(request(get(pagesUrl + "/" + id + "/revisions"), f, null, null, 200)
                            .path("items")
                            .size())
                    .isZero();
            var saved = request(
                    put(pagesUrl + "/" + id + "/content").header("If-Match", "\"rev-0\""),
                    f,
                    Map.of("content", "First saved source", "contentType", type, "interpretation", interpretation),
                    key(),
                    200);
            assertThat(saved.path("revision").asInt())
                    .as(type + " first content save")
                    .isEqualTo(1);
            var history = request(get(pagesUrl + "/" + id + "/revisions"), f, null, null, 200)
                    .path("items");
            assertThat(history.size()).isEqualTo(1);
            assertThat(history.get(0).path("n").asInt()).isEqualTo(1);
        }
    }

    @Test
    void immutableCandidatesAndVerificationAreTenantScopedAndIdempotent() throws Exception {
        var f = fixture();
        String base = f.base();
        String key = key();
        var body = Map.of("name", "Example", "contentType", "json", "source", source());
        var created = request(post(base + "/plugin-developments"), f, body, key, 201);
        assertThat(request(post(base + "/plugin-developments"), f, body, key, 201)
                        .path("id")
                        .asString())
                .isEqualTo(created.path("id").asString());
        String id = created.path("id").asString();
        var listedDevelopment = request(get(base + "/plugin-developments"), f, null, null, 200)
                .path("items")
                .get(0);
        assertThat(listedDevelopment.path("id").asString()).isEqualTo(id);
        assertThat(listedDevelopment.has("source")).isFalse();
        var saved = request(
                put(base + "/plugin-developments/" + id),
                f,
                Map.of("baseRevision", 1, "name", "Edited", "contentType", "json", "source", source()),
                key(),
                200);
        request(
                put(base + "/plugin-developments/" + id),
                f,
                Map.of("baseRevision", 1, "name", "Stale", "contentType", "json", "source", source()),
                key(),
                409);
        var candidate = request(
                post(base + "/plugin-developments/" + id + "/candidates"),
                f,
                Map.of(
                        "baseRevision",
                        2,
                        "sourceDigest",
                        saved.path("sourceDigest").asString(),
                        "entryPoint",
                        "src/main.ts",
                        "bundle",
                        "export default { id: 'demo' };",
                        "environment",
                        "browser-es2022-v1"),
                key(),
                201);
        assertThat(candidate.path("bundleDigest").asString())
                .isEqualTo(Sha256.hex(candidate.path("bundle").asString()));
        var listedCandidate = request(get(base + "/plugin-developments/" + id + "/candidates"), f, null, null, 200)
                .path("items")
                .get(0);
        assertThat(listedCandidate.path("id").asString())
                .isEqualTo(candidate.path("id").asString());
        assertThat(listedCandidate.has("source")).isFalse();
        assertThat(listedCandidate.has("bundle")).isFalse();
        var detail = request(
                get(base + "/plugin-developments/" + id + "/candidates/"
                        + candidate.path("id").asString()),
                f,
                null,
                null,
                200);
        assertThat(detail.path("bundle").asString())
                .isEqualTo(candidate.path("bundle").asString());
        assertThat(detail.path("source").path("fixtures").asString()).isEqualTo(FIXTURES);
        assertThatThrownBy(() -> scope.inTenant(
                        new TenantRegistryApi.TenantId(f.tenant),
                        () -> runtime.update(
                                "update shared.plugin_candidates set payload=payload where id=?",
                                UUID.fromString(candidate.path("id").asString()))))
                .isInstanceOf(org.springframework.dao.DataAccessException.class);

        request(
                put(base + "/plugin-developments/" + id),
                f,
                Map.of("baseRevision", 2, "name", "After candidate", "contentType", "json", "source", source()),
                key(),
                200);
        var report = request(
                post(base + "/plugin-verifications"),
                f,
                Map.of(
                        "developmentId",
                        id,
                        "candidateId",
                        candidate.path("id").asString(),
                        "fixtureDigest",
                        Sha256.hex(FIXTURES),
                        "environment",
                        "browser-es2022-v1",
                        "browserEvidence",
                        Map.of("passed", true, "checks", List.of(Map.of("name", "browser preview", "passed", true)))),
                key(),
                201);
        assertThat(report.path("productionEligible").asBoolean()).isFalse();
        assertThat(report.path("browserEvidence").path("passed").asBoolean()).isTrue();
        assertThat(report.path("serverValidation").path("passed").asBoolean()).isTrue();
        var manyChecks = java.util.stream.IntStream.range(0, 101)
                .mapToObj(index -> Map.of("name", "browser check " + index, "passed", true))
                .toList();
        var manyReport = request(
                post(base + "/plugin-verifications"),
                f,
                Map.of(
                        "developmentId",
                        id,
                        "candidateId",
                        candidate.path("id").asString(),
                        "fixtureDigest",
                        Sha256.hex(FIXTURES),
                        "environment",
                        "browser-es2022-v1",
                        "browserEvidence",
                        Map.of("passed", true, "checks", manyChecks)),
                key(),
                201);
        assertThat(manyReport.path("browserEvidence").path("checks").size()).isEqualTo(101);
        var reportSummary = request(get(base + "/plugin-verifications").param("developmentId", id), f, null, null, 200)
                .path("items")
                .get(0);
        assertThat(reportSummary.has("browserEvidence")).isFalse();
        assertThat(reportSummary.has("serverValidation")).isFalse();
        assertThat(reportSummary.path("browserPassed").asBoolean()).isTrue();
        assertThat(reportSummary.path("serverPassed").asBoolean()).isTrue();
        var storedReport = request(
                get(base + "/plugin-verifications/" + manyReport.path("id").asString()), f, null, null, 200);
        assertThat(storedReport.path("browserEvidence").path("checks").size()).isEqualTo(101);
        var another = fixture();
        mvc.perform(get(another.base() + "/plugin-developments/" + id).header("Authorization", another.authorization()))
                .andExpect(status().isNotFound());
        assertThat(request(get(another.base() + "/plugin-developments"), another, null, null, 200)
                        .path("items")
                        .size())
                .isZero();
        scope.inTenant(new TenantRegistryApi.TenantId(another.tenant), () -> {
            assertThat(runtime.queryForObject(
                            "select count(*) from shared.plugin_candidates where id=?",
                            Integer.class,
                            UUID.fromString(candidate.path("id").asString())))
                    .isZero();
            return null;
        });
        request(
                post(base + "/plugin-verifications"),
                f,
                Map.of(
                        "developmentId",
                        id,
                        "candidateId",
                        candidate.path("id").asString(),
                        "fixtureDigest",
                        "forged",
                        "environment",
                        "browser-es2022-v1",
                        "browserEvidence",
                        Map.of("passed", true, "checks", List.of())),
                key(),
                422);
        request(
                post(base + "/plugin-verifications"),
                f,
                Map.of(
                        "developmentId",
                        id,
                        "candidateId",
                        candidate.path("id").asString(),
                        "fixtureDigest",
                        Sha256.hex(FIXTURES),
                        "environment",
                        "browser-es2022-v1",
                        "browserEvidence",
                        Map.of("passed", true, "checks", Arrays.asList((Object) null))),
                key(),
                422);
    }

    @Test
    void idempotencyUsesStructuredSourceRatherThanAmbiguousMapText() throws Exception {
        var f = fixture();
        String key = key();
        var one = new LinkedHashMap<String, String>();
        one.put("a", "x, b=y");
        var two = new LinkedHashMap<String, String>();
        two.put("a", "x");
        two.put("b", "y");
        assertThat(one.toString()).isEqualTo(two.toString());
        var original = new HashMap<>(source());
        original.put("files", one);
        var changed = new HashMap<>(source());
        changed.put("files", two);
        request(
                post(f.base() + "/plugin-developments"),
                f,
                Map.of("name", "Stable fingerprint", "contentType", "json", "source", original),
                key,
                201);
        request(
                post(f.base() + "/plugin-developments"),
                f,
                Map.of("name", "Stable fingerprint", "contentType", "json", "source", changed),
                key,
                409);
    }

    @Test
    void verificationUsesTheBrowserConfigurationPrecedenceAndRejectsTrailingMetadata() throws Exception {
        var f = fixture();
        var malformed = new HashMap<>(source());
        malformed.put("configuration", "{} {}");
        request(
                post(f.base() + "/plugin-developments"),
                f,
                Map.of("name", "Invalid metadata", "contentType", "json", "source", malformed),
                key(),
                422);
        for (int variant : List.of(0, 1, 2)) {
            var source = new HashMap<>(source());
            var manifest = json.readTree((String) source.get("manifest"));
            ((tools.jackson.databind.node.ObjectNode) manifest.path("renderers").get(0))
                    .set("config", json.readTree("{\"schema\":{\"type\":\"number\"}}"));
            source.put("manifest", json.writeValueAsString(manifest));
            source.put("configuration", "{\"schema\":{\"type\":\"string\"}}");
            String fixtures = "[{\"id\":\"number\",\"label\":\"Number\",\"contentType\":\"json\",\"value\":\"42\""
                    + (variant > 0 ? ",\"config\":{\"schema\":{\"type\":\"number\"}}" : "")
                    + (variant == 2 ? ",\"interpretation\":{}" : "") + "}]";
            source.put("fixtures", fixtures);
            var d = request(
                    post(f.base() + "/plugin-developments"),
                    f,
                    Map.of("name", "Configuration precedence", "contentType", "json", "source", source),
                    key(),
                    201);
            var c = request(
                    post(f.base() + "/plugin-developments/" + d.path("id").asString() + "/candidates"),
                    f,
                    Map.of(
                            "baseRevision",
                            1,
                            "sourceDigest",
                            d.path("sourceDigest").asString(),
                            "entryPoint",
                            "src/main.ts",
                            "bundle",
                            "void 0;",
                            "environment",
                            "browser-es2022-v1"),
                    key(),
                    201);
            var report = request(
                    post(f.base() + "/plugin-verifications"),
                    f,
                    Map.of(
                            "developmentId",
                            d.path("id").asString(),
                            "candidateId",
                            c.path("id").asString(),
                            "fixtureDigest",
                            Sha256.hex(fixtures),
                            "environment",
                            "browser-es2022-v1",
                            "browserEvidence",
                            Map.of("passed", true, "checks", List.of())),
                    key(),
                    201);
            assertThat(report.path("browserEvidence").path("passed").asBoolean())
                    .isTrue();
            assertThat(report.path("serverValidation").path("passed").asBoolean())
                    .isEqualTo(variant == 1);
        }
    }

    @Test
    void legacyRevisionWithoutProfileRestoresItsDefaultType() {
        var f = fixture();
        UUID space = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Legacy", "authored", key())
                .value()
                .id();
        var pageId = scope.inTenant(new TenantRegistryApi.TenantId(f.tenant), () -> {
            var created = (io.space.concepts.page.api.PageApi.CreateResult.Created) directPages.create(
                    io.space.concepts.page.api.PageApi.Actor.system(),
                    io.space.concepts.page.api.PageApi.Format.JSON,
                    "Legacy");
            var id =
                    new io.space.concepts.page.api.PageApi.PageId(created.page().id());
            directPages.edit(id, "{legacy", 0, io.space.concepts.page.api.PageApi.Actor.system());
            directSpaces.place(new io.space.concepts.space.api.SpaceApi.SpaceId(space), id.value(), "legacy.json");
            revisions.record(
                    new io.space.concepts.revision.api.RevisionApi.ItemId(id.value()),
                    1,
                    "{legacy",
                    new io.space.concepts.revision.api.RevisionApi.Actor(
                            io.space.concepts.revision.api.RevisionApi.ActorType.SYSTEM, null),
                    null);
            return id.value();
        });
        var dedicated = editPageUseCase
                .editPage(
                        f.credential,
                        f.tenant,
                        space,
                        pageId,
                        "{}",
                        1,
                        key(),
                        new io.space.content.ContentProfile("json-schema", null, null, null))
                .value();
        assertThat(viewRevisionUseCase
                        .viewRevision(f.credential, f.tenant, space, pageId, 1)
                        .contentType())
                .isEqualTo("json");
        var restored = revertPageUseCase
                .revertPage(f.credential, f.tenant, space, pageId, 1, dedicated.revision(), key())
                .value();
        assertThat(restored.contentType()).isEqualTo("json");
        assertThat(restored.content()).isEqualTo("{legacy");
    }

    @Test
    void ordinaryMembersCanReadCatalogButCannotWriteDevelopment() throws Exception {
        var f = fixture();
        var user = verified();
        scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant),
                () -> membership.add(
                        MembershipApi.Group.tenant(f.tenant),
                        new MembershipApi.MemberId(user.value()),
                        MembershipApi.Role.MEMBER));
        var member = new Fixture(f.tenant, credential(user));
        var catalog = request(get(f.base() + "/content-plugins"), member, null, null, 200);
        assertThat(catalog.path("canDevelop").asBoolean()).isFalse();
        request(
                post(f.base() + "/plugin-developments"),
                member,
                Map.of("name", "Denied", "contentType", "json", "source", source()),
                key(),
                403);
    }

    @Test
    void interpretationSharesTheContentBaselineAndInvalidDedicatedDraftNeverReplacesLive() throws Exception {
        var f = fixture();
        UUID space = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Content", "authored", key())
                .value()
                .id();
        var created = createPageUseCase
                .createPage(f.credential, f.tenant, space, "json", "Structured", "schema.json", key())
                .value();
        var ordinary = editPageUseCase
                .editPage(f.credential, f.tenant, space, created.id(), "{draft", 0, key())
                .value();
        publishPageUseCase.publishPage(f.credential, f.tenant, space, created.id(), key());
        UUID live = scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant),
                () -> releases.live(new ReleaseApi.ScopeId(space)).orElseThrow().id());
        var profile = new io.space.content.ContentProfile("json-schema", null, null, null);
        var invalid = editPageUseCase
                .editPage(f.credential, f.tenant, space, created.id(), "{draft", ordinary.revision(), key(), profile)
                .value();
        assertThat(invalid.contentType()).isEqualTo("json-schema");
        assertThat(viewRevisionUseCase
                        .viewRevision(f.credential, f.tenant, space, created.id(), invalid.revision())
                        .contentType())
                .isEqualTo("json-schema");
        String contentUrl = f.base() + "/spaces/" + space + "/pages/" + created.id() + "/content";
        var conflict = request(
                put(contentUrl).header("If-Match", "\"rev-" + ordinary.revision() + "\""),
                f,
                Map.of("content", "{}", "contentType", "json"),
                key(),
                409);
        assertThat(conflict.path("conflict").path("currentContentType").asString())
                .isEqualTo("json-schema");
        request(
                put(contentUrl).header("If-Match", "\"rev-" + invalid.revision() + "\""),
                f,
                Map.of("content", "{}", "contentType", " "),
                key(),
                422);
        request(
                put(contentUrl).header("If-Match", "\"rev-" + invalid.revision() + "\""),
                f,
                Map.of("content", "{}", "interpretation", Map.of("schema", "{}")),
                key(),
                422);
        assertThat(publishPageUseCase
                        .publishPage(f.credential, f.tenant, space, created.id(), key())
                        .value()
                        .outcome())
                .isEqualTo(ReleaseTypes.Outcome.HELD);
        assertThat(scope.inTenant(
                        new TenantRegistryApi.TenantId(f.tenant),
                        () -> releases.live(new ReleaseApi.ScopeId(space))
                                .orElseThrow()
                                .id()))
                .isEqualTo(live);
        assertThatThrownBy(() -> editPageUseCase.editPage(
                        f.credential,
                        f.tenant,
                        space,
                        created.id(),
                        "{}",
                        ordinary.revision(),
                        key(),
                        io.space.content.ContentProfile.defaults("json")))
                .isInstanceOf(PageEditingTypes.EditConflictException.class);
        var valid = editPageUseCase
                .editPage(
                        f.credential,
                        f.tenant,
                        space,
                        created.id(),
                        "{\"type\":\"object\"}",
                        invalid.revision(),
                        key(),
                        profile)
                .value();
        publishPageUseCase.publishPage(f.credential, f.tenant, space, created.id(), key());
        var frozen = scope.inTenant(new TenantRegistryApi.TenantId(f.tenant), () -> {
            var version = releases.live(new ReleaseApi.ScopeId(space)).orElseThrow();
            return releases.export(new ReleaseApi.ReleaseId(version.id())).orElseThrow();
        });
        assertThat(frozen.pages().getFirst().contentProfile()).isEqualTo(valid.contentProfile());
        var restored = revertPageUseCase
                .revertPage(f.credential, f.tenant, space, created.id(), ordinary.revision(), valid.revision(), key())
                .value();
        assertThat(restored.contentType()).isEqualTo("json");
        assertThat(restored.content()).isEqualTo("{draft");
    }

    @Test
    void invalidSyncedHotfixRollsBackBothSourceAndInterpretation() {
        var f = fixture();
        UUID space = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Synced", "synced", key())
                .value()
                .id();
        var profile = new io.space.content.ContentProfile("json-schema", null, null, null);
        var pageId = scope.inTenant(new TenantRegistryApi.TenantId(f.tenant), () -> {
            var created = (io.space.concepts.page.api.PageApi.CreateResult.Created) directPages.create(
                    io.space.concepts.page.api.PageApi.Actor.system(),
                    io.space.concepts.page.api.PageApi.Format.JSON,
                    "Schema");
            var id =
                    new io.space.concepts.page.api.PageApi.PageId(created.page().id());
            var saved = (io.space.concepts.page.api.PageApi.EditResult.Edited) directPages.edit(
                    id, "{\"type\":\"object\"}", 0, io.space.concepts.page.api.PageApi.Actor.system(), profile);
            directSpaces.place(new io.space.concepts.space.api.SpaceApi.SpaceId(space), id.value(), "schema.json");
            revisions.record(
                    new io.space.concepts.revision.api.RevisionApi.ItemId(id.value()),
                    1,
                    saved.page().content(),
                    new io.space.concepts.revision.api.RevisionApi.Actor(
                            io.space.concepts.revision.api.RevisionApi.ActorType.SYSTEM, null),
                    null,
                    profile);
            var snapshot = new ReleaseApi.PageSnapshot(
                    id.value(),
                    "schema.json",
                    "Schema",
                    ReleaseApi.Format.JSON,
                    saved.page().content(),
                    "schema.json",
                    ReleaseApi.Seo.empty(),
                    null,
                    Map.of(),
                    id.value().toString(),
                    List.of(),
                    0,
                    profile);
            var release = releases.draft(
                    new ReleaseApi.ScopeId(space), new ReleaseApi.Source(ReleaseApi.SourceKind.IMPORT, "test", null));
            var rid = new ReleaseApi.ReleaseId(release.id());
            releases.load(
                    rid,
                    new ReleaseApi.Bundle(
                            "1.0",
                            "test",
                            java.time.Instant.EPOCH,
                            List.of(snapshot),
                            List.of(),
                            Map.of("schema.json", ReleaseApi.checksum(snapshot.content()))));
            releases.validate(rid, List.of());
            releases.promote(rid);
            return id.value();
        });
        assertThatThrownBy(
                        () -> editPageUseCase.editPage(f.credential, f.tenant, space, pageId, "{", 1, key(), profile))
                .isInstanceOf(io.space.control.compositions.resource.InvalidBundleException.class);
        var restored = viewPageUseCase.viewPage(f.credential, f.tenant, space, pageId);
        assertThat(restored.content()).isEqualTo("{\"type\":\"object\"}");
        assertThat(restored.revision()).isEqualTo(1);
        assertThat(restored.contentType()).isEqualTo("json-schema");
    }

    @Test
    void contentTypesPersistImmutableVersionsAndTenantStateWithoutReadSideWrites() throws Exception {
        var f = fixture();
        String base = f.base() + "/content-types";
        var initial = request(get(base), f, null, null, 200);
        assertThat(initial.path("items").size()).isEqualTo(7);
        assertThat(owner.queryForObject(
                        "select count(*) from shared.content_types where tenant_id=?", Integer.class, f.tenant))
                .isZero();
        var builtin = java.util.stream.StreamSupport.stream(
                        initial.path("items").spliterator(), false)
                .filter(x -> x.path("contentType").asString().equals("markdown"))
                .findFirst()
                .orElseThrow();
        var detail = request(
                get(base + "/versions/" + builtin.path("activeVersionRef").asString()), f, null, null, 200);
        if (builtin.path("contentType").asString().equals("markdown"))
            assertThat(detail.path("definition").path("schemaResources").isEmpty())
                    .isTrue();
        var definition = demoDefinition(f, "1.0.0");
        String idempotencyKey = key();
        var first = request(
                post(base + "/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 0, "definition", definition),
                idempotencyKey,
                201);
        var replay = request(
                post(base + "/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 0, "definition", definition),
                idempotencyKey,
                201);
        assertThat(replay).isEqualTo(first);
        String v1 = first.path("versionRef").asString();
        request(
                post(base + "/activate"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 0, "versionRef", v1),
                key(),
                409);
        var second = request(
                post(base + "/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 1, "definition", demoDefinition(f, "2.0.0")),
                key(),
                201);
        var listed = request(get(base), f, null, null, 200);
        var state = java.util.stream.StreamSupport.stream(listed.path("items").spliterator(), false)
                .filter(x -> x.path("contentType").asString().equals("demo-card"))
                .findFirst()
                .orElseThrow();
        assertThat(state.path("activeVersionRef").asString()).isEqualTo(v1);
        assertThat(state.path("revision").asInt()).isEqualTo(2);
        request(
                post(base + "/activate"),
                f,
                Map.of(
                        "contentType",
                        "demo-card",
                        "baseRevision",
                        2,
                        "versionRef",
                        second.path("versionRef").asString()),
                key(),
                200);
        var disabled = request(
                post(base + "/deactivate"), f, Map.of("contentType", "demo-card", "baseRevision", 3), key(), 200);
        assertThat(disabled.path("enabled").asBoolean()).isFalse();
        assertThat(disabled.path("revision").asInt()).isEqualTo(4);
        var versions = request(get(base + "/versions").param("contentType", "demo-card"), f, null, null, 200);
        assertThat(versions.path("items").size()).isEqualTo(2);
        assertThat(versions.path("items").get(0).has("definition")).isFalse();
        assertThat(request(get(base + "/versions/" + v1), f, null, null, 200)
                        .path("definition")
                        .path("version")
                        .asString())
                .isEqualTo("1.0.0");
        assertThatThrownBy(() -> owner.update(
                        "update shared.content_type_versions set payload=payload where id=?", UUID.fromString(v1)))
                .isInstanceOf(org.springframework.dao.DataAccessException.class);
        var another = fixture();
        request(get(another.base() + "/content-types/versions/" + v1), another, null, null, 404);
        scope.inTenant(new TenantRegistryApi.TenantId(another.tenant), () -> {
            assertThat(runtime.queryForObject(
                            "select count(*) from shared.content_type_versions where id=?",
                            Integer.class,
                            UUID.fromString(v1)))
                    .isZero();
            return null;
        });
        var memberId = verified();
        scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant),
                () -> membership.add(
                        MembershipApi.Group.tenant(f.tenant),
                        new MembershipApi.MemberId(memberId.value()),
                        MembershipApi.Role.MEMBER));
        var member = new Fixture(f.tenant, credential(memberId));
        assertThat(request(get(base), member, null, null, 200).path("canManage").asBoolean())
                .isFalse();
        request(post(base + "/deactivate"), member, Map.of("contentType", "demo-card", "baseRevision", 4), key(), 403);
        var unsafe = demoDefinition(f, "3.0.0");
        ((tools.jackson.databind.node.ObjectNode) unsafe.path("renderers").get(0)).put("pluginId", "untrusted.remote");
        request(
                post(base + "/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 4, "definition", unsafe),
                key(),
                422);
    }

    @Test
    void customInterpretationAndFrozenDefinitionKeepTheirVersionAfterSwitchAndDisable() throws Exception {
        var f = fixture();
        String base = f.base() + "/content-types";
        var first = request(
                post(base + "/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 0, "definition", demoDefinition(f, "1.0.0")),
                key(),
                201);
        String reference = first.path("versionRef").asString();
        UUID space = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Typed", "authored", key())
                .value()
                .id();
        var settings = json.readTree("{\"nested\":{\"values\":[1,true,null,\"ok\"]},\"schema\":null}");
        var page = request(
                post(f.base() + "/spaces/" + space + "/pages"),
                f,
                Map.of(
                        "format",
                        "json",
                        "title",
                        "Demo",
                        "slug",
                        "demo.json",
                        "contentType",
                        "demo-card",
                        "versionRef",
                        reference,
                        "interpretation",
                        settings),
                key(),
                201);
        UUID id = UUID.fromString(page.path("id").asString());
        String contentUrl = f.base() + "/spaces/" + space + "/pages/" + id + "/content";
        var saved = request(
                put(contentUrl).header("If-Match", "\"rev-0\""),
                f,
                Map.of(
                        "content",
                        "{\"title\":\"One\"}",
                        "contentType",
                        "demo-card",
                        "versionRef",
                        reference,
                        "interpretation",
                        settings),
                key(),
                200);
        assertThat(saved.path("interpretation")).isEqualTo(settings);
        assertThat(publishPageUseCase
                        .publishPage(f.credential, f.tenant, space, id, key())
                        .value()
                        .outcome())
                .isNotEqualTo(ReleaseTypes.Outcome.HELD);
        var frozen = scope.inTenant(new TenantRegistryApi.TenantId(f.tenant), () -> {
            var live = releases.live(new ReleaseApi.ScopeId(space)).orElseThrow();
            return releases.export(new ReleaseApi.ReleaseId(live.id()))
                    .orElseThrow()
                    .pages()
                    .getFirst();
        });
        assertThat(frozen.contentTypeDefinition().versionRef()).isEqualTo(reference);
        assertThat(frozen.contentTypeDefinition().digest())
                .isEqualTo(first.path("digest").asString());
        assertThat(frozen.contentProfile().interpretation().get("nested")).isInstanceOf(Map.class);
        var next = request(
                post(base + "/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 1, "definition", demoDefinition(f, "2.0.0")),
                key(),
                201);
        request(
                post(base + "/activate"),
                f,
                Map.of(
                        "contentType",
                        "demo-card",
                        "baseRevision",
                        2,
                        "versionRef",
                        next.path("versionRef").asString()),
                key(),
                200);
        request(post(base + "/deactivate"), f, Map.of("contentType", "demo-card", "baseRevision", 3), key(), 200);
        request(
                post(f.base() + "/spaces/" + space + "/pages"),
                f,
                Map.of(
                        "format",
                        "json",
                        "title",
                        "Denied",
                        "slug",
                        "denied.json",
                        "contentType",
                        "demo-card",
                        "versionRef",
                        reference),
                key(),
                422);
        var old = viewPageUseCase.viewPage(f.credential, f.tenant, space, id);
        assertThat(old.versionRef()).isEqualTo(reference);
        editPageUseCase.editPage(f.credential, f.tenant, space, id, "{\"title\":\"Two\"}", old.revision(), key());
        assertThat(publishPageUseCase
                        .publishPage(f.credential, f.tenant, space, id, key())
                        .value()
                        .outcome())
                .isNotEqualTo(ReleaseTypes.Outcome.HELD);
        assertThat(viewRevisionUseCase
                        .viewRevision(f.credential, f.tenant, space, id, 1)
                        .versionRef())
                .isEqualTo(reference);
        editPageUseCase.editPage(f.credential, f.tenant, space, id, "{}", 2, key());
        assertThat(publishPageUseCase
                        .publishPage(f.credential, f.tenant, space, id, key())
                        .value()
                        .outcome())
                .isEqualTo(ReleaseTypes.Outcome.HELD);
    }

    @Test
    void externalFrozenDefinitionsRebindLocallyAndDisabledTypesOnlyBlockNewBindings() throws Exception {
        var f = fixture();
        var registered = request(
                post(f.base() + "/content-types/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 0, "definition", demoDefinition(f, "1.0.0")),
                key(),
                201);
        var version = json.treeToValue(
                registered, io.space.control.compositions.platform.contenttype.ContentTypeTypes.Version.class);
        var external = new io.space.content.ContentTypeSnapshot(
                UUID.randomUUID().toString(), version.digest(), version.definition());
        var profile = new io.space.content.ContentProfile(
                "demo-card", external.versionRef(), Map.of("arbitrary", List.of(1, true)));
        UUID targetSpace = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Import binding", "authored", key())
                .value()
                .id();
        var target = createPageUseCase
                .createPage(
                        f.credential,
                        f.tenant,
                        targetSpace,
                        "json",
                        "Existing",
                        "existing.json",
                        key(),
                        new io.space.content.ContentProfile("demo-card", version.versionRef(), Map.of()))
                .value();
        var page = new ReleaseApi.PageSnapshot(
                target.id(),
                "demo.json",
                "Demo",
                ReleaseApi.Format.JSON,
                "{\"title\":\"Imported\"}",
                "demo.json",
                ReleaseApi.Seo.empty(),
                null,
                Map.of(),
                "demo",
                List.of(),
                0,
                profile,
                external);
        var bundle = new ReleaseApi.Bundle(
                ReleaseApi.BUNDLE_VERSION,
                "test",
                java.time.Instant.EPOCH,
                List.of(page),
                List.of(),
                Map.of("demo.json", ReleaseApi.checksum(page.content())));
        var rebound = scope.inTenant(new TenantRegistryApi.TenantId(f.tenant), () -> typeBindings.imported(bundle))
                .pages()
                .getFirst();
        assertThat(rebound.contentProfile().versionRef()).isEqualTo(version.versionRef());
        assertThat(rebound.contentTypeDefinition().versionRef()).isEqualTo(version.versionRef());
        assertThat(rebound.contentProfile().interpretation()).isEqualTo(profile.interpretation());
        var another = fixture();
        assertThatThrownBy(() -> scope.inTenant(
                        new TenantRegistryApi.TenantId(another.tenant), () -> typeBindings.imported(bundle)))
                .isInstanceOf(io.space.control.compositions.resource.ContentTypes.Invalid.class);
        request(
                post(f.base() + "/content-types/deactivate"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 1),
                key(),
                200);
        var other = new ReleaseApi.PageSnapshot(
                UUID.randomUUID(),
                "other.json",
                "Other",
                ReleaseApi.Format.JSON,
                "{}",
                "other.json",
                ReleaseApi.Seo.empty(),
                null,
                Map.of(),
                "other",
                List.of(),
                1);
        var aggregate = new ReleaseApi.Bundle(
                bundle.bundleVersion(),
                bundle.generator(),
                bundle.generatedAt(),
                List.of(page, other),
                bundle.toc(),
                bundle.checksums());
        assertThat(scope.inTenant(new TenantRegistryApi.TenantId(f.tenant), () -> typeBindings.imported(aggregate))
                        .pages())
                .hasSize(2);
        var copied = new ReleaseApi.PageSnapshot(
                UUID.randomUUID(),
                page.slug(),
                page.title(),
                page.format(),
                page.content(),
                page.contentPath(),
                page.seo(),
                page.icon(),
                page.properties(),
                page.externalId(),
                page.attachments(),
                0,
                page.contentProfile(),
                page.contentTypeDefinition());
        var newBinding = new ReleaseApi.Bundle(
                bundle.bundleVersion(),
                bundle.generator(),
                bundle.generatedAt(),
                List.of(copied),
                bundle.toc(),
                bundle.checksums());
        assertThatThrownBy(() -> scope.inTenant(
                        new TenantRegistryApi.TenantId(f.tenant), () -> typeBindings.imported(newBinding)))
                .isInstanceOf(io.space.control.compositions.resource.ContentTypes.Invalid.class);
    }

    @Test
    void explicitRebindingAppliesNewDefaultsButOrdinaryEditsPreserveClearedValues() throws Exception {
        var f = fixture();
        var definition = demoDefinition(f, "1.0.0");
        definition.putObject("defaultInterpretation").put("preset", "new-binding");
        var registered = request(
                post(f.base() + "/content-types/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 0, "definition", definition),
                key(),
                201);
        UUID space = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Defaults", "authored", key())
                .value()
                .id();
        var plain = createPageUseCase
                .createPage(f.credential, f.tenant, space, "json", "Defaults", "defaults.json", key())
                .value();
        String ref = registered.path("versionRef").asString();
        var rebound = editPageUseCase
                .editPage(
                        f.credential,
                        f.tenant,
                        space,
                        plain.id(),
                        "{\"title\":\"Bound\"}",
                        0,
                        key(),
                        new io.space.content.ContentProfile("demo-card", ref, Map.of()))
                .value();
        assertThat(rebound.interpretation()).containsEntry("preset", "new-binding");
        var cleared = editPageUseCase
                .editPage(
                        f.credential,
                        f.tenant,
                        space,
                        plain.id(),
                        rebound.content(),
                        1,
                        key(),
                        new io.space.content.ContentProfile("demo-card", ref, Map.of()))
                .value();
        assertThat(cleared.interpretation()).isEmpty();
    }

    @Test
    void directoryKeepsMaterializedBuiltinStateAfterMoreThanOneHundredTypes() throws Exception {
        var f = fixture();
        String base = f.base() + "/content-types";
        var directory = request(get(base), f, null, null, 200);
        String txt = java.util.stream.StreamSupport.stream(
                        directory.path("items").spliterator(), false)
                .filter(x -> x.path("contentType").asString().equals("txt"))
                .findFirst()
                .orElseThrow()
                .path("activeVersionRef")
                .asString();
        var template = (tools.jackson.databind.node.ObjectNode)
                request(get(base + "/versions/" + txt), f, null, null, 200).path("definition");
        for (int i = 0; i < 101; i++) {
            String id = "custom-" + i;
            var d = template.deepCopy();
            d.put("id", id);
            request(
                    post(base + "/versions"),
                    f,
                    Map.of("contentType", id, "baseRevision", 0, "definition", d),
                    key(),
                    201);
        }
        request(post(base + "/deactivate"), f, Map.of("contentType", "xml", "baseRevision", 0), key(), 200);
        String jsonRef = java.util.stream.StreamSupport.stream(
                        directory.path("items").spliterator(), false)
                .filter(x -> x.path("contentType").asString().equals("json"))
                .findFirst()
                .orElseThrow()
                .path("activeVersionRef")
                .asString();
        var definition = (tools.jackson.databind.node.ObjectNode)
                request(get(base + "/versions/" + jsonRef), f, null, null, 200).path("definition");
        definition.put("version", "2.0.0");
        var selected = request(
                post(base + "/versions"),
                f,
                Map.of("contentType", "json", "baseRevision", 0, "definition", definition),
                key(),
                201);
        var result = request(get(base), f, null, null, 200);
        assertThat(result.path("items").size()).isEqualTo(108);
        var xml = java.util.stream.StreamSupport.stream(result.path("items").spliterator(), false)
                .filter(x -> x.path("contentType").asString().equals("xml"))
                .findFirst()
                .orElseThrow();
        assertThat(xml.path("enabled").asBoolean()).isFalse();
        assertThat(xml.path("revision").asInt()).isEqualTo(1);
        UUID space = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "Default", "authored", key())
                .value()
                .id();
        var page = createPageUseCase
                .createPage(f.credential, f.tenant, space, "json", "Selected", "selected.json", key())
                .value();
        assertThat(page.versionRef()).isEqualTo(selected.path("versionRef").asString());
    }

    @Test
    void revisionRestoreChecksOnlyChangedBindingsAndKeepsHistoricalConfiguration() throws Exception {
        var f = fixture();
        String base = f.base() + "/content-types";
        var v1 = request(
                        post(base + "/versions"),
                        f,
                        Map.of("contentType", "demo-card", "baseRevision", 0, "definition", demoDefinition(f, "1.0.0")),
                        key(),
                        201)
                .path("versionRef")
                .asString();
        var v2 = request(
                        post(base + "/versions"),
                        f,
                        Map.of("contentType", "demo-card", "baseRevision", 1, "definition", demoDefinition(f, "2.0.0")),
                        key(),
                        201)
                .path("versionRef")
                .asString();
        UUID space = createSpaceUseCase
                .createSpace(f.credential, f.tenant, "History", "authored", key())
                .value()
                .id();
        var profile1 = new io.space.content.ContentProfile("demo-card", v1, Map.of("historic", List.of(1, true)));
        var profile2 = new io.space.content.ContentProfile("demo-card", v2, Map.of("historic", List.of(2, false)));
        var page = createPageUseCase
                .createPage(f.credential, f.tenant, space, "json", "History", "history.json", key(), profile1)
                .value();
        editPageUseCase.editPage(
                f.credential, f.tenant, space, page.id(), "{\"title\":\"Version One\"}", 0, key(), profile1);
        editPageUseCase.editPage(
                f.credential, f.tenant, space, page.id(), "{\"title\":\"Version Two\"}", 1, key(), profile2);
        editPageUseCase.editPage(f.credential, f.tenant, space, page.id(), "{\"title\":\"Later\"}", 2, key(), profile2);
        request(post(base + "/deactivate"), f, Map.of("contentType", "demo-card", "baseRevision", 2), key(), 200);
        assertThatThrownBy(() -> revertPageUseCase.revertPage(f.credential, f.tenant, space, page.id(), 1, 3, key()))
                .isInstanceOf(io.space.control.compositions.resource.ContentTypes.Invalid.class);
        assertThat(viewPageUseCase
                        .viewPage(f.credential, f.tenant, space, page.id())
                        .revision())
                .isEqualTo(3);
        var restored = revertPageUseCase
                .revertPage(f.credential, f.tenant, space, page.id(), 2, 3, key())
                .value();
        assertThat(restored.revision()).isEqualTo(4);
        assertThat(restored.versionRef()).isEqualTo(v2);
        assertThat(restored.interpretation()).isEqualTo(profile2.interpretation());
        assertThat(restored.content()).isEqualTo("{\"title\":\"Version Two\"}");
    }

    @Test
    void verificationUsesRegisteredTypeDefaultAndRecordsItsActualDefinition() throws Exception {
        var f = fixture();
        var registered = request(
                post(f.base() + "/content-types/versions"),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 0, "definition", demoDefinition(f, "1")),
                key(),
                201);
        String fixtures = json.writeValueAsString(List.of(Map.of(
                "id", "custom", "label", "Custom type", "contentType", "demo-card", "value", "{\"title\":\"Card\"}")));
        var report = verifyFixtures(f, "demo-card", fixtures);
        assertThat(report.path("serverValidation").path("passed").asBoolean()).isTrue();
        var content = java.util.stream.StreamSupport.stream(
                        report.path("serverValidation").path("checks").spliterator(), false)
                .filter(check -> check.path("name").asString().equals("content:custom:preview"))
                .findFirst()
                .orElseThrow();
        assertThat(content.path("message").asString())
                .contains("versionRef=" + registered.path("versionRef").asString())
                .contains("digest=" + registered.path("digest").asString());
    }

    @Test
    void verificationKeepsPinnedFormatAndSchemaAfterTheDefaultVersionChanges() throws Exception {
        var f = fixture();
        String versions = f.base() + "/content-types/versions";
        var first = request(
                post(versions),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 0, "definition", demoDefinition(f, "1")),
                key(),
                201);
        var definition = demoDefinition(f, "2");
        definition.put("format", "txt").put("language", "plaintext");
        String uri = "https://example.test/demo-envelope";
        definition
                .putObject("schemaResources")
                .put(
                        uri,
                        "{\"$schema\":\"https://json-schema.org/draft/2020-12/schema\",\"type\":\"object\",\"properties\":{\"content\":{\"const\":\"version two\"}}}");
        definition.putObject("validation").put("encoding", "text").put("schemaRef", uri);
        var second = request(
                post(versions),
                f,
                Map.of("contentType", "demo-card", "baseRevision", 1, "definition", definition),
                key(),
                201);
        request(
                post(f.base() + "/content-types/activate"),
                f,
                Map.of(
                        "contentType",
                        "demo-card",
                        "baseRevision",
                        2,
                        "versionRef",
                        second.path("versionRef").asString()),
                key(),
                200);
        String unavailable = UUID.randomUUID().toString();
        String fixtures = json.writeValueAsString(List.of(
                Map.of(
                        "id",
                        "pinned",
                        "label",
                        "Old JSON definition",
                        "contentType",
                        "demo-card",
                        "versionRef",
                        first.path("versionRef").asString(),
                        "value",
                        "{\"title\":\"Card\"}"),
                Map.of(
                        "id",
                        "old-value",
                        "label",
                        "Old value under current schema",
                        "contentType",
                        "demo-card",
                        "value",
                        "{\"title\":\"Card\"}"),
                Map.of(
                        "id",
                        "current",
                        "label",
                        "Current text definition",
                        "contentType",
                        "demo-card",
                        "value",
                        "version two"),
                Map.of(
                        "id",
                        "missing",
                        "label",
                        "Unavailable version",
                        "contentType",
                        "demo-card",
                        "versionRef",
                        unavailable,
                        "value",
                        "version two")));
        var report = verifyFixtures(f, "demo-card", fixtures);
        var checks = new HashMap<String, JsonNode>();
        report.path("serverValidation")
                .path("checks")
                .forEach(check -> checks.put(check.path("name").asString(), check));
        assertThat(checks.get("content:pinned:preview").path("passed").asBoolean())
                .isTrue();
        assertThat(checks.get("content:pinned:preview").path("message").asString())
                .contains("versionRef=" + first.path("versionRef").asString())
                .contains("digest=" + first.path("digest").asString());
        assertThat(checks.get("content:old-value:preview").path("passed").asBoolean())
                .isFalse();
        assertThat(checks.get("content:current:preview").path("passed").asBoolean())
                .isTrue();
        for (String id : List.of("old-value", "current"))
            assertThat(checks.get("content:" + id + ":preview").path("message").asString())
                    .contains("versionRef=" + second.path("versionRef").asString())
                    .contains("digest=" + second.path("digest").asString());
        var missing = checks.get("content:missing:preview");
        assertThat(missing.path("passed").asBoolean()).isFalse();
        assertThat(missing.path("message").asString())
                .contains("unavailable", "requestedVersionRef=" + unavailable)
                .doesNotContain("digest=");
    }

    JsonNode verifyFixtures(Fixture f, String type, String fixtures) throws Exception {
        var source = new HashMap<>(source());
        var manifest = (tools.jackson.databind.node.ObjectNode) json.readTree((String) source.get("manifest"));
        manifest.putArray("contentTypes").add(type);
        ((tools.jackson.databind.node.ObjectNode) manifest.path("renderers").get(0))
                .putArray("contentTypes")
                .add(type);
        source.put("manifest", json.writeValueAsString(manifest));
        source.put("fixtures", fixtures);
        var development = request(
                post(f.base() + "/plugin-developments"),
                f,
                Map.of("name", "Fixed type samples", "contentType", type, "source", source),
                key(),
                201);
        var candidate = request(
                post(f.base() + "/plugin-developments/" + development.path("id").asString() + "/candidates"),
                f,
                Map.of(
                        "baseRevision",
                        1,
                        "sourceDigest",
                        development.path("sourceDigest").asString(),
                        "entryPoint",
                        "src/main.ts",
                        "bundle",
                        "void 0;",
                        "environment",
                        "browser-es2022-v1"),
                key(),
                201);
        return request(
                post(f.base() + "/plugin-verifications"),
                f,
                Map.of(
                        "developmentId",
                        development.path("id").asString(),
                        "candidateId",
                        candidate.path("id").asString(),
                        "fixtureDigest",
                        Sha256.hex(fixtures),
                        "environment",
                        "browser-es2022-v1",
                        "browserEvidence",
                        Map.of("passed", true, "checks", List.of())),
                key(),
                201);
    }

    tools.jackson.databind.node.ObjectNode demoDefinition(Fixture f, String version) throws Exception {
        var state = request(get(f.base() + "/content-types"), f, null, null, 200);
        String reference = java.util.stream.StreamSupport.stream(
                        state.path("items").spliterator(), false)
                .filter(x -> x.path("contentType").asString().equals("json"))
                .findFirst()
                .orElseThrow()
                .path("activeVersionRef")
                .asString();
        var definition = (tools.jackson.databind.node.ObjectNode)
                request(get(f.base() + "/content-types/versions/" + reference), f, null, null, 200)
                        .path("definition")
                        .deepCopy();
        definition.put("id", "demo-card").put("version", version).put("label", "Demo Card");
        String uri = "https://example.test/demo-envelope";
        definition
                .putObject("schemaResources")
                .put(
                        uri,
                        "{\"$schema\":\"https://json-schema.org/draft/2020-12/schema\",\"type\":\"object\",\"required\":[\"content\",\"interpretation\"],\"properties\":{\"content\":{\"type\":\"object\",\"required\":[\"title\"]},\"interpretation\":{\"type\":\"object\"}},\"additionalProperties\":false}");
        definition.putObject("validation").put("encoding", "json").put("schemaRef", uri);
        return definition;
    }

    JsonNode request(MockHttpServletRequestBuilder builder, Fixture f, Object body, String key, int status)
            throws Exception {
        builder.header("Authorization", f.authorization());
        if (key != null) builder.header("Idempotency-Key", key);
        if (body != null) builder.contentType("application/json").content(json.writeValueAsString(body));
        var response =
                mvc.perform(builder).andExpect(status().is(status)).andReturn().getResponse();
        return json.readTree(response.getContentAsString());
    }

    Fixture fixture() {
        var operator = verified();
        owner.update("update iam.users set platform_operator=true where id=?", operator.value());
        var user = verified();
        String email = owner.queryForObject("select email from iam.users where id=?", String.class, user.value());
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), "Plugins " + key(), email)
                .tenant()
                .id();
        return new Fixture(tenant, credential(user));
    }

    UserApi.UserId verified() {
        var r = (UserApi.RegisterResult.Registered) users.register(key() + "@plugins.test", "Developer");
        owner.update("update iam.users set verified=true where id=?", r.user().value());
        return r.user();
    }

    String credential(UserApi.UserId id) {
        return ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(id.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown"))
                .credentials()
                .accessToken();
    }

    static String key() {
        return UUID.randomUUID().toString();
    }

    record Fixture(UUID tenant, String credential) {
        String base() {
            return "/api/v1/tenants/" + tenant;
        }

        String authorization() {
            return "Bearer " + credential;
        }
    }
}
