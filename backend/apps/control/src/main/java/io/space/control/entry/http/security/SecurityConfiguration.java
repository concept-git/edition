package io.space.control.entry.http.security;

import io.space.control.compositions.flow.ProblemCode;
import io.space.control.entry.http.problem.ProblemResponseWriter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/** 定义五平面最小安全边界；具体主体与资源链判定分别由后续 Session、ApiToken 和 Permission 票接入。 */
@Configuration
class SecurityConfiguration {

    @Bean
    @org.springframework.core.annotation.Order(1)
    SecurityFilterChain readerCommandSecurity(HttpSecurity http) throws Exception {
        return http.securityMatcher("/_auth/**")
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        routes -> routes.requestMatchers(HttpMethod.GET, "/_auth/history", "/_auth/session")
                                .permitAll()
                                .requestMatchers(HttpMethod.DELETE, "/_auth/session")
                                .permitAll()
                                .requestMatchers(HttpMethod.POST, "/_auth/session", "/_auth/session/refresh")
                                .permitAll()
                                .requestMatchers(HttpMethod.POST, "/_auth/history")
                                .permitAll()
                                .anyRequest()
                                .denyAll())
                .build();
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ProblemResponseWriter problems,
            AuthenticationEntryPoint authenticationRequired,
            SessionTouchFilter sessionTouch,
            JwtDecoder jwtDecoder,
            ApiTokenAuthenticationManager apiTokenAuthentication,
            ManagementTokenAuthenticationManager managementTokenAuthentication)
            throws Exception {
        AuthenticationManager jwtAuthentication = new ProviderManager(new JwtAuthenticationProvider(jwtDecoder));
        AuthenticationManagerResolver<HttpServletRequest> bearerResolver = request -> {
            if (isManagementToken(request)) return managementTokenAuthentication::authenticate;
            return isApiToken(request) ? apiTokenAuthentication : jwtAuthentication;
        };
        return http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/internal/analytics")
                        .permitAll()
                        .requestMatchers("/auth/**", "/healthz", "/readyz", "/metrics", "/api-docs/**")
                        .permitAll()
                        // 邀请摘要公开可读：受邀人可能尚未注册，得先看清这是谁发给谁的邀请。
                        // token 本身是秘密，持有者即收件人；接受邀请仍需登录且邮箱匹配。
                        .requestMatchers(HttpMethod.GET, "/api/v1/invitations/*")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/ops/domains/allowed")
                        .permitAll()
                        .requestMatchers(
                                "/api/v1/**",
                                "/admin/**",
                                "/ops/**",
                                "/audit/**",
                                "/audit:export",
                                "/stats/**",
                                "/webhooks/**",
                                "/releases/**")
                        .authenticated()
                        // 交付面在 Issue 23 接入域名与权限判定；此处只开放其只读形态，未知写请求默认拒绝。
                        .requestMatchers(HttpMethod.GET, "/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/**")
                        .permitAll()
                        .anyRequest()
                        .denyAll())
                .oauth2ResourceServer(oauth2 -> oauth2.authenticationManagerResolver(bearerResolver)
                        .authenticationEntryPoint(authenticationRequired))
                .addFilterAfter(sessionTouch, BearerTokenAuthenticationFilter.class)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationRequired)
                        .accessDeniedHandler((request, response, exception) -> problems.write(
                                request,
                                response,
                                HttpServletResponse.SC_FORBIDDEN,
                                ProblemCode.PERMISSION_DENIED,
                                "Permission denied",
                                "The authenticated principal cannot perform this operation.")))
                .build();
    }

    @Bean
    AuthenticationEntryPoint authenticationRequired(ProblemResponseWriter problems) {
        return (request, response, exception) -> {
            if (problems.writeDependencyFailure(request, response, exception)) {
                return;
            }
            boolean apiToken = isApiToken(request) || isManagementToken(request);
            problems.write(
                    request,
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    apiToken ? ProblemCode.INVALID_TOKEN : ProblemCode.AUTHENTICATION_REQUIRED,
                    apiToken ? "API token invalid" : "Authentication required",
                    apiToken
                            ? "The supplied API token is invalid, expired or revoked."
                            : "A valid Bearer credential is required.");
        };
    }

    private static boolean isApiToken(HttpServletRequest request) {
        return hasBearerPrefix(request, "spc_");
    }

    private static boolean isManagementToken(HttpServletRequest request) {
        return hasBearerPrefix(request, "spm_");
    }

    private static boolean hasBearerPrefix(HttpServletRequest request, String prefix) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null) return false;
        int separator = authorization.indexOf(' ');
        return separator > 0
                && authorization.substring(0, separator).equalsIgnoreCase("Bearer")
                && authorization.substring(separator + 1).startsWith(prefix);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value(
                            "${security.cors.allowed-origins:http://localhost:8088,http://127.0.0.1:8088}")
                    List<String> allowedOrigins) {
        var configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name()));
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Idempotency-Key", "X-Request-Id", "X-Domain-Ask-Token", "If-Match"));
        configuration.setExposedHeaders(List.of("ETag", "X-Content-ETag", "X-Request-Id"));
        configuration.setAllowCredentials(true);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
