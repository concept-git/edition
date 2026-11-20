package io.space.control.compositions.releases.bundleexport;

import static org.assertj.core.api.Assertions.*;

import io.space.SpaceApplication;
import io.space.concepts.bundleexport.api.BundleExportJobs;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tenantregistry.api.*;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.releases.release.BuildReleaseUseCase;
import io.space.control.support.*;
import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class BundleExportRestartTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static MinIOContainer minio = MinioFixture.container();

    private static final String KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    @Test
    void aClaimedExportRecoversAfterApplicationReconstruction() throws Exception {
        MinioFixture.ensureBucket(minio);
        UUID tenant, space, job;
        String credential;
        try (var app = start(false)) {
            var owner = app.getBean(FixtureDatabaseConfiguration.FIXTURE_JDBC, JdbcTemplate.class);
            String email = "restart-export@test.example";
            var user = ((UserApi.RegisterResult.Registered)
                            app.getBean(UserApi.class).register(email, "Export owner"))
                    .user();
            owner.update("update iam.users set verified=true,platform_operator=true where id=?", user.value());
            credential = ((SessionApi.StartResult.Started) app.getBean(SessionApi.class)
                            .start(
                                    new SessionApi.HolderId(user.value()),
                                    new SessionApi.Device("test", "test", "test"),
                                    "loopback"))
                    .credentials()
                    .accessToken();
            tenant = app.getBean(ProvisionTenantUseCase.class)
                    .provisionTenant(credential, "Export restart", email)
                    .tenant()
                    .id();
            space = app.getBean(CreateSpaceUseCase.class)
                    .createSpace(
                            credential,
                            tenant,
                            "Restart docs",
                            "authored",
                            UUID.randomUUID().toString())
                    .value()
                    .id();
            var scope = app.getBean(TenantScopeApi.class);
            var pages = app.getBean(PageApi.class);
            var spaces = app.getBean(SpaceApi.class);
            UUID chosenSpace = space;
            scope.inTenant(new TenantRegistryApi.TenantId(tenant), () -> {
                spaces.setAutoRelease(new SpaceApi.ActorId(user.value()), new SpaceApi.SpaceId(chosenSpace), false);
                var page = ((PageApi.CreateResult.Created)
                                pages.create(PageApi.Actor.user(user.value()), PageApi.Format.MARKDOWN, "Restart"))
                        .page();
                spaces.place(new SpaceApi.SpaceId(chosenSpace), page.id(), "restart");
                pages.edit(new PageApi.PageId(page.id()), "Durable export", 0, PageApi.Actor.user(user.value()));
                pages.publish(new PageApi.PageId(page.id()), PageApi.Actor.user(user.value()));
            });
            UUID release = app.getBean(BuildReleaseUseCase.class)
                    .buildRelease(credential, tenant, space, UUID.randomUUID().toString())
                    .value()
                    .release()
                    .id();
            job = app.getBean(RequestExportUseCase.class)
                    .requestExport(
                            credential,
                            tenant,
                            space,
                            release,
                            UUID.randomUUID().toString())
                    .value()
                    .id();
            UUID chosenJob = job;
            assertThat(scope.inTenant(
                            new TenantRegistryApi.TenantId(tenant),
                            () -> app.getBean(BundleExportJobs.class).claim(chosenJob)))
                    .isPresent();
            owner.update("update shared.bundle_exports set lease_until=now()-interval '1 second' where" + " id=?", job);
        }
        try (var app = start(true)) {
            var exports = app.getBean(ViewExportUseCase.class);
            var downloads = app.getBean(DownloadExportUseCase.class);
            org.awaitility.Awaitility.await().atMost(Duration.ofSeconds(20)).untilAsserted(() -> {
                var state = exports.viewExport(credential, tenant, space, job);
                assertThat(state.status()).isEqualTo("completed");
                assertThat(state.attempts()).isEqualTo(2);
            });
            try (var file = downloads.downloadExport(credential, tenant, space, job).stream()) {
                assertThat(file.readNBytes(2)).containsExactly((byte) 'P', (byte) 'K');
            }
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
                        "--io.space.operations.scheduling-enabled=false",
                        "--io.space.bundle-export.initial-delay=" + (recovery ? "0" : "3600000"),
                        "--io.space.session.allow-ephemeral-key=true",
                        "--io.space.idempotency.encryption-key=" + KEY,
                        "--io.space.mail-outbox.encryption-key=" + KEY,
                        "--io.space.object-store.endpoint=" + minio.getS3URL(),
                        "--io.space.object-store.access-key=" + minio.getUserName(),
                        "--io.space.object-store.secret-key=" + minio.getPassword(),
                        "--io.space.object-store.bucket=" + MinioFixture.BUCKET);
    }
}
