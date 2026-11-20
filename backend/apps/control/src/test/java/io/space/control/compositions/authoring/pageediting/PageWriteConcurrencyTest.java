package io.space.control.compositions.authoring.pageediting;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.deletion.TrashPageUseCase;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PageWriteConcurrencyTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    CreatePageUseCase createPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    EditPageUseCase editPageUseCase;

    @Autowired
    PageApi pageApi;

    @org.springframework.beans.factory.annotation.Autowired
    TrashPageUseCase trashPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

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
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    TenantScopeApi scope;

    @Autowired
    JdbcTemplate runtime;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate owner;

    @Test
    void editingWaitsForLifecycleChangesAndRechecksTheCommittedState() throws Exception {
        for (boolean archive : java.util.List.of(false, true)) {
            var registered =
                    (UserApi.RegisterResult.Registered) users.register(UUID.randomUUID() + "@page-race.test", "Owner");
            UUID user = registered.user().value();
            owner.update("update iam.users set verified=true,platform_operator=true where id=?", user);
            String credential = ((SessionApi.StartResult.Started) sessions.start(
                            new SessionApi.HolderId(user), new SessionApi.Device("Test", "Test", "Test"), "unknown"))
                    .credentials()
                    .accessToken();
            UUID tenant = provisionTenantUseCase
                    .provisionTenant(
                            credential,
                            "Lifecycle race",
                            users.accountProfile(registered.user())
                                    .orElseThrow()
                                    .email())
                    .tenant()
                    .id();
            UUID space = createSpaceUseCase
                    .createSpace(credential, tenant, "Docs", "authored", key())
                    .value()
                    .id();
            UUID page = createPageUseCase
                    .createPage(credential, tenant, space, "markdown", "Guide", "guide", key())
                    .value()
                    .id();
            var tenantId = new TenantRegistryApi.TenantId(tenant);
            var ready = new CountDownLatch(1);
            var release = new CountDownLatch(1);
            String editingName = "page-edit-" + tenant;
            try (var pool = Executors.newFixedThreadPool(2)) {
                var changing = pool.submit(() -> scope.inTenant(tenantId, () -> {
                    // Hold the write row so the editor must observe the lifecycle commit before saving.
                    pageApi.lock(new PageApi.PageId(page)).orElseThrow();
                    if (archive) archiveSpaceUseCase.archiveSpace(credential, tenant, space, key());
                    else trashPageUseCase.trashPage(credential, tenant, space, page, key());
                    ready.countDown();
                    try {
                        if (!release.await(10, TimeUnit.SECONDS))
                            throw new IllegalStateException("lifecycle gate timed out");
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        throw new IllegalStateException(interrupted);
                    }
                }));
                try {
                    assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
                    var editing = pool.submit(() -> {
                        try {
                            return scope.inTenant(tenantId, () -> {
                                runtime.queryForObject(
                                        "select set_config('application_name',?,true)", String.class, editingName);
                                return editPageUseCase.editPage(
                                        credential, tenant, space, page, "Must not be saved", 0, key());
                            });
                        } catch (FlowException refused) {
                            return refused;
                        }
                    });
                    await().atMost(Duration.ofSeconds(5))
                            .until(() -> editing.isDone()
                                    || owner.queryForObject(
                                                    "select count(*) from pg_stat_activity where application_name=? and wait_event_type='Lock'",
                                                    Integer.class,
                                                    editingName)
                                            == 1);
                    release.countDown();
                    changing.get(10, TimeUnit.SECONDS);
                    Object result = editing.get(10, TimeUnit.SECONDS);
                    assertThat(result).isInstanceOf(FlowException.class);
                    assertThat(((FlowException) result).code())
                            .isEqualTo(archive ? ProblemCode.SPACE_ARCHIVED : ProblemCode.PAGE_NOT_FOUND);
                    assertThat(owner.queryForObject(
                                    "select revision from authoring.pages where id=?", Integer.class, page))
                            .isZero();
                } finally {
                    release.countDown();
                }
            }
        }
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }
}
