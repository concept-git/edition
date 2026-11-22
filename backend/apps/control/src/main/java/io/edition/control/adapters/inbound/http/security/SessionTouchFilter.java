package io.edition.control.adapters.inbound.http.security;

import io.edition.control.usecases.iam.accountsession.TouchUseCase;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
class SessionTouchFilter extends OncePerRequestFilter {
    private final TouchUseCase touchUseCase;

    SessionTouchFilter(TouchUseCase touchUseCase) {
        this.touchUseCase = touchUseCase;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwt) {
            touchUseCase.touch(UUID.fromString(jwt.getToken().getClaimAsString("sid")));
        }
        chain.doFilter(request, response);
    }
}
