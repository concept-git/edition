package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import io.space.control.support.FixtureHttpServer;
import io.space.control.support.MinioFixture;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 票 20：持续导入 HTTP 验收。真 PG + 真 MinIO。 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ImportAcceptanceTest {
    private static final long OVERSIZE = 500L * 1024 * 1024 + 1;

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static final MinIOContainer minio = MinioFixture.container();

    @DynamicPropertySource
    static void objectStore(DynamicPropertyRegistry registry) {
        MinioFixture.bind(registry, minio);
        registry.add("io.space.import.remote.allowed-hosts", () -> "localhost");
    }

    static FixtureHttpServer remote;

    @BeforeAll
    static void remoteFixtures() throws IOException {
        remote = FixtureHttpServer.start();
    }

    @AfterAll
    static void stopRemoteFixtures() {
        if (remote != null) remote.stop();
    }

    @BeforeAll
    static void bucket() {
        MinioFixture.ensureBucket(minio);
    }

    @Autowired
    ReleaseApi releases;

    @Autowired
    TenantScopeApi tenantScope;

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

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void syncedSpaceImportsV1ZipAndMirrorsPageTitles() throws Exception {
        Fixture f = synced("ImportOk", "owner@import-ok.test");
        String key = key();
        JsonNode accepted = importZip(f, fv1OkZip(), key, 202);
        assertThat(accepted.path("job").path("progress").isObject()).isTrue();
        UUID jobId = UUID.fromString(accepted.get("job").get("id").asText());
        JsonNode replayed = importZip(f, fv1OkZip(), key, 202);
        assertThat(replayed.get("job").get("id").asText()).isEqualTo(jobId.toString());

        JsonNode job = pollJob(f, jobId);
        assertThat(job.path("outcome").asText()).isEqualTo("promoted");

        String listed = mvc.perform(get(f.pages()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Set<String> titles = new HashSet<>();
        for (JsonNode item : json.readTree(listed).get("items")) {
            titles.add(item.get("title").asText());
        }
        assertThat(titles).contains("Welcome", "Guide");
    }

    @Test
    void syncedSpaceImportsTxtJsonAndXmlAsDistinctPageFormats() throws Exception {
        Fixture f = synced("ImportSourceDocs", "owner@import-source-docs.test");
        JsonNode accepted = importZip(f, zipFixture("F-source-docs"), key(), 202);
        JsonNode job = pollJob(f, UUID.fromString(accepted.get("job").get("id").asText()));
        assertThat(job.path("outcome").asText()).isEqualTo("promoted");
        String listed = mvc.perform(get(f.pages()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Set<String> formats = new HashSet<>();
        for (JsonNode item : json.readTree(listed).get("items"))
            formats.add(item.get("format").asText());
        assertThat(formats).containsExactlyInAnyOrder("txt", "json", "xml");
    }

    @Test
    void authoredSpaceRejectsImport() throws Exception {
        Fixture f = authored("ImportAuthored", "owner@import-authored.test");
        mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType("application/zip")
                        .content(fv1OkZip()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_mode_restricted"));
        assertThat(jobCount(f.space)).isZero();
    }

    @Test
    void replaySameIdempotencyKeyReturnsSameJob() throws Exception {
        Fixture f = synced("ImportReplay", "owner@import-replay.test");
        String key = key();
        byte[] zip = fv1OkZip();
        JsonNode first = importZip(f, zip, key, 202);
        JsonNode second = importZip(f, zip, key, 202);
        assertThat(second.get("job").get("id").asText())
                .isEqualTo(first.get("job").get("id").asText());
    }

    @Test
    void driftBoardStartsEmpty() throws Exception {
        Fixture f = synced("ImportDrift", "owner@import-drift.test");
        mvc.perform(get(f.spacePath() + "/drift").header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driftCount").value(0))
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void approveOnNonFlaggedReleaseConflicts() throws Exception {
        Fixture f = authored("ImportApprove", "owner@import-approve.test");
        String created = mvc.perform(authed(post(f.pages()), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"format\":\"markdown\",\"title\":\"Guide\",\"slug\":\"guide\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID page = UUID.fromString(json.readTree(created).get("id").asText());
        String published = mvc.perform(authed(post(f.pages() + "/" + page + ":publish"), f))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID live = UUID.fromString(
                json.readTree(published).get("release").get("id").asText());
        mvc.perform(authed(post(f.releases() + "/" + live + ":approve"), f))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("release_not_flagged"));
    }

    @Test
    void missingImportJobIsNotFound() throws Exception {
        Fixture f = synced("ImportMissingJob", "owner@import-missing-job.test");
        mvc.perform(get(f.spacePath() + "/import-jobs/" + UUID.randomUUID()).header("Authorization", f.authorization()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("import_job_not_found"));
    }

    @Test
    void unknownPackCompletesInvalidBundle() throws Exception {
        Fixture f = synced("ImportUnknownHttp", "owner@import-unknown-http.test");
        JsonNode accepted = importZip(f, zipFixture("F-unknown"), key(), 202);
        JsonNode job = pollJob(f, UUID.fromString(accepted.get("job").get("id").asText()));
        assertThat(job.get("status").asText()).isEqualTo("completed");
        assertThat(job.get("outcome").asText()).isEqualTo("invalid_bundle");
        mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void runningJobConflictsOnANewKey() throws Exception {
        Fixture f = synced("ImportBusyHttp", "owner@import-busy-http.test");
        jdbc.update("""
                insert into shared.jobs (tenant_id, type, space_id, status, phase, attempt)
                values (?, 'import', ?, 'running', 'inspecting', 0)
                """, f.tenant(), f.space());
        mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType("application/zip")
                        .content(fv1OkZip()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("import_in_progress"));
    }

    @Test
    void sameKeyDifferentZipConflicts() throws Exception {
        Fixture f = synced("ImportReuseHttp", "owner@import-reuse-http.test");
        String key = key();
        importZip(f, fv1OkZip(), key, 202);
        mvc.perform(authed(post(f.releases() + ":import"), f, key)
                        .contentType("application/zip")
                        .content(zipFixture("F-unknown")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("idempotency_key_reused"));
    }

    @Test
    void ipdJobReportSurvivesReloadAndHtmlExportPreservesOriginal() throws Exception {
        Fixture f = synced("ImportReportHttp", "owner@import-report-http.test");
        byte[] bad = Files.readAllBytes(io.space.concepts.importformat.ImportPacks.ipdToleranceZip("empty"));
        UUID failedId = UUID.fromString(
                importZip(f, bad, key(), 202).get("job").get("id").asText());
        JsonNode failed = pollJob(f, failedId);
        assertThat(failed.get("outcome").asText()).isEqualTo("invalid_bundle");
        assertThat(failed.path("report").path("errors").get(0).path("code").asText())
                .isEqualTo("empty_ipd_pack");
        assertThat(pollJob(f, failedId).path("report")).isEqualTo(failed.path("report"));
        JsonNode valid = pollJob(
                f,
                UUID.fromString(importZip(
                                f,
                                Files.readAllBytes(io.space.concepts.importformat.ImportPacks.ipdToleranceZip("valid")),
                                key(),
                                202)
                        .get("job")
                        .get("id")
                        .asText()));
        assertThat(valid.get("outcome").asText()).isEqualTo("promoted");
        assertThat(valid.path("report").path("info").toString()).contains("metadata_record_ignored");
        assertThat(snapshot(f, valid.get("releaseId").asText()).pages())
                .filteredOn(page -> "intro.html".equals(page.externalId()))
                .singleElement()
                .extracting(ReleaseApi.PageSnapshot::content)
                .isEqualTo(Files.readString(
                        Path.of(System.getProperty("space.import.fixtures"), "F-ipd-tolerant/intro.html")));
    }

    @Test
    void hwMiniAndOkfMiniPromote() throws Exception {
        Fixture hw = synced("ImportHwHttp", "owner@import-hw-http.test");
        JsonNode hwJob = pollJob(
                hw,
                UUID.fromString(importZip(hw, zipFixture("F-hw-mini"), key(), 202)
                        .get("job")
                        .get("id")
                        .asText()));
        assertThat(hwJob.get("outcome").asText()).isEqualTo("promoted");
        assertThat(snapshot(hw, hwJob.get("releaseId").asText()).generator()).isEqualTo("hwcloud-docs");

        Fixture okf = synced("ImportOkfHttp", "owner@import-okf-http.test");
        JsonNode okfJob = pollJob(
                okf,
                UUID.fromString(importZip(okf, zipFixture("F-okf-mini"), key(), 202)
                        .get("job")
                        .get("id")
                        .asText()));
        assertThat(okfJob.get("outcome").asText()).isEqualTo("promoted");
        assertThat(snapshot(okf, okfJob.get("releaseId").asText()).generator()).isEqualTo("okf-v0.1");
    }

    @Test
    void brokenLinkHoldsTheDraft() throws Exception {
        Fixture f = synced("ImportHeldHttp", "owner@import-held-http.test");
        JsonNode job = pollJob(
                f,
                UUID.fromString(importZip(f, zipFixture("F-broken-link"), key(), 202)
                        .get("job")
                        .get("id")
                        .asText()));
        assertThat(job.get("status").asText()).isEqualTo("completed");
        assertThat(job.get("outcome").asText()).isEqualTo("held");
        String report = mvc.perform(
                        get(f.releases() + "/" + job.get("releaseId").asText())
                                .header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(json.readTree(report).get("status").asText()).isEqualTo("draft");
        assertThat(json.readTree(report).get("report").get("errors").toString()).contains("broken_link");
        mvc.perform(get(f.releases() + "/" + job.get("releaseId").asText() + "/preview/welcome")
                        .header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("welcome"))
                .andExpect(jsonPath("$.html").isString());
    }

    @Test
    void multipartFilePromotesLikeADirectZip() throws Exception {
        Fixture f = synced("ImportMultipart", "owner@import-multipart.test");
        JsonNode accepted =
                json.readTree(mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart(
                                        f.releases() + ":import")
                                .file("file", fv1OkZip())
                                .header("Authorization", f.authorization())
                                .header("Idempotency-Key", key()))
                        .andExpect(status().isAccepted())
                        .andReturn()
                        .getResponse()
                        .getContentAsString());
        JsonNode job = pollJob(f, UUID.fromString(accepted.get("job").get("id").asText()));
        assertThat(job.get("outcome").asText()).isEqualTo("promoted");
    }

    @Test
    void archivedSpaceRejectsImport() throws Exception {
        Fixture f = synced("ImportArchivedHttp", "owner@import-archived-http.test");
        mvc.perform(authed(post(f.spacePath() + ":archive"), f)).andExpect(status().isOk());
        mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType("application/zip")
                        .content(fv1OkZip()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("space_archived"));
        assertThat(jobCount(f.space)).isZero();
    }

    @Test
    void badChecksumCompletesInvalidBundle() throws Exception {
        Fixture f = synced("ImportChecksumHttp", "owner@import-checksum-http.test");
        JsonNode job = pollJob(
                f,
                UUID.fromString(importZip(f, zipFixture("F-v1-bad-checksum"), key(), 202)
                        .get("job")
                        .get("id")
                        .asText()));
        assertThat(job.get("outcome").asText()).isEqualTo("invalid_bundle");
        mvc.perform(get(f.releases()).header("Authorization", f.authorization()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void declaredZipOver500MiBIsRejectedWithoutAJob() throws Exception {
        Fixture f = synced("ImportOversize", "owner@import-oversize.test");
        long before = jobCount(f.space);
        mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType("application/zip")
                        .content(new byte[] {0x50, 0x4b, 0x03, 0x04})
                        .with(request -> {
                            request.removeHeader("Content-Length");
                            request.addHeader("Content-Length", Long.toString(OVERSIZE));
                            return request;
                        }))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("file_too_large"))
                .andExpect(jsonPath("$.violations[0].field").value("zip"));
        assertThat(jobCount(f.space)).isEqualTo(before);
    }

    @Test
    void remoteUrlBodyIsAcceptedAndEchoesSourceUrl() throws Exception {
        Fixture f = synced("ImportRemoteHttp", "owner@import-remote-http.test");
        String url =
                remote.serveZip("tree-http.zip", io.space.concepts.importformat.ImportPacks.zipFixture("F-tree-mini"));
        String body = mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\":\"" + url + "\"}"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.job.sourceUrl").value(url))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode job = pollJob(
                f, UUID.fromString(json.readTree(body).get("job").get("id").asText()));
        assertThat(job.get("outcome").asText()).isEqualTo("promoted");
        assertThat(job.get("sourceUrl").asText()).isEqualTo(url);
    }

    @Test
    void jsonBodyMustNameExactlyOneSource() throws Exception {
        Fixture f = synced("ImportChoiceHttp", "owner@import-choice-http.test");
        mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"))
                .andExpect(jsonPath("$.violations[0].field").value("uploadKey|url"));
        mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"uploadKey\":\"k\",\"url\":\"https://x.example/a.zip\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"));
        assertThat(jobCount(f.space)).isZero();
    }

    @Test
    void forbiddenAndUnreachableRemoteAddressesAre422WithoutAJob() throws Exception {
        Fixture f = synced("ImportRemoteReject", "owner@import-remote-reject-http.test");
        mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\":\"http://example.com/a.zip\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("import_source_forbidden"))
                .andExpect(jsonPath("$.violations[0].code").value("scheme_not_https"));
        mvc.perform(authed(post(f.releases() + ":import"), f)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\":\"" + remote.baseUrl() + "/nope.zip\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("import_source_unreachable"))
                .andExpect(jsonPath("$.violations[0].code").value("http_404"));
        assertThat(jobCount(f.space)).isZero();
    }

    private JsonNode importZip(Fixture f, byte[] zip, String idempotencyKey, int status) throws Exception {
        String body = mvc.perform(authed(post(f.releases() + ":import"), f, idempotencyKey)
                        .contentType("application/zip")
                        .content(zip))
                .andExpect(status().is(status))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(body);
    }

    private JsonNode pollJob(Fixture f, UUID jobId) throws Exception {
        JsonNode job = null;
        for (int i = 0; i < 180; i++) {
            String body = mvc.perform(
                            get(f.spacePath() + "/import-jobs/" + jobId).header("Authorization", f.authorization()))
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();
            job = json.readTree(body);
            String status = job.path("status").asText();
            if ("completed".equals(status) || "failed".equals(status)) {
                return job;
            }
            Thread.sleep(500);
        }
        throw new AssertionError("import job did not finish: " + job);
    }

    private long jobCount(UUID space) {
        Long count = jdbc.queryForObject("select count(*) from shared.jobs where space_id = ?", Long.class, space);
        return count == null ? 0 : count;
    }

    private Fixture synced(String name, String ownerEmail) {
        return fixture(name, ownerEmail, "synced");
    }

    private Fixture authored(String name, String ownerEmail) {
        return fixture(name, ownerEmail, "authored");
    }

    private Fixture fixture(String name, String ownerEmail, String mode) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@import-http.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        String cred = credential(owner);
        UUID space = createSpaceUseCase
                .createSpace(cred, tenant, name + " Docs", mode, key())
                .value()
                .id();
        return new Fixture(tenant, space, cred);
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

    private static byte[] fv1OkZip() throws IOException {
        return zipFixture("F-v1-ok");
    }

    private static byte[] zipFixture(String id) throws IOException {
        Path tree = firstExistingDir(
                Path.of(System.getProperty("space.import.fixtures")).resolve(id),
                Path.of("backend/apps/control/src/test/resources/import-packs").resolve(id));
        if (tree == null) throw new IllegalStateException("missing import-pack fixture " + id);
        return zipTree(tree);
    }

    private static byte[] zipTree(Path src) throws IOException {
        ByteArrayOutputStream raw = new ByteArrayOutputStream();
        try (ZipOutputStream out = new ZipOutputStream(raw);
                var walk = Files.walk(src)) {
            for (Path file : walk.filter(Files::isRegularFile).sorted().toList()) {
                String name = src.relativize(file).toString().replace('\\', '/');
                ZipEntry entry = new ZipEntry(name);
                entry.setTime(0);
                out.putNextEntry(entry);
                Files.copy(file, out);
                out.closeEntry();
            }
        }
        return raw.toByteArray();
    }

    private static Path firstExistingDir(Path... candidates) {
        for (Path candidate : candidates) {
            if (Files.isDirectory(candidate)) return candidate;
        }
        return null;
    }

    private ReleaseApi.Bundle snapshot(Fixture fixture, String release) {
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(fixture.tenant()),
                () -> releases.export(new ReleaseApi.ReleaseId(UUID.fromString(release)))
                        .orElseThrow());
    }

    private record Fixture(UUID tenant, UUID space, String credential) {
        String pages() {
            return spacePath() + "/pages";
        }

        String releases() {
            return spacePath() + "/releases";
        }

        String spacePath() {
            return "/api/v1/tenants/" + tenant + "/spaces/" + space;
        }

        String authorization() {
            return "Bearer " + credential;
        }
    }
}
