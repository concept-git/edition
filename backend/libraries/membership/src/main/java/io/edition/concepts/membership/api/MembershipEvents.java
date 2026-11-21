package io.edition.concepts.membership.api;

import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.membership.api.MembershipApi.Role;

/**
 * 动作完成事件。事件类型属于本概念，不点名他人；
 * owner 与租户根授权的联动是组合层的 sync，不是本模块的反应。
 */
public final class MembershipEvents {

    private MembershipEvents() {}

    public record MemberAdded(Group group, MemberId member, Role role) {}

    public record MemberRemoved(Group group, MemberId member, Role formerRole) {}

    public record RoleChanged(Group group, MemberId member, Role role) {}

    public record Invited(Group group, String email, Role role) {}

    /** 令牌明文交给同事务邮件 outbox 编排；持久化须加密，实际投递在提交后执行。 */
    public record InviteMailRequested(Group group, String email, Role role, String token) {}

    public record InviteAccepted(Group group, MemberId member, Role role) {}

    public record InviteRevoked(Group group) {}

    public record GroupCleared(Group group) {}
}
