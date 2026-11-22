package io.edition.control.adapters.inbound.http.security;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.control.usecases.principal.ManagementTokenPrincipalResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
class ManagementTokenAccessConfiguration implements WebMvcConfigurer {
    private final ManagementTokenPrincipalResolver tokens;

    ManagementTokenAccessConfiguration(ManagementTokenPrincipalResolver tokens) {
        this.tokens = tokens;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                if (!(SecurityContextHolder.getContext().getAuthentication()
                        instanceof ManagementTokenAuthentication auth)) return true;
                if (!(handler instanceof HandlerMethod method)) throw new ScopeDeniedException();
                String type = method.getBeanType().getSimpleName();
                String scope = io.edition.control.usecases.access.ManagementCapabilities.requiredScope(
                        type, method.getMethod().getName(), request.getMethod());
                if (scope == null) throw new ScopeDeniedException();
                if (!scope.isEmpty() && !auth.identity().scopes().contains(scope))
                    throw new ScopeDeniedException(scope);
                if (auth.identity().tenantId() != null
                        && (type.equals("AccountController") || scope.startsWith("platform:")))
                    throw new ScopeDeniedException();
                tokens.touch(auth.identity().credentialId());
                return true;
            }
        });
    }

    static final class ScopeDeniedException extends GatewayProblemException {
        ScopeDeniedException() {
            super(ProblemCode.PERMISSION_DENIED);
        }

        ScopeDeniedException(String scope) {
            super(
                    ProblemCode.MANAGEMENT_SCOPE_REQUIRED,
                    java.util.List.of(new io.edition.shared.ValidationViolation("scope", scope)));
        }
    }
}
