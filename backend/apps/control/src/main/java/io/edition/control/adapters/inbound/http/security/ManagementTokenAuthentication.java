package io.edition.control.adapters.inbound.http.security;

import io.edition.control.usecases.principal.ManagementTokenPrincipalResolver.Identity;
import java.util.List;
import org.springframework.security.authentication.AbstractAuthenticationToken;

final class ManagementTokenAuthentication extends AbstractAuthenticationToken {
    private final Identity identity;
    private final String credential;

    ManagementTokenAuthentication(Identity identity, String credential) {
        super(List.of());
        this.identity = identity;
        this.credential = credential;
        setAuthenticated(true);
    }

    Identity identity() {
        return identity;
    }

    String credential() {
        return credential;
    }

    @Override
    public Object getCredentials() {
        return "";
    }

    @Override
    public Object getPrincipal() {
        return identity.actorId();
    }

    @Override
    public String getName() {
        return "management-token:" + identity.credentialId();
    }
}
