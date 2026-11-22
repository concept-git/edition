package io.edition.contentapp.adapters.inbound.http;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/** 交付运行时的匿名只读 HTTP 边界。 */
public @Configuration(proxyBeanMethods = false) class ContentSecurityConfiguration {

    public @Bean SecurityFilterChain deliverySecurityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/api/content/search-events", "/api/content/events")
                        .permitAll()
                        .requestMatchers("/_auth/**")
                        .denyAll()
                        .requestMatchers(HttpMethod.GET, "/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/**")
                        .permitAll()
                        .anyRequest()
                        .denyAll())
                .build();
    }
}
