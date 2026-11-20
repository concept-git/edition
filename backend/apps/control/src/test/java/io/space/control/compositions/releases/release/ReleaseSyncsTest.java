package io.space.control.compositions.releases.release;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.CreatePageUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.authoring.space.SpaceTypes;
import io.space.control.compositions.authoring.space.UpdateSpaceUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.resource.InvalidBundleException;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
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
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class ReleaseSyncsTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    PublishPageUseCase publishPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    BuildReleaseUseCase buildReleaseUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewReleaseUseCase viewReleaseUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DiscardReleaseUseCase discardReleaseUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PromoteReleaseUseCase promoteReleaseUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RollbackUseCase rollbackUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PatchReleaseUseCase patchReleaseUseCase;

    @Autowired
    ReleasePipeline pipeline;

    @org.springframework.beans.factory.annotation.Autowired
    CreatePageUseCase createPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    UpdateSpaceUseCase updateSpaceUseCase;

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
    io.space.concepts.membership.api.MembershipApi memberships;

    @Autowired
    io.space.concepts.permission.api.PermissionApi permissions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void loadRejectedDiscardsTheDraft() {
        TenantFixture tenant = tenant("Reject", "owner@reject-publish-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Reject", "authored", key())
                .value()
                .id();
        tenants.inTenant(tenant.id(), () -> {
            ReleaseApi.View drafted = releases.draft(
                    new ReleaseApi.ScopeId(space),
                    new ReleaseApi.Source(ReleaseApi.SourceKind.BUILD, "fixture", UUID.randomUUID()));
            ReleaseApi.ReleaseId id = new ReleaseApi.ReleaseId(drafted.id());
            assertThat(releases.load(
                            id,
                            new ReleaseApi.Bundle(
                                    "2.0", " ", Instant.parse("2026-09-01T00:00:00Z"), List.of(), List.of(), Map.of())))
                    .isInstanceOf(ReleaseApi.LoadResult.InvalidBundle.class);
            assertThatExceptionOfType(InvalidBundleException.class).isThrownBy(() -> pipeline.loadRejected(id));
            assertThat(releases.status(id)).isEmpty();
        });
    }

    @Test
    void concurrentWikiPublishesLeaveAtMostOneLive() throws Exception {
        TenantFixture tenant = tenant("Race", "owner@race-publish-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Race", "authored", key())
                .value()
                .id();
        UUID first = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "One", "one", key())
                .value()
                .id();
        UUID second = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "Two", "two", key())
                .value()
                .id();
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(2);
        AtomicReference<Throwable> failure = new AtomicReference<>();
        try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
            pool.submit(() -> run(
                    start,
                    done,
                    failure,
                    () -> publishPageUseCase.publishPage(tenant.credential(), tenant.id(), space, first, key())));
            pool.submit(() -> run(
                    start,
                    done,
                    failure,
                    () -> publishPageUseCase.publishPage(tenant.credential(), tenant.id(), space, second, key())));
            start.countDown();
            assertThat(done.await(30, TimeUnit.SECONDS)).isTrue();
        }
        assertThat(failure.get()).isNull();
        tenants.inTenant(tenant.id(), () -> {
            long live = releases.list(new ReleaseApi.ScopeId(space)).stream()
                    .filter(item -> item.status() == ReleaseApi.Status.LIVE)
                    .count();
            assertThat(live).isEqualTo(1);
        });
    }

    @Test
    void promotionRollbackAndDiscardReplayTheirOriginalResponses() {
        var tenant = tenant("Release replay", "owner@release-replay.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Docs", "authored", key())
                .value()
                .id();
        UUID first = validatedEmpty(tenant, space);
        String promoteKey = key();
        var promoted = promoteReleaseUseCase.promoteRelease(tenant.credential(), tenant.id(), space, first, promoteKey);
        assertThat(promoteReleaseUseCase.promoteRelease(tenant.credential(), tenant.id(), space, first, promoteKey))
                .isEqualTo(promoted);
        UUID second = validatedEmpty(tenant, space);
        promoteReleaseUseCase.promoteRelease(tenant.credential(), tenant.id(), space, second, key());
        String rollbackKey = key();
        var rolledBack = rollbackUseCase.rollback(tenant.credential(), tenant.id(), space, first, rollbackKey);
        assertThat(rollbackUseCase.rollback(tenant.credential(), tenant.id(), space, first, rollbackKey))
                .isEqualTo(rolledBack);
        UUID discarded = validatedEmpty(tenant, space);
        String patchKey = key();
        var patch = new ReleaseTypes.ReleasePatch(true, "Before removal", false, null);
        var patched =
                patchReleaseUseCase.patchRelease(tenant.credential(), tenant.id(), space, discarded, patch, patchKey);
        String discardKey = key();
        var response =
                discardReleaseUseCase.discardRelease(tenant.credential(), tenant.id(), space, discarded, discardKey);
        assertThat(discardReleaseUseCase.discardRelease(tenant.credential(), tenant.id(), space, discarded, discardKey))
                .isEqualTo(response);
        assertThat(patchReleaseUseCase.patchRelease(
                        tenant.credential(), tenant.id(), space, discarded, patch, patchKey))
                .isEqualTo(patched);
    }

    @Test
    void syncedSpaceCanRollbackAnArchivedRelease() {
        var tenant = tenant("Synced rollback", "owner@synced-rollback.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Docs", "synced", key())
                .value()
                .id();
        UUID first = validatedEmpty(tenant, space);
        tenants.inTenant(tenant.id(), () -> releases.promote(new ReleaseApi.ReleaseId(first)));
        UUID second = validatedEmpty(tenant, space);
        tenants.inTenant(tenant.id(), () -> releases.promote(new ReleaseApi.ReleaseId(second)));
        var result = rollbackUseCase.rollback(tenant.credential(), tenant.id(), space, first, key());
        assertThat(result.value().id()).isEqualTo(first);
        assertThat(result.value().status()).isEqualTo("live");
    }

    @Test
    void buildReplayUsesTheSubmittedRequestInsteadOfTheChangedLiveVersion() {
        var tenant = tenant("Build replay", "owner@build-replay.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Docs", "authored", key())
                .value()
                .id();
        updateSpaceUseCase.updateSpace(
                tenant.credential(),
                tenant.id(),
                space,
                new SpaceTypes.UpdatePatch(null, null, null, java.util.Optional.of(false)),
                key());
        UUID page = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "Guide", "guide", key())
                .value()
                .id();
        publishPageUseCase.publishPage(tenant.credential(), tenant.id(), space, page, key());
        String buildKey = key();
        var first = buildReleaseUseCase.buildRelease(tenant.credential(), tenant.id(), space, buildKey);
        assertThat(first.value().outcome()).isEqualTo(ReleaseTypes.Outcome.PROMOTED);
        assertThat(buildReleaseUseCase.buildRelease(tenant.credential(), tenant.id(), space, buildKey))
                .isEqualTo(first);
    }

    private UUID validatedEmpty(TenantFixture tenant, UUID space) {
        return tenants.inTenant(tenant.id(), () -> {
            var draft = releases.draft(
                    new ReleaseApi.ScopeId(space),
                    new ReleaseApi.Source(ReleaseApi.SourceKind.BUILD, "replay-test", UUID.randomUUID()));
            var id = new ReleaseApi.ReleaseId(draft.id());
            releases.load(id, new ReleaseApi.Bundle("1.0", "space", Instant.now(), List.of(), List.of(), Map.of()));
            releases.validate(id, List.of());
            return draft.id();
        });
    }

    @Test
    void pendingReleaseReportsRequirePublishPermission() {
        var tenant = tenant("Report permissions", "owner@release-reports.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Docs", "authored", key())
                .value()
                .id();
        UUID draft = validatedEmpty(tenant, space);
        assertThat(viewReleaseUseCase
                        .viewRelease(tenant.credential(), tenant.id(), space, draft)
                        .status())
                .isEqualTo("validated");
        var reader = verifiedUser("reader@release-reports.test");
        tenants.inTenant(tenant.id(), () -> {
            memberships.add(
                    io.space.concepts.membership.api.MembershipApi.Group.tenant(tenant.id()),
                    new io.space.concepts.membership.api.MembershipApi.MemberId(reader.value()),
                    io.space.concepts.membership.api.MembershipApi.Role.MEMBER);
            permissions.grant(
                    TenantAccess.space(space),
                    new io.space.concepts.permission.api.PermissionApi.Principal(
                            io.space.concepts.permission.api.PermissionApi.PrincipalType.USER, reader.value()),
                    new io.space.concepts.permission.api.PermissionApi.Role("reader"));
        });
        assertThatExceptionOfType(io.space.control.compositions.access.PermissionDeniedException.class)
                .isThrownBy(() -> viewReleaseUseCase.viewRelease(credential(reader), tenant.id(), space, draft));
    }

    private static void run(
            CountDownLatch start, CountDownLatch done, AtomicReference<Throwable> failure, Runnable work) {
        try {
            start.await();
            work.run();
        } catch (Throwable error) {
            failure.compareAndSet(null, error);
        } finally {
            done.countDown();
        }
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@publish-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
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

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record TenantFixture(UUID id, String credential) {}
}
