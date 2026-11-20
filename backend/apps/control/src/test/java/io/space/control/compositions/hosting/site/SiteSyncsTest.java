package io.space.control.compositions.hosting.site;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.authoring.permission.ExplainSiteAdminUseCase;
import io.space.control.compositions.authoring.permission.ListSitePermissionsUseCase;
import io.space.control.compositions.authoring.permission.PermissionTypes;
import io.space.control.compositions.authoring.permission.PutSiteGrantUseCase;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.authoring.space.SpaceTypes;
import io.space.control.compositions.authoring.space.ViewSpaceUseCase;
import io.space.control.compositions.authoring.termination.DeleteSiteUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.resource.SiteNotFoundException;
import io.space.control.compositions.resource.SpaceArchivedException;
import io.space.control.compositions.resource.SpaceNotFoundException;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
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
class SiteSyncsTest {
    @org.springframework.beans.factory.annotation.Autowired
    DeleteSiteUseCase deleteSiteUseCase;

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
    ViewSpaceUseCase viewSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ArchiveSpaceUseCase archiveSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListSitePermissionsUseCase listSitePermissionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutSiteGrantUseCase putSiteGrantUseCase;

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

    @Test
    void createMountReorderAndUnmountRunThroughTheSiteAddressTable() {
        TenantFixture tenant = tenant("Site Core", "owner-core@site-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "API", "authored", key())
                .value()
                .id();
        UUID other = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Guide", "authored", key())
                .value()
                .id();

        var created = createSiteUseCase.createSite(tenant.ownerCredential(), tenant.id(), "Acme Docs", key());
        UUID site = created.value().id();
        assertThat(created.value().rule()).isEqualTo("/{slug}/{itemPath}");
        assertThat(created.value().domains()).isEmpty();
        assertThat(created.value().allowedActions()).contains(SiteTypes.Action.UPDATE, SiteTypes.Action.DELETE);

        mountSpaceUseCase.mountSpace(tenant.ownerCredential(), tenant.id(), site, "api", space, key());
        var mounted = mountSpaceUseCase
                .mountSpace(tenant.ownerCredential(), tenant.id(), site, "guide", other, key())
                .value();
        assertThat(mounted.mounts()).extracting(SiteTypes.Mount::slug).containsExactly("api", "guide");
        assertThat(mounted.allowedActions()).contains(SiteTypes.Action.DELETE);

        var ordered = reorderMountsUseCase
                .reorderMounts(tenant.ownerCredential(), tenant.id(), site, List.of("guide", "api"), key())
                .value();
        assertThat(ordered.mounts()).extracting(SiteTypes.Mount::slug).containsExactly("guide", "api");

        updateSiteUseCase.updateSite(tenant.ownerCredential(), tenant.id(), site, home(space), key());
        unmountSpaceUseCase.unmountSpace(tenant.ownerCredential(), tenant.id(), site, "api", key());
        var after = viewSiteUseCase.viewSite(tenant.ownerCredential(), tenant.id(), site);
        assertThat(after.mounts()).extracting(SiteTypes.Mount::slug).containsExactly("guide");
        assertThat(after.home()).isNull();
        assertThat(viewSpaceUseCase
                        .viewSpace(tenant.ownerCredential(), tenant.id(), other)
                        .mounts())
                .extracting(SpaceTypes.Mount::siteId)
                .containsExactly(site);
    }

    @Test
    void mountErrorCasesAreExplicitAndIdempotentForTheSamePair() {
        TenantFixture tenant = tenant("Site Mount", "owner-mount@site-syncs.test");
        UUID first = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "First", "authored", key())
                .value()
                .id();
        UUID second = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Second", "authored", key())
                .value()
                .id();
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Docs", key())
                .value()
                .id();
        mountSpaceUseCase.mountSpace(tenant.ownerCredential(), tenant.id(), site, "api", first, key());

        var replay = mountSpaceUseCase.mountSpace(tenant.ownerCredential(), tenant.id(), site, "api", first, key());
        assertThat(replay.value().mounts()).hasSize(1);
        assertThatExceptionOfType(SiteSlugTakenException.class)
                .isThrownBy(() -> mountSpaceUseCase.mountSpace(
                        tenant.ownerCredential(), tenant.id(), site, "api", second, key()));
        assertThatExceptionOfType(SpaceAlreadyMountedException.class)
                .isThrownBy(() -> mountSpaceUseCase.mountSpace(
                        tenant.ownerCredential(), tenant.id(), site, "docs", first, key()));
        assertThatExceptionOfType(SlugInvalidException.class)
                .isThrownBy(() ->
                        mountSpaceUseCase.mountSpace(tenant.ownerCredential(), tenant.id(), site, "??", second, key()));
        assertThatExceptionOfType(SpaceNotFoundException.class)
                .isThrownBy(() -> mountSpaceUseCase.mountSpace(
                        tenant.ownerCredential(), tenant.id(), site, "gone", UUID.randomUUID(), key()));
        assertThatExceptionOfType(OrderInvalidException.class)
                .isThrownBy(() -> reorderMountsUseCase.reorderMounts(
                        tenant.ownerCredential(), tenant.id(), site, List.of("missing"), key()));

        archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), second, key());
        assertThatExceptionOfType(SpaceArchivedException.class)
                .isThrownBy(() -> mountSpaceUseCase.mountSpace(
                        tenant.ownerCredential(), tenant.id(), site, "archived", second, key()));
        unmountSpaceUseCase.unmountSpace(tenant.ownerCredential(), tenant.id(), site, "api", key());
        mountSpaceUseCase.mountSpace(tenant.ownerCredential(), tenant.id(), site, "api", first, key());
        archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), first, key());
        var replayArchived = mountSpaceUseCase
                .mountSpace(tenant.ownerCredential(), tenant.id(), site, "api", first, key())
                .value();
        assertThat(replayArchived.mounts()).extracting(SiteTypes.Mount::slug).containsExactly("api");
        var unmounted = unmountSpaceUseCase
                .unmountSpace(tenant.ownerCredential(), tenant.id(), site, "api", key())
                .value();
        assertThat(unmounted.mounts()).isEmpty();
        assertThatExceptionOfType(SiteNameInvalidException.class)
                .isThrownBy(() -> createSiteUseCase.createSite(tenant.ownerCredential(), tenant.id(), "  ", key()));
        assertThatExceptionOfType(HomeNotMountedException.class)
                .isThrownBy(() ->
                        updateSiteUseCase.updateSite(tenant.ownerCredential(), tenant.id(), site, home(second), key()));
    }

    @Test
    void listHidesUngrantedSitesAndWritesRequireSiteAdmin() {
        TenantFixture tenant = tenant("Site Acl", "owner-acl@site-syncs.test");
        UUID visible = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Visible", key())
                .value()
                .id();
        UUID hidden = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Hidden", key())
                .value()
                .id();
        UserApi.UserId member = verifiedUser("member@site-syncs.test");
        String memberCredential = credential(member);
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(member.value()),
                        MembershipApi.Role.MEMBER));

        assertThat(listSitesUseCase
                        .listSites(memberCredential, tenant.id(), null, 20)
                        .items())
                .isEmpty();
        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() -> viewSiteUseCase.viewSite(memberCredential, tenant.id(), visible));
        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() -> createSiteUseCase.createSite(memberCredential, tenant.id(), "Forbidden", key()));

        putSiteGrantUseCase.putSiteGrant(
                tenant.ownerCredential(), tenant.id(), visible, "user:" + member.value(), "admin");
        assertThat(viewSiteUseCase
                        .viewSite(memberCredential, tenant.id(), visible)
                        .id())
                .isEqualTo(visible);
        assertThat(listSitesUseCase
                        .listSites(memberCredential, tenant.id(), null, 20)
                        .items())
                .extracting(SiteTypes.SiteSummary::id)
                .containsExactly(visible)
                .doesNotContain(hidden);
        var renamed = updateSiteUseCase
                .updateSite(memberCredential, tenant.id(), visible, name("Renamed"), key())
                .value();
        assertThat(renamed.name()).isEqualTo("Renamed");
        assertThatThrownBy(() -> putSiteGrantUseCase.putSiteGrant(
                        tenant.ownerCredential(), tenant.id(), visible, "anonymous", "admin"))
                .isInstanceOf(io.space.control.compositions.flow.FlowException.class)
                .satisfies(error -> assertThat(((io.space.control.compositions.flow.FlowException) error).code())
                        .isEqualTo(io.space.control.compositions.flow.ProblemCode.PERMISSION_ROLE_INVALID));
        putSiteGrantUseCase.putSiteGrant(tenant.ownerCredential(), tenant.id(), visible, "anonymous", "reader");
        var explained = explainSiteAdminUseCase.explainSiteAdmin(
                tenant.ownerCredential(), tenant.id(), visible, "user:" + member.value());
        assertThat(explained.allowed()).isTrue();
        assertThat(explained.effectiveOperations()).contains(PermissionTypes.PermissionOperation.ADMIN);
    }

    @Test
    void brandingRoundTripAndEmptyDeleteClearGrants() {
        TenantFixture tenant = tenant("Site Brand", "owner-brand@site-syncs.test");
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Brand", key())
                .value()
                .id();
        var patched = updateSiteUseCase
                .updateSite(
                        tenant.ownerCredential(),
                        tenant.id(),
                        site,
                        SiteTypes.UpdatePatch.fromJson(
                                false,
                                null,
                                true,
                                "%s | Acme",
                                true,
                                false,
                                true,
                                "https://cdn.example/logo.png",
                                false,
                                null,
                                true,
                                "#AABBCC",
                                true,
                                "zh-CN",
                                true,
                                "G-123",
                                true,
                                "noindex",
                                false,
                                null,
                                false,
                                null),
                        key())
                .value();
        assertThat(patched.titleTemplate()).isEqualTo("%s | Acme");
        assertThat(patched.branding().logo()).isEqualTo("https://cdn.example/logo.png");
        assertThat(patched.branding().primaryColor()).isEqualTo("#aabbcc");
        assertThat(patched.locale()).isEqualTo("zh-CN");
        assertThat(patched.analyticsId()).isEqualTo("G-123");
        assertThat(patched.robotsPolicy()).isEqualTo("noindex");
        assertThatExceptionOfType(BrandingInvalidException.class)
                .isThrownBy(() -> updateSiteUseCase.updateSite(
                        tenant.ownerCredential(),
                        tenant.id(),
                        site,
                        SiteTypes.UpdatePatch.fromJson(
                                false,
                                null,
                                false,
                                null,
                                true,
                                false,
                                true,
                                "http://insecure.example/logo.png",
                                false,
                                null,
                                false,
                                null,
                                false,
                                null,
                                false,
                                null,
                                false,
                                null,
                                false,
                                null,
                                false,
                                null),
                        key()));
        assertThatExceptionOfType(SitePatchInvalidException.class)
                .isThrownBy(() -> updateSiteUseCase.updateSite(
                        tenant.ownerCredential(),
                        tenant.id(),
                        site,
                        SiteTypes.UpdatePatch.fromJson(
                                false, null, false, null, false, false, false, null, false, null, false, null, false,
                                null, false, null, false, null, false, null, false, null),
                        key()));

        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Mounted", "authored", key())
                .value()
                .id();
        mountSpaceUseCase.mountSpace(tenant.ownerCredential(), tenant.id(), site, "docs", space, key());
        assertThatExceptionOfType(SiteNotEmptyException.class)
                .isThrownBy(() ->
                        deleteSiteUseCase.deleteSite(tenant.ownerCredential(), tenant.id(), site, "Brand", key()));
        unmountSpaceUseCase.unmountSpace(tenant.ownerCredential(), tenant.id(), site, "docs", key());
        putSiteGrantUseCase.putSiteGrant(tenant.ownerCredential(), tenant.id(), site, "anonymous", "reader");
        deleteSiteUseCase.deleteSite(tenant.ownerCredential(), tenant.id(), site, "Brand", key());
        assertThatExceptionOfType(SiteNotFoundException.class)
                .isThrownBy(() -> viewSiteUseCase.viewSite(tenant.ownerCredential(), tenant.id(), site));
        assertThatExceptionOfType(SiteNotFoundException.class)
                .isThrownBy(() -> listSitePermissionsUseCase.listSitePermissions(
                        tenant.ownerCredential(), tenant.id(), site, null, 20));
    }

    @Test
    void tenantPathCannotBorrowRootAdminForAnotherTenantSite() {
        TenantFixture first = tenant("Site First", "owner-first@site-syncs.test");
        TenantFixture second = tenant("Site Second", "owner-second@site-syncs.test");
        UUID foreign = createSiteUseCase
                .createSite(second.ownerCredential(), second.id(), "Foreign", key())
                .value()
                .id();
        assertThatExceptionOfType(SiteNotFoundException.class)
                .isThrownBy(() -> viewSiteUseCase.viewSite(first.ownerCredential(), first.id(), foreign));
        assertThatExceptionOfType(SiteNotFoundException.class)
                .isThrownBy(() -> updateSiteUseCase.updateSite(
                        first.ownerCredential(), first.id(), foreign, name("Compromised"), key()));
    }

    @Test
    void tokensCannotWriteSites() {
        TenantFixture tenant = tenant("Site Token", "owner-token@site-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Bound", "authored", key())
                .value()
                .id();
        ApiTokenApi.IssueResult.Issued issued =
                tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
                    UUID ownerId = jdbc.queryForObject(
                            "select id from iam.users where email = ?", UUID.class, "owner-token@site-syncs.test");
                    return (ApiTokenApi.IssueResult.Issued) tokens.issue(
                            ownerId,
                            tenant.id(),
                            space,
                            "Site writer",
                            Set.of(ApiTokenApi.Scope.READ, ApiTokenApi.Scope.WRITE),
                            Instant.now().plus(1, ChronoUnit.DAYS));
                });
        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() -> createSiteUseCase.createSite(issued.secret(), tenant.id(), "Token Site", key()));
        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() -> listSitesUseCase.listSites(issued.secret(), tenant.id(), null, 20));
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Owned", key())
                .value()
                .id();
        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() ->
                        putSiteGrantUseCase.putSiteGrant(issued.secret(), tenant.id(), site, "anonymous", "reader"));
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
