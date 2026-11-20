package io.space.control.compositions.iam.membership;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.util.UUID;
import java.util.concurrent.Executors;
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
class MembershipSyncsTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    InviteUseCase inviteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PreviewInviteUseCase previewInviteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    AcceptInviteUseCase acceptInviteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListMembersUseCase listMembersUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListInvitesUseCase listInvitesUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetMemberRoleUseCase setMemberRoleUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RemoveMemberUseCase removeMemberUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RevokeInviteUseCase revokeInviteUseCase;

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
    PermissionApi permissions;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void inviteCanBePreviewedListedAndRevokedWhileInvalidLinksShareOneError() {
        TenantFixture tenant = tenant("Invitation Lifecycle", "owner-lifecycle@invitation-syncs.test");

        var issued = inviteUseCase.invite(
                tenant.ownerCredential(), tenant.id(), "guest-lifecycle@invitation-syncs.test", "member", key());

        assertThat(previewInviteUseCase.previewInvite(issued.value().token()))
                .extracting(
                        preview -> preview.tenant().name(),
                        MembershipTypes.InvitePreview::email,
                        MembershipTypes.InvitePreview::role)
                .containsExactly("Invitation Lifecycle", "guest-lifecycle@invitation-syncs.test", "member");
        assertThat(listInvitesUseCase
                        .listInvites(tenant.ownerCredential(), tenant.id(), null, 20)
                        .items())
                .extracting(MembershipTypes.InviteSummary::id)
                .containsExactly(issued.value().invite().id());

        revokeInviteUseCase.revokeInvite(
                tenant.ownerCredential(), tenant.id(), issued.value().invite().id());
        assertThatExceptionOfType(InviteInvalidException.class)
                .isThrownBy(
                        () -> previewInviteUseCase.previewInvite(issued.value().token()));
        assertThatExceptionOfType(InviteInvalidException.class)
                .isThrownBy(() -> previewInviteUseCase.previewInvite("unknown-token"));
    }

    @Test
    void invitingAnExistingMemberAndAcceptingForTheWrongEmailUseTheirErrorSyncs() {
        TenantFixture tenant = tenant("Invitation Errors", "owner-errors@invitation-syncs.test");
        assertThatExceptionOfType(AlreadyMemberException.class)
                .isThrownBy(() -> inviteUseCase.invite(
                        tenant.ownerCredential(), tenant.id(), "owner-errors@invitation-syncs.test", "member", key()));

        UserApi.UserId intended = verifiedUser("intended@invitation-syncs.test");
        UserApi.UserId stranger = verifiedUser("stranger@invitation-syncs.test");
        var issued = inviteUseCase.invite(
                tenant.ownerCredential(), tenant.id(), "intended@invitation-syncs.test", "member", key());

        assertThatExceptionOfType(InviteEmailMismatchException.class)
                .isThrownBy(() -> acceptInviteUseCase.acceptInvite(
                        stranger.value(), issued.value().token()));
        assertThat(acceptInviteUseCase
                        .acceptInvite(intended.value(), issued.value().token())
                        .tenant()
                        .id())
                .isEqualTo(tenant.id());
        var duplicate = tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.invite(
                        MembershipApi.Group.tenant(tenant.id()),
                        "intended@invitation-syncs.test",
                        MembershipApi.Role.MEMBER));
        assertThatExceptionOfType(InviteAlreadyAcceptedException.class)
                .isThrownBy(() -> acceptInviteUseCase.acceptInvite(intended.value(), duplicate.token()));
        assertThat(tenantScope.inTenant(
                        new TenantRegistryApi.TenantId(tenant.id()),
                        () -> memberships.inviteOf(MembershipApi.InviteRef.ofToken(duplicate.token()))))
                .isEmpty();
    }

    @Test
    void memberListsAndRoleChangesKeepRootAccessInStepWithOwnership() {
        TenantFixture tenant = tenant("Invitation Roles", "owner-roles@invitation-syncs.test");
        UserApi.UserId member = verifiedUser("member-roles@invitation-syncs.test");
        var issued = inviteUseCase.invite(
                tenant.ownerCredential(), tenant.id(), "member-roles@invitation-syncs.test", "member", key());
        acceptInviteUseCase.acceptInvite(member.value(), issued.value().token());

        assertThat(listMembersUseCase
                        .listMembers(tenant.ownerCredential(), tenant.id(), null, 20)
                        .items())
                .extracting(MembershipTypes.MemberSummary::id)
                .contains(tenant.owner().value(), member.value());

        setMemberRoleUseCase.setMemberRole(tenant.ownerCredential(), tenant.id(), member.value(), "owner");
        assertThat(rootGrantCount(tenant.id(), member.value())).isOne();
        setMemberRoleUseCase.setMemberRole(tenant.ownerCredential(), tenant.id(), member.value(), "member");
        assertThat(rootGrantCount(tenant.id(), member.value())).isZero();

        removeMemberUseCase.removeMember(tenant.ownerCredential(), tenant.id(), member.value());
        removeMemberUseCase.removeMember(tenant.ownerCredential(), tenant.id(), member.value());
        assertThat(listMembersUseCase
                        .listMembers(tenant.ownerCredential(), tenant.id(), null, 20)
                        .items())
                .extracting(MembershipTypes.MemberSummary::id)
                .doesNotContain(member.value());
    }

    @Test
    void leavingOneTenantClearsOnlyThatTenantsPermissionPrincipal() {
        TenantFixture first = tenant("Permission Cleanup A", "owner-clean-a@invitation-syncs.test");
        TenantFixture second = tenant("Permission Cleanup B", "owner-clean-b@invitation-syncs.test");
        UserApi.UserId member = verifiedUser("member-clean@invitation-syncs.test");
        acceptMember(first, member, "member-clean@invitation-syncs.test");
        acceptMember(second, member, "member-clean@invitation-syncs.test");
        var principal = new PermissionApi.Principal(PermissionApi.PrincipalType.USER, member.value());
        var reader = new PermissionApi.Role("reader");

        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(first.id()),
                () -> permissions.grant(
                        new PermissionApi.Resource(PermissionApi.ResourceType.TENANT, first.id()), principal, reader));
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(second.id()),
                () -> permissions.grant(
                        new PermissionApi.Resource(PermissionApi.ResourceType.TENANT, second.id()), principal, reader));

        removeMemberUseCase.removeMember(first.ownerCredential(), first.id(), member.value());

        assertThat(canRead(first.id(), principal)).isFalse();
        assertThat(canRead(second.id(), principal)).isTrue();
    }

    @Test
    void lastOwnerMissingMemberInvalidRoleAndCursorBranchesAreExplicit() {
        TenantFixture tenant = tenant("Invitation Branches", "owner-branches@invitation-syncs.test");

        assertThatExceptionOfType(LastOwnerException.class)
                .isThrownBy(() -> removeMemberUseCase.removeMember(
                        tenant.ownerCredential(), tenant.id(), tenant.owner().value()));
        assertThatExceptionOfType(MemberNotFoundException.class)
                .isThrownBy(() -> setMemberRoleUseCase.setMemberRole(
                        tenant.ownerCredential(), tenant.id(), UUID.randomUUID(), "owner"));
        assertThatExceptionOfType(MemberRoleInvalidException.class)
                .isThrownBy(() -> setMemberRoleUseCase.setMemberRole(
                        tenant.ownerCredential(), tenant.id(), tenant.owner().value(), "unknown"));
        assertThatExceptionOfType(InvalidCursorException.class)
                .isThrownBy(() -> listMembersUseCase.listMembers(tenant.ownerCredential(), tenant.id(), "broken", 20));
        assertThatExceptionOfType(InvalidCursorException.class)
                .isThrownBy(() -> listInvitesUseCase.listInvites(tenant.ownerCredential(), tenant.id(), "broken", 20));
    }

    @Test
    void sameKeySerialReplayReturnsTheExactFirstResponseAndCreatesOneInvite() {
        TenantFixture tenant = tenant("Serial Idempotency", "owner-serial@invitation-syncs.test");
        String key = key();

        var first = inviteUseCase.invite(
                tenant.ownerCredential(), tenant.id(), "serial@invitation-syncs.test", "MEMBER", key);
        var replay = inviteUseCase.invite(
                tenant.ownerCredential(), tenant.id(), " SERIAL@invitation-syncs.test ", "member", key);

        assertThat(replay.serializedBody()).isEqualTo(first.serializedBody());
        assertThat(replay.status()).isEqualTo(first.status()).isEqualTo(201);
        assertThat(replay.contentType()).isEqualTo(first.contentType());
        assertThat(inviteCount(tenant.id(), "serial@invitation-syncs.test")).isOne();
        String persistedEnvelope = jdbc.queryForObject(
                "select response_body from shared.idempotency_records where idempotency_key = ?", String.class, key);
        assertThat(persistedEnvelope)
                .startsWith("v1:")
                .doesNotContain(first.value().token())
                .doesNotContain(first.serializedBody());
    }

    @Test
    void sameKeyConcurrentRequestsWaitAndReplayOneInvite() throws Exception {
        TenantFixture tenant = tenant("Concurrent Idempotency", "owner-concurrent@invitation-syncs.test");
        String key = key();

        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var calls = java.util.List.of(
                    executor.submit(() -> inviteUseCase.invite(
                            tenant.ownerCredential(), tenant.id(), "concurrent@invitation-syncs.test", "member", key)),
                    executor.submit(() -> inviteUseCase.invite(
                            tenant.ownerCredential(), tenant.id(), "concurrent@invitation-syncs.test", "member", key)));
            var first = calls.get(0).get();
            var second = calls.get(1).get();

            assertThat(second.serializedBody()).isEqualTo(first.serializedBody());
        }
        assertThat(inviteCount(tenant.id(), "concurrent@invitation-syncs.test")).isOne();
    }

    @Test
    void sameKeyWithDifferentCanonicalRequestIsRejected() {
        TenantFixture tenant = tenant("Reuse Conflict", "owner-reuse@invitation-syncs.test");
        String key = key();
        inviteUseCase.invite(tenant.ownerCredential(), tenant.id(), "first@invitation-syncs.test", "member", key);

        assertThatExceptionOfType(io.space.control.compositions.flow.FlowIdempotencyKeyReusedException.class)
                .isThrownBy(() -> inviteUseCase.invite(
                        tenant.ownerCredential(), tenant.id(), "second@invitation-syncs.test", "member", key));
    }

    private long inviteCount(UUID tenant, String email) {
        return jdbc.queryForObject(
                "select count(*) from iam.invites where tenant_id = ? and email::text = ?", Long.class, tenant, email);
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private long rootGrantCount(UUID tenant, UUID member) {
        return jdbc.queryForObject("""
                select count(*) from iam.permission_grants
                 where resource_type = 'tenant' and resource_id = ? and principal_id = ?
                """, Long.class, tenant, member);
    }

    private void acceptMember(TenantFixture tenant, UserApi.UserId member, String email) {
        var issued = inviteUseCase.invite(tenant.ownerCredential(), tenant.id(), email, "member", key());
        acceptInviteUseCase.acceptInvite(member.value(), issued.value().token());
    }

    private boolean canRead(UUID tenant, PermissionApi.Principal principal) {
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> permissions
                        .decide(
                                java.util.List.of(
                                        new PermissionApi.Resource(PermissionApi.ResourceType.TENANT, tenant)),
                                principal,
                                new PermissionApi.Operation("read"))
                        .allowed());
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        String operator = operator("operator-" + UUID.randomUUID() + "@invitation-syncs.test");
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(operator, name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, owner, credential(owner));
    }

    private String operator(String email) {
        UserApi.UserId operator = verifiedUser(email);
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        return credential(operator);
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Invitation User");
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

    private record TenantFixture(UUID id, UserApi.UserId owner, String ownerCredential) {}
}
