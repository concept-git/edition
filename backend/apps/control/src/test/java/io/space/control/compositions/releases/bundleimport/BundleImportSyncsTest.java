package io.space.control.compositions.releases.bundleimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.importformat.ImportPacks;
import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.objectstore.api.ObjectStoreApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.EditPageUseCase;
import io.space.control.compositions.authoring.pageediting.ListPagesUseCase;
import io.space.control.compositions.authoring.pageediting.ListRevisionsUseCase;
import io.space.control.compositions.authoring.pageediting.PageEditingTypes;
import io.space.control.compositions.authoring.pageediting.RenamePageUseCase;
import io.space.control.compositions.authoring.pageediting.ViewPageUseCase;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.authoring.space.ViewSpaceUseCase;
import io.space.control.compositions.authoring.tagging.ListTaggedPagesUseCase;
import io.space.control.compositions.flow.FlowIdempotencyKeyReusedException;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.resource.SpaceArchivedException;
import io.space.control.compositions.resource.SpaceModeRestrictedException;
import io.space.control.support.FixtureDatabaseConfiguration;
import io.space.control.support.FixtureHttpServer;
import io.space.control.support.MinioFixture;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class BundleImportSyncsTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static final MinIOContainer minio = MinioFixture.container();

    @DynamicPropertySource
    static void objectStore(DynamicPropertyRegistry registry) {
        MinioFixture.bind(registry, minio);
        // 远程地址夹具由本机 HttpServer 提供（http）；localhost 列入信任主机以豁免 https/私网检查
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
    BundleImportJobRunner runner;

    @Autowired
    ObjectStoreApi objectStore;

    @org.springframework.beans.factory.annotation.Autowired
    ListPagesUseCase listPagesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewPageUseCase viewPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RenamePageUseCase renamePageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    EditPageUseCase editPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListRevisionsUseCase listRevisionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewSpaceUseCase viewSpaceUseCase;

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
    ReleaseApi releases;

    @Autowired
    io.space.concepts.toc.api.TocApi toc;

    @Autowired
    ImportJobApi jobs;

    @Autowired
    TenantAccess tenants;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    io.space.concepts.tag.api.TagApi tags;

    @org.springframework.beans.factory.annotation.Autowired
    ListTaggedPagesUseCase listTaggedPagesUseCase;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void importsBundleV1OntoASyncedSpace() throws Exception {
        TenantFixture tenant = tenant("Import Ok", "owner@import-ok.test");
        UUID space = synced(tenant, "Docs");
        FlowResponse<BundleImportTypes.ImportAccepted> accepted = importZipNow(tenant, space, "F-v1-ok", key());
        assertThat(accepted.status()).isEqualTo(202);
        assertThat(accepted.value().job().status()).isEqualTo("queued");
        assertThat(accepted.value().release()).isNotNull();

        BundleImportTypes.JobView job =
                awaitJob(tenant, space, accepted.value().job().id());
        assertThat(job.status()).isEqualTo("completed");
        assertThat(job.outcome()).isEqualTo("promoted");
        assertThat(job.releaseId()).isEqualTo(accepted.value().release().id());

        tenants.inTenant(tenant.id(), () -> {
            assertThat(releases.live(new ReleaseApi.ScopeId(space))
                            .orElseThrow()
                            .id())
                    .isEqualTo(accepted.value().release().id());
        });

        var listed =
                listPagesUseCase.listPages(tenant.credential(), tenant.id(), space, null, 20, null, null, null, null);
        assertThat(listed.items())
                .extracting(PageEditingTypes.PageSummary::slug)
                .containsExactlyInAnyOrder("welcome", "guide");
        PageEditingTypes.PageSummary welcome = listed.items().stream()
                .filter(item -> "welcome".equals(item.slug()))
                .findFirst()
                .orElseThrow();
        PageEditingTypes.PageDetail detail =
                viewPageUseCase.viewPage(tenant.credential(), tenant.id(), space, welcome.id());
        assertThat(detail.status()).isEqualTo("published");
        assertThat(detail.content()).contains("Hello from F-v1-ok");
        assertThat(detail.allowedActions())
                .contains(PageEditingTypes.Action.EDIT)
                .doesNotContain(PageEditingTypes.Action.RENAME, PageEditingTypes.Action.CREATE);

        var revisions =
                listRevisionsUseCase.listRevisions(tenant.credential(), tenant.id(), space, welcome.id(), null, 20);
        assertThat(revisions.items()).isNotEmpty();
        assertThat(revisions.items().getFirst().actor().type()).isEqualTo("system");

        assertThat(viewSpaceUseCase
                        .viewSpace(tenant.credential(), tenant.id(), space)
                        .pageCount())
                .isEqualTo(2);
        assertThat(viewSpaceUseCase
                        .viewSpace(tenant.credential(), tenant.id(), space)
                        .driftCount())
                .isZero();
    }

    @Test
    void authoredSpaceRejectsImport() throws Exception {
        TenantFixture tenant = tenant("Import Authored", "owner@import-authored.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Wiki", "authored", key())
                .value()
                .id();
        assertThatExceptionOfType(SpaceModeRestrictedException.class)
                .isThrownBy(() -> importZip(tenant, space, "F-v1-ok", key()));
        assertThat(jdbc.queryForObject("select count(*) from shared.jobs where space_id = ?", Long.class, space))
                .isZero();
    }

    @Test
    void sameKeyAndShaReplaysTheSameJob() throws Exception {
        TenantFixture tenant = tenant("Import Replay", "owner@import-replay.test");
        UUID space = synced(tenant, "Replay");
        String key = key();
        var first = importZip(tenant, space, "F-v1-ok", key);
        var second = importZip(tenant, space, "F-v1-ok", key);
        assertThat(second.status()).isEqualTo(202);
        assertThat(second.value().job().id()).isEqualTo(first.value().job().id());
        assertThat(second.value().release().id())
                .isEqualTo(first.value().release().id());
    }

    @Test
    void identicalZipWithANewKeyIsSkipped() throws Exception {
        TenantFixture tenant = tenant("Import Skip", "owner@import-skip.test");
        UUID space = synced(tenant, "Skip");
        var first = importZip(tenant, space, "F-v1-ok", key());
        UUID live = first.value().release().id();
        var second = importZip(tenant, space, "F-v1-ok", key());
        BundleImportTypes.JobView job = viewImportJobUseCase.viewImportJob(
                tenant.credential(), tenant.id(), space, second.value().job().id());
        assertThat(job.outcome()).isEqualTo("skipped");
        tenants.inTenant(tenant.id(), () -> {
            assertThat(releases.live(new ReleaseApi.ScopeId(space))
                            .orElseThrow()
                            .id())
                    .isEqualTo(live);
            assertThat(releases.status(
                            new ReleaseApi.ReleaseId(second.value().release().id())))
                    .isEmpty();
        });
    }

    @Test
    void hotfixEditOnSyncedPromotesBuildAndFlagsDrift() throws Exception {
        TenantFixture tenant = tenant("Import Hotfix", "owner@import-hotfix.test");
        UUID space = synced(tenant, "Hotfix");
        importZip(tenant, space, "F-v1-ok", key());
        PageEditingTypes.PageSummary welcome = pageAt(tenant, space, "welcome");
        tenants.inTenant(
                tenant.id(), () -> tags.tag(new io.space.concepts.tag.api.TagApi.ItemId(welcome.id()), "hotfix"));
        PageEditingTypes.PageDetail before =
                viewPageUseCase.viewPage(tenant.credential(), tenant.id(), space, welcome.id());
        String patched = before.content() + "\n\nHotfix line.\n";
        PageEditingTypes.PageDetail edited = editPageUseCase
                .editPage(tenant.credential(), tenant.id(), space, welcome.id(), patched, before.revision(), key())
                .value();
        assertThat(edited.driftFlag()).isTrue();
        assertThat(listTaggedPagesUseCase
                        .listTaggedPages(tenant.credential(), tenant.id(), "hotfix", null, 20)
                        .items())
                .singleElement()
                .satisfies(item -> assertThat(item.driftFlag()).isTrue());
        assertThat(edited.content()).contains("Hotfix line");
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.View live = releases.live(new ReleaseApi.ScopeId(space)).orElseThrow();
            assertThat(live.source().kind()).isEqualTo(ReleaseApi.SourceKind.BUILD);
        });
        BundleImportTypes.DriftBoard board = viewDriftUseCase.viewDrift(tenant.credential(), tenant.id(), space);
        assertThat(board.driftCount()).isGreaterThan(0);
        assertThat(board.items()).extracting(BundleImportTypes.DriftItem::slug).contains("welcome");
        assertThat(viewSpaceUseCase
                        .viewSpace(tenant.credential(), tenant.id(), space)
                        .driftCount())
                .isGreaterThan(0);

        assertThatExceptionOfType(SpaceModeRestrictedException.class)
                .isThrownBy(() -> renamePageUseCase.renamePage(
                        tenant.credential(), tenant.id(), space, welcome.id(), "Nope", key()));
    }

    @Test
    void importAfterHotfixFlagsThenApproveMirrors() throws Exception {
        TenantFixture tenant = tenant("Import Flagged", "owner@import-flagged.test");
        UUID space = synced(tenant, "Flagged");
        importZip(tenant, space, "F-v1-ok", key());
        PageEditingTypes.PageSummary welcome = pageAt(tenant, space, "welcome");
        PageEditingTypes.PageDetail before =
                viewPageUseCase.viewPage(tenant.credential(), tenant.id(), space, welcome.id());
        editPageUseCase.editPage(
                tenant.credential(),
                tenant.id(),
                space,
                welcome.id(),
                before.content() + "\n\nKeep hotfix.\n",
                before.revision(),
                key());

        var flagged = importZip(tenant, space, "F-v1-ok", key());
        BundleImportTypes.JobView job = viewImportJobUseCase.viewImportJob(
                tenant.credential(), tenant.id(), space, flagged.value().job().id());
        assertThat(job.outcome()).isEqualTo("flagged");
        tenants.inTenant(tenant.id(), () -> {
            assertThat(releases.status(
                            new ReleaseApi.ReleaseId(flagged.value().release().id())))
                    .contains(ReleaseApi.Status.FLAGGED);
            assertThat(releases.live(new ReleaseApi.ScopeId(space))
                            .orElseThrow()
                            .source()
                            .kind())
                    .isEqualTo(ReleaseApi.SourceKind.BUILD);
        });
        assertThat(viewPageUseCase
                        .viewPage(tenant.credential(), tenant.id(), space, welcome.id())
                        .content())
                .contains("Keep hotfix");

        assertThat(listPreviewPagesUseCase.listPreviewPages(
                        tenant.credential(),
                        tenant.id(),
                        space,
                        flagged.value().release().id()))
                .extracting(BundleImportTypes.PreviewPage::slug)
                .contains("welcome");
        BundleImportTypes.SnapshotPreview preview = previewReleaseUseCase.previewRelease(
                tenant.credential(),
                tenant.id(),
                space,
                flagged.value().release().id(),
                "welcome");
        assertThat(preview.html()).contains("Hello from F-v1-ok");
        assertThat(preview.html()).doesNotContain("Keep hotfix");

        var approved = approveReleaseUseCase.approveRelease(
                tenant.credential(),
                tenant.id(),
                space,
                flagged.value().release().id(),
                key());
        assertThat(approved.status()).isEqualTo(200);
        assertThat(approved.value().outcome()).isEqualTo("promoted");
        assertThat(viewPageUseCase
                        .viewPage(tenant.credential(), tenant.id(), space, welcome.id())
                        .content())
                .contains("Hello from F-v1-ok")
                .doesNotContain("Keep hotfix");
        assertThat(viewDriftUseCase
                        .viewDrift(tenant.credential(), tenant.id(), space)
                        .driftCount())
                .isZero();
    }

    @Test
    void flaggedImportBlocksANewKey() throws Exception {
        TenantFixture tenant = tenant("Import Blocked", "owner@import-blocked.test");
        UUID space = synced(tenant, "Blocked");
        importZip(tenant, space, "F-v1-ok", key());
        PageEditingTypes.PageSummary welcome = pageAt(tenant, space, "welcome");
        PageEditingTypes.PageDetail before =
                viewPageUseCase.viewPage(tenant.credential(), tenant.id(), space, welcome.id());
        editPageUseCase.editPage(
                tenant.credential(),
                tenant.id(),
                space,
                welcome.id(),
                before.content() + "\n\nDrift.\n",
                before.revision(),
                key());
        importZip(tenant, space, "F-v1-ok", key());
        assertThatExceptionOfType(ImportBlockedException.class)
                .isThrownBy(() -> importZip(tenant, space, "F-v1-ok", key()));
    }

    @Test
    void approvalMirrorsDeletedPagesAndReplaysAfterPromotion() throws Exception {
        TenantFixture tenant = tenant("Approval deletion", "owner@approval-deletion.test");
        UUID space = synced(tenant, "Docs");
        var initial = importZip(tenant, space, "F-v1-ok", key());
        var original = tenants.inTenant(
                tenant.id(),
                () -> releases.export(new ReleaseApi.ReleaseId(
                                initial.value().release().id()))
                        .orElseThrow());
        var welcome = pageAt(tenant, space, "welcome");
        var removed = pageAt(tenant, space, "guide");
        var before = viewPageUseCase.viewPage(tenant.credential(), tenant.id(), space, welcome.id());
        editPageUseCase.editPage(
                tenant.credential(),
                tenant.id(),
                space,
                welcome.id(),
                before.content() + "\n\nHotfix.\n",
                before.revision(),
                key());
        UUID flagged = tenants.inTenant(tenant.id(), () -> {
            var draft = releases.draft(
                    new ReleaseApi.ScopeId(space),
                    new ReleaseApi.Source(ReleaseApi.SourceKind.IMPORT, "approval-test", UUID.randomUUID()));
            var id = new ReleaseApi.ReleaseId(draft.id());
            var retained = original.pages().stream()
                    .filter(p -> p.pageId().equals(welcome.id()))
                    .toList();
            var bundle = new ReleaseApi.Bundle(
                    original.bundleVersion(),
                    original.generator(),
                    original.generatedAt(),
                    retained,
                    java.util.List.of(),
                    original.checksums());
            assertThat(releases.load(id, bundle)).isInstanceOf(ReleaseApi.LoadResult.Loaded.class);
            assertThat(releases.validate(
                            id, java.util.List.of(new ReleaseApi.CoverageWarning(welcome.id(), "welcome"))))
                    .isInstanceOf(ReleaseApi.ValidateResult.Warnings.class);
            return draft.id();
        });
        String approvalKey = key();
        var approved =
                approveReleaseUseCase.approveRelease(tenant.credential(), tenant.id(), space, flagged, approvalKey);
        assertThat(jdbc.queryForObject(
                        "select trashed_at is not null from authoring.pages where id=?", Boolean.class, removed.id()))
                .isTrue();
        assertThat(listPagesUseCase
                        .listPages(tenant.credential(), tenant.id(), space, null, 20, null, null, null, null)
                        .items())
                .extracting(PageEditingTypes.PageSummary::id)
                .containsExactly(welcome.id());
        var replay =
                approveReleaseUseCase.approveRelease(tenant.credential(), tenant.id(), space, flagged, approvalKey);
        assertThat(replay).isEqualTo(approved);
        archiveSpaceUseCase.archiveSpace(tenant.credential(), tenant.id(), space, key());
        assertThat(approveReleaseUseCase.approveRelease(tenant.credential(), tenant.id(), space, flagged, approvalKey))
                .isEqualTo(approved);
    }

    @Test
    void uploadAndRemoteImportOfTheSameBytesUseOneLockOrder() throws Exception {
        var tenant = tenant("Mixed ingress race", "owner@mixed-ingress.test");
        UUID space = synced(tenant, "Docs");
        Path zip = ImportPacks.zipFixture("F-tree-mini");
        String url = remote.serveSlowZip("mixed-ingress.zip", zip, 3000);
        try (var pool = Executors.newSingleThreadExecutor()) {
            var remoteAccepted = pool.submit(() -> remoteImport(tenant, space, url));
            org.awaitility.Awaitility.await()
                    .atMost(java.time.Duration.ofSeconds(5))
                    .until(() -> remote.hits("/mixed-ingress.zip") == 1);
            try (InputStream body = Files.newInputStream(zip)) {
                assertThatExceptionOfType(ImportInProgressException.class)
                        .isThrownBy(() -> continuousImportUseCase.continuousImport(
                                tenant.credential(),
                                tenant.id(),
                                space,
                                new BundleImportTypes.ImportSource.ZipStream(body, Files.size(zip)),
                                key()));
            }
            assertThat(remoteAccepted.get(10, TimeUnit.SECONDS).status()).isEqualTo(202);
        }
    }

    @Test
    void runningJobBlocksANewKey() throws Exception {
        TenantFixture tenant = tenant("Import Busy", "owner@import-busy.test");
        UUID space = synced(tenant, "Busy");
        jdbc.update("""
                insert into shared.jobs (tenant_id, type, space_id, status, phase, attempt)
                values (?, 'import', ?, 'running', 'inspecting', 0)
                """, tenant.id(), space);
        assertThatExceptionOfType(ImportInProgressException.class)
                .isThrownBy(() -> importZip(tenant, space, "F-v1-ok", key()));
    }

    @Test
    void unknownPackCompletesInvalidBundleAndDiscardsRelease() throws Exception {
        TenantFixture tenant = tenant("Import Unknown", "owner@import-unknown.test");
        UUID space = synced(tenant, "Unknown");
        var accepted = importZip(tenant, space, "F-unknown", key());
        BundleImportTypes.JobView job = viewImportJobUseCase.viewImportJob(
                tenant.credential(), tenant.id(), space, accepted.value().job().id());
        assertThat(job.status()).isEqualTo("completed");
        assertThat(job.outcome()).isEqualTo("invalid_bundle");
        tenants.inTenant(tenant.id(), () -> {
            assertThat(releases.status(
                            new ReleaseApi.ReleaseId(accepted.value().release().id())))
                    .isEmpty();
            assertThat(releases.live(new ReleaseApi.ScopeId(space))).isEmpty();
        });
    }

    @Test
    void importsHuaweiAndOkfMiniPacks() throws Exception {
        TenantFixture hw = tenant("Import Hw", "owner@import-hw.test");
        UUID hwSpace = synced(hw, "Hw");
        var hwAccepted = importZip(hw, hwSpace, "F-hw-mini", key());
        BundleImportTypes.JobView hwJob = viewImportJobUseCase.viewImportJob(
                hw.credential(), hw.id(), hwSpace, hwAccepted.value().job().id());
        assertThat(hwJob.outcome()).isEqualTo("promoted");
        tenants.inTenant(hw.id(), () -> {
            ReleaseApi.View live =
                    releases.live(new ReleaseApi.ScopeId(hwSpace)).orElseThrow();
            assertThat(releases.export(new ReleaseApi.ReleaseId(live.id()))
                            .orElseThrow()
                            .generator())
                    .isEqualTo("hwcloud-docs");
        });

        TenantFixture okf = tenant("Import Okf", "owner@import-okf.test");
        UUID okfSpace = synced(okf, "Okf");
        var okfAccepted = importZip(okf, okfSpace, "F-okf-mini", key());
        BundleImportTypes.JobView okfJob = viewImportJobUseCase.viewImportJob(
                okf.credential(), okf.id(), okfSpace, okfAccepted.value().job().id());
        assertThat(okfJob.outcome()).isEqualTo("promoted");
        tenants.inTenant(okf.id(), () -> {
            ReleaseApi.View live =
                    releases.live(new ReleaseApi.ScopeId(okfSpace)).orElseThrow();
            assertThat(releases.export(new ReleaseApi.ReleaseId(live.id()))
                            .orElseThrow()
                            .generator())
                    .isEqualTo("okf-v0.1");
        });
    }

    @Test
    void tolerantIpdPromotesAndRenumberingPreservesIdsWhileBadStructureKeepsLive() throws Exception {
        TenantFixture tenant = tenant("IPD Tolerance", "owner@ipd-tolerance.test");
        UUID space = synced(tenant, "IPD");
        BundleImportTypes.JobView first = importIpd(tenant, space, "valid");
        assertThat(first.outcome()).isEqualTo("promoted");
        assertThat(first.report().info())
                .extracting(BundleImportTypes.ImportIssue::code)
                .contains("metadata_record_ignored", "seo_field_ignored", "title_fallback");
        assertThat(viewImportJobUseCase
                        .viewImportJob(tenant.credential(), tenant.id(), space, first.id())
                        .report())
                .isEqualTo(first.report());
        ReleaseApi.Bundle original = tenants.inTenant(
                tenant.id(),
                () -> releases.export(new ReleaseApi.ReleaseId(first.releaseId()))
                        .orElseThrow());
        assertThat(original.pages()).hasSize(7);
        assertThat(original.pages().stream()
                        .filter(page -> page.externalId().equals("intro.html"))
                        .findFirst()
                        .orElseThrow()
                        .content())
                .isEqualTo(Files.readString(
                        Path.of(System.getProperty("space.import.fixtures"), "F-ipd-tolerant/intro.html")));
        assertThat(original.toc()).hasSize(2);
        assertThat(original.pages())
                .extracting(ReleaseApi.PageSnapshot::externalId)
                .contains(
                        "intro.html", "class-only.html", "meta-only.html", "guides/a/same.html", "guides/b/same.html");
        var published =
                listPagesUseCase.listPages(tenant.credential(), tenant.id(), space, null, 20, null, null, null, null);
        assertThat(published.items()).hasSize(7);
        assertThat(published.items()).allMatch(page -> page.status().equals("published"));
        UUID introId = original.pages().stream()
                .filter(page -> page.externalId().equals("intro.html"))
                .findFirst()
                .orElseThrow()
                .pageId();
        var workingTree =
                tenants.inTenant(tenant.id(), () -> toc.tree(new io.space.concepts.toc.api.TocApi.TocId(space)));
        assertThat(workingTree).hasSize(2);
        assertThat(workingTree.getFirst().children())
                .filteredOn(node -> introId.equals(node.targetId()))
                .hasSize(2);
        assertThat(workingTree.getFirst().children().getFirst().label()).isEqualTo("介绍导航");
        assertThat(importIpd(tenant, space, "renumbered").outcome()).isEqualTo("skipped");
        var badParent = importIpd(tenant, space, "missing-parent");
        assertThat(badParent.outcome()).isEqualTo("invalid_bundle");
        assertThat(badParent.report().errors())
                .extracting(BundleImportTypes.ImportIssue::path)
                .contains("CLASS[1].p_code");
        for (String variant : java.util.List.of("empty", "missing-link")) {
            var invalid = importIpd(tenant, space, variant);
            assertThat(invalid.outcome()).isEqualTo("invalid_bundle");
            assertThat(invalid.report().errors())
                    .extracting(BundleImportTypes.ImportIssue::code)
                    .contains(variant.equals("empty") ? "empty_ipd_pack" : "broken_local_reference");
            assertThat(viewImportJobUseCase
                            .viewImportJob(tenant.credential(), tenant.id(), space, invalid.id())
                            .report())
                    .isEqualTo(invalid.report());
        }
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.View live = releases.live(new ReleaseApi.ScopeId(space)).orElseThrow();
            assertThat(live.id()).isEqualTo(first.releaseId());
            ReleaseApi.Bundle after =
                    releases.export(new ReleaseApi.ReleaseId(live.id())).orElseThrow();
            assertThat(after.pages()).isEqualTo(original.pages());
            assertThat(after.toc()).isEqualTo(original.toc());
            assertThat(toc.tree(new io.space.concepts.toc.api.TocApi.TocId(space)))
                    .isEqualTo(workingTree);
        });
        var after =
                listPagesUseCase.listPages(tenant.credential(), tenant.id(), space, null, 20, null, null, null, null);
        assertThat(after.items())
                .extracting(PageEditingTypes.PageSummary::id)
                .containsExactlyInAnyOrderElementsOf(published.items().stream()
                        .map(PageEditingTypes.PageSummary::id)
                        .toList());
    }

    private BundleImportTypes.JobView importIpd(TenantFixture tenant, UUID space, String variant) throws Exception {
        Path zip = ImportPacks.ipdToleranceZip(variant);
        FlowResponse<BundleImportTypes.ImportAccepted> accepted;
        try (InputStream in = Files.newInputStream(zip)) {
            accepted = continuousImportUseCase.continuousImport(
                    tenant.credential(),
                    tenant.id(),
                    space,
                    new BundleImportTypes.ImportSource.ZipStream(in, Files.size(zip)),
                    key());
        }
        return awaitJob(tenant, space, accepted.value().job().id());
    }

    @Test
    @EnabledIf("githubZipPresent")
    void importsGithubTourismOkfZip() throws Exception {
        TenantFixture tenant = tenant("Import Github Okf", "owner@import-github-okf.test");
        UUID space = synced(tenant, "GithubOkf");
        Path zip = ImportPacks.okfGithubZip();
        FlowResponse<BundleImportTypes.ImportAccepted> accepted;
        try (InputStream in = Files.newInputStream(zip)) {
            accepted = continuousImportUseCase.continuousImport(
                    tenant.credential(),
                    tenant.id(),
                    space,
                    new BundleImportTypes.ImportSource.ZipStream(in, Files.size(zip)),
                    key());
        }
        BundleImportTypes.JobView job =
                awaitJob(tenant, space, accepted.value().job().id());
        assertThat(job.status()).isEqualTo("completed");
        assertThat(job.outcome()).isEqualTo("promoted");
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.View live = releases.live(new ReleaseApi.ScopeId(space)).orElseThrow();
            ReleaseApi.Bundle bundle =
                    releases.export(new ReleaseApi.ReleaseId(live.id())).orElseThrow();
            assertThat(bundle.generator()).isEqualTo("okf-v0.1");
            assertThat(bundle.pages()).isNotEmpty();
        });
    }

    static boolean designKnowledgeBaseZipPresent() {
        String env = System.getenv("DESIGN_OKF_ZIP");
        return env != null && Files.isRegularFile(Path.of(env));
    }

    /** 案例验收：okfgen 从本仓库设计文档生成的 OKF v0.2 知识库 zip，经远程地址导入成为主版本。 */
    @Test
    @EnabledIf("designKnowledgeBaseZipPresent")
    void importsTheDesignKnowledgeBaseBuiltWithOkfTooling() throws Exception {
        TenantFixture tenant = tenant("Import Design KB", "owner@import-design-kb.test");
        UUID space = synced(tenant, "DesignKb");
        String url = remote.serveZip("dw-design-okf.zip", Path.of(System.getenv("DESIGN_OKF_ZIP")));
        FlowResponse<BundleImportTypes.ImportAccepted> accepted = remoteImport(tenant, space, url);
        BundleImportTypes.JobView job =
                awaitJob(tenant, space, accepted.value().job().id());
        tenants.inTenant(tenant.id(), () -> {
            if (!"promoted".equals(job.outcome())) {
                ReleaseApi.View draft =
                        releases.list(new ReleaseApi.ScopeId(space)).getFirst();
                throw new AssertionError("design KB import outcome=" + job.outcome() + " report=" + draft.report());
            }
            ReleaseApi.View live = releases.live(new ReleaseApi.ScopeId(space)).orElseThrow();
            ReleaseApi.Bundle bundle =
                    releases.export(new ReleaseApi.ReleaseId(live.id())).orElseThrow();
            assertThat(bundle.generator()).isEqualTo("okf-v0.1");
            assertThat(bundle.pages()).hasSize(69);
            assertThat(bundle.pages())
                    .extracting(ReleaseApi.PageSnapshot::slug)
                    .contains("context", "authoring-space", "publishing-bundleimport", "bundle");
            assertThat(bundle.toc())
                    .extracting(ReleaseApi.TocNode::label)
                    .contains("产品规格（PRD）", "架构决策记录（ADR）", "概念规格（CONCEPT.md）", "组合流程规格（SYNCS.md）");
            System.out.println("[design-kb] pages=" + bundle.pages().size() + " toc groups="
                    + bundle.toc().stream().map(ReleaseApi.TocNode::label).toList());
        });
    }

    @Test
    void storedUploadPromotesTheSameAsADirectZip() throws Exception {
        TenantFixture tenant = tenant("Import Upload", "owner@import-upload.test");
        UUID space = synced(tenant, "Upload");
        Path zip = zipFixture("F-v1-ok");
        BundleImportTypes.ImportUpload upload =
                startImportUploadUseCase.startImportUpload(tenant.credential(), tenant.id(), space);
        try (InputStream in = Files.newInputStream(zip)) {
            objectStore.putIfAbsent(upload.uploadKey(), in, Files.size(zip), "application/zip");
        }
        var accepted = continuousImportUseCase.continuousImport(
                tenant.credential(),
                tenant.id(),
                space,
                new BundleImportTypes.ImportSource.StoredUpload(upload.uploadKey()),
                key());
        assertThat(accepted.status()).isEqualTo(202);
        BundleImportTypes.JobView job =
                awaitJob(tenant, space, accepted.value().job().id());
        assertThat(job.outcome()).isEqualTo("promoted");
    }

    @Test
    void sameKeyDifferentShaConflicts() throws Exception {
        TenantFixture tenant = tenant("Import Reuse", "owner@import-reuse.test");
        UUID space = synced(tenant, "Reuse");
        String key = key();
        importZip(tenant, space, "F-v1-ok", key);
        assertThatExceptionOfType(FlowIdempotencyKeyReusedException.class)
                .isThrownBy(() -> importZip(tenant, space, "F-unknown", key));
    }

    @Test
    void incompleteRecoveryMetadataTerminatesInsteadOfLoopingAsRunning() {
        var tenant = tenant("Incomplete job", "incomplete-job@test.example");
        UUID space = synced(tenant, "Broken fixture");
        UUID job = jdbc.queryForObject(
                "insert into shared.jobs(tenant_id,type,space_id,status,phase,attempt) values(?,'import',?,'running','inspecting',0) returning id",
                UUID.class,
                tenant.id(),
                space);
        runner.run(tenant.id(), job);
        runner.run(tenant.id(), job);
        var result = viewImportJobUseCase.viewImportJob(tenant.credential(), tenant.id(), space, job);
        assertThat(result.status()).isEqualTo("failed");
        assertThat(result.outcome()).isEqualTo("unexpected_error");
    }

    @Test
    void missingZipMarksTheJobRetryingAndKeepsTheDraft() {
        TenantFixture tenant = tenant("Import Retry", "owner@import-retry.test");
        UUID space = synced(tenant, "Retry");
        UUID[] ids = new UUID[2];
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.View drafted = releases.draft(
                    new ReleaseApi.ScopeId(space),
                    new ReleaseApi.Source(ReleaseApi.SourceKind.IMPORT, "missing", UUID.randomUUID()));
            ImportJobApi.View job =
                    jobs.enqueue(tenant.id(), space, drafted.id(), "00".repeat(32), "import-zips/missing", null);
            ids[0] = drafted.id();
            ids[1] = job.id();
        });
        runner.run(tenant.id(), ids[1]);
        BundleImportTypes.JobView job =
                viewImportJobUseCase.viewImportJob(tenant.credential(), tenant.id(), space, ids[1]);
        assertThat(job.status()).isEqualTo("retrying");
        assertThat(job.outcome()).isNull();
        tenants.inTenant(tenant.id(), () -> {
            assertThat(releases.status(new ReleaseApi.ReleaseId(ids[0]))).contains(ReleaseApi.Status.DRAFT);
        });
    }

    @Test
    void missingZipExhaustsRetriesAndKeepsTheDraft() {
        TenantFixture tenant = tenant("Import Failed", "owner@import-failed.test");
        UUID space = synced(tenant, "Failed");
        UUID[] ids = new UUID[2];
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.View drafted = releases.draft(
                    new ReleaseApi.ScopeId(space),
                    new ReleaseApi.Source(ReleaseApi.SourceKind.IMPORT, "missing", UUID.randomUUID()));
            ImportJobApi.View job =
                    jobs.enqueue(tenant.id(), space, drafted.id(), "00".repeat(32), "import-zips/missing", null);
            ids[0] = drafted.id();
            ids[1] = job.id();
        });
        runner.run(tenant.id(), ids[1]);
        runner.run(tenant.id(), ids[1]);
        assertThat(viewImportJobUseCase
                        .viewImportJob(tenant.credential(), tenant.id(), space, ids[1])
                        .attempt())
                .isEqualTo(1);
        for (int i = 0; i < 5; i++) {
            jdbc.update("update shared.jobs set next_run_at=now()-interval '1 second' where id=?", ids[1]);
            runner.run(tenant.id(), ids[1]);
        }
        BundleImportTypes.JobView job =
                viewImportJobUseCase.viewImportJob(tenant.credential(), tenant.id(), space, ids[1]);
        assertThat(job.status()).isEqualTo("failed");
        assertThat(job.outcome()).isEqualTo("dependency_failed");
        tenants.inTenant(tenant.id(), () -> {
            assertThat(releases.status(new ReleaseApi.ReleaseId(ids[0]))).contains(ReleaseApi.Status.DRAFT);
        });
    }

    @Test
    void archivedSpaceRejectsImport() throws Exception {
        TenantFixture tenant = tenant("Import Archived", "owner@import-archived.test");
        UUID space = synced(tenant, "Archived");
        archiveSpaceUseCase.archiveSpace(tenant.credential(), tenant.id(), space, key());
        assertThatExceptionOfType(SpaceArchivedException.class)
                .isThrownBy(() -> importZipNow(tenant, space, "F-v1-ok", key()));
        assertThat(jdbc.queryForObject("select count(*) from shared.jobs where space_id = ?", Long.class, space))
                .isZero();
    }

    @Test
    void brokenLinkHoldsDraftWithReport() throws Exception {
        TenantFixture tenant = tenant("Import Held", "owner@import-held.test");
        UUID space = synced(tenant, "Held");
        var accepted = importZip(tenant, space, "F-broken-link", key());
        BundleImportTypes.JobView job = viewImportJobUseCase.viewImportJob(
                tenant.credential(), tenant.id(), space, accepted.value().job().id());
        assertThat(job.outcome()).isEqualTo("held");
        assertThat(listPreviewPagesUseCase.listPreviewPages(
                        tenant.credential(),
                        tenant.id(),
                        space,
                        accepted.value().release().id()))
                .extracting(BundleImportTypes.PreviewPage::slug)
                .contains("welcome");
        BundleImportTypes.SnapshotPreview preview = previewReleaseUseCase.previewRelease(
                tenant.credential(),
                tenant.id(),
                space,
                accepted.value().release().id(),
                "welcome");
        assertThat(preview.slug()).isEqualTo("welcome");
        assertThat(preview.html()).contains("Hello from F-v1-ok");
        tenants.inTenant(tenant.id(), () -> {
            assertThat(releases.status(
                            new ReleaseApi.ReleaseId(accepted.value().release().id())))
                    .contains(ReleaseApi.Status.DRAFT);
            ReleaseApi.View draft = releases.list(new ReleaseApi.ScopeId(space)).stream()
                    .filter(item -> item.id().equals(accepted.value().release().id()))
                    .findFirst()
                    .orElseThrow();
            assertThat(draft.report().errors())
                    .extracting(ReleaseApi.Issue::code)
                    .contains("broken_link");
        });
    }

    @Test
    void badChecksumCompletesInvalidBundle() throws Exception {
        TenantFixture tenant = tenant("Import Checksum", "owner@import-checksum.test");
        UUID space = synced(tenant, "Checksum");
        var accepted = importZip(tenant, space, "F-v1-bad-checksum", key());
        BundleImportTypes.JobView job = viewImportJobUseCase.viewImportJob(
                tenant.credential(), tenant.id(), space, accepted.value().job().id());
        assertThat(job.outcome()).isEqualTo("invalid_bundle");
        tenants.inTenant(tenant.id(), () -> {
            assertThat(releases.status(
                            new ReleaseApi.ReleaseId(accepted.value().release().id())))
                    .isEmpty();
        });
    }

    @Test
    void oversizePageCompletesInvalidBundle() throws Exception {
        TenantFixture tenant = tenant("Import Oversize", "owner@import-oversize-page.test");
        UUID space = synced(tenant, "Oversize");
        Path zip = ImportPacks.oversizePageZip();
        FlowResponse<BundleImportTypes.ImportAccepted> accepted;
        try (InputStream in = Files.newInputStream(zip)) {
            accepted = continuousImportUseCase.continuousImport(
                    tenant.credential(),
                    tenant.id(),
                    space,
                    new BundleImportTypes.ImportSource.ZipStream(in, Files.size(zip)),
                    key());
        }
        BundleImportTypes.JobView job =
                awaitJob(tenant, space, accepted.value().job().id());
        assertThat(job.outcome()).isEqualTo("invalid_bundle");
    }

    @Test
    void formatChangeHoldsWithUnsupportedFormatReport() throws Exception {
        TenantFixture tenant = tenant("Import Format", "owner@import-format.test");
        UUID space = synced(tenant, "Format");
        importZip(tenant, space, "F-v1-ok", key());
        Path zip = ImportPacks.welcomeAsHtmlOverV1();
        FlowResponse<BundleImportTypes.ImportAccepted> accepted;
        try (InputStream in = Files.newInputStream(zip)) {
            accepted = continuousImportUseCase.continuousImport(
                    tenant.credential(),
                    tenant.id(),
                    space,
                    new BundleImportTypes.ImportSource.ZipStream(in, Files.size(zip)),
                    key());
        }
        BundleImportTypes.JobView job =
                awaitJob(tenant, space, accepted.value().job().id());
        assertThat(job.outcome()).isEqualTo("held");
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.View draft = releases.list(new ReleaseApi.ScopeId(space)).stream()
                    .filter(item -> item.id().equals(accepted.value().release().id()))
                    .findFirst()
                    .orElseThrow();
            assertThat(draft.report().errors())
                    .extracting(ReleaseApi.Issue::code)
                    .contains("unsupported_format");
        });
    }

    @Test
    void missingUploadKeyIsNotFound() {
        TenantFixture tenant = tenant("Import UploadMissing", "owner@import-upload-missing.test");
        UUID space = synced(tenant, "UploadMissing");
        assertThatExceptionOfType(ImportUploadNotFoundException.class)
                .isThrownBy(() -> continuousImportUseCase.continuousImport(
                        tenant.credential(),
                        tenant.id(),
                        space,
                        new BundleImportTypes.ImportSource.StoredUpload("import-uploads/missing"),
                        key()));
    }

    @Test
    void remoteUrlImportsPlainTreeAndRecordsSourceUrl() throws Exception {
        TenantFixture tenant = tenant("Import Remote", "owner@import-remote.test");
        UUID space = synced(tenant, "Remote");
        String url = remote.serveZip("tree.zip", ImportPacks.zipFixture("F-tree-mini"));
        FlowResponse<BundleImportTypes.ImportAccepted> accepted = continuousImportUseCase.continuousImport(
                tenant.credential(), tenant.id(), space, new BundleImportTypes.ImportSource.RemoteZip(url), key());
        assertThat(accepted.status()).isEqualTo(202);
        assertThat(accepted.value().job().sourceUrl()).isEqualTo(url);
        assertThat(accepted.value().job().adapterId())
                .as("format is only known after adapt")
                .isNull();
        BundleImportTypes.JobView job =
                awaitJob(tenant, space, accepted.value().job().id());
        assertThat(job.outcome()).isEqualTo("promoted");
        assertThat(job.sourceUrl()).isEqualTo(url);
        assertThat(job.adapterId()).isEqualTo("file-tree");
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.Bundle live =
                    releases.export(new ReleaseApi.ReleaseId(job.releaseId())).orElseThrow();
            assertThat(live.generator()).isEqualTo("file-tree");
            assertThat(live.pages())
                    .extracting(ReleaseApi.PageSnapshot::slug)
                    .contains(
                            "README.md",
                            "01-getting-started.md",
                            "02-guides/index.md",
                            "02-guides/install.md",
                            "02-guides/faq.html",
                            "reference/api.html");
        });
        var listed =
                listPagesUseCase.listPages(tenant.credential(), tenant.id(), space, null, 20, null, null, null, null);
        assertThat(listed.items())
                .extracting(PageEditingTypes.PageSummary::slug)
                .contains("02-guides/install.md");
    }

    @Test
    void remoteUrlWithUnchangedContentSkipsAndChangedContentReconcilesByExternalId() throws Exception {
        TenantFixture tenant = tenant("Import Remote V2", "owner@import-remote-v2.test");
        UUID space = synced(tenant, "RemoteV2");
        String first = remote.serveZip("v1.zip", ImportPacks.zipFixture("F-tree-mini"));
        awaitJob(tenant, space, remoteImport(tenant, space, first).value().job().id());
        UUID startedId = pageAt(tenant, space, "01-getting-started.md").id();
        UUID apiId = pageAt(tenant, space, "reference/api.html").id();

        BundleImportTypes.JobView same = awaitJob(
                tenant, space, remoteImport(tenant, space, first).value().job().id());
        assertThat(same.outcome()).isEqualTo("skipped");

        String second = remote.serveZip("v2.zip", ImportPacks.zipFixture("F-tree-mini-v2"));
        BundleImportTypes.JobView changed = awaitJob(
                tenant, space, remoteImport(tenant, space, second).value().job().id());
        assertThat(changed.outcome()).isEqualTo("promoted");
        var listed =
                listPagesUseCase.listPages(tenant.credential(), tenant.id(), space, null, 50, null, null, null, null);
        assertThat(listed.items())
                .extracting(PageEditingTypes.PageSummary::slug)
                .contains("02-guides/03-getting-started.md", "02-guides/api.html")
                .doesNotContain("02-guides/faq.html", "reference/api.html", "01-getting-started.md");
        assertThat(pageAt(tenant, space, "02-guides/03-getting-started.md").id())
                .isEqualTo(startedId);
        assertThat(pageAt(tenant, space, "02-guides/api.html").id()).isNotEqualTo(apiId);
    }

    @Test
    void rejectedRemoteAddressesCreateNoJobAndNoRelease() throws Exception {
        TenantFixture tenant = tenant("Import Remote Reject", "owner@import-remote-reject.test");
        UUID space = synced(tenant, "RemoteReject");
        String text = remote.serveText("notes.txt", "not a zip");
        String missing = remote.baseUrl() + "/missing.zip";
        String oversize = remote.serveOversize("huge.zip", RemoteZipFetcher.MAX_REMOTE_ZIP_BYTES + 1);

        assertThatExceptionOfType(ImportSourceForbiddenException.class)
                .isThrownBy(() -> remoteImport(tenant, space, "https://127.0.0.1:9/main.zip"));
        assertThatExceptionOfType(ImportSourceForbiddenException.class)
                .isThrownBy(() -> remoteImport(tenant, space, "http://example.com/main.zip"));
        assertThatExceptionOfType(ImportSourceUnreachableException.class)
                .isThrownBy(() -> remoteImport(tenant, space, "https://nonexistent.invalid/main.zip"));
        assertThatExceptionOfType(ImportSourceUnreachableException.class)
                .isThrownBy(() -> remoteImport(tenant, space, missing));
        assertThatExceptionOfType(io.space.control.compositions.resource.InvalidBundleException.class)
                .isThrownBy(() -> remoteImport(tenant, space, text));
        assertThatExceptionOfType(ZipTooLargeException.class).isThrownBy(() -> remoteImport(tenant, space, oversize));

        assertThat(jdbc.queryForObject("select count(*) from shared.jobs where space_id = ?", Long.class, space))
                .isZero();
        tenants.inTenant(
                tenant.id(),
                () -> assertThat(releases.list(new ReleaseApi.ScopeId(space))).isEmpty());
    }

    @Test
    void remoteReplayWithTheSameKeyDoesNotFetchAgain() throws Exception {
        TenantFixture tenant = tenant("Import Remote Replay", "owner@import-remote-replay.test");
        UUID space = synced(tenant, "RemoteReplay");
        String url = remote.serveZip("replay.zip", ImportPacks.zipFixture("F-tree-mini"));
        String key = key();
        var first = continuousImportUseCase.continuousImport(
                tenant.credential(), tenant.id(), space, new BundleImportTypes.ImportSource.RemoteZip(url), key);
        awaitJob(tenant, space, first.value().job().id());
        // A later operation must not prevent replay of an already completed request.
        jdbc.update("""
                insert into shared.jobs (tenant_id, type, space_id, status, phase, attempt)
                values (?, 'import', ?, 'running', 'inspecting', 0)
                """, tenant.id(), space);
        var replayed = continuousImportUseCase.continuousImport(
                tenant.credential(), tenant.id(), space, new BundleImportTypes.ImportSource.RemoteZip(url), key);
        assertThat(replayed.value().job().id()).isEqualTo(first.value().job().id());
        assertThat(remote.hits("/replay.zip")).isEqualTo(1);
    }

    @Test
    void remoteImportBlockedByARunningJobDoesNotFetch() throws Exception {
        TenantFixture tenant = tenant("Import Remote Busy", "owner@import-remote-busy.test");
        UUID space = synced(tenant, "RemoteBusy");
        String url = remote.serveZip("busy.zip", ImportPacks.zipFixture("F-tree-mini"));
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.View drafted = releases.draft(
                    new ReleaseApi.ScopeId(space),
                    new ReleaseApi.Source(ReleaseApi.SourceKind.IMPORT, "22".repeat(32), null));
            ImportJobApi.View job =
                    jobs.enqueue(tenant.id(), space, drafted.id(), "22".repeat(32), "import-zips/busy", null);
            jobs.markRunning(job.id(), "adapting");
        });
        assertThatExceptionOfType(ImportInProgressException.class).isThrownBy(() -> remoteImport(tenant, space, url));
        assertThat(remote.hits("/busy.zip")).isZero();
    }

    @Test
    void concurrentRemoteImportOnTheSameSpaceIsRejectedWithoutFetching() throws Exception {
        TenantFixture tenant = tenant("Import Remote Race", "owner@import-remote-race.test");
        UUID space = synced(tenant, "RemoteRace");
        String slow = remote.serveSlowZip("slow.zip", ImportPacks.zipFixture("F-tree-mini"), 3_000);
        String fast = remote.serveZip("fast.zip", ImportPacks.zipFixture("F-tree-mini"));
        ExecutorService pool = Executors.newSingleThreadExecutor();
        try {
            Future<FlowResponse<BundleImportTypes.ImportAccepted>> first =
                    pool.submit(() -> remoteImport(tenant, space, slow));
            Thread.sleep(800); // 首个受理已持锁并在下载
            assertThatExceptionOfType(ImportInProgressException.class)
                    .isThrownBy(() -> remoteImport(tenant, space, fast));
            assertThat(remote.hits("/fast.zip")).isZero();
            BundleImportTypes.JobView job = awaitJob(
                    tenant, space, first.get(30, TimeUnit.SECONDS).value().job().id());
            assertThat(job.outcome()).isEqualTo("promoted");
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void authoredSpaceRejectsRemoteImportBeforeFetching() throws Exception {
        TenantFixture tenant = tenant("Import Remote Authored", "owner@import-remote-authored.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Wiki", "authored", key())
                .value()
                .id();
        assertThatExceptionOfType(SpaceModeRestrictedException.class)
                .isThrownBy(() -> remoteImport(tenant, space, remote.baseUrl() + "/never-fetched.zip"));
        assertThat(remote.hits("/never-fetched.zip")).isZero();
    }

    private FlowResponse<BundleImportTypes.ImportAccepted> remoteImport(TenantFixture tenant, UUID space, String url) {
        return continuousImportUseCase.continuousImport(
                tenant.credential(), tenant.id(), space, new BundleImportTypes.ImportSource.RemoteZip(url), key());
    }

    static boolean githubZipPresent() {
        return ImportPacks.okfGithubZip() != null;
    }

    private FlowResponse<BundleImportTypes.ImportAccepted> importZip(
            TenantFixture tenant, UUID space, String fixture, String key) throws Exception {
        FlowResponse<BundleImportTypes.ImportAccepted> accepted = importZipNow(tenant, space, fixture, key);
        awaitJob(tenant, space, accepted.value().job().id());
        return accepted;
    }

    private FlowResponse<BundleImportTypes.ImportAccepted> importZipNow(
            TenantFixture tenant, UUID space, String fixture, String key) throws IOException {
        Path zip = zipFixture(fixture);
        try (InputStream in = Files.newInputStream(zip)) {
            return continuousImportUseCase.continuousImport(
                    tenant.credential(),
                    tenant.id(),
                    space,
                    new BundleImportTypes.ImportSource.ZipStream(in, Files.size(zip)),
                    key);
        }
    }

    private BundleImportTypes.JobView awaitJob(TenantFixture tenant, UUID space, UUID jobId)
            throws InterruptedException {
        BundleImportTypes.JobView job = null;
        for (int i = 0; i < 360; i++) {
            job = viewImportJobUseCase.viewImportJob(tenant.credential(), tenant.id(), space, jobId);
            if ("completed".equals(job.status()) || "failed".equals(job.status())) {
                return job;
            }
            Thread.sleep(250);
        }
        throw new AssertionError("import job did not finish: " + job);
    }

    private UUID synced(TenantFixture tenant, String name) {
        return createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), name, "synced", key())
                .value()
                .id();
    }

    private PageEditingTypes.PageSummary pageAt(TenantFixture tenant, UUID space, String slug) {
        return listPagesUseCase
                .listPages(tenant.credential(), tenant.id(), space, null, 20, null, null, null, null)
                .items()
                .stream()
                .filter(item -> slug.equals(item.slug()))
                .findFirst()
                .orElseThrow();
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@import-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Importer");
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

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private static Path zipFixture(String id) throws IOException {
        return ImportPacks.zipFixture(id);
    }

    private record TenantFixture(UUID id, String credential) {}
}
