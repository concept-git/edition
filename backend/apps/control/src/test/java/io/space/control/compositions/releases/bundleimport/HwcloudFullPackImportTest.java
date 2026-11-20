package io.space.control.compositions.releases.bundleimport;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.importformat.ImportPacks;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.AttachUseCase;
import io.space.control.compositions.authoring.pageediting.BatchGetPagesOnCompletion;
import io.space.control.compositions.authoring.pageediting.CreatePageUseCase;
import io.space.control.compositions.authoring.pageediting.DetachUseCase;
import io.space.control.compositions.authoring.pageediting.DiffRevisionsUseCase;
import io.space.control.compositions.authoring.pageediting.DownloadAttachmentUseCase;
import io.space.control.compositions.authoring.pageediting.EditPageUseCase;
import io.space.control.compositions.authoring.pageediting.ListPagesUseCase;
import io.space.control.compositions.authoring.pageediting.ListRevisionsUseCase;
import io.space.control.compositions.authoring.pageediting.PreviewPageUseCase;
import io.space.control.compositions.authoring.pageediting.RemovePropertyUseCase;
import io.space.control.compositions.authoring.pageediting.RenamePageUseCase;
import io.space.control.compositions.authoring.pageediting.RevertPageUseCase;
import io.space.control.compositions.authoring.pageediting.SetIconUseCase;
import io.space.control.compositions.authoring.pageediting.SetPropertyUseCase;
import io.space.control.compositions.authoring.pageediting.SetSeoUseCase;
import io.space.control.compositions.authoring.pageediting.ViewAttachmentUseCase;
import io.space.control.compositions.authoring.pageediting.ViewPageContentUseCase;
import io.space.control.compositions.authoring.pageediting.ViewPageUseCase;
import io.space.control.compositions.authoring.pageediting.ViewRevisionUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.authoring.space.ViewSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import io.space.control.support.MinioFixture;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.condition.EnabledIf;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

/**
 * 票 20 Q15：唯一一份真实厂商数据 {@code docs/reference/docs/api-ecs.zip}（257 页）走完
 * 受理 → worker → outcome 的端到端。夹具不在仓库时跳过；不进 Gherkin / Browser。
 * 结果（页数、耗时、report 摘要）以日志输出，供 acceptance 记录引用。
 */
@SpringBootTest
@org.springframework.context.annotation.Import(io.space.control.support.ImportSqlCounter.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@Tag("slow")
class HwcloudFullPackImportTest {
    private static final Logger log = LoggerFactory.getLogger(HwcloudFullPackImportTest.class);

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static final MinIOContainer minio = MinioFixture.container();

    @DynamicPropertySource
    static void objectStore(DynamicPropertyRegistry registry) {
        MinioFixture.bind(registry, minio);
    }

    @BeforeAll
    static void bucket() {
        MinioFixture.ensureBucket(minio);
    }

    @Autowired
    io.space.control.support.ImportSqlCounter.Counter sql;

    @org.springframework.beans.factory.annotation.Autowired
    ContinuousImportUseCase continuousImportUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewImportJobUseCase viewImportJobUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListPagesUseCase listPagesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewPageUseCase viewPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewPageContentUseCase viewPageContentUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    BatchGetPagesOnCompletion batchGetPagesOnCompletion;

    @org.springframework.beans.factory.annotation.Autowired
    CreatePageUseCase createPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PreviewPageUseCase previewPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RenamePageUseCase renamePageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    EditPageUseCase editPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListRevisionsUseCase listRevisionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewRevisionUseCase viewRevisionUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DiffRevisionsUseCase diffRevisionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RevertPageUseCase revertPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetSeoUseCase setSeoUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetIconUseCase setIconUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetPropertyUseCase setPropertyUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RemovePropertyUseCase removePropertyUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    AttachUseCase attachUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DetachUseCase detachUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewAttachmentUseCase viewAttachmentUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DownloadAttachmentUseCase downloadAttachmentUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewSpaceUseCase viewSpaceUseCase;

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
    TenantAccess tenants;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    static boolean fullZipPresent() {
        return ImportPacks.hwFullZip() != null;
    }

    @RepeatedTest(3)
    @EnabledIf("fullZipPresent")
    void fullHwcloudPackImportsEndToEnd() throws Exception {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@hw-full.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        String ownerEmail = "owner-" + UUID.randomUUID() + "@hw-full.test";
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), "HW Full", ownerEmail)
                .tenant()
                .id();
        String credential = credential(owner);
        UUID space = createSpaceUseCase
                .createSpace(
                        credential,
                        tenant,
                        "ECS API",
                        "synced",
                        UUID.randomUUID().toString())
                .value()
                .id();

        Path zip = ImportPacks.hwFullZip();
        long statementsBefore = sql.count();
        Instant started = Instant.now();
        var accepted = importZip(credential, tenant, space, zip);
        Instant acceptedAt = Instant.now();
        BundleImportTypes.JobView job =
                awaitJob(credential, tenant, space, accepted.value().job().id());
        Instant finished = Instant.now();

        ReleaseApi.View release = tenants.inTenant(
                tenant,
                () -> releases.list(new ReleaseApi.ScopeId(space)).stream()
                        .filter(item ->
                                item.id().equals(accepted.value().release().id()))
                        .findFirst()
                        .orElse(null));
        String errors = release == null ? "-" : summarize(release.report().errors());
        String warnings = release == null ? "-" : summarize(release.report().warnings());
        String info = release == null ? "-" : summarize(release.report().info());
        String lastError =
                jdbc.queryForObject("select last_error_code from shared.jobs where id = ?", String.class, job.id());
        String zipKey = jdbc.queryForObject("select zip_key from shared.jobs where id = ?", String.class, job.id());
        log.info(
                "hw-full import outcome={} status={} lastError={} zipKey={} accept={}ms pipeline={}ms pages={} errors=[{}] warnings=[{}] info=[{}]",
                job.outcome(),
                job.status(),
                lastError,
                zipKey,
                Duration.between(started, acceptedAt).toMillis(),
                Duration.between(acceptedAt, finished).toMillis(),
                release == null ? -1 : release.pageCount(),
                errors,
                warnings,
                info);

        log.info("hw-full worker preparedStatements={}", sql.count() - statementsBefore);
        assertThat(job.status()).isEqualTo("completed");
        assertThat(job.outcome()).isEqualTo("promoted");
        assertThat(job.phase()).isEqualTo("mirroring");
        assertThat(job.progressDone()).isEqualTo(257);
        assertThat(job.progressTotal()).isEqualTo(257);
        assertThat(release).isNotNull();
        assertThat(release.pageCount()).isEqualTo(257);
        tenants.inTenant(
                tenant,
                () -> assertThat(releases.live(new ReleaseApi.ScopeId(space)))
                        .map(ReleaseApi.View::id)
                        .contains(release.id()));
        assertThat(viewSpaceUseCase.viewSpace(credential, tenant, space).pageCount())
                .isEqualTo(257);
    }

    private static String summarize(java.util.List<ReleaseApi.Issue> issues) {
        return issues.stream()
                        .collect(Collectors.groupingBy(ReleaseApi.Issue::code, Collectors.counting()))
                        .entrySet()
                        .stream()
                        .map(entry -> entry.getKey() + "×" + entry.getValue())
                        .collect(Collectors.joining(", "))
                + (issues.isEmpty()
                        ? ""
                        : "; e.g. " + issues.getFirst().path() + " "
                                + issues.getFirst().detail());
    }

    private io.space.control.compositions.flow.FlowResponse<BundleImportTypes.ImportAccepted> importZip(
            String credential, UUID tenant, UUID space, Path zip) throws Exception {
        try (InputStream in = Files.newInputStream(zip)) {
            return continuousImportUseCase.continuousImport(
                    credential,
                    tenant,
                    space,
                    new BundleImportTypes.ImportSource.ZipStream(in, Files.size(zip)),
                    UUID.randomUUID().toString());
        }
    }

    private BundleImportTypes.JobView awaitJob(String credential, UUID tenant, UUID space, UUID jobId)
            throws InterruptedException {
        BundleImportTypes.JobView job = null;
        for (int i = 0; i < 1200; i++) {
            job = viewImportJobUseCase.viewImportJob(credential, tenant, space, jobId);
            if ("completed".equals(job.status()) || "failed".equals(job.status())) return job;
            Thread.sleep(500);
        }
        throw new AssertionError("hw-full import did not finish: " + job);
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
}
