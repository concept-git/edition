package io.space.control.compositions.releases.bundleexport;

import static org.assertj.core.api.Assertions.*;
import static org.awaitility.Awaitility.await;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import io.space.concepts.bundleexport.api.BundleExportJobs;
import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.objectstore.api.*;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.toc.api.TocApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.authoring.pageediting.AttachUseCase;
import io.space.control.compositions.authoring.pageediting.SetIconUseCase;
import io.space.control.compositions.authoring.pageediting.SetPropertyUseCase;
import io.space.control.compositions.authoring.pageediting.SetSeoUseCase;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.authoring.termination.DeleteSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.releases.bundleimport.ApproveReleaseUseCase;
import io.space.control.compositions.releases.bundleimport.BundleImportTypes;
import io.space.control.compositions.releases.bundleimport.ContinuousImportUseCase;
import io.space.control.compositions.releases.bundleimport.ListPreviewPagesUseCase;
import io.space.control.compositions.releases.bundleimport.PreviewReleaseUseCase;
import io.space.control.compositions.releases.bundleimport.StartImportUploadUseCase;
import io.space.control.compositions.releases.bundleimport.ViewDriftUseCase;
import io.space.control.compositions.releases.bundleimport.ViewImportJobUseCase;
import io.space.control.compositions.releases.release.BuildReleaseUseCase;
import io.space.control.support.*;
import java.io.*;
import java.time.*;
import java.util.*;
import java.util.zip.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(properties = "io.space.bundle-export.initial-delay=3600000")
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class BundleExportAcceptanceTest {
    @org.springframework.beans.factory.annotation.Autowired
    AttachUseCase attachUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetIconUseCase setIconUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetPropertyUseCase setPropertyUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetSeoUseCase setSeoUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DeleteSpaceUseCase deleteSpaceUseCase;

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static final MinIOContainer minio = MinioFixture.container();

    @DynamicPropertySource
    static void objects(DynamicPropertyRegistry registry) {
        MinioFixture.bind(registry, minio);
    }

    @BeforeAll
    static void bucket() {
        MinioFixture.ensureBucket(minio);
    }

    @org.springframework.beans.factory.annotation.Autowired
    RequestExportUseCase requestExportUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewExportUseCase viewExportUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RetryExportUseCase retryExportUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DownloadExportUseCase downloadExportUseCase;

    @Autowired
    BundleExportWorker worker;

    @Autowired
    BundleExportJobs jobs;

    @org.springframework.beans.factory.annotation.Autowired
    BuildReleaseUseCase buildReleaseUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ContinuousImportUseCase continuousImportUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    StartImportUploadUseCase startImportUploadUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewImportJobUseCase viewImportJobUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewDriftUseCase viewDriftUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListPreviewPagesUseCase listPreviewPagesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PreviewReleaseUseCase previewReleaseUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ApproveReleaseUseCase approveReleaseUseCase;

    @Autowired
    ImportJobApi imports;

    @Autowired
    ReleaseApi releases;

    @Autowired
    PageApi pages;

    @Autowired
    SpaceApi spaces;

    @Autowired
    TocApi toc;

    @Autowired
    PermissionApi permissions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @org.springframework.beans.factory.annotation.Autowired
    ArchiveSpaceUseCase archiveSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    TenantScopeApi scope;

    @Autowired
    ObjectReservationsApi reservations;

    @Autowired
    ObjectStoreApi objects;

    @Autowired
    io.space.control.compositions.authoring.termination.SourceObjectCleanup cleanup;

    @Autowired
    MockMvc http;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate owner;

    static final JsonMapper JSON = JsonMapper.builder().build();

    @Test
    void completePortableZipRoundTripsContentMetadataTocAndAttachmentBytes() throws Exception {
        var f = fixture();
        var accepted = requestExportUseCase
                .requestExport(f.credential(), f.tenant(), f.space(), f.release(), key())
                .value();
        assertThat(accepted.status()).isEqualTo("queued");
        worker.poll();
        byte[] archive = download(f, accepted.id());
        var zip = entries(archive);
        var manifest = JSON.readTree(zip.get("manifest.json"));
        var page = manifest.get("pages").get(0);
        assertThat(page.get("externalId").asString()).isEqualTo(f.page().toString());
        assertThat(page.get("icon").asString()).isEqualTo("https://assets.example/icon.png");
        assertThat(new String(zip.get(page.get("content").asString()), java.nio.charset.StandardCharsets.UTF_8))
                .isEqualTo(f.body());
        assertThat(zip.get(page.get("attachments").get(0).asString())).isEqualTo(f.attachment());
        assertThat(manifest.get("toc").get(0).get("children").get(0).get("ref").asString())
                .isEqualTo(f.page().toString());
        UUID target = createSpaceUseCase
                .createSpace(f.credential(), f.tenant(), "Round trip", "synced", key())
                .value()
                .id();
        var intake = continuousImportUseCase
                .continuousImport(
                        f.credential(),
                        f.tenant(),
                        target,
                        new BundleImportTypes.ImportSource.ZipStream(new ByteArrayInputStream(archive), archive.length),
                        key())
                .value();
        await().atMost(Duration.ofSeconds(20))
                .untilAsserted(() -> assertThat(scope.inTenant(
                                new TenantRegistryApi.TenantId(f.tenant()),
                                () -> imports.view(intake.job().id())
                                        .orElseThrow()
                                        .status()))
                        .isEqualTo("completed"));
        var bundle = scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant()),
                () -> releases.export(new ReleaseApi.ReleaseId(intake.release().id()))
                        .orElseThrow());
        var restored = bundle.pages().getFirst();
        assertThat(restored.content()).isEqualTo(f.body());
        assertThat(restored.icon()).isEqualTo("https://assets.example/icon.png");
        assertThat(restored.externalId()).isEqualTo(f.page().toString());
        assertThat(restored.properties()).containsEntry("product_code", "测试");
        assertThat(restored.seo().description()).isEqualTo("用于导出回环验证");
        var working = scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant()),
                () -> pages.view(new PageApi.PageId(restored.pageId())).orElseThrow());
        assertThat(working.icon()).isEqualTo(restored.icon());
        assertThat(working.content()).isEqualTo(f.body());
        try (var in =
                objects.open(restored.attachments().getFirst().storageKey()).orElseThrow()) {
            assertThat(in.readAllBytes()).isEqualTo(f.attachment());
        }
        var modified = (tools.jackson.databind.node.ObjectNode) JSON.readTree(zip.get("manifest.json"));
        ((tools.jackson.databind.node.ObjectNode) modified.get("pages").get(0))
                .put("icon", "https://assets.example/updated.png");
        byte[] updated = replaceManifest(zip, JSON.writeValueAsBytes(modified));
        var update = continuousImportUseCase
                .continuousImport(
                        f.credential(),
                        f.tenant(),
                        target,
                        new BundleImportTypes.ImportSource.ZipStream(new ByteArrayInputStream(updated), updated.length),
                        key())
                .value();
        await().atMost(Duration.ofSeconds(20))
                .untilAsserted(() -> assertThat(scope.inTenant(
                                new TenantRegistryApi.TenantId(f.tenant()),
                                () -> imports.view(update.job().id())
                                        .orElseThrow()
                                        .status()))
                        .isEqualTo("completed"));
        assertThat(scope.inTenant(
                        new TenantRegistryApi.TenantId(f.tenant()),
                        () -> releases.live(new ReleaseApi.ScopeId(target))
                                .orElseThrow()
                                .id()))
                .isEqualTo(update.release().id());
        assertThat(scope.inTenant(
                        new TenantRegistryApi.TenantId(f.tenant()),
                        () -> pages.view(new PageApi.PageId(restored.pageId()))
                                .orElseThrow()
                                .icon()))
                .isEqualTo("https://assets.example/updated.png");
        var reexport = requestExportUseCase
                .requestExport(
                        f.credential(), f.tenant(), target, intake.release().id(), key())
                .value();
        worker.poll();
        var importedZip = entries(download(
                new Fixture(
                        f.tenant(),
                        target,
                        f.page(),
                        intake.release().id(),
                        f.user(),
                        f.credential(),
                        f.body(),
                        f.attachment(),
                        f.objectKey()),
                reexport.id()));
        assertThat(JSON.readTree(importedZip.get("manifest.json"))
                        .get("pages")
                        .get(0)
                        .get("externalId")
                        .asString())
                .isEqualTo(f.page().toString());
    }

    @Test
    void zipRejectsRestrictionsAndDownloadRechecksPermissions() {
        var f = fixture();
        var job = requestExportUseCase
                .requestExport(f.credential(), f.tenant(), f.space(), f.release(), key())
                .value();
        worker.poll();
        scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant()),
                () -> permissions.restrict(
                        new PermissionApi.Resource(PermissionApi.ResourceType.PAGE, f.page()), Set.of(), 0));
        assertThatThrownBy(() ->
                        requestExportUseCase.requestExport(f.credential(), f.tenant(), f.space(), f.release(), key()))
                .isInstanceOf(PermissionDeniedException.class);
        assertThatThrownBy(() -> downloadExportUseCase.downloadExport(f.credential(), f.tenant(), f.space(), job.id()))
                .isInstanceOf(PermissionDeniedException.class);
    }

    @Test
    void historicalPageUsesItsCurrentSpaceInsteadOfItsReleaseSpace() {
        var f = fixture();
        UUID destination = createSpaceUseCase
                .createSpace(f.credential(), f.tenant(), "Moved", "authored", key())
                .value()
                .id();
        scope.inTenant(new TenantRegistryApi.TenantId(f.tenant()), () -> {
            toc.replace(new TocApi.TocId(f.space()), List.of());
            spaces.transfer(f.page(), new SpaceApi.SpaceId(destination), "moved");
            permissions.grant(
                    new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, destination),
                    new PermissionApi.Principal(PermissionApi.PrincipalType.USER, f.user()),
                    new PermissionApi.Role("none"));
        });
        assertThatThrownBy(() ->
                        requestExportUseCase.requestExport(f.credential(), f.tenant(), f.space(), f.release(), key()))
                .isInstanceOf(PermissionDeniedException.class);
    }

    @Test
    void snapshotPinSurvivesRetentionAndCollectedZipIsPrivateAndIdempotent() throws Exception {
        var f = fixture();
        String key = key();
        var first = requestExportUseCase.requestExport(f.credential(), f.tenant(), f.space(), f.release(), key);
        var replay = requestExportUseCase.requestExport(f.credential(), f.tenant(), f.space(), f.release(), key);
        assertThat(replay.serializedBody()).isEqualTo(first.serializedBody());
        for (int i = 0; i < 3; i++) {
            int revision = i + 1;
            scope.inTenant(
                    new TenantRegistryApi.TenantId(f.tenant()),
                    () -> pages.edit(
                            new PageApi.PageId(f.page()),
                            "Changed " + revision,
                            revision,
                            PageApi.Actor.user(f.user())));
            buildReleaseUseCase.buildRelease(f.credential(), f.tenant(), f.space(), key());
        }
        scope.inTenant(new TenantRegistryApi.TenantId(f.tenant()), () -> {
            releases.setRetention(new ReleaseApi.ScopeId(f.space()), 1);
            releases.prune(new ReleaseApi.ScopeId(f.space()));
        });
        assertThat(scope.inTenant(
                        new TenantRegistryApi.TenantId(f.tenant()),
                        () -> releases.status(new ReleaseApi.ReleaseId(f.release()))))
                .isPresent();
        worker.poll();
        byte[] archive = download(f, first.value().id());
        var zip = entries(archive);
        var p = JSON.readTree(zip.get("manifest.json")).get("pages").get(0);
        assertThat(new String(zip.get(p.get("content").asString()), java.nio.charset.StandardCharsets.UTF_8))
                .isEqualTo(f.body());
        http.perform(get(path(f) + "/exports/" + first.value().id() + "/download")
                        .header("Authorization", "Bearer " + f.credential()))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("Content-Type", "application/zip"));
    }

    @Test
    void expiredOutputCannotBeDownloadedAndCanBeGeneratedAgain() {
        var f = fixture();
        var job = requestExportUseCase
                .requestExport(f.credential(), f.tenant(), f.space(), f.release(), key())
                .value();
        worker.poll();
        owner.update("update shared.bundle_exports set expires_at=now()-interval '1 second' where id=?", job.id());
        assertThat(viewExportUseCase
                        .viewExport(f.credential(), f.tenant(), f.space(), job.id())
                        .status())
                .isEqualTo("expired");
        assertThatThrownBy(() -> downloadExportUseCase.downloadExport(f.credential(), f.tenant(), f.space(), job.id()))
                .isInstanceOf(ExportProblem.class);
        var regenerated = requestExportUseCase
                .requestExport(f.credential(), f.tenant(), f.space(), f.release(), key())
                .value();
        assertThat(regenerated.id()).isNotEqualTo(job.id());
        worker.poll();
        assertThat(viewExportUseCase
                        .viewExport(f.credential(), f.tenant(), f.space(), regenerated.id())
                        .status())
                .isEqualTo("completed");
    }

    @Test
    void expiredLeaseCanBeReclaimedButOldTokenCannotPublishAndBudgetIsBounded() {
        var f = fixture();
        var job = requestExportUseCase
                .requestExport(f.credential(), f.tenant(), f.space(), f.release(), key())
                .value();
        var tenant = new TenantRegistryApi.TenantId(f.tenant());
        var old = scope.inTenant(tenant, () -> jobs.claim(job.id()).orElseThrow());
        owner.update("update shared.bundle_exports set lease_until=now()-interval '1 second' where id=?", job.id());
        var fresh = scope.inTenant(tenant, () -> jobs.claim(job.id()).orElseThrow());
        scope.inTenant(tenant, () -> jobs.complete(old, "stale", 1));
        assertThat(viewExportUseCase
                        .viewExport(f.credential(), f.tenant(), f.space(), job.id())
                        .status())
                .isEqualTo("running");
        owner.update(
                "update shared.bundle_exports set lease_until=now()-interval '1 second',attempts=8" + " where id=?",
                job.id());
        assertThat(scope.inTenant(tenant, () -> jobs.claim(job.id()))).isEmpty();
        scope.inTenant(tenant, () -> jobs.complete(fresh, "late", 1));
        assertThat(viewExportUseCase
                        .viewExport(f.credential(), f.tenant(), f.space(), job.id())
                        .status())
                .isEqualTo("failed");
        retryExportUseCase.retryExport(f.credential(), f.tenant(), f.space(), job.id(), key());
        worker.poll();
        assertThat(viewExportUseCase
                        .viewExport(f.credential(), f.tenant(), f.space(), job.id())
                        .status())
                .isEqualTo("completed");
    }

    @Test
    void concurrentSpaceTerminationCannotMissAnUncommittedExport() throws Exception {
        var f = fixture();
        archiveSpaceUseCase.archiveSpace(f.credential(), f.tenant(), f.space(), key());
        owner.execute("create function shared.hold_export_test() returns trigger language plpgsql as $$"
                + " begin perform pg_advisory_xact_lock(987654321); return new; end $$");
        owner.execute("create trigger hold_export_test before insert on shared.bundle_exports for each"
                + " row execute function shared.hold_export_test()");
        var pool = java.util.concurrent.Executors.newFixedThreadPool(2);
        try (var blocker = Objects.requireNonNull(owner.getDataSource()).getConnection()) {
            blocker.setAutoCommit(false);
            try (var statement = blocker.createStatement()) {
                statement.execute("select pg_advisory_xact_lock(987654321)");
            }
            var capture = pool.submit(() ->
                    requestExportUseCase.requestExport(f.credential(), f.tenant(), f.space(), f.release(), key()));
            try {
                await().atMost(Duration.ofSeconds(3))
                        .until(() -> owner.queryForObject(
                                        "select count(*) from pg_stat_activity"
                                                + " where datname=current_database()"
                                                + " and wait_event_type='Lock'",
                                        Integer.class)
                                >= 1);
                var deleted = pool.submit(() ->
                        deleteSpaceUseCase.deleteSpace(f.credential(), f.tenant(), f.space(), "Portable docs", key()));
                await().atMost(Duration.ofSeconds(3))
                        .until(() -> owner.queryForObject(
                                        "select count(*) from pg_stat_activity"
                                                + " where datname=current_database()"
                                                + " and wait_event_type='Lock'",
                                        Integer.class)
                                >= 2);
                blocker.commit();
                var job = capture.get(10, java.util.concurrent.TimeUnit.SECONDS).value();
                deleted.get(10, java.util.concurrent.TimeUnit.SECONDS);
                assertThat(owner.queryForObject(
                                "select status from shared.bundle_exports where id=?", String.class, job.id()))
                        .isEqualTo("cancelled");
                assertThat(owner.queryForObject(
                                "select snapshot is null and cardinality(object_keys)=0"
                                        + " from shared.bundle_exports where id=?",
                                Boolean.class,
                                job.id()))
                        .isTrue();
            } finally {
                blocker.rollback();
            }
        } finally {
            pool.shutdownNow();
            owner.execute("drop trigger hold_export_test on shared.bundle_exports");
            owner.execute("drop function shared.hold_export_test()");
        }
    }

    @Test
    void missingCompletedObjectBecomesRecoverableFailureInsteadOfPermanentDownloadLoop() throws Exception {
        var f = fixture();
        var job = requestExportUseCase
                .requestExport(f.credential(), f.tenant(), f.space(), f.release(), key())
                .value();
        worker.poll();
        byte[] original = download(f, job.id());
        String object = scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant()),
                () -> jobs.find(f.space(), job.id()).orElseThrow().outputKey());
        MinioFixture.client(minio)
                .removeObject(io.minio.RemoveObjectArgs.builder()
                        .bucket(MinioFixture.BUCKET)
                        .object(object)
                        .build());
        http.perform(get(path(f) + "/exports/" + job.id() + "/download")
                        .header("Authorization", "Bearer " + f.credential()))
                .andExpect(status().isServiceUnavailable());
        assertThat(viewExportUseCase
                        .viewExport(f.credential(), f.tenant(), f.space(), job.id())
                        .status())
                .isEqualTo("failed");
        assertThat(viewExportUseCase
                        .viewExport(f.credential(), f.tenant(), f.space(), job.id())
                        .error())
                .isEqualTo("export_output_missing");
        retryExportUseCase.retryExport(f.credential(), f.tenant(), f.space(), job.id(), key());
        worker.poll();
        assertThat(download(f, job.id())).isEqualTo(original);
    }

    @Test
    void readPermissionAloneAndUnpublishedReleasesCannotExport() {
        var f = fixture();
        var user = ((UserApi.RegisterResult.Registered)
                        users.register(UUID.randomUUID() + "@read-only-export.test", "Reader"))
                .user();
        owner.update("update iam.users set verified=true where id=?", user.value());
        String credential = ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(user.value()),
                        new SessionApi.Device("test", "test", "test"),
                        "loopback"))
                .credentials()
                .accessToken();
        scope.inTenant(new TenantRegistryApi.TenantId(f.tenant()), () -> {
            memberships.add(
                    MembershipApi.Group.tenant(f.tenant()),
                    new MembershipApi.MemberId(user.value()),
                    MembershipApi.Role.MEMBER);
            permissions.grant(
                    new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, f.space()),
                    new PermissionApi.Principal(PermissionApi.PrincipalType.USER, user.value()),
                    new PermissionApi.Role("reader"));
        });
        assertThatThrownBy(
                        () -> requestExportUseCase.requestExport(credential, f.tenant(), f.space(), f.release(), key()))
                .isInstanceOf(PermissionDeniedException.class);
        UUID draft = scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant()),
                () -> releases.draft(
                                new ReleaseApi.ScopeId(f.space()),
                                new ReleaseApi.Source(ReleaseApi.SourceKind.BUILD, "test", f.user()))
                        .id());
        assertThatThrownBy(
                        () -> requestExportUseCase.requestExport(f.credential(), f.tenant(), f.space(), draft, key()))
                .isInstanceOf(PermissionDeniedException.class);
    }

    @Test
    void artifactReferencesProtectTheZipUntilExpiryAndThenAllowCollection() {
        var f = fixture();
        var job = requestExportUseCase
                .requestExport(f.credential(), f.tenant(), f.space(), f.release(), key())
                .value();
        worker.poll();
        String object = scope.inTenant(
                new TenantRegistryApi.TenantId(f.tenant()),
                () -> jobs.find(f.space(), job.id()).orElseThrow().outputKey());
        owner.update(
                "update shared.source_objects set protected_until=now()-interval '1 second' where" + " storage_key=?",
                object);
        cleanup.collect();
        assertThat(objects.exists(object)).isTrue();
        owner.update("update shared.bundle_exports set expires_at=now()-interval '1 second' where id=?", job.id());
        owner.update(
                "update shared.source_objects set protected_until=now()-interval '1 second' where" + " storage_key=?",
                object);
        cleanup.collect();
        assertThat(objects.exists(object)).isFalse();
    }

    private Fixture fixture() {
        String email = UUID.randomUUID() + "@export.test";
        var user = ((UserApi.RegisterResult.Registered) users.register(email, "Exporter")).user();
        owner.update("update iam.users set verified=true,platform_operator=true where id=?", user.value());
        String credential = ((SessionApi.StartResult.Started) sessions.start(
                        new SessionApi.HolderId(user.value()),
                        new SessionApi.Device("test", "test", "test"),
                        "loopback"))
                .credentials()
                .accessToken();
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential, "Export " + UUID.randomUUID(), email)
                .tenant()
                .id();
        UUID space = createSpaceUseCase
                .createSpace(credential, tenant, "Portable docs", "authored", key())
                .value()
                .id();
        String body = "# 可携带文档\n\n保留中文正文与格式。\n";
        byte[] image = Base64.getDecoder()
                .decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
        UUID page = scope.inTenant(new TenantRegistryApi.TenantId(tenant), () -> {
            spaces.setAutoRelease(new SpaceApi.ActorId(user.value()), new SpaceApi.SpaceId(space), false);
            var created = ((PageApi.CreateResult.Created)
                            pages.create(PageApi.Actor.user(user.value()), PageApi.Format.MARKDOWN, "可携带文档"))
                    .page();
            var id = new PageApi.PageId(created.id());
            spaces.place(new SpaceApi.SpaceId(space), created.id(), "guide");
            pages.edit(id, body, 0, PageApi.Actor.user(user.value()));
            pages.setIcon(id, "https://assets.example/icon.png", PageApi.Actor.user(user.value()));
            pages.setProperty(id, "product_code", "测试", PageApi.Actor.user(user.value()));
            pages.setSeo(
                    id,
                    new PageApi.SeoPatch(
                            PageApi.Patch.unchanged(),
                            PageApi.Patch.set("用于导出回环验证"),
                            PageApi.Patch.unchanged(),
                            PageApi.Patch.unchanged(),
                            Optional.of(true)),
                    PageApi.Actor.user(user.value()));
            assertThat(pages.attach(id, new PageApi.FileUpload("示例:2026.png", image), PageApi.Actor.user(user.value())))
                    .isInstanceOf(PageApi.AttachResult.Attached.class);
            pages.publish(id, PageApi.Actor.user(user.value()));
            toc.replace(
                    new TocApi.TocId(space),
                    List.of(new TocApi.Draft(
                            "分组",
                            TocApi.Kind.GROUP,
                            null,
                            null,
                            List.of(new TocApi.Draft("文档", TocApi.Kind.TARGET, created.id(), null, List.of())))));
            return created.id();
        });
        UUID release = buildReleaseUseCase
                .buildRelease(credential, tenant, space, key())
                .value()
                .release()
                .id();
        String object = scope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> pages.view(new PageApi.PageId(page))
                        .orElseThrow()
                        .attachments()
                        .getFirst()
                        .storageKey());
        reservations.protect(object);
        objects.putIfAbsent(object, image, "image/png");
        return new Fixture(tenant, space, page, release, user.value(), credential, body, image, object);
    }

    private byte[] download(Fixture f, UUID id) throws IOException {
        var status = viewExportUseCase.viewExport(f.credential(), f.tenant(), f.space(), id);
        assertThat(status.status()).as(status.toString()).isEqualTo("completed");
        try (var input = downloadExportUseCase.downloadExport(f.credential(), f.tenant(), f.space(), id).stream()) {
            return input.readAllBytes();
        }
    }

    private static Map<String, byte[]> entries(byte[] bytes) throws IOException {
        var result = new LinkedHashMap<String, byte[]>();
        try (var zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) result.put(entry.getName(), zip.readAllBytes());
        }
        return result;
    }

    private static byte[] replaceManifest(Map<String, byte[]> entries, byte[] manifest) throws IOException {
        var output = new ByteArrayOutputStream();
        try (var zip = new ZipOutputStream(output)) {
            for (var entry : entries.entrySet()) {
                zip.putNextEntry(new ZipEntry(entry.getKey()));
                zip.write(entry.getKey().equals("manifest.json") ? manifest : entry.getValue());
                zip.closeEntry();
            }
        }
        return output.toByteArray();
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private static String path(Fixture f) {
        return "/api/v1/tenants/" + f.tenant() + "/spaces/" + f.space();
    }

    private record Fixture(
            UUID tenant,
            UUID space,
            UUID page,
            UUID release,
            UUID user,
            String credential,
            String body,
            byte[] attachment,
            String objectKey) {}
}
