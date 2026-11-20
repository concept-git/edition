package io.space.concepts.redirect.api;

import java.text.Normalizer;
import java.util.Objects;

/** Redirect path: `/…` exact or `/…/*` prefix, ≤512 code points, no whitespace/`?#`. */
public record RedirectPath(String value) {
    private static final int MAX_CODE_POINTS = 512;

    public RedirectPath {
        Objects.requireNonNull(value, "path");
        value = Normalizer.normalize(value.strip(), Normalizer.Form.NFKC);
        if (value.length() > 1 && value.endsWith("/") && !value.endsWith("*/")) {
            value = value.substring(0, value.length() - 1);
        }
        if (!valid(value)) throw new Invalid();
    }

    public boolean prefix() {
        return value.endsWith("/*");
    }

    public String prefixValue() {
        return prefix() ? value.substring(0, value.length() - 2) : value;
    }

    public boolean matches(String requestPath) {
        String request = requestPath == null ? "" : requestPath;
        if (!prefix()) return value.equals(request);
        String prefix = prefixValue();
        return request.equals(prefix) || request.startsWith(prefix + "/");
    }

    public static String remainder(String registered, String requestPath) {
        var path = new RedirectPath(registered);
        if (!path.matches(requestPath)) return "";
        if (!path.prefix()) return "";
        String prefix = path.prefixValue();
        return requestPath.equals(prefix) ? "" : requestPath.substring(prefix.length());
    }

    private static boolean valid(String value) {
        if (!value.startsWith("/") || value.length() < 2) return false;
        int length = value.codePointCount(0, value.length());
        if (length > MAX_CODE_POINTS) return false;
        if (value.indexOf('?') >= 0 || value.indexOf('#') >= 0) return false;
        if (value.chars().anyMatch(Character::isWhitespace)) return false;
        if (value.contains("//")) return false;
        if (value.endsWith("/*")) {
            return value.length() > 2 && !value.substring(0, value.length() - 2).endsWith("/");
        }
        return !value.endsWith("/");
    }

    public static final class Invalid extends RuntimeException {}
}
