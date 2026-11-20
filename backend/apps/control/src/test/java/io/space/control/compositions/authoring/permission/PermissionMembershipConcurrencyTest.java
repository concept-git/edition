package io.space.control.compositions.authoring.permission;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.CreatePageUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.iam.membership.AcceptInviteUseCase;
import io.space.control.compositions.iam.membership.InviteUseCase;
import io.space.control.compositions.iam.membership.RemoveMemberUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.sql.Connection;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
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
class PermissionMembershipConcurrencyTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @org.springframework.beans.factory.annotation.Autowired
    PutPageRestrictionUseCase putPageRestrictionUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutSpaceGrantUseCase putSpaceGrantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    InviteUseCase inviteUseCase;

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

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreatePageUseCase createPageUseCase;

    @Autowired
    PermissionApi permissions;

    @Autowired
    MembershipApi memberships;

    @Autowired
    UserApi users;

    @Autowired
    TeamApi teams;

    @Autowired
    SessionApi sessions;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void grantAndTenantRemovalSerializeOnTheMembershipRow() throws Exception {
        TenantFixture tenant = tenant("Membership lock", "owner@membership-lock.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Locked", "authored", key())
                .value()
                .id();
        UserApi.UserId member = verifiedUser("member@membership-lock.test");
        join(tenant, member, "member@membership-lock.test");
        installGrantDelay(member.value(), space);

        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var grant = executor.submit(() -> putSpaceGrantUseCase.putSpaceGrant(
                    tenant.credential(), tenant.id(), space, "user:" + member.value(), "reader"));
            awaitDelayedGrant();
            var removal = executor.submit(
                    () -> removeMemberUseCase.removeMember(tenant.credential(), tenant.id(), member.value()));

            grant.get(10, TimeUnit.SECONDS);
            removal.get(10, TimeUnit.SECONDS);
        } finally {
            removeGrantDelay();
        }

        assertThat(isTenantMember(tenant.id(), member)).isFalse();
        assertThat(canRead(tenant.id(), space, member)).isFalse();

        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(member.value()),
                        MembershipApi.Role.MEMBER));
        removeMemberUseCase.removeMember(tenant.credential(), tenant.id(), member.value());
        assertThatExceptionOfType(PermissionPrincipalNotFoundException.class)
                .isThrownBy(() -> putSpaceGrantUseCase.putSpaceGrant(
                        tenant.credential(), tenant.id(), space, "user:" + member.value(), "reader"));
        assertThat(canRead(tenant.id(), space, member)).isFalse();
    }

    @Test
    void mixedUserAndTeamRestrictionUsesTheSameLockOrderAsTenantRemoval() throws Exception {
        TenantFixture tenant = tenant("Restriction lock", "owner-restriction-lock@test.local");
        UUID space = createSpaceUseCase
                .createSpace(tenant.credential(), tenant.id(), "Restriction", "authored", key())
                .value()
                .id();
        UUID page = createPageUseCase
                .createPage(tenant.credential(), tenant.id(), space, "markdown", "Restriction", "restriction", key())
                .value()
                .id();
        UserApi.UserId member = verifiedUser("member-restriction-lock@test.local");
        join(tenant, member, "member-restriction-lock@test.local");
        TeamApi.View team = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            var created = (TeamApi.CreateResult.Created) teams.create(tenant.id(), "Restriction Team");
            var teamGroup =
                    MembershipApi.Group.team(tenant.id(), created.team().id().value());
            memberships.add(teamGroup, new MembershipApi.MemberId(tenant.owner().value()), MembershipApi.Role.OWNER);
            memberships.add(teamGroup, new MembershipApi.MemberId(member.value()), MembershipApi.Role.MEMBER);
            return created.team();
        });

        try (Connection blocker = jdbc.getDataSource().getConnection();
                var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            blocker.setAutoCommit(false);
            lockTenantMembership(blocker, tenant.id(), member.value());

            var removal = executor.submit(
                    () -> removeMemberUseCase.removeMember(tenant.credential(), tenant.id(), member.value()));
            awaitBlockedMembershipLocks(1);
            var restriction = executor.submit(() -> {
                try {
                    putPageRestrictionUseCase.putPageRestriction(
                            tenant.credential(),
                            tenant.id(),
                            space,
                            page,
                            List.of(
                                    "user:" + member.value(),
                                    "team:" + team.id().value()),
                            0);
                    return "restricted";
                } catch (PermissionPrincipalNotFoundException expected) {
                    return expected.code().value();
                }
            });
            awaitBlockedMembershipLocks(2);
            blocker.commit();

            removal.get(10, TimeUnit.SECONDS);
            assertThat(restriction.get(10, TimeUnit.SECONDS)).isEqualTo("permission_principal_not_found");
        }

        assertThat(isTenantMember(tenant.id(), member)).isFalse();
        PermissionApi.RestrictionView finalRestriction = tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()), () -> permissions.restriction(TenantAccess.page(page)));
        assertThat(finalRestriction.active()).isFalse();
        assertThat(finalRestriction.principals()).isEmpty();
    }

    private void installGrantDelay(UUID member, UUID space) {
        jdbc.execute("""
                create or replace function iam.delay_membership_race_grant() returns trigger
                language plpgsql as $function$
                begin
                  if new.principal_id = '%s'::uuid and new.resource_id = '%s'::uuid then
                    perform pg_sleep(1.5);
                  end if;
                  return new;
                end
                $function$
                """.formatted(member, space));
        jdbc.execute("""
                create trigger delay_membership_race_grant
                before insert or update on iam.permission_grants
                for each row execute function iam.delay_membership_race_grant()
                """);
    }

    private void awaitDelayedGrant() throws InterruptedException {
        long deadline = System.nanoTime() + Duration.ofSeconds(5).toNanos();
        while (System.nanoTime() < deadline) {
            Integer active = jdbc.queryForObject("""
                    select count(*) from pg_stat_activity
                     where state = 'active' and query like 'insert into iam.permission_grants%'
                    """, Integer.class);
            if (active != null && active > 0) {
                return;
            }
            Thread.sleep(25);
        }
        throw new AssertionError("grant did not reach the delayed INSERT");
    }

    private void removeGrantDelay() {
        jdbc.execute("drop trigger if exists delay_membership_race_grant on iam.permission_grants");
        jdbc.execute("drop function if exists iam.delay_membership_race_grant()");
    }

    private static void lockTenantMembership(Connection connection, UUID tenant, UUID member)
            throws java.sql.SQLException {
        try (var statement = connection.prepareStatement("""
                select member_id from iam.memberships
                 where group_type = 'tenant' and group_id = ? and member_id = ?
                 for update
                """)) {
            statement.setObject(1, tenant);
            statement.setObject(2, member);
            try (var locked = statement.executeQuery()) {
                if (!locked.next()) {
                    throw new AssertionError("tenant membership fixture is missing");
                }
            }
        }
    }

    private void awaitBlockedMembershipLocks(int expected) throws InterruptedException {
        long deadline = System.nanoTime() + Duration.ofSeconds(5).toNanos();
        while (System.nanoTime() < deadline) {
            Integer waiting = jdbc.queryForObject("""
                    select count(*) from pg_stat_activity
                     where wait_event_type = 'Lock'
                       and query like 'select member_id::text, role, created_at%'
                       and query like '%from iam.memberships%'
                    """, Integer.class);
            if (waiting != null && waiting >= expected) {
                return;
            }
            Thread.sleep(25);
        }
        throw new AssertionError("expected " + expected + " blocked membership lock requests");
    }

    private boolean isTenantMember(UUID tenant, UserApi.UserId member) {
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> memberships.isMember(
                        MembershipApi.Group.tenant(tenant), new MembershipApi.MemberId(member.value())));
    }

    private boolean canRead(UUID tenant, UUID space, UserApi.UserId member) {
        var principal = new PermissionApi.Principal(PermissionApi.PrincipalType.USER, member.value());
        return tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant),
                () -> permissions
                        .decide(
                                List.of(TenantAccess.tenant(tenant), TenantAccess.space(space)),
                                principal,
                                TenantAccess.READ)
                        .allowed());
    }

    private void join(TenantFixture tenant, UserApi.UserId member, String email) {
        var invite = inviteUseCase.invite(tenant.credential(), tenant.id(), email, "member", key());
        acceptInviteUseCase.acceptInvite(member.value(), invite.value().token());
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@membership-lock.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, owner, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Membership Lock User");
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
