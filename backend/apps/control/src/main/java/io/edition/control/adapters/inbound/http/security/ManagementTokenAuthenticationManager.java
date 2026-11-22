package io.edition.control.adapters.inbound.http.security;

import io.edition.control.usecases.principal.ManagementTokenPrincipalResolver;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
final class ManagementTokenAuthenticationManager {
    private final ManagementTokenPrincipalResolver resolver;

    ManagementTokenAuthenticationManager(ManagementTokenPrincipalResolver resolver) {
        this.resolver = resolver;
    }

    public Authentication authenticate(Authentication authentication) {
        if (!(authentication instanceof BearerTokenAuthenticationToken bearer))
            throw new BadCredentialsException("invalid management credential");
        var identity = resolver.authenticate(bearer.getToken())
                .orElseThrow(() -> new BadCredentialsException("invalid management credential"));
        return new ManagementTokenAuthentication(identity, bearer.getToken());
    }
}
