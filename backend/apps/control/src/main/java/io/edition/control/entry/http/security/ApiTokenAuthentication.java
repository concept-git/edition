package io.edition.control.entry.http.security;

import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.AbstractAuthenticationToken;

/** 已认证机器主体；原始凭据仅供 controller 继续传入组合 guard，不进入 name/toString。 */
final class ApiTokenAuthentication extends AbstractAuthenticationToken {
    private final UUID tokenId;
    private final String credential;

    ApiTokenAuthentication(UUID tokenId, String credential) {
        super(List.of());
        this.tokenId = tokenId;
        this.credential = credential;
        setAuthenticated(true);
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
        return tokenId;
    }

    @Override
    public String getName() {
        return "api-token:" + tokenId;
    }
}
