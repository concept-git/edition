package io.space.concepts.user.domain;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.user.api.*;
import io.space.concepts.user.domain.EmailVerification.Challenge;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class EmailVerificationTest {

    private final Instant now = Instant.parse("2026-08-29T10:00:00Z");

    @Test
    void issuedTokenRedeemsBeforeExpiry() {
        var issued = EmailVerification.issue(now);
        var challenge = new Challenge(issued.tokenHash(), issued.expiresAt(), false);

        assertThat(EmailVerification.redeems(challenge, issued.token(), now)).isTrue();
        assertThat(issued.expiresAt()).isEqualTo(now.plus(EmailVerification.VALIDITY));
    }

    @Test
    void wrongTokenIsRejected() {
        var issued = EmailVerification.issue(now);
        var challenge = new Challenge(issued.tokenHash(), issued.expiresAt(), false);

        assertThat(EmailVerification.redeems(challenge, "not-the-token", now)).isFalse();
    }

    @Test
    void expiredTokenIsRejected() {
        var issued = EmailVerification.issue(now);
        var challenge = new Challenge(issued.tokenHash(), issued.expiresAt(), false);

        assertThat(EmailVerification.redeems(challenge, issued.token(), issued.expiresAt()))
                .isFalse();
    }

    @Test
    void consumedTokenNeverRedeemsAgain() {
        var issued = EmailVerification.issue(now);
        var verified = new Challenge(null, null, true);

        assertThat(EmailVerification.redeems(verified, issued.token(), now)).isFalse();
    }

    @Test
    void tokenPlaintextIsNeverStoredVerbatim() {
        var issued = EmailVerification.issue(now);

        assertThat(issued.tokenHash()).isNotEqualTo(issued.token());
        assertThat(EmailVerification.hash(issued.token())).isEqualTo(issued.tokenHash());
    }
}
