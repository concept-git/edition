package io.edition.control.entry.http.security;

import io.edition.control.compositions.principal.UnresolvedPrincipalException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * 取回本次请求的原始 Bearer 凭据。
 *
 * <p>组合层的 guard 自己解析主体（gateway 看不见 Permission 的值类型，也就无从构造资源链），
 * 因此 controller 传的是凭据原文而非已解析的身份。
 */
@Component
public class BearerCredential {

    public String require() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof ManagementTokenAuthentication management) {
            return management.credential();
        }
        if (!(authentication instanceof JwtAuthenticationToken token)) {
            if (authentication instanceof ApiTokenAuthentication machine) {
                return machine.credential();
            }
            throw new UnresolvedPrincipalException();
        }
        return token.getToken().getTokenValue();
    }
}
