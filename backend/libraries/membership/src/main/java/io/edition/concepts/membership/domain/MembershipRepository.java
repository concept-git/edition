package io.edition.concepts.membership.domain;

import io.edition.concepts.membership.api.*;
import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.InviteId;
import io.edition.concepts.membership.api.MembershipApi.InviteView;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.membership.api.MembershipApi.MemberView;
import io.edition.concepts.membership.api.MembershipApi.Membership;
import io.edition.concepts.membership.api.MembershipApi.PendingInvite;
import io.edition.concepts.membership.api.MembershipApi.Role;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipRepository {

    /** 成员唯一性由 DB 约束守护：已是成员时返回 false（并发安全）。 */
    boolean insertMember(Group group, MemberId member, Role role, Instant joinedAt);

    void deleteMember(Group group, MemberId member);

    void updateRole(Group group, MemberId member, Role role);

    Optional<Role> roleOf(Group group, MemberId member);

    Optional<Membership> lockMembership(Group group, MemberId member);

    long ownerCount(Group group);

    long memberCount(Group group);

    /** 锁住该群体的 owner 行后计数——last_owner 判定是先查后写，没有锁就不成立。 */
    long lockOwnerCount(Group group);

    List<MemberView> pageMembers(Group group, Instant beforeJoinedAt, UUID beforeId, int limit);

    List<Membership> groupsOf(MemberId member);

    List<Membership> lockGroupsOf(MemberId member);

    void clearGroup(Group group);

    List<io.edition.concepts.membership.api.MembershipApi.ScopedMember> snapshot();

    void deletePendingInvites(Group group, String email);

    void lockInvitation(Group group, String normalizedEmail);

    void deletePendingInvites(String email);

    InviteView insertInvite(Group group, String email, Role role, String tokenHash, Instant expiresAt);

    Optional<InviteView> findInviteByHash(String tokenHash);

    List<PendingInvite> findPendingByEmail(String email);

    void deleteInviteByHash(String tokenHash);

    void deleteInviteById(Group group, InviteId invite);

    List<InviteView> pageInvites(Group group, Instant beforeCreatedAt, UUID beforeId, int limit);
}
