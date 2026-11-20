package io.space.control.entry.http.security;

import io.space.control.compositions.principal.ApiTokenPrincipalResolver;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
final class ApiTokenAuthenticationManager implements AuthenticationManager {
    private final ApiTokenPrincipalResolver resolver;

    ApiTokenAuthenticationManager(ApiTokenPrincipalResolver resolver) {
        this.resolver = resolver;
    }

    @Override
    public Authentication authenticate(Authentication authentication) {
        if (!(authentication instanceof BearerTokenAuthenticationToken bearer)) {
            throw invalid();
        }
        var tokenId = resolver.authenticate(bearer.getToken()).orElseThrow(ApiTokenAuthenticationManager::invalid);
        return new ApiTokenAuthentication(tokenId, bearer.getToken());
    }

    private static OAuth2AuthenticationException invalid() {
        return new OAuth2AuthenticationException(new OAuth2Error("invalid_token", "The API token is invalid.", null));
    }
}
