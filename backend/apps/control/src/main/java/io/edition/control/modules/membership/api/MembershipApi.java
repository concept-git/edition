package io.edition.control.modules.membership.api;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Membership [Group, Member] 概念的唯一对外门面。
 * 两次实例化（租户成员、用户组）共此一模块：Group 携带自己的类型，模块不认识"租户"或"团队"的含义。
 * error case 是可被 sync 匹配的输出（sealed 变体）；前置违反直接抛（编程错误）。
 */
public interface MembershipApi {

    /** 无自助直加入口——加入须经同意；群体创建 flow 可内部落座首个 owner。 */
    AddResult add(Group group, MemberId member, Role role);

    /** 非成员时幂等成功。 */
    RemoveResult remove(Group group, MemberId member);

    SetRoleResult setRole(Group group, MemberId member, Role role);

    /**
     * 同群体同邮箱的既有待处理邀请随之作废，即"重发"。
     * 这里没有 already_member 分支：本概念只认 member id，邮箱与成员的对应关系在组合层
     * （User._byEmail + _isMember），否则 Membership 就得认识 User，独立性即破。
     */
    Invited invite(Group group, String email, Role role);

    AcceptResult accept(InviteRef invite, MemberId member);

    Optional<InviteView> inviteOf(InviteRef invite);

    /** 一个邮箱可被多个租户邀请：注册即入租时全部接受，不做任意取一。 */
    List<PendingInvite> pendingFor(String email);

    void revokeInvite(Group group, InviteId invite);

    void revokeInvitesFor(String email);

    MemberPage membersOf(Group group, String cursor, int limit);

    InvitePage invitesOf(Group group, String cursor, int limit);

    List<Membership> groupsOf(MemberId member);

    List<Membership> lockGroupsOf(MemberId member);

    boolean isMember(Group group, MemberId member);

    Optional<Role> roleOf(Group group, MemberId member);

    /** 锁住一条确定的成员关系，供跨 flow grant/remove 串行；不存在时返回 empty。 */
    Optional<Membership> lockMembership(Group group, MemberId member);

    long ownerCount(Group group);

    long lockOwnerCount(Group group);

    long memberCount(Group group);

    /** 群体终结专用：删除全部成员与待处理邀请。 */
    void clearGroup(Group group);

    List<ScopedMember> snapshot();

    record ScopedMember(Group group, MemberId member, Role role) {}

    /**
     * 群体身份。tenantId 由调用方显式携带，模块不查别人的表：
     * 租户群体的 tenantId 就是它自己，用户组群体由组合层填入所属租户。
     */
    record Group(GroupType type, UUID id, UUID tenantId) {
        public Group {
            Objects.requireNonNull(type, "group type");
            Objects.requireNonNull(id, "group id");
            Objects.requireNonNull(tenantId, "tenant id");
            if (type == GroupType.TENANT && !id.equals(tenantId)) {
                throw new IllegalArgumentException("a tenant group is its own tenant");
            }
        }

        public static Group tenant(UUID tenant) {
            return new Group(GroupType.TENANT, tenant, tenant);
        }

        public static Group team(UUID tenant, UUID team) {
            return new Group(GroupType.TEAM, team, tenant);
        }
    }

    enum GroupType {
        TENANT,
        TEAM
    }

    record MemberId(UUID value) {
        public MemberId {
            Objects.requireNonNull(value, "member id");
        }
    }

    enum Role {
        OWNER,
        MEMBER
    }

    /**
     * 邀请引用。外部路径出示明文（服务端取哈希比对），组合层内部路径（注册即入租）出示句柄——
     * 内部接纳使用库内哈希句柄，无需恢复令牌明文。
     */
    sealed interface InviteRef {

        record Plaintext(String token) implements InviteRef {
            public Plaintext {
                Objects.requireNonNull(token, "invite token");
            }
        }

        record Handle(String tokenHash) implements InviteRef {
            public Handle {
                Objects.requireNonNull(tokenHash, "invite handle");
            }
        }

        static InviteRef ofToken(String token) {
            return new Plaintext(token);
        }

        static InviteRef ofHandle(String tokenHash) {
            return new Handle(tokenHash);
        }
    }

    record Membership(Group group, Role role, Instant joinedAt) {}

    record MemberView(MemberId member, Role role, Instant joinedAt) {}

    /** 邀请的稳定 id：管理列表与撤销用它，明文 token 与其哈希都不出现在管理面。 */
    record InviteId(UUID value) {
        public InviteId {
            Objects.requireNonNull(value, "invite id");
        }
    }

    record InviteView(InviteId id, Group group, String email, Role role, Instant expiresAt, Instant createdAt) {}

    record PendingInvite(Group group, Role role, String handle) {}

    record MemberPage(List<MemberView> members, String nextCursor) {
        public MemberPage {
            members = List.copyOf(members);
        }
    }

    record InvitePage(List<InviteView> invites, String nextCursor) {
        public InvitePage {
            invites = List.copyOf(invites);
        }
    }

    sealed interface AddResult {
        record Added(Group group, MemberId member, Role role) implements AddResult {}

        record AlreadyMember(MemberId member) implements AddResult {}
    }

    sealed interface RemoveResult {
        record Removed(Group group, MemberId member) implements RemoveResult {}

        /** 移除后群体将没有 owner。 */
        record LastOwner() implements RemoveResult {}
    }

    sealed interface SetRoleResult {
        record RoleSet(Group group, MemberId member, Role role) implements SetRoleResult {}

        record NotMember(MemberId member) implements SetRoleResult {}

        /** 降级后群体将没有 owner。 */
        record LastOwner() implements SetRoleResult {}
    }

    /** token 明文只在此出现一次：调用方投递后即不可复原（库内只有哈希）。 */
    record Invited(InviteView invite, String token) {}

    sealed interface AcceptResult {
        record Accepted(Group group, MemberId member, Role role) implements AcceptResult {}

        /** 令牌不存在或已被使用。 */
        record Invalid() implements AcceptResult {}

        record Expired() implements AcceptResult {}

        /** 邀请已作废，但此人本来就是成员——调用方无须让他再做什么。 */
        record AlreadyMember(Group group) implements AcceptResult {}
    }
}
