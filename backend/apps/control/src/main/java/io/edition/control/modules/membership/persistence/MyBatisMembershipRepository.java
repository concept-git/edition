package io.edition.control.modules.membership.persistence;

import io.edition.control.modules.membership.api.*;
import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.GroupType;
import io.edition.control.modules.membership.api.MembershipApi.InviteId;
import io.edition.control.modules.membership.api.MembershipApi.InviteView;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.modules.membership.api.MembershipApi.MemberView;
import io.edition.control.modules.membership.api.MembershipApi.Membership;
import io.edition.control.modules.membership.api.MembershipApi.PendingInvite;
import io.edition.control.modules.membership.api.MembershipApi.Role;
import io.edition.control.modules.membership.domain.MembershipRepository;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/** 成员与邀请的持久值翻译；未知租户的发现只走数据库窄函数，不扩大普通查询作用域。 */
@Repository
class MyBatisMembershipRepository implements MembershipRepository {

    private final MembershipMapper mapper;

    MyBatisMembershipRepository(MembershipMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public List<io.edition.control.modules.membership.api.MembershipApi.ScopedMember> snapshot() {
        return mapper.snapshot().stream()
                .map(row -> new io.edition.control.modules.membership.api.MembershipApi.ScopedMember(
                        new Group(
                                GroupType.valueOf(row.groupType().toUpperCase(Locale.ROOT)),
                                UUID.fromString(row.groupId()),
                                UUID.fromString(row.tenantId())),
                        new MemberId(UUID.fromString(row.memberId())),
                        role(row.role())))
                .toList();
    }

    @Override
    public boolean insertMember(Group group, MemberId member, Role role, Instant joinedAt) {
        return mapper.insertMember(group.tenantId(), type(group), group.id(), member.value(), value(role), joinedAt)
                > 0;
    }

    @Override
    public void deleteMember(Group group, MemberId member) {
        mapper.deleteMember(type(group), group.id(), member.value());
    }

    @Override
    public void updateRole(Group group, MemberId member, Role role) {
        mapper.updateRole(type(group), group.id(), member.value(), value(role));
    }

    @Override
    public Optional<Role> roleOf(Group group, MemberId member) {
        return Optional.ofNullable(mapper.roleOf(type(group), group.id(), member.value()))
                .map(MyBatisMembershipRepository::role);
    }

    @Override
    public Optional<Membership> lockMembership(Group group, MemberId member) {
        return Optional.ofNullable(mapper.lockMembership(type(group), group.id(), member.value()))
                .map(row -> new Membership(group, role(row.role()), row.createdAt()));
    }

    @Override
    public long ownerCount(Group group) {
        return mapper.ownerCount(type(group), group.id());
    }

    @Override
    public long memberCount(Group group) {
        return mapper.memberCount(type(group), group.id());
    }

    @Override
    public long lockOwnerCount(Group group) {
        return mapper.lockOwners(type(group), group.id()).size();
    }

    @Override
    public List<MemberView> pageMembers(Group group, Instant beforeJoinedAt, UUID beforeId, int limit) {
        return mapper.pageMembers(type(group), group.id(), beforeJoinedAt, beforeId, limit).stream()
                .map(row -> new MemberView(
                        new MemberId(UUID.fromString(row.memberId())), role(row.role()), row.createdAt()))
                .toList();
    }

    @Override
    public List<Membership> groupsOf(MemberId member) {
        return memberships(mapper.groupsOf(member.value()));
    }

    @Override
    public List<Membership> lockGroupsOf(MemberId member) {
        return memberships(mapper.lockGroupsOf(member.value()));
    }

    @Override
    public void clearGroup(Group group) {
        mapper.clearGroupInvites(type(group), group.id());
        mapper.clearGroupMembers(type(group), group.id());
    }

    @Override
    public void deletePendingInvites(Group group, String email) {
        mapper.deletePendingInvites(type(group), group.id(), email);
    }

    @Override
    public void lockInvitation(Group group, String normalizedEmail) {
        mapper.lockInvitation("membership-invite:" + type(group) + ":" + group.id() + ":" + normalizedEmail);
    }

    @Override
    public void deletePendingInvites(String email) {
        mapper.deletePendingInvitesForEmail(email);
    }

    @Override
    public InviteView insertInvite(Group group, String email, Role role, String tokenHash, Instant expiresAt) {
        return invite(mapper.insertInvite(
                tokenHash, group.tenantId(), type(group), group.id(), email, value(role), expiresAt));
    }

    @Override
    public Optional<InviteView> findInviteByHash(String tokenHash) {
        return Optional.ofNullable(mapper.findInviteByHash(tokenHash)).map(MyBatisMembershipRepository::invite);
    }

    @Override
    public List<PendingInvite> findPendingByEmail(String email) {
        return mapper.findPendingByEmail(email).stream()
                .map(row -> new PendingInvite(
                        new Group(
                                GroupType.valueOf(row.groupType().toUpperCase(Locale.ROOT)),
                                UUID.fromString(row.groupId()),
                                UUID.fromString(row.tenantId())),
                        role(row.role()),
                        row.tokenHash()))
                .toList();
    }

    @Override
    public void deleteInviteByHash(String tokenHash) {
        mapper.deleteInviteByHash(tokenHash);
    }

    @Override
    public void deleteInviteById(Group group, InviteId invite) {
        mapper.deleteInviteById(type(group), group.id(), invite.value());
    }

    @Override
    public List<InviteView> pageInvites(Group group, Instant beforeCreatedAt, UUID beforeId, int limit) {
        return mapper.pageInvites(type(group), group.id(), beforeCreatedAt, beforeId, limit).stream()
                .map(MyBatisMembershipRepository::invite)
                .toList();
    }

    private static InviteView invite(MembershipMapper.InviteRow row) {
        return new InviteView(
                new InviteId(UUID.fromString(row.id())),
                new Group(
                        GroupType.valueOf(row.groupType().toUpperCase(Locale.ROOT)),
                        UUID.fromString(row.groupId()),
                        UUID.fromString(row.tenantId())),
                row.email(),
                role(row.role()),
                row.expiresAt(),
                row.createdAt());
    }

    private static String type(Group group) {
        return group.type().name().toLowerCase(Locale.ROOT);
    }

    private static String value(Role role) {
        return role.name().toLowerCase(Locale.ROOT);
    }

    private static Role role(String stored) {
        return Role.valueOf(stored.toUpperCase(Locale.ROOT));
    }

    private static List<Membership> memberships(List<MembershipMapper.GroupRow> rows) {
        return rows.stream()
                .map(row -> new Membership(
                        new Group(
                                GroupType.valueOf(row.groupType().toUpperCase(Locale.ROOT)),
                                UUID.fromString(row.groupId()),
                                UUID.fromString(row.tenantId())),
                        role(row.role()),
                        row.createdAt()))
                .toList();
    }
}
