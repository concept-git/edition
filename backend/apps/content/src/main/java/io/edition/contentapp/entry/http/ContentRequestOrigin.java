package io.edition.contentapp.entry.http;

import io.edition.delivery.contract.ReaderOrigin;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** 还原公开 origin；仅信任已配置代理的转发头。 */
@Component
public final class ContentRequestOrigin {
    private final List<String> trustedProxies;

    public ContentRequestOrigin(@Value("${security.trusted-proxies:127.0.0.1,::1}") List<String> trustedProxies) {
        this.trustedProxies = List.copyOf(trustedProxies);
    }

    public ReaderOrigin from(HttpServletRequest request) {
        boolean trusted = trustedProxies.contains(request.getRemoteAddr());
        String authority = trusted && request.getHeader("X-Forwarded-Host") != null
                ? ReaderOrigin.first(request.getHeader("X-Forwarded-Host"))
                : request.getHeader("Host");
        if (authority == null || authority.isBlank()) authority = request.getServerName();
        String scheme = trusted && request.getHeader("X-Forwarded-Proto") != null
                ? ReaderOrigin.first(request.getHeader("X-Forwarded-Proto")).toLowerCase(Locale.ROOT)
                : request.getScheme();
        return ReaderOrigin.resolve(scheme, authority);
    }
}
