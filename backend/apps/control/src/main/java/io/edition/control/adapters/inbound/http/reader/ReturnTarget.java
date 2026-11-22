package io.edition.control.adapters.inbound.http.reader;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/** 表单 {@code returnTo} 的校验：只接受站内相对路径，其余回落 {@code /}，避免开放重定向。 */
final class ReturnTarget {
    static final int MAX_LENGTH = 2048;

    private ReturnTarget() {}

    static String of(String candidate) {
        if (candidate == null || candidate.isEmpty() || candidate.length() > MAX_LENGTH) return "/";
        try {
            URI.create(candidate);
        } catch (IllegalArgumentException malformed) {
            return "/";
        }
        String decoded = candidate;
        for (int pass = 0; pass < 4; pass++) {
            if (!decoded.startsWith("/")
                    || decoded.startsWith("//")
                    || decoded.contains("\\")
                    || decoded.chars().anyMatch(c -> c < 32 || c == 127)) return "/";
            String next;
            try {
                next = URLDecoder.decode(decoded.replace("+", "%2B"), StandardCharsets.UTF_8);
            } catch (IllegalArgumentException malformed) {
                return "/";
            }
            if (next.equals(decoded)) return candidate;
            decoded = next;
        }
        return "/";
    }
}
