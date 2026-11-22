package io.edition.control.modules.membership.application;

import io.edition.control.modules.membership.api.*;
import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.membership.api.MembershipEvents;
import io.edition.control.modules.membership.domain.InviteToken;
import io.edition.control.modules.membership.domain.MembershipRepository;
import io.edition.control.modules.membership.domain.OwnerRule;
import io.edition.shared.KeysetCursor;
import io.edition.shared.PageWindow;
import java.time.Clock;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 成员与邀请事实的事务入口；所有者保护在锁内判断，明文邀请只交给同事务 outbox 编排。 */
@Service
@Transactional
class MembershipService implements MembershipApi {

    @Override
    @Transactional(readOnly = true)
    public List<ScopedMember> snapshot() {
        return repository.snapshot();
    }

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    private final MembershipRepository repository;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    MembershipService(MembershipRepository repository, ApplicationEventPublisher events, Clock clock) {
        this.repository = repository;
        this.events = events;
        this.clock = clock;
    }

    @Override
    public AddResult add(Group group, MemberId member, Role role) {
        requireOwnerIfGroupEmpty(group, role);
        if (!repository.insertMember(group, member, role, clock.instant())) {
            return new AddResult.AlreadyMember(member);
        }
        events.publishEvent(new MembershipEvents.MemberAdded(group, member, role));
        return new AddResult.Added(group, member, role);
    }

    @Override
    public RemoveResult remove(Group group, MemberId member) {
        Optional<Role> current = repository.roleOf(group, member);
        if (current.isEmpty()) {
            // 非成员时幂等成功：调用方不必先查再删。
            return new RemoveResult.Removed(group, member);
        }
        if (OwnerRule.wouldOrphan(current.orElseThrow(), repository.lockOwnerCount(group))) {
            return new RemoveResult.LastOwner();
        }
        repository.deleteMember(group, member);
        events.publishEvent(new MembershipEvents.MemberRemoved(group, member, current.orElseThrow()));
        return new RemoveResult.Removed(group, member);
    }

    @Override
    public SetRoleResult setRole(Group group, MemberId member, Role role) {
        Optional<Role> current = repository.roleOf(group, member);
        if (current.isEmpty()) {
            return new SetRoleResult.NotMember(member);
        }
        if (current.orElseThrow() == role) {
            return new SetRoleResult.RoleSet(group, member, role);
        }
        if (role == Role.MEMBER && OwnerRule.wouldOrphan(current.orElseThrow(), repository.lockOwnerCount(group))) {
            return new SetRoleResult.LastOwner();
        }
        repository.updateRole(group, member, role);
        events.publishEvent(new MembershipEvents.RoleChanged(group, member, role));
        return new SetRoleResult.RoleSet(group, member, role);
    }

    @Override
    public Invited invite(Group group, String email, Role role) {
        String normalizedEmail = email.strip().toLowerCase(Locale.ROOT);
        repository.lockInvitation(group, normalizedEmail);
        // 重复邀请 = 作废旧令牌后签发新的（"重发"语义，CONCEPT.md 的 ensures）。
        repository.deletePendingInvites(group, normalizedEmail);
        var issued = InviteToken.issue(clock.instant());
        InviteView invite =
                repository.insertInvite(group, normalizedEmail, role, issued.tokenHash(), issued.expiresAt());
        events.publishEvent(new MembershipEvents.Invited(group, normalizedEmail, role));
        events.publishEvent(new MembershipEvents.InviteMailRequested(group, normalizedEmail, role, issued.token()));
        return new Invited(invite, issued.token());
    }

    @Override
    public AcceptResult accept(InviteRef invite, MemberId member) {
        String tokenHash = hashOf(invite);
        Optional<InviteView> found = repository.findInviteByHash(tokenHash);
        if (found.isEmpty()) {
            return new AcceptResult.Invalid();
        }
        InviteView pending = found.orElseThrow();
        if (!InviteToken.redeems(pending.expiresAt(), clock.instant())) {
            return new AcceptResult.Expired();
        }
        requireOwnerIfGroupEmpty(pending.group(), pending.role());
        boolean seated = repository.insertMember(pending.group(), member, pending.role(), clock.instant());
        repository.deleteInviteByHash(tokenHash);
        if (!seated) {
            // 已是成员：邀请照样作废，避免残留可用链接。
            return new AcceptResult.AlreadyMember(pending.group());
        }
        events.publishEvent(new MembershipEvents.MemberAdded(pending.group(), member, pending.role()));
        events.publishEvent(new MembershipEvents.InviteAccepted(pending.group(), member, pending.role()));
        return new AcceptResult.Accepted(pending.group(), member, pending.role());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<InviteView> inviteOf(InviteRef invite) {
        return repository
                .findInviteByHash(hashOf(invite))
                .filter(pending -> InviteToken.redeems(pending.expiresAt(), clock.instant()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PendingInvite> pendingFor(String email) {
        return repository.findPendingByEmail(email.strip());
    }

    @Override
    public void revokeInvite(Group group, InviteId invite) {
        repository.deleteInviteById(group, invite);
        events.publishEvent(new MembershipEvents.InviteRevoked(group));
    }

    @Override
    public void revokeInvitesFor(String email) {
        repository.deletePendingInvites(email.strip());
    }

    @Override
    @Transactional(readOnly = true)
    public MemberPage membersOf(Group group, String cursor, int limit) {
        int pageSize = pageSize(limit);
        Optional<KeysetCursor> position = KeysetCursor.decode(cursor);
        List<MemberView> rows = repository.pageMembers(
                group,
                position.map(KeysetCursor::at).orElse(null),
                position.map(KeysetCursor::id).orElse(null),
                pageSize + 1);
        var window = PageWindow.of(
                rows,
                pageSize,
                row -> KeysetCursor.encode(row.joinedAt(), row.member().value()));
        return new MemberPage(window.items(), window.nextCursor());
    }

    @Override
    @Transactional(readOnly = true)
    public InvitePage invitesOf(Group group, String cursor, int limit) {
        int pageSize = pageSize(limit);
        Optional<KeysetCursor> position = KeysetCursor.decode(cursor);
        List<InviteView> rows = repository.pageInvites(
                group,
                position.map(KeysetCursor::at).orElse(null),
                position.map(KeysetCursor::id).orElse(null),
                pageSize + 1);
        var window = PageWindow.of(
                rows,
                pageSize,
                row -> KeysetCursor.encode(row.createdAt(), row.id().value()));
        return new InvitePage(window.items(), window.nextCursor());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Membership> groupsOf(MemberId member) {
        return repository.groupsOf(member);
    }

    @Override
    public List<Membership> lockGroupsOf(MemberId member) {
        return repository.lockGroupsOf(member);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isMember(Group group, MemberId member) {
        return repository.roleOf(group, member).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Role> roleOf(Group group, MemberId member) {
        return repository.roleOf(group, member);
    }

    @Override
    public Optional<Membership> lockMembership(Group group, MemberId member) {
        return repository.lockMembership(group, member);
    }

    @Override
    @Transactional(readOnly = true)
    public long ownerCount(Group group) {
        return repository.ownerCount(group);
    }

    @Override
    public long lockOwnerCount(Group group) {
        return repository.lockOwnerCount(group);
    }

    @Override
    @Transactional(readOnly = true)
    public long memberCount(Group group) {
        return repository.memberCount(group);
    }

    @Override
    public void clearGroup(Group group) {
        repository.clearGroup(group);
        events.publishEvent(new MembershipEvents.GroupCleared(group));
    }

    private void requireOwnerIfGroupEmpty(Group group, Role role) {
        if (role != Role.OWNER && repository.lockOwnerCount(group) == 0) {
            throw new IllegalArgumentException("the first member of a group must be an owner");
        }
    }

    private static String hashOf(InviteRef invite) {
        return switch (invite) {
            case InviteRef.Plaintext plaintext -> InviteToken.hash(plaintext.token());
            case InviteRef.Handle handle -> handle.tokenHash();
        };
    }

    private static int pageSize(int requested) {
        return requested <= 0 ? DEFAULT_PAGE_SIZE : Math.min(requested, MAX_PAGE_SIZE);
    }
}
