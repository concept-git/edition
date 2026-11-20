package io.space.concepts.membership;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.membership.api.*;
import io.space.concepts.membership.api.MembershipApi.AcceptResult;
import io.space.concepts.membership.api.MembershipApi.AddResult;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.InviteRef;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.MemberView;
import io.space.concepts.membership.api.MembershipApi.RemoveResult;
import io.space.concepts.membership.api.MembershipApi.Role;
import io.space.concepts.membership.api.MembershipApi.SetRoleResult;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Membership 的 OP 与 error case（CONCEPT.md 同名小节）。 */
@ApplicationModuleTest
@org.springframework.transaction.annotation.Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.membership.adapters.MembershipConfiguration.class)
class MembershipModuleTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    MembershipApi memberships;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    // OP: after invite (g, "b@x.com", member) : (t), accept (t, b) : (ok) then _isMember (g, b) : (true)
    @Test
    void joiningRequiresConsentFromBothSides(PublishedEvents events) {
        Group group = tenant();
        seat(group, Role.OWNER);
        MemberId invitee = user();

        var invited = memberships.invite(group, "b@membership.test", Role.MEMBER);
        assertThat(memberships.isMember(group, invitee)).isFalse();

        var accepted = memberships.accept(InviteRef.ofToken(invited.token()), invitee);

        assertThat(accepted).isEqualTo(new AcceptResult.Accepted(group, invitee, Role.MEMBER));
        assertThat(memberships.isMember(group, invitee)).isTrue();
        assertThat(events.ofType(MembershipEvents.InviteAccepted.class)).hasSize(1);
    }

    // OP: after remove (g, b) then _isMember (g, b) : (false)
    @Test
    void removeTakesTheMemberOutAndIsIdempotentForNonMembers() {
        Group group = tenant();
        MemberId owner = seat(group, Role.OWNER);
        MemberId member = seat(group, Role.MEMBER);

        assertThat(memberships.remove(group, member)).isInstanceOf(RemoveResult.Removed.class);
        assertThat(memberships.isMember(group, member)).isFalse();

        assertThat(memberships.remove(group, member)).isInstanceOf(RemoveResult.Removed.class);
        assertThat(memberships.isMember(group, owner)).isTrue();
    }

    // OP: after add (g, a, owner), remove (g, a) : (error: last_owner) then _isMember (g, a) : (true)
    @Test
    void theLastOwnerCanNeitherBeRemovedNorDemoted() {
        Group group = tenant();
        MemberId onlyOwner = seat(group, Role.OWNER);

        assertThat(memberships.remove(group, onlyOwner)).isInstanceOf(RemoveResult.LastOwner.class);
        assertThat(memberships.setRole(group, onlyOwner, Role.MEMBER)).isInstanceOf(SetRoleResult.LastOwner.class);

        assertThat(memberships.isMember(group, onlyOwner)).isTrue();
        assertThat(memberships.roleOf(group, onlyOwner)).contains(Role.OWNER);
    }

    @Test
    void theFirstMemberMustBeAnOwner() {
        Group group = tenant();
        MemberId member = user();

        assertThatThrownBy(() -> memberships.add(group, member, Role.MEMBER))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("first member");
        assertThat(memberships.isMember(group, member)).isFalse();
    }

    @Test
    void acceptingAMemberInviteOnAnEmptyGroupIsAProgrammingError() {
        Group group = tenant();
        MemberId invitee = user();
        var invited = memberships.invite(group, "first@membership.test", Role.MEMBER);

        assertThatThrownBy(() -> memberships.accept(InviteRef.ofToken(invited.token()), invitee))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("first member");
        assertThat(memberships.isMember(group, invitee)).isFalse();
    }

    @Test
    void asecondOwnerUnlocksRemovalOfTheFirst() {
        Group group = tenant();
        MemberId first = seat(group, Role.OWNER);
        MemberId second = seat(group, Role.OWNER);

        assertThat(memberships.remove(group, first)).isInstanceOf(RemoveResult.Removed.class);
        assertThat(memberships.ownerCount(group)).isEqualTo(1);
        assertThat(memberships.roleOf(group, second)).contains(Role.OWNER);
    }

    /**
     * last_owner 是先查后写，没有锁就守不住：两笔并发各自读到 2 个 owner、双双放行，
     * 群体归零后再也无人可管。这条断言的是"最多一个成功"，不是"某一个成功"。
     */
    @Test
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    void concurrentOwnerRemovalsCannotEmptyTheGroup() throws Exception {
        Group group = tenant();
        MemberId first = scope.inTenant(group.tenantId(), () -> seat(group, Role.OWNER));
        MemberId second = scope.inTenant(group.tenantId(), () -> seat(group, Role.OWNER));

        try (var pool = Executors.newFixedThreadPool(2)) {
            List<Callable<RemoveResult>> attempts = List.of(
                    () -> scope.inTenant(group.tenantId(), () -> memberships.remove(group, first)),
                    () -> scope.inTenant(group.tenantId(), () -> memberships.remove(group, second)));
            long removed = pool.invokeAll(attempts).stream()
                    .map(future -> {
                        try {
                            return future.get();
                        } catch (Exception failure) {
                            throw new IllegalStateException(failure);
                        }
                    })
                    .filter(RemoveResult.Removed.class::isInstance)
                    .count();

            assertThat(removed).isEqualTo(1);
        }
        assertThat(scope.inTenant(group.tenantId(), () -> memberships.ownerCount(group)))
                .isEqualTo(1);
    }

    @Test
    void addRefusesToSeatTheSameMemberTwice() {
        Group group = tenant();
        MemberId member = seat(group, Role.OWNER);

        assertThat(memberships.add(group, member, Role.OWNER)).isInstanceOf(AddResult.AlreadyMember.class);
        assertThat(memberships.roleOf(group, member)).contains(Role.OWNER);
    }

    @Test
    void setRoleReportsNonMembersInsteadOfSilentlySucceeding() {
        Group group = tenant();

        assertThat(memberships.setRole(group, user(), Role.OWNER)).isInstanceOf(SetRoleResult.NotMember.class);
    }

    /** 重复邀请 = 重发：旧链接立即失效，只有新链接可用。 */
    @Test
    void reinvitingTheSameEmailInvalidatesTheEarlierToken() {
        Group group = tenant();
        seat(group, Role.OWNER);
        MemberId invitee = user();

        var first = memberships.invite(group, "resend@membership.test", Role.MEMBER);
        var second = memberships.invite(group, "resend@membership.test", Role.MEMBER);

        assertThat(memberships.accept(InviteRef.ofToken(first.token()), invitee))
                .isInstanceOf(AcceptResult.Invalid.class);
        assertThat(memberships.accept(InviteRef.ofToken(second.token()), invitee))
                .isInstanceOf(AcceptResult.Accepted.class);
    }

    /** 已是成员时接受邀请不是"邀请无效"：链接照样作废，但调用方无须让他再做什么。 */
    @Test
    void acceptingAnInviteWhenAlreadySeatedReportsAlreadyMember() {
        Group group = tenant();
        seat(group, Role.OWNER);
        MemberId member = seat(group, Role.MEMBER);
        var invited = memberships.invite(group, "seated@membership.test", Role.MEMBER);

        assertThat(memberships.accept(InviteRef.ofToken(invited.token()), member))
                .isInstanceOf(AcceptResult.AlreadyMember.class);
        assertThat(memberships.inviteOf(InviteRef.ofToken(invited.token()))).isEmpty();
    }

    @Test
    void anAcceptedInviteCannotBeReplayed() {
        Group group = tenant();
        seat(group, Role.OWNER);
        var invited = memberships.invite(group, "once@membership.test", Role.MEMBER);
        memberships.accept(InviteRef.ofToken(invited.token()), user());

        assertThat(memberships.accept(InviteRef.ofToken(invited.token()), user()))
                .isInstanceOf(AcceptResult.Invalid.class);
        assertThat(memberships.inviteOf(InviteRef.ofToken(invited.token()))).isEmpty();
    }

    @Test
    void anExpiredInviteIsNeitherReadableNorRedeemable() {
        Group group = tenant();
        var invited = memberships.invite(group, "stale@membership.test", Role.MEMBER);
        expire(invited.invite().id().value());

        assertThat(memberships.inviteOf(InviteRef.ofToken(invited.token()))).isEmpty();
        assertThat(memberships.accept(InviteRef.ofToken(invited.token()), user()))
                .isInstanceOf(AcceptResult.Expired.class);
    }

    @Test
    void aRevokedInviteCanNoLongerBeAccepted() {
        Group group = tenant();
        var invited = memberships.invite(group, "revoked@membership.test", Role.MEMBER);

        memberships.revokeInvite(group, invited.invite().id());

        assertThat(memberships.accept(InviteRef.ofToken(invited.token()), user()))
                .isInstanceOf(AcceptResult.Invalid.class);
    }

    /** 明文只在签发时出现一次：库里只有哈希，读取路径拿不到它。 */
    @Test
    void thePlaintextTokenIsNeverReadableAgain() {
        Group group = tenant();
        var invited = memberships.invite(group, "secret@membership.test", Role.MEMBER);

        var stored = jdbc.queryForList(
                "select token_hash from iam.invites where id = ?",
                String.class,
                invited.invite().id().value());

        assertThat(stored).hasSize(1).doesNotContain(invited.token());
        assertThat(memberships.invitesOf(group, null, 20).invites())
                .extracting(view -> view.id().value())
                .contains(invited.invite().id().value());
    }

    /** 一个邮箱可被多个租户邀请：注册即入租时不能任意取一。 */
    @Test
    void pendingInvitesAreListedForEveryInvitingGroup() {
        Group first = tenant();
        Group second = tenant();
        context(first);
        memberships.invite(first, "multi@membership.test", Role.MEMBER);
        context(second);
        memberships.invite(second, "multi@membership.test", Role.OWNER);

        var pending = memberships.pendingFor("multi@membership.test");

        assertThat(pending).extracting(MembershipApi.PendingInvite::group).containsExactlyInAnyOrder(first, second);
    }

    /** 组合层的"注册即入租"走服务端句柄，明文不参与。 */
    @Test
    void aPendingInviteCanBeAcceptedByItsServerSideHandle() {
        Group group = tenant();
        seat(group, Role.OWNER);
        MemberId invitee = user();
        memberships.invite(group, "handle@membership.test", Role.MEMBER);

        var pending = memberships.pendingFor("handle@membership.test").getFirst();
        var accepted = memberships.accept(InviteRef.ofHandle(pending.handle()), invitee);

        assertThat(accepted).isInstanceOf(AcceptResult.Accepted.class);
        assertThat(memberships.isMember(group, invitee)).isTrue();
    }

    @Test
    void groupsOfListsEveryGroupTheMemberBelongsTo() {
        Group first = tenant();
        Group second = tenant();
        MemberId member = user();
        context(first);
        memberships.add(first, member, Role.OWNER);
        context(second);
        memberships.add(second, user(), Role.OWNER);
        memberships.add(second, member, Role.MEMBER);

        assertThat(memberships.groupsOf(member))
                .extracting(MembershipApi.Membership::group)
                .containsExactlyInAnyOrder(first, second);
    }

    @Test
    void membersWalkEveryRowExactlyOnceAcrossCursorPages() {
        Group group = tenant();
        var seated = List.of(
                seat(group, Role.OWNER),
                seat(group, Role.MEMBER),
                seat(group, Role.MEMBER),
                seat(group, Role.MEMBER),
                seat(group, Role.MEMBER));

        var seen = new ArrayList<MemberId>();
        String cursor = null;
        do {
            var page = memberships.membersOf(group, cursor, 2);
            assertThat(page.members()).hasSizeLessThanOrEqualTo(2);
            page.members().stream().map(MemberView::member).forEach(seen::add);
            cursor = page.nextCursor();
        } while (cursor != null);

        assertThat(seen).containsExactlyInAnyOrderElementsOf(seated).doesNotHaveDuplicates();
    }

    @Test
    void listingRejectsAMalformedCursorSoTheGatewayCanAnswer400() {
        assertThatThrownBy(() -> memberships.membersOf(tenant(), "not-a-cursor", 20))
                .isInstanceOf(IllegalArgumentException.class);
    }

    /** 群体隔离：同一个人在别的群体里的身份不串到这里。 */
    @Test
    void membershipIsScopedToItsGroup() {
        Group first = tenant();
        Group second = tenant();
        MemberId member = user();
        context(first);
        memberships.add(first, member, Role.OWNER);

        context(second);
        assertThat(memberships.isMember(second, member)).isFalse();
        assertThat(memberships.membersOf(second, null, 20).members()).isEmpty();
    }

    /** tenant_id 显式落列：票 29 打开 RLS 时它就是隔离依据，此刻留 null 等于埋雷。 */
    @Test
    void everyRowCarriesItsTenantForTheComingRowLevelSecurity() {
        Group group = tenant();
        MemberId member = seat(group, Role.OWNER);
        var invited = memberships.invite(group, "stamped@membership.test", Role.MEMBER);

        assertThat(jdbc.queryForObject(
                        "select tenant_id from iam.memberships where group_id = ? and member_id = ?",
                        UUID.class,
                        group.id(),
                        member.value()))
                .isEqualTo(group.tenantId());
        assertThat(jdbc.queryForObject(
                        "select tenant_id from iam.invites where id = ?",
                        UUID.class,
                        invited.invite().id().value()))
                .isEqualTo(group.tenantId());
    }

    private void context(Group group) {
        jdbc.queryForObject(
                "select set_config('app.tenant_id', ?, true)",
                String.class,
                group.tenantId().toString());
    }

    private Group tenant() {
        UUID id = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", id, "Tenant " + id);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, id.toString());
        return Group.tenant(id);
    }

    private MemberId seat(Group group, Role role) {
        MemberId member = user();
        memberships.add(group, member, role);
        return member;
    }

    /** memberships.member_id 有外键，所以成员必须是真实用户行。 */
    private MemberId user() {
        UUID id = UUID.randomUUID();
        fixtures.update(
                "insert into iam.users (id, email, name) values (?, ?, ?)",
                id,
                id + "@membership.test",
                "Member " + id);
        return new MemberId(id);
    }

    private void expire(UUID inviteId) {
        jdbc.update("update iam.invites set expires_at = now() - interval '1 minute' where id = ?", inviteId);
    }
}
