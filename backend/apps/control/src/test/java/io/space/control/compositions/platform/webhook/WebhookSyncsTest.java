package io.space.control.compositions.platform.webhook;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.concepts.webhook.api.WebhookApi;
import io.space.control.compositions.authoring.permission.DeletePageRestrictionUseCase;
import io.space.control.compositions.authoring.permission.DeleteSiteGrantUseCase;
import io.space.control.compositions.authoring.permission.DeleteSpaceGrantUseCase;
import io.space.control.compositions.authoring.permission.ExplainPageReadUseCase;
import io.space.control.compositions.authoring.permission.ExplainSiteAdminUseCase;
import io.space.control.compositions.authoring.permission.ListPermissionPagesUseCase;
import io.space.control.compositions.authoring.permission.ListSitePermissionsUseCase;
import io.space.control.compositions.authoring.permission.ListSpacePermissionsUseCase;
import io.space.control.compositions.authoring.permission.PutPageRestrictionUseCase;
import io.space.control.compositions.authoring.permission.PutSiteGrantUseCase;
import io.space.control.compositions.authoring.permission.PutSpaceGrantUseCase;
import io.space.control.compositions.authoring.permission.SearchPermissionTeamsUseCase;
import io.space.control.compositions.authoring.permission.SearchPermissionUsersUseCase;
import io.space.control.compositions.authoring.permission.SearchSitePermissionTeamsUseCase;
import io.space.control.compositions.authoring.permission.SearchSitePermissionUsersUseCase;
import io.space.control.compositions.authoring.permission.ViewPagePermissionUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.hosting.site.*;
import io.space.control.compositions.hosting.site.CreateSiteUseCase;
import io.space.control.compositions.hosting.site.ListSitesUseCase;
import io.space.control.compositions.hosting.site.ListSpaceMountsUseCase;
import io.space.control.compositions.hosting.site.MountSpaceUseCase;
import io.space.control.compositions.hosting.site.ReorderMountsUseCase;
import io.space.control.compositions.hosting.site.SiteTypes;
import io.space.control.compositions.hosting.site.UnmountSpaceUseCase;
import io.space.control.compositions.hosting.site.UpdateSiteUseCase;
import io.space.control.compositions.hosting.site.ViewSiteUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.releases.release.PublishPageUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.Set;
import java.util.UUID;
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
class WebhookSyncsTest {
    @org.springframework.beans.factory.annotation.Autowired
    PublishPageUseCase publishPageUseCase;

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    CreateSiteUseCase createSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListSitesUseCase listSitesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewSiteUseCase viewSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListSpaceMountsUseCase listSpaceMountsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    UpdateSiteUseCase updateSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    MountSpaceUseCase mountSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    UnmountSpaceUseCase unmountSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ReorderMountsUseCase reorderMountsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SearchPermissionUsersUseCase searchPermissionUsersUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SearchPermissionTeamsUseCase searchPermissionTeamsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListPermissionPagesUseCase listPermissionPagesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewPagePermissionUseCase viewPagePermissionUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutPageRestrictionUseCase putPageRestrictionUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DeletePageRestrictionUseCase deletePageRestrictionUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ExplainPageReadUseCase explainPageReadUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListSpacePermissionsUseCase listSpacePermissionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutSpaceGrantUseCase putSpaceGrantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DeleteSpaceGrantUseCase deleteSpaceGrantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListSitePermissionsUseCase listSitePermissionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SearchSitePermissionUsersUseCase searchSitePermissionUsersUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SearchSitePermissionTeamsUseCase searchSitePermissionTeamsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutSiteGrantUseCase putSiteGrantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DeleteSiteGrantUseCase deleteSiteGrantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ExplainSiteAdminUseCase explainSiteAdminUseCase;

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
    MembershipApi memberships;

    @Autowired
    ApiTokenApi tokens;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Autowired
    PageApi pages;

    @Autowired
    SpaceApi spaceApi;

    @Autowired
    ReleaseApi releases;

    @org.springframework.beans.factory.annotation.Autowired
    ListWebhooksUseCase listWebhooksUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateWebhookUseCase createWebhookUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    UpdateWebhookUseCase updateWebhookUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListDeliveriesUseCase listDeliveriesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RedeliverUseCase redeliverUseCase;

    @Autowired
    WebhookApi webhookApi;

    @Test
    void promotedEventIsDurableDeduplicatedSignedSecretIsNeverListedAndRetryIsFenced() {
        var tenant = tenant("Hooks", "owner-hooks@site-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Hooks", "authored", key())
                .value()
                .id();
        var config = new WebhookTypes.Configuration(
                "https://receiver.example/hooks", "space", space, Set.of("release.promoted"), true);
        String requestKey = key();
        var created = createWebhookUseCase
                .createWebhook(tenant.ownerCredential(), tenant.id(), config, requestKey)
                .value();
        assertThat(createWebhookUseCase
                        .createWebhook(tenant.ownerCredential(), tenant.id(), config, requestKey)
                        .value())
                .isEqualTo(created);
        assertThat(jdbc.queryForObject(
                        "select secret from shared.webhooks where id=?",
                        String.class,
                        created.subscription().id()))
                .startsWith("v1:")
                .doesNotContain(created.secret());
        UUID page = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            var p = (PageApi.CreateResult.Created)
                    pages.create(PageApi.Actor.system(), PageApi.Format.MARKDOWN, "Page");
            spaceApi.place(new SpaceApi.SpaceId(space), p.page().id(), "page");
            return p.page().id();
        });
        publishPageUseCase.publishPage(tenant.ownerCredential(), tenant.id(), space, page, key());
        var listed = listDeliveriesUseCase.listDeliveries(
                tenant.ownerCredential(), tenant.id(), created.subscription().id(), null, 20);
        assertThat(listed.items()).hasSize(1);
        var first = webhookApi.claim(1).getFirst();
        assertThat(webhookApi.secret(first.encryptedSecret())).isEqualTo(created.secret());
        webhookApi.finish(first, 503, "delivery_unavailable", 10);
        jdbc.update(
                "update shared.webhook_deliveries set next_retry_at=now()-interval '1 second' where" + " id=?",
                first.id());
        var second = webhookApi.claim(1).getFirst();
        webhookApi.finish(first, 200, null, 1);
        assertThat(jdbc.queryForObject(
                        "select status from shared.webhook_deliveries where id=?", String.class, first.id()))
                .isEqualTo("running");
        webhookApi.finish(second, 200, null, 1);
        var done = listDeliveriesUseCase
                .listDeliveries(
                        tenant.ownerCredential(),
                        tenant.id(),
                        created.subscription().id(),
                        null,
                        20)
                .items()
                .getFirst();
        assertThat(done.status()).isEqualTo("completed");
        assertThat(done.history()).hasSize(2);
        redeliverUseCase.redeliver(
                tenant.ownerCredential(), tenant.id(), created.subscription().id(), done.id(), key());
        var replay = webhookApi.claim(1).getFirst();
        assertThat(replay.eventId()).isEqualTo(first.eventId());
        webhookApi.finish(replay, 400, "rejected", 1);
        updateWebhookUseCase.updateWebhook(
                tenant.ownerCredential(),
                tenant.id(),
                created.subscription().id(),
                new WebhookTypes.Configuration(config.url(), config.scopeType(), space, config.events(), false),
                key());
        assertThatExceptionOfType(WebhookAccess.Disabled.class)
                .isThrownBy(() -> redeliverUseCase.redeliver(
                        tenant.ownerCredential(),
                        tenant.id(),
                        created.subscription().id(),
                        done.id(),
                        key()));
    }

    @Test
    void siteChangesCaptureOneDeliveryReceiptAtCommitAndNoneOnRollback(
            @Autowired org.springframework.transaction.PlatformTransactionManager transactions) {
        var tenant = tenant("Site delivery hook", "owner-delivery-hook@site-syncs.test");
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Docs", key())
                .value()
                .id();
        var hook = createWebhookUseCase
                .createWebhook(
                        tenant.ownerCredential(),
                        tenant.id(),
                        new WebhookTypes.Configuration(
                                "https://receiver.example/hooks", "site", site, Set.of("delivery.completed"), true),
                        key())
                .value();
        var tx = new org.springframework.transaction.support.TransactionTemplate(transactions);
        tx.executeWithoutResult(ignored -> {
            updateSiteUseCase.updateSite(tenant.ownerCredential(), tenant.id(), site, name("Docs 2"), key());
            updateSiteUseCase.updateSite(tenant.ownerCredential(), tenant.id(), site, name("Docs 3"), key());
        });
        tx.executeWithoutResult(rollback -> {
            updateSiteUseCase.updateSite(tenant.ownerCredential(), tenant.id(), site, name("Docs 4"), key());
            rollback.setRollbackOnly();
        });
        assertThat(listDeliveriesUseCase
                        .listDeliveries(
                                tenant.ownerCredential(),
                                tenant.id(),
                                hook.subscription().id(),
                                null,
                                20)
                        .items())
                .hasSize(1);
        webhookApi.claim(20).forEach(delivery -> webhookApi.finish(delivery, 200, null, 1));
    }

    @Test
    void scopesCannotCrossTenantsAndHttpDestinationsAreRejected() {
        var a = tenant("Hook A", "owner-hooks-a@site-syncs.test");
        var b = tenant("Hook B", "owner-hooks-b@site-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(b.ownerCredential(), b.id(), "Private", "authored", key())
                .value()
                .id();
        assertThatExceptionOfType(WebhookAccess.Missing.class)
                .isThrownBy(() -> createWebhookUseCase.createWebhook(
                        a.ownerCredential(),
                        a.id(),
                        new WebhookTypes.Configuration(
                                "https://receiver.example/hooks", "space", space, Set.of("release.promoted"), true),
                        key()));
        assertThatExceptionOfType(WebhookAccess.Invalid.class)
                .isThrownBy(() -> createWebhookUseCase.createWebhook(
                        a.ownerCredential(),
                        a.id(),
                        new WebhookTypes.Configuration(
                                "http://receiver.example/hooks", "tenant", null, Set.of("release.promoted"), true),
                        key()));
        assertThat(listWebhooksUseCase
                        .listWebhooks(a.ownerCredential(), a.id(), null, 20)
                        .items())
                .isEmpty();
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@site-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Site User");
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

    private static SiteTypes.UpdatePatch name(String name) {
        return SiteTypes.UpdatePatch.fromJson(
                true, name, false, null, false, false, false, null, false, null, false, null, false, null, false, null,
                false, null, false, null, false, null);
    }

    private static SiteTypes.UpdatePatch home(UUID space) {
        return SiteTypes.UpdatePatch.fromJson(
                false, null, false, null, false, false, false, null, false, null, false, null, false, null, false, null,
                false, null, true, space, false, null);
    }

    private record TenantFixture(UUID id, String ownerCredential) {}
}
