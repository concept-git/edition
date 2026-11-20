package io.space.control.compositions.releases.bundleimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.space.concepts.importformat.ImportPacks;
import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.objectstore.api.ObjectStoreApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import io.space.control.support.MinioFixture;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * 票 20 验收 12：对象存储真实停机（连接被拒，不是对象键缺失）。
 * 受理阶段 → 503 且不建 job / Release / 幂等记录；worker 阶段 → job retrying、Release 保持 draft，
 * 不得标 held、不得 discard。独立测试类：停掉容器后不再复用。
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ImportObjectStoreOutageTest {
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
    MockMvc mvc;

    @org.springframework.beans.factory.annotation.Autowired
    ViewImportJobUseCase viewImportJobUseCase;

    @Autowired
    BundleImportJobRunner runner;

    @Autowired
    ObjectStoreApi objectStore;

    @Autowired
    ReleaseApi releases;

    @Autowired
    ImportJobApi jobs;

    @Autowired
    TenantAccess tenants;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void outageKeepsQueuedJobRetryingAndRejectsNewIngressWith503() throws Exception {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@import-outage.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser("owner@import-outage.test");
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), "Import Outage", "owner@import-outage.test")
                .tenant()
                .id();
        String credential = credential(owner);
        UUID space = createSpaceUseCase
                .createSpace(credential, tenant, "Outage Docs", "synced", key())
                .value()
                .id();

        // 对象存储在线时封存 zip 并登记一条 queued 作业（模拟「已 202、worker 尚未跑」）。
        Path zip = ImportPacks.zipFixture("F-v1-ok");
        String zipKey = "import-zips/outage-" + UUID.randomUUID();
        try (InputStream in = Files.newInputStream(zip)) {
            objectStore.putIfAbsent(zipKey, in, Files.size(zip), "application/zip");
        }
        UUID[] ids = new UUID[2];
        tenants.inTenant(tenant, () -> {
            ReleaseApi.View drafted = releases.draft(
                    new ReleaseApi.ScopeId(space),
                    new ReleaseApi.Source(ReleaseApi.SourceKind.IMPORT, "outage", UUID.randomUUID()));
            ImportJobApi.View job = jobs.enqueue(tenant, space, drafted.id(), "11".repeat(32), zipKey, null);
            ids[0] = drafted.id();
            ids[1] = job.id();
        });

        minio.stop();

        // worker：连接被拒 → retrying，draft 保留，不 held、不 discard。
        runner.run(tenant, ids[1]);
        BundleImportTypes.JobView job = viewImportJobUseCase.viewImportJob(credential, tenant, space, ids[1]);
        assertThat(job.status()).isEqualTo("retrying");
        assertThat(job.outcome()).isNull();
        assertThat(job.attempt()).isEqualTo(1);
        assertThat(job.nextRunAt()).isNotNull();
        tenants.inTenant(
                tenant,
                () -> assertThat(releases.status(new ReleaseApi.ReleaseId(ids[0])))
                        .contains(ReleaseApi.Status.DRAFT));

        // 受理：入站流式写对象存储失败 → 503，不建 job、不建 Release、幂等记录不封存。
        jdbc.update("update shared.jobs set status = 'failed', outcome = 'dependency_failed' where id = ?", ids[1]);
        long jobsBefore = count("select count(*) from shared.jobs where space_id = ?", space);
        long releasesBefore = count("select count(*) from releases.releases where space_id = ?", space);
        String idempotencyKey = key();
        mvc.perform(post("/api/v1/tenants/" + tenant + "/spaces/" + space + "/releases:import")
                        .header("Authorization", "Bearer " + credential)
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType("application/zip")
                        .content(Files.readAllBytes(zip)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("dependency_unavailable"));
        assertThat(count("select count(*) from shared.jobs where space_id = ?", space))
                .isEqualTo(jobsBefore);
        assertThat(count("select count(*) from releases.releases where space_id = ?", space))
                .isEqualTo(releasesBefore);
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.idempotency_records where idempotency_key = ?",
                        Long.class,
                        idempotencyKey))
                .isZero();
    }

    private long count(String sql, UUID space) {
        Long value = jdbc.queryForObject(sql, Long.class, space);
        return value == null ? 0 : value;
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
}
