package io.space.control.compositions.iam.membership;

import io.space.concepts.membership.api.MembershipApi.Role;
import java.util.Locale;

/** 成员角色与邮箱的入口归一：租户面与 Team 面共用同一套解析，避免两处各写一份大小写规则。 */
public final class MemberRoles {
    private MemberRoles() {}

    /** 大小写不敏感地解析 owner / member；其他值是业务拒绝而非编程错误。 */
    public static Role parse(String value) {
        try {
            return Role.valueOf(value.strip().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException | NullPointerException invalid) {
            throw new MemberRoleInvalidException(value);
        }
    }

    public static String normalizeEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }
}
