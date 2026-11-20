package io.space.concepts.membership.domain;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.membership.api.*;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;

/** 邀请令牌的领域规则（CONCEPT.md：限时 7 天、一次性、只存哈希）。 */
class InviteTokenTest {

    private static final Instant NOW = Instant.parse("2026-08-31T02:00:00Z");

    @Test
    void issuesAnOpaqueTokenValidForSevenDays() {
        var issued = InviteToken.issue(NOW);

        assertThat(issued.token()).isNotBlank().doesNotContain("=");
        assertThat(issued.expiresAt()).isEqualTo(NOW.plus(Duration.ofDays(7)));
        assertThat(InviteToken.VALIDITY).isEqualTo(Duration.ofDays(7));
    }

    @Test
    void storesOnlyTheHashSoAPlaintextLeakCannotComeFromTheDatabase() {
        var issued = InviteToken.issue(NOW);

        assertThat(issued.tokenHash()).isNotEqualTo(issued.token());
        assertThat(InviteToken.hash(issued.token())).isEqualTo(issued.tokenHash());
    }

    @Test
    void issuesADistinctTokenEveryTime() {
        assertThat(InviteToken.issue(NOW).token())
                .isNotEqualTo(InviteToken.issue(NOW).token());
    }

    @Test
    void redeemsOnlyBeforeExpiry() {
        var issued = InviteToken.issue(NOW);

        assertThat(InviteToken.redeems(issued.expiresAt(), NOW)).isTrue();
        assertThat(InviteToken.redeems(issued.expiresAt(), issued.expiresAt())).isFalse();
        assertThat(InviteToken.redeems(issued.expiresAt(), issued.expiresAt().plusSeconds(1)))
                .isFalse();
    }
}
