package io.space.concepts.membership.domain;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.membership.api.*;
import io.space.concepts.membership.api.MembershipApi.Role;
import org.junit.jupiter.api.Test;

/**
 * 群体不得沦为无人可管的孤岛（CONCEPT.md 的 last_owner error case）。
 * 判定是纯函数：调用方在事务内提供当前 owner 计数。
 */
class OwnerRuleTest {

    @Test
    void removingTheLastOwnerWouldOrphanTheGroup() {
        assertThat(OwnerRule.wouldOrphan(Role.OWNER, 1)).isTrue();
    }

    @Test
    void removingAnOwnerIsFineWhileAnotherOwnerRemains() {
        assertThat(OwnerRule.wouldOrphan(Role.OWNER, 2)).isFalse();
    }

    @Test
    void removingAPlainMemberNeverOrphansTheGroup() {
        assertThat(OwnerRule.wouldOrphan(Role.MEMBER, 1)).isFalse();
        assertThat(OwnerRule.wouldOrphan(Role.MEMBER, 0)).isFalse();
    }

    /** 计数为 0 时（数据异常或并发删除）不再阻挡，否则群体永远无法清理。 */
    @Test
    void aGroupWithoutAnyOwnerDoesNotBlockRemoval() {
        assertThat(OwnerRule.wouldOrphan(Role.OWNER, 0)).isFalse();
    }
}
