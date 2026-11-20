package io.space.control.compositions.authoring.space;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.resource.SpaceArchivedException;
import io.space.control.compositions.resource.SpaceModeRestrictedException;
import io.space.control.compositions.resource.SpaceNotFoundException;
import io.space.control.support.FixtureDatabaseConfiguration;
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
class SpaceSyncsTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListSpacesUseCase listSpacesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewSpaceUseCase viewSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    UpdateSpaceUseCase updateSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ArchiveSpaceUseCase archiveSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RestoreSpaceUseCase restoreSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ConvertSpaceUseCase convertSpaceUseCase;

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
    PermissionApi permissions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void createListAndViewRunThroughTenantScopeAndDomainActions() {
        TenantFixture tenant = tenant("Space Core", "owner-core@space-syncs.test");

        var authored =
                createSpaceUseCase.createSpace(tenant.ownerCredential(), tenant.id(), "Authoring", "authored", key());
        var synced = createSpaceUseCase.createSpace(tenant.ownerCredential(), tenant.id(), "Mirror", "synced", key());

        assertThat(authored.value().mode()).isEqualTo("authored");
        assertThat(synced.value().mode()).isEqualTo("synced");
        assertThat(listSpacesUseCase
                        .listSpaces(tenant.ownerCredential(), tenant.id(), null, 20, null, null, null)
                        .items())
                .extracting(SpaceTypes.SpaceSummary::id)
                .containsExactlyInAnyOrder(authored.value().id(), synced.value().id());
        assertThat(viewSpaceUseCase.viewSpace(
                        tenant.ownerCredential(), tenant.id(), authored.value().id()))
                .isEqualTo(authored.value());
        assertThat(jdbc.queryForList(
                        "select distinct tenant_id from authoring.spaces where id in (?, ?)",
                        UUID.class,
                        authored.value().id(),
                        synced.value().id()))
                .containsExactly(tenant.id());
    }

    @Test
    void listFiltersCandidatesAndDetailRequiresReadOnTheFullChain() {
        TenantFixture tenant = tenant("Space Read", "owner-read@space-syncs.test");
        var visible = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Visible", "authored", key())
                .value();
        var hidden = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Hidden", "authored", key())
                .value();
        UserApi.UserId reader = verifiedUser("reader@space-syncs.test");
        String readerCredential = credential(reader);
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(reader.value()),
                        MembershipApi.Role.MEMBER));

        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() -> viewSpaceUseCase.viewSpace(readerCredential, tenant.id(), visible.id()));

        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> permissions.grant(
                        new PermissionApi.Resource(PermissionApi.ResourceType.SPACE, visible.id()),
                        new PermissionApi.Principal(PermissionApi.PrincipalType.USER, reader.value()),
                        new PermissionApi.Role("reader")));

        assertThat(viewSpaceUseCase
                        .viewSpace(readerCredential, tenant.id(), visible.id())
                        .id())
                .isEqualTo(visible.id());
        assertThat(listSpacesUseCase
                        .listSpaces(readerCredential, tenant.id(), null, 20, null, null, null)
                        .items())
                .extracting(SpaceTypes.SpaceSummary::id)
                .containsExactly(visible.id())
                .doesNotContain(hidden.id());
    }

    @Test
    void updateArchiveAndRestoreEnforceTheArchivedErrorCase() {
        TenantFixture tenant = tenant("Space Lifecycle", "owner-life@space-syncs.test");
        UUID id = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Before", "authored", key())
                .value()
                .id();

        var updated = updateSpaceUseCase.updateSpace(
                tenant.ownerCredential(), tenant.id(), id, patch("After", "book", "Description"), key());
        assertThat(updated.value())
                .extracting(
                        SpaceTypes.SpaceDetail::name, SpaceTypes.SpaceDetail::icon, SpaceTypes.SpaceDetail::description)
                .containsExactly("After", "book", "Description");

        archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), id, key());
        assertThat(listSpacesUseCase
                        .listSpaces(tenant.ownerCredential(), tenant.id(), null, 20, null, null, null)
                        .items())
                .singleElement()
                .extracting(SpaceTypes.SpaceSummary::status)
                .isEqualTo("archived");
        assertThatExceptionOfType(SpaceArchivedException.class)
                .isThrownBy(() -> updateSpaceUseCase.updateSpace(
                        tenant.ownerCredential(), tenant.id(), id, patch("Blocked", null, null), key()));
        assertThatExceptionOfType(SpaceArchivedException.class)
                .isThrownBy(() -> updateSpaceUseCase.updateSpace(
                        tenant.ownerCredential(), tenant.id(), id, patch(null, "code", "Blocked"), key()));

        restoreSpaceUseCase.restoreSpace(tenant.ownerCredential(), tenant.id(), id, key());
        assertThat(updateSpaceUseCase
                        .updateSpace(tenant.ownerCredential(), tenant.id(), id, patch("Writable", null, null), key())
                        .value()
                        .name())
                .isEqualTo("Writable");
    }

    @Test
    void singleFieldPatchPreservesTheOtherMetadataField() {
        TenantFixture tenant = tenant("Space Patch", "owner-patch@space-syncs.test");
        UUID id = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Patch", "authored", key())
                .value()
                .id();
        updateSpaceUseCase.updateSpace(
                tenant.ownerCredential(), tenant.id(), id, patch(null, "book", "Keep me"), key());

        var updated = updateSpaceUseCase
                .updateSpace(
                        tenant.ownerCredential(),
                        tenant.id(),
                        id,
                        new SpaceTypes.UpdatePatch(
                                SpaceApi.Patch.unchanged(),
                                SpaceApi.Patch.set("code"),
                                SpaceApi.Patch.unchanged(),
                                java.util.Optional.empty()),
                        key())
                .value();

        assertThat(updated.icon()).isEqualTo("code");
        assertThat(updated.description()).isEqualTo("Keep me");
    }

    @Test
    void updateSpaceSetsAutoReleaseOnAuthoredAndRejectsSynced() {
        TenantFixture tenant = tenant("Space AutoRelease", "owner-autorelease@space-syncs.test");
        UUID authored = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Wiki", "authored", key())
                .value()
                .id();
        UUID synced = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Imported", "synced", key())
                .value()
                .id();

        var off = updateSpaceUseCase
                .updateSpace(
                        tenant.ownerCredential(),
                        tenant.id(),
                        authored,
                        new SpaceTypes.UpdatePatch(
                                SpaceApi.Patch.unchanged(),
                                SpaceApi.Patch.unchanged(),
                                SpaceApi.Patch.unchanged(),
                                java.util.Optional.of(false)),
                        key())
                .value();
        assertThat(off.autoRelease()).isFalse();
        assertThatExceptionOfType(SpaceModeRestrictedException.class)
                .isThrownBy(() -> updateSpaceUseCase.updateSpace(
                        tenant.ownerCredential(),
                        tenant.id(),
                        synced,
                        new SpaceTypes.UpdatePatch(
                                SpaceApi.Patch.unchanged(),
                                SpaceApi.Patch.unchanged(),
                                SpaceApi.Patch.unchanged(),
                                java.util.Optional.of(true)),
                        key()));
        assertThatExceptionOfType(SpacePatchInvalidException.class)
                .isThrownBy(() -> SpaceTypes.UpdatePatch.fromJson(false, null, false, null, false, null, true, null));
    }

    @Test
    void tenantPathCannotBorrowRootAdminForAnotherTenantSpace() {
        TenantFixture first = tenant("Space First", "owner-first@space-syncs.test");
        TenantFixture second = tenant("Space Second", "owner-second@space-syncs.test");
        UUID foreign = createSpaceUseCase
                .createSpace(second.ownerCredential(), second.id(), "Foreign", "authored", key())
                .value()
                .id();

        assertThatExceptionOfType(SpaceNotFoundException.class)
                .isThrownBy(() -> viewSpaceUseCase.viewSpace(first.ownerCredential(), first.id(), foreign));
        assertThatExceptionOfType(SpaceNotFoundException.class)
                .isThrownBy(() -> updateSpaceUseCase.updateSpace(
                        first.ownerCredential(), first.id(), foreign, patch("Compromised", null, null), key()));
    }

    @Test
    void guardsAndNotFoundErrorsAreExplicit() {
        TenantFixture tenant = tenant("Space Guards", "owner-guard@space-syncs.test");
        UserApi.UserId outsider = verifiedUser("outsider@space-syncs.test");
        String outsiderCredential = credential(outsider);

        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() -> createSpaceUseCase.createSpace(
                        outsiderCredential, tenant.id(), "Forbidden", "authored", key()));
        assertThatExceptionOfType(PermissionDeniedException.class)
                .isThrownBy(() ->
                        listSpacesUseCase.listSpaces(outsiderCredential, tenant.id(), null, 20, null, null, null));
        assertThatExceptionOfType(SpaceNameInvalidException.class)
                .isThrownBy(() -> createSpaceUseCase.createSpace(
                        tenant.ownerCredential(), tenant.id(), "   ", "authored", key()));
        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> createSpaceUseCase.createSpace(
                        tenant.ownerCredential(), tenant.id(), "Mode", "unknown", key()));
        assertThatExceptionOfType(SpaceNotFoundException.class)
                .isThrownBy(() -> viewSpaceUseCase.viewSpace(tenant.ownerCredential(), tenant.id(), UUID.randomUUID()));
        assertThatExceptionOfType(SpaceNotFoundException.class)
                .isThrownBy(() -> archiveSpaceUseCase.archiveSpace(
                        tenant.ownerCredential(), tenant.id(), UUID.randomUUID(), key()));
        assertThatExceptionOfType(SpaceNotFoundException.class)
                .isThrownBy(() -> restoreSpaceUseCase.restoreSpace(
                        tenant.ownerCredential(), tenant.id(), UUID.randomUUID(), key()));
    }

    @Test
    void convertSpaceRequiresLiveForAuthoredToSynced() {
        TenantFixture tenant = tenant("Space Convert", "owner-convert@space-syncs.test");
        UUID authored = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Authored", "authored", key())
                .value()
                .id();
        UUID synced = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Synced", "synced", key())
                .value()
                .id();

        assertThat(viewSpaceUseCase
                        .viewSpace(tenant.ownerCredential(), tenant.id(), authored)
                        .allowedActions())
                .doesNotContain(SpaceTypes.Action.CONVERT);
        assertThatExceptionOfType(LiveReleaseRequiredException.class)
                .isThrownBy(() -> convertSpaceUseCase.convertSpace(
                        tenant.ownerCredential(), tenant.id(), authored, "synced", key()));
        assertThat(convertSpaceUseCase
                        .convertSpace(tenant.ownerCredential(), tenant.id(), synced, "authored", key())
                        .value())
                .extracting(SpaceTypes.SpaceDetail::mode, SpaceTypes.SpaceDetail::autoRelease)
                .containsExactly("authored", true);
    }

    @Test
    void mutationsReplayExactlyAndRejectKeyReuseForAnotherRequest() {
        TenantFixture tenant = tenant("Space Idempotency", "owner-idem@space-syncs.test");
        String replayKey = key();

        var first =
                createSpaceUseCase.createSpace(tenant.ownerCredential(), tenant.id(), "Once", "authored", replayKey);
        var replay =
                createSpaceUseCase.createSpace(tenant.ownerCredential(), tenant.id(), "Once", "authored", replayKey);

        assertThat(replay.serializedBody()).isEqualTo(first.serializedBody());
        assertThat(jdbc.queryForObject(
                        "select count(*) from authoring.spaces where tenant_id = ? and name = 'Once'",
                        Long.class,
                        tenant.id()))
                .isOne();
        assertThatExceptionOfType(io.space.control.compositions.flow.FlowIdempotencyKeyReusedException.class)
                .isThrownBy(() -> createSpaceUseCase.createSpace(
                        tenant.ownerCredential(), tenant.id(), "Different", "authored", replayKey));
        assertThat(jdbc.queryForObject(
                        "select response_body from shared.idempotency_records where idempotency_key = ?",
                        String.class,
                        replayKey))
                .startsWith("v1:")
                .doesNotContain(first.serializedBody());
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@space-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Space User");
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

    private static SpaceTypes.UpdatePatch patch(String name, String icon, String description) {
        return new SpaceTypes.UpdatePatch(
                name == null ? SpaceApi.Patch.unchanged() : SpaceApi.Patch.set(name),
                icon == null ? SpaceApi.Patch.unchanged() : SpaceApi.Patch.set(icon),
                description == null ? SpaceApi.Patch.unchanged() : SpaceApi.Patch.set(description),
                java.util.Optional.empty());
    }

    private record TenantFixture(UUID id, String ownerCredential) {}
}
