package io.space.control.compositions.principal;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.oauth2.jwt.JwtDecoder;

class SessionPrincipalResolverTest {

    @Test
    void dependencyFailureRemainsASystemFailure() {
        JwtDecoder decoder = mock(JwtDecoder.class);
        var dependencyFailure = new DataAccessResourceFailureException("session store unavailable");
        when(decoder.decode("credential")).thenThrow(dependencyFailure);

        var resolver = new SessionPrincipalResolver(decoder);

        assertThatThrownBy(() -> resolver.resolve(new PrincipalResolver.Credential("credential")))
                .isSameAs(dependencyFailure);
    }
}
