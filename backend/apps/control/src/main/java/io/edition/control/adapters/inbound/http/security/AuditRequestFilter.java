package io.edition.control.adapters.inbound.http.security;

import io.edition.control.usecases.RequestAuditContext;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.LOWEST_PRECEDENCE - 100)
public class AuditRequestFilter extends OncePerRequestFilter {
    private final java.util.Set<String> trusted;

    public AuditRequestFilter(
            @org.springframework.beans.factory.annotation.Value("${security.trusted-proxies:127.0.0.1,::1}")
                    java.util.Set<String> trusted) {
        this.trusted = trusted;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String type = "anonymous";
        UUID actor = null, tenant = null, credentialId = null;
        if (auth instanceof ManagementTokenAuthentication management) {
            type = "user";
            actor = management.identity().actorId();
            credentialId = management.identity().credentialId();
        } else if (auth instanceof ApiTokenAuthentication token) {
            type = "token";
            actor = (UUID) token.getPrincipal();
        } else if (auth
                instanceof
                org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken jwt) {
            try {
                actor = UUID.fromString(jwt.getToken().getSubject());
                type = "user";
            } catch (IllegalArgumentException invalid) {
                actor = null;
            }
        }
        var path = java.util.regex.Pattern.compile("/api/v1/tenants/([a-fA-F0-9-]{36})(?:/|$)")
                .matcher(request.getRequestURI());
        if (path.find()) {
            try {
                tenant = UUID.fromString(path.group(1));
            } catch (IllegalArgumentException invalid) {
                tenant = null;
            }
        }
        String ip = ClientAddress.of(request, trusted);
        if (ip != null && !ip.matches("[0-9a-fA-F:.]+")) ip = null;
        try (var credentialContext = io.edition.requestcontext.CredentialAuditContext.open(credentialId);
                var context = RequestAuditContext.open(type, actor, ip, RequestIdFilter.requestId(request), tenant)) {
            chain.doFilter(request, response);
        }
    }
}
