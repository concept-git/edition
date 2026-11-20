package io.space.control.compositions.releases.release;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.authoring.permission.PutSpaceGrantUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.List;
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

/** sync listTenantReleases：跨空间键集分页、可读收窄、筛选与游标错误。 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class TenantReleaseListingTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    ListReleasesUseCase listReleasesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantReleasesUseCase listTenantReleasesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutSpaceGrantUseCase putSpaceGrantUseCase;

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
    MembershipApi memberships;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void mergesReadableSpacesNewestFirstAndPagesByCursor() {
        TenantFixture tenant = tenant("Release Index", "owner@release-index.test");
        UUID first = space(tenant, "Alpha");
        UUID second = space(tenant, "Beta");
        UUID oldest = draft(tenant.id(), first);
        UUID middle = draft(tenant.id(), second);
        UUID newest = draft(tenant.id(), first);

        var page = listTenantReleasesUseCase.listTenantReleases(
                tenant.credential(), tenant.id(), filter(null, null, null), null, 2);
        assertThat(page.items())
                .extracting(ReleaseTypes.TenantReleaseSummary::id)
                .containsExactly(newest, middle);
        assertThat(page.items().getFirst().spaceName()).isEqualTo("Alpha");
        assertThat(page.items().get(1).spaceName()).isEqualTo("Beta");
        assertThat(page.items().getFirst().spaceMode()).isEqualTo("authored");
        assertThat(page.total()).isNull();
        assertThat(page.spaces())
                .extracting(ReleaseTypes.ReleaseSpaceChoice::name)
                .containsExactly("Alpha", "Beta");
        assertThat(page.nextCursor()).isNotBlank();

        var rest = listTenantReleasesUseCase.listTenantReleases(
                tenant.credential(), tenant.id(), filter(null, null, null), page.nextCursor(), 2);
        assertThat(rest.items())
                .extracting(ReleaseTypes.TenantReleaseSummary::id)
                .containsExactly(oldest);
        assertThat(rest.nextCursor()).isNull();
    }

    @Test
    void spaceListUsesTheSameKeysetOrderAsTheTenantList() {
        TenantFixture tenant = tenant("Space Release Page", "owner@space-release-page.test");
        UUID space = space(tenant, "Selected");
        UUID other = space(tenant, "Other");
        List<UUID> ids = List.of(draft(tenant.id(), space), draft(tenant.id(), space), draft(tenant.id(), space));
        draft(tenant.id(), other);
        // 相同时间戳让续页必须使用数据库的 UUID 次序，而不是 Java UUID 的有符号比较。
        jdbc.update("update releases.releases set created_at = '2026-01-01T00:00:00Z' where space_id = ?", space);
        var expected = ids.stream()
                .sorted((left, right) -> right.toString().compareTo(left.toString()))
                .toList();

        var first = listReleasesUseCase.listReleases(tenant.credential(), tenant.id(), space, null, 2);
        assertThat(first.items())
                .extracting(ReleaseTypes.ReleaseSummary::id)
                .containsExactlyElementsOf(expected.subList(0, 2));
        assertThat(first.nextCursor()).isNotBlank();
        var rest = listReleasesUseCase.listReleases(tenant.credential(), tenant.id(), space, first.nextCursor(), 2);
        assertThat(rest.items()).extracting(ReleaseTypes.ReleaseSummary::id).containsExactly(expected.getLast());
        assertThat(rest.nextCursor()).isNull();
        assertThat(first.total()).isNull();
        assertThatExceptionOfType(InvalidCursorException.class)
                .isThrownBy(() ->
                        listReleasesUseCase.listReleases(tenant.credential(), tenant.id(), space, "not-a-cursor", 2));
    }

    @Test
    void filtersBySpaceModeAndStatusWithoutLeakingTotals() {
        TenantFixture tenant = tenant("Release Filter", "owner@release-filter.test");
        UUID authored = space(tenant, "Authored");
        UUID synced = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Synced", "synced", key())
                .value()
                .id();
        UUID inAuthored = draft(tenant.id(), authored);
        UUID inSynced = draft(tenant.id(), synced);

        assertThat(listTenantReleasesUseCase
                        .listTenantReleases(tenant.credential(), tenant.id(), filter(authored, null, null), null, 20)
                        .items())
                .extracting(ReleaseTypes.TenantReleaseSummary::id)
                .containsExactly(inAuthored);
        assertThat(listTenantReleasesUseCase
                        .listTenantReleases(tenant.credential(), tenant.id(), filter(null, "synced", null), null, 20)
                        .items())
                .extracting(ReleaseTypes.TenantReleaseSummary::id)
                .containsExactly(inSynced);
        assertThat(listTenantReleasesUseCase
                        .listTenantReleases(tenant.credential(), tenant.id(), filter(null, null, "draft"), null, 20)
                        .items())
                .hasSize(2);
        assertThat(listTenantReleasesUseCase
                        .listTenantReleases(tenant.credential(), tenant.id(), filter(null, null, "live"), null, 20)
                        .items())
                .isEmpty();
        // 不属于本租户的空间筛选不探测存在性：空页而非 404。
        assertThat(listTenantReleasesUseCase
                        .listTenantReleases(
                                tenant.credential(), tenant.id(), filter(UUID.randomUUID(), null, null), null, 20)
                        .items())
                .isEmpty();
    }

    @Test
    void readerSeesOnlyGrantedSpacesAndOutsidersAreRefused() {
        TenantFixture tenant = tenant("Release Reader", "owner@release-reader.test");
        TenantFixture other = tenant("Release Other", "owner@release-other.test");
        UUID granted = space(tenant, "Granted");
        UUID hidden = space(tenant, "Hidden");
        UUID visible = draft(tenant.id(), granted);
        draft(tenant.id(), hidden);
        draft(other.id(), space(other, "Foreign"));

        UserApi.UserId reader = verifiedUser("reader@release-reader.test");
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(reader.value()),
                        MembershipApi.Role.MEMBER));
        putSpaceGrantUseCase.putSpaceGrant(
                tenant.credential(), tenant.id(), granted, "user:" + reader.value(), "reader");

        var page = listTenantReleasesUseCase.listTenantReleases(
                credential(reader), tenant.id(), filter(null, null, null), null, 20);
        assertThat(page.items())
                .extracting(ReleaseTypes.TenantReleaseSummary::id)
                .containsExactly(visible);
        assertThat(page.items().getFirst().allowedActions()).isEmpty();
        assertThat(page.spaces())
                .extracting(ReleaseTypes.ReleaseSpaceChoice::id)
                .containsExactly(granted);

        var owner = listTenantReleasesUseCase.listTenantReleases(
                tenant.credential(), tenant.id(), filter(null, null, null), null, 20);
        assertThat(owner.items()).hasSize(2);
        assertThat(owner.items().getFirst().allowedActions()).contains(ReleaseTypes.Action.DISCARD);

        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() -> listTenantReleasesUseCase.listTenantReleases(
                        other.credential(), tenant.id(), filter(null, null, null), null, 20));
    }

    @Test
    void rejectsMalformedCursorsAndLimits() {
        TenantFixture tenant = tenant("Release Cursor", "owner@release-cursor.test");
        space(tenant, "Any");
        assertThatExceptionOfType(InvalidCursorException.class)
                .isThrownBy(() -> listTenantReleasesUseCase.listTenantReleases(
                        tenant.credential(), tenant.id(), filter(null, null, null), "not-a-cursor", 20));
        assertThatExceptionOfType(InvalidCursorException.class)
                .isThrownBy(() -> listTenantReleasesUseCase.listTenantReleases(
                        tenant.credential(), tenant.id(), filter(null, null, null), null, 0));
        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> ReleaseTypes.TenantReleaseFilter.parse(null, null, "shipped"));
    }

    private static ReleaseTypes.TenantReleaseFilter filter(UUID space, String mode, String status) {
        return ReleaseTypes.TenantReleaseFilter.parse(space, mode, status);
    }

    private UUID space(TenantFixture tenant, String name) {
        return createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), name, "authored", key())
                .value()
                .id();
    }

    private UUID draft(UUID tenant, UUID space) {
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> releases.draft(
                                new ReleaseApi.ScopeId(space),
                                new ReleaseApi.Source(ReleaseApi.SourceKind.BUILD, "fixture", UUID.randomUUID()))
                        .id());
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@release-index.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Release Index");
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
