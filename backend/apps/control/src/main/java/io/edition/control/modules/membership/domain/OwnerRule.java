package io.edition.control.modules.membership.domain;

import io.edition.control.modules.membership.api.*;
import io.edition.control.modules.membership.api.MembershipApi.Role;

/**
 * 群体永不沦为无人可管的孤岛：最后一个 owner 既不能被移除，也不能被降级。
 * 纯函数——owner 计数由调用方在事务内提供。
 */
public final class OwnerRule {

    private OwnerRule() {}

    public static boolean wouldOrphan(Role currentRole, long ownerCount) {
        // 计数为 0 时不再阻挡：否则数据异常或并发删除会让群体永远无法清理。
        return currentRole == Role.OWNER && ownerCount == 1;
    }
}
