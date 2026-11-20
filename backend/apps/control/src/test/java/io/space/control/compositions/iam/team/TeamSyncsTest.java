package io.space.control.compositions.iam.team;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.iam.membership.AcceptInviteUseCase;
import io.space.control.compositions.iam.membership.InviteInvalidException;
import io.space.control.compositions.iam.membership.PreviewInviteUseCase;
import io.space.control.compositions.iam.membership.RemoveMemberUseCase;
import io.space.control.compositions.iam.membership.TeamLastOwnerException;
import io.space.control.compositions.iam.membership.TenantMembershipRequiredException;
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

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class TeamSyncsTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    CreateTeamUseCase createTeamUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    GetTeamUseCase getTeamUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DeleteTeamUseCase deleteTeamUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    InviteTeamMemberUseCase inviteTeamMemberUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SetTeamMemberRoleUseCase setTeamMemberRoleUseCase;

    @Autowired
    io.space.concepts.team.api.TeamApi teamApi;

    @Autowired
    JdbcTemplate runtime;

    @org.springframework.beans.factory.annotation.Autowired
    PreviewInviteUseCase previewInviteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    AcceptInviteUseCase acceptInviteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RemoveMemberUseCase removeMemberUseCase;

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
    void creatorIsAtomicOwnerAndCreateIsExactlyReplayable() {
        TenantFixture tenant = tenant("Team Create", "owner-create@team-syncs.test");
        String key = key();

        var created = createTeamUseCase.createTeam(tenant.credential(), tenant.id(), "Platform", key);
        var replay = createTeamUseCase.createTeam(tenant.credential(), tenant.id(), "Platform", key);

        assertThat(replay.serializedBody()).isEqualTo(created.serializedBody());
        assertThat(created.value().ownerCount()).isOne();
        assertThat(created.value().memberCount()).isOne();
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.teams where tenant_id = ? and normalized_name = 'platform'",
                        Long.class,
                        tenant.id()))
                .isOne();
        assertThatExceptionOfType(io.space.control.compositions.flow.FlowIdempotencyKeyReusedException.class)
                .isThrownBy(() -> createTeamUseCase.createTeam(tenant.credential(), tenant.id(), "Different", key));
    }

    @Test
    void teamOwnerGetsOnlyTeamRootAdminAndInvitationRequiresTenantMembership() {
        TenantFixture tenant = tenant("Team Access", "owner-access@team-syncs.test");
        var team = createTeamUseCase
                .createTeam(tenant.credential(), tenant.id(), "Docs", key())
                .value();
        UserApi.UserId member = verifiedUser("member-access@team-syncs.test");

        assertThatExceptionOfType(TenantMembershipRequiredException.class)
                .isThrownBy(() -> inviteTeamMemberUseCase.inviteTeamMember(
                        tenant.credential(), tenant.id(), team.id(), "member-access@team-syncs.test", "owner", key()));

        seatTenantMember(tenant.id(), member);
        var issued = inviteTeamMemberUseCase.inviteTeamMember(
                tenant.credential(), tenant.id(), team.id(), "member-access@team-syncs.test", "owner", key());
        var preview = previewInviteUseCase.previewInvite(issued.value().token());
        assertThat(preview.kind()).isEqualTo("team");
        assertThat(preview.team().id()).isEqualTo(team.id());

        acceptInviteUseCase.acceptInvite(member.value(), issued.value().token());
        var principal = new PermissionApi.Principal(PermissionApi.PrincipalType.USER, member.value());
        var tenantRoot = new PermissionApi.Resource(PermissionApi.ResourceType.TENANT, tenant.id());
        var teamRoot = new PermissionApi.Resource(PermissionApi.ResourceType.TEAM, team.id());
        assertThat(decide(tenant.id(), List.of(tenantRoot, teamRoot), principal))
                .isTrue();
        assertThat(decide(tenant.id(), List.of(tenantRoot), principal)).isFalse();
    }

    @Test
    void deleteClearsMembersInvitesAndBothPermissionDirections() {
        TenantFixture tenant = tenant("Team Delete", "owner-delete@team-syncs.test");
        var team = createTeamUseCase
                .createTeam(tenant.credential(), tenant.id(), "Disposable", key())
                .value();
        UserApi.UserId member = verifiedUser("member-delete@team-syncs.test");
        seatTenantMember(tenant.id(), member);
        var pending = inviteTeamMemberUseCase.inviteTeamMember(
                tenant.credential(), tenant.id(), team.id(), "member-delete@team-syncs.test", "member", key());

        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> permissions.grant(
                        new PermissionApi.Resource(PermissionApi.ResourceType.TENANT, tenant.id()),
                        new PermissionApi.Principal(PermissionApi.PrincipalType.TEAM, team.id()),
                        new PermissionApi.Role("reader")));

        deleteTeamUseCase.deleteTeam(tenant.credential(), tenant.id(), team.id());

        assertThat(jdbc.queryForObject("select count(*) from iam.teams where id = ?", Long.class, team.id()))
                .isZero();
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.memberships where group_type = 'team' and group_id = ?",
                        Long.class,
                        team.id()))
                .isZero();
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.permission_grants where principal_type = 'team' and principal_id = ?",
                        Long.class,
                        team.id()))
                .isZero();
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.permission_grants where resource_type = 'team' and resource_id = ?",
                        Long.class,
                        team.id()))
                .isZero();
        assertThatExceptionOfType(InviteInvalidException.class)
                .isThrownBy(
                        () -> previewInviteUseCase.previewInvite(pending.value().token()));
        assertThatExceptionOfType(TeamTypes.TeamNotFoundException.class)
                .isThrownBy(() -> getTeamUseCase.getTeam(tenant.credential(), tenant.id(), team.id()));
    }

    @Test
    void tenantAndTeamInstantiationsWithTheSameUuidDoNotCollide() {
        TenantFixture tenant = tenant("Same UUID", "owner-same@team-syncs.test");
        UserApi.UserId member = verifiedUser("member-same@team-syncs.test");
        seatTenantMember(tenant.id(), member);
        // 刻意让 Team 的稳定 id 与其 Tenant 的 id 相同：Membership 的键是 (group_type, group_id)，
        // 两次实例化不得互相覆盖。Team 行必须真实存在，否则 tenant_write_consistency 会先一步拒绝。
        jdbc.update("""
                insert into iam.teams (id, tenant_id, name, normalized_name)
                values (?, ?, 'Same UUID Team', 'same uuid team')
                """, tenant.id(), tenant.id());
        var sameIdTeam = MembershipApi.Group.team(tenant.id(), tenant.id());
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        sameIdTeam, new MembershipApi.MemberId(member.value()), MembershipApi.Role.OWNER));

        assertThat(isMember(tenant.id(), MembershipApi.Group.tenant(tenant.id()), member))
                .isTrue();
        tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> memberships.clearGroup(sameIdTeam));
        assertThat(isMember(tenant.id(), MembershipApi.Group.tenant(tenant.id()), member))
                .isTrue();
    }

    @Test
    void removingTenantMemberCascadesTeamsButRollsBackForLastTeamOwner() {
        TenantFixture tenant = tenant("Tenant Cascade", "owner-cascade@team-syncs.test");
        var team = createTeamUseCase
                .createTeam(tenant.credential(), tenant.id(), "Cascade", key())
                .value();
        UserApi.UserId target = verifiedUser("target-cascade@team-syncs.test");
        seatTenantMember(tenant.id(), target);
        var issued = inviteTeamMemberUseCase.inviteTeamMember(
                tenant.credential(), tenant.id(), team.id(), "target-cascade@team-syncs.test", "owner", key());
        acceptInviteUseCase.acceptInvite(target.value(), issued.value().token());
        setTeamMemberRoleUseCase.setTeamMemberRole(
                tenant.credential(), tenant.id(), team.id(), tenant.owner().value(), "member");

        assertThatExceptionOfType(TeamLastOwnerException.class)
                .isThrownBy(() -> removeMemberUseCase.removeMember(tenant.credential(), tenant.id(), target.value()))
                .satisfies(error -> assertThat(error.teams()).containsExactly(team.id()));
        assertThat(isMember(tenant.id(), MembershipApi.Group.tenant(tenant.id()), target))
                .isTrue();

        setTeamMemberRoleUseCase.setTeamMemberRole(
                tenant.credential(), tenant.id(), team.id(), tenant.owner().value(), "owner");
        removeMemberUseCase.removeMember(tenant.credential(), tenant.id(), target.value());
        assertThat(isMember(tenant.id(), MembershipApi.Group.tenant(tenant.id()), target))
                .isFalse();
        assertThat(isMember(tenant.id(), MembershipApi.Group.team(tenant.id(), team.id()), target))
                .isFalse();
    }

    @Test
    void rejectedRenameKeepsTheOuterRlsTransactionUsable() {
        var tenant = tenant("Rename Conflict", "owner-rename-conflict@team-syncs.test");
        tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            var existing =
                    (io.space.concepts.team.api.TeamApi.CreateResult.Created) teamApi.create(tenant.id(), "Taken");
            var changed =
                    (io.space.concepts.team.api.TeamApi.CreateResult.Created) teamApi.create(tenant.id(), "Original");
            assertThat(teamApi.rename(changed.team().id(), existing.team().name()))
                    .isInstanceOf(io.space.concepts.team.api.TeamApi.RenameResult.NameTaken.class);
            assertThat(teamApi.view(changed.team().id()).orElseThrow().name()).isEqualTo("Original");
            assertThat(teamApi.create(tenant.id(), "After Conflict"))
                    .isInstanceOf(io.space.concepts.team.api.TeamApi.CreateResult.Created.class);
        });
        assertThat(jdbc.queryForObject("select count(*) from iam.teams where tenant_id = ?", Long.class, tenant.id()))
                .isEqualTo(3);
    }

    private boolean decide(UUID tenant, List<PermissionApi.Resource> chain, PermissionApi.Principal principal) {
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> permissions
                        .decide(chain, principal, new PermissionApi.Operation("admin"))
                        .allowed());
    }

    @Test
    void acceptingAnInviteCannotRecreateMembershipAfterTenantRemoval() throws Exception {
        var tenant = tenant("Accept removal race", "owner@accept-removal.test");
        var team = createTeamUseCase
                .createTeam(tenant.credential(), tenant.id(), "Race", key())
                .value();
        var target = verifiedUser("target@accept-removal.test");
        seatTenantMember(tenant.id(), target);
        var invitation = inviteTeamMemberUseCase
                .inviteTeamMember(
                        tenant.credential(), tenant.id(), team.id(), "target@accept-removal.test", "member", key())
                .value();
        var scope = new TenantRegistryApi.TenantId(tenant.id());
        var gateReady = new java.util.concurrent.CountDownLatch(1);
        var releaseGate = new java.util.concurrent.CountDownLatch(1);
        String acceptingName = "accept-" + tenant.id();
        String removingName = "remove-" + tenant.id();
        try (var pool = java.util.concurrent.Executors.newFixedThreadPool(3)) {
            var gate = pool.submit(() -> tenantScope.inTenant(scope, () -> {
                teamApi.lock(new io.space.concepts.team.api.TeamApi.TeamId(team.id()))
                        .orElseThrow();
                gateReady.countDown();
                try {
                    if (!releaseGate.await(15, java.util.concurrent.TimeUnit.SECONDS))
                        throw new IllegalStateException("gate timed out");
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(interrupted);
                }
            }));
            try {
                assertThat(gateReady.await(5, java.util.concurrent.TimeUnit.SECONDS))
                        .isTrue();
                var accepting = pool.submit(() -> tenantScope.inTenant(scope, () -> {
                    runtime.queryForObject("select set_config('application_name',?,true)", String.class, acceptingName);
                    return acceptInviteUseCase.acceptInvite(target.value(), invitation.token());
                }));
                org.awaitility.Awaitility.await()
                        .atMost(java.time.Duration.ofSeconds(5))
                        .until(() -> lockWaiters(acceptingName) == 1);
                var removing = pool.submit(() -> tenantScope.inTenant(scope, () -> {
                    runtime.queryForObject("select set_config('application_name',?,true)", String.class, removingName);
                    removeMemberUseCase.removeMember(tenant.credential(), tenant.id(), target.value());
                }));
                org.awaitility.Awaitility.await()
                        .atMost(java.time.Duration.ofSeconds(5))
                        .until(() -> removing.isDone() || lockWaiters(removingName) == 1);
                releaseGate.countDown();
                gate.get(10, java.util.concurrent.TimeUnit.SECONDS);
                accepting.get(10, java.util.concurrent.TimeUnit.SECONDS);
                removing.get(10, java.util.concurrent.TimeUnit.SECONDS);
                assertThat(isMember(tenant.id(), MembershipApi.Group.tenant(tenant.id()), target))
                        .isFalse();
                assertThat(isMember(tenant.id(), MembershipApi.Group.team(tenant.id(), team.id()), target))
                        .isFalse();
            } finally {
                releaseGate.countDown();
            }
        }
    }

    private int lockWaiters(String connection) {
        return jdbc.queryForObject(
                "select count(*) from pg_stat_activity where application_name=? and wait_event_type='Lock'",
                Integer.class,
                connection);
    }

    /** Membership 是租户作用域概念：断言它同样要处在对应租户上下文内，否则 RLS 直接 42501。 */
    private boolean isMember(UUID tenant, MembershipApi.Group group, UserApi.UserId member) {
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> memberships.isMember(group, new MembershipApi.MemberId(member.value())));
    }

    private void seatTenantMember(UUID tenant, UserApi.UserId member) {
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant),
                        new MembershipApi.MemberId(member.value()),
                        MembershipApi.Role.MEMBER));
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@team-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, owner, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Team User");
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

    private record TenantFixture(UUID id, UserApi.UserId owner, String credential) {}
}
