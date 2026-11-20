package io.space.concepts.session.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.session.api.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class SessionCredentialConfigurationTest {

    private final SessionCredentialConfiguration configuration = new SessionCredentialConfiguration();

    @Test
    void missingKeysRefuseStartupUnlessEphemeralKeysAreExplicitlyAllowed() {
        // 部署产物拿不到这个开关：忘配 PEM 只会启动失败，不会悄悄发一批重启即失效的凭据。
        assertThatThrownBy(() -> configuration.sessionRsaKey(new MockEnvironment(), "kid", "", "", false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("session RSA private/public PEM keys are required");
    }

    @Test
    void localRunsMayOptIntoAnEphemeralKey() throws Exception {
        assertThat(configuration
                        .sessionRsaKey(new MockEnvironment(), "kid", "", "", true)
                        .getKeyID())
                .isEqualTo("kid");
    }
}
