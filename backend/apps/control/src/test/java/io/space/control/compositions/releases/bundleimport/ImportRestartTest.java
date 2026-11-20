package io.space.control.compositions.releases.bundleimport;

import static org.assertj.core.api.Assertions.*;

import io.space.SpaceApplication;
import io.space.concepts.importjob.api.ImportJobApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.authoring.termination.DeleteSiteUseCase;
import io.space.control.compositions.hosting.site.CreateSiteUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.support.*;
import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
class ImportRestartTest {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static final MinIOContainer minio = MinioFixture.container();

    private static final String ENCRYPTION_KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    @Test
    void queuedWorkAndEncryptedDeletionReplaySurviveApplicationReconstruction() throws Exception {
        MinioFixture.ensureBucket(minio);
        UUID tenant, space, site, job, deletion;
        String credential;
        String deletionKey = UUID.randomUUID().toString();
        try (var app = start(false)) {
            var owner = app.getBean(FixtureDatabaseConfiguration.FIXTURE_JDBC, JdbcTemplate.class);
            var user = ((UserApi.RegisterResult.Registered)
                            app.getBean(UserApi.class).register("restart@test.example", "Restart owner"))
                    .user();
            owner.update("update iam.users set verified=true,platform_operator=true where id=?", user.value());
            credential = ((SessionApi.StartResult.Started) app.getBean(SessionApi.class)
                            .start(
                                    new SessionApi.HolderId(user.value()),
                                    new SessionApi.Device("Test", "Test", "Test"),
                                    "unknown"))
                    .credentials()
                    .accessToken();
            tenant = app.getBean(ProvisionTenantUseCase.class)
                    .provisionTenant(credential, "Restart tenant", "restart@test.example")
                    .tenant()
                    .id();
            space = app.getBean(CreateSpaceUseCase.class)
                    .createSpace(
                            credential,
                            tenant,
                            "Import",
                            "synced",
                            UUID.randomUUID().toString())
                    .value()
                    .id();
            site = app.getBean(CreateSiteUseCase.class)
                    .createSite(credential, tenant, "Deleted", UUID.randomUUID().toString())
                    .value()
                    .id();
            deletion = app.getBean(DeleteSiteUseCase.class)
                    .deleteSite(credential, tenant, site, "Deleted", deletionKey)
                    .value()
                    .id();
            // A rejected volatile wake-up must not undo the committed acceptance.
            app.getBean("importJobExecutor", ThreadPoolTaskExecutor.class).shutdown();
            byte[] zip;
            try (var fixture = getClass().getResourceAsStream("/import-packs/F-v1-ok.zip")) {
                assertThat(fixture).as("shared import acceptance fixture").isNotNull();
                zip = fixture.readAllBytes();
            }
            var accepted = app.getBean(ContinuousImportUseCase.class)
                    .continuousImport(
                            credential,
                            tenant,
                            space,
                            new BundleImportTypes.ImportSource.ZipStream(
                                    new java.io.ByteArrayInputStream(zip), zip.length),
                            UUID.randomUUID().toString());
            job = accepted.value().job().id();
            assertThat(owner.queryForObject("select status from shared.jobs where id=?", String.class, job))
                    .isEqualTo("queued");
        }
        try (var app = start(true)) {
            var scope = app.getBean(TenantScopeApi.class);
            var jobs = app.getBean(ImportJobApi.class);
            var replay = app.getBean(DeleteSiteUseCase.class)
                    .deleteSite(credential, tenant, site, "Deleted", deletionKey)
                    .value();
            assertThat(replay.id()).isEqualTo(deletion);
            org.awaitility.Awaitility.await()
                    .atMost(Duration.ofSeconds(30))
                    .pollInterval(Duration.ofMillis(200))
                    .untilAsserted(() -> {
                        var result = scope.inTenant(
                                new TenantRegistryApi.TenantId(tenant),
                                () -> jobs.view(job).orElseThrow());
                        assertThat(result.status()).isEqualTo("completed");
                        assertThat(result.outcome()).isEqualTo("promoted");
                        assertThat(result.attempt()).isEqualTo(1);
                    });
            var owner = app.getBean(FixtureDatabaseConfiguration.FIXTURE_JDBC, JdbcTemplate.class);
            assertThat(owner.queryForObject(
                            "select count(*) from releases.releases where space_id=?", Long.class, space))
                    .isEqualTo(1);
            System.out.println("RESTART_ACCEPTANCE queuedRecovered=true deletionReplay=true attempt=1");
        }
    }

    private ConfigurableApplicationContext start(boolean recovery) {
        return new SpringApplicationBuilder(SpaceApplication.class)
                .profiles("test")
                .run(
                        "--server.port=0",
                        "--spring.datasource.url=" + postgres.getJdbcUrl(),
                        "--spring.datasource.username=" + postgres.getUsername(),
                        "--spring.datasource.password=" + postgres.getPassword(),
                        "--io.space.rls.enabled=true",
                        "--io.space.delivery.enabled=false",
                        "--io.space.operations.scheduling-enabled=" + recovery,
                        "--io.space.session.allow-ephemeral-key=true",
                        "--io.space.idempotency.encryption-key=" + ENCRYPTION_KEY,
                        "--io.space.mail-outbox.encryption-key=" + ENCRYPTION_KEY,
                        "--io.space.object-store.endpoint=" + minio.getS3URL(),
                        "--io.space.object-store.access-key=" + minio.getUserName(),
                        "--io.space.object-store.secret-key=" + minio.getPassword(),
                        "--io.space.object-store.bucket=" + MinioFixture.BUCKET);
    }
}
