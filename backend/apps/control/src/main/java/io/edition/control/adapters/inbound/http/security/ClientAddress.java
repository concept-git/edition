package io.edition.control.adapters.inbound.http.security;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;

/** Transport-only extraction; forwarded addresses are accepted only from configured proxies. */
public final class ClientAddress {
    private ClientAddress() {}

    public static String of(HttpServletRequest request, Set<String> trusted) {
        String remote = request.getRemoteAddr();
        String forwarded = request.getHeader("X-Forwarded-For");
        if (trusted.contains(remote) && forwarded != null && !forwarded.isBlank()) {
            String candidate = forwarded.split(",", 2)[0].strip();
            if (candidate.contains(":") ? candidate.matches("[a-fA-F0-9:]+") : candidate.matches("[0-9.]+"))
                return candidate;
        }
        return remote;
    }
}
