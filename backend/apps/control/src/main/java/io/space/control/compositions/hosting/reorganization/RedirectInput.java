package io.space.control.compositions.hosting.reorganization;

import io.space.concepts.redirect.api.RedirectApi;
import io.space.concepts.redirect.api.RedirectPath;
import java.util.Optional;

/** 重定向请求的路径规范化与有限枚举解析。 */
final class RedirectInput {
    private RedirectInput() {}

    static String manualPath(String value) {
        final String normalized;
        try {
            normalized = new RedirectPath(value).value();
        } catch (RedirectPath.Invalid invalid) {
            throw new ReorganizationTypes.RedirectPathInvalidException();
        }
        String exact = normalized.endsWith("/*") ? normalized.substring(0, normalized.length() - 2) : normalized;
        if (exact.equals("/")
                || exact.equals("/api")
                || exact.startsWith("/api/")
                || exact.equals("/_static")
                || exact.startsWith("/_static/")
                || exact.equals("/sitemap.xml")
                || exact.equals("/robots.txt")) {
            throw new ReorganizationTypes.RedirectPathInvalidException();
        }
        return normalized;
    }

    static Optional<RedirectApi.Origin> parseOrigin(String value) {
        if (value == null || value.isBlank()) return Optional.empty();
        try {
            return Optional.of(RedirectApi.Origin.parse(value));
        } catch (IllegalArgumentException invalid) {
            throw new ReorganizationTypes.RedirectPathInvalidException("origin");
        }
    }

    static RedirectApi.TargetType parseTargetType(String value) {
        if (value == null) throw new ReorganizationTypes.RedirectPathInvalidException("targetType");
        try {
            return RedirectApi.TargetType.parse(value);
        } catch (IllegalArgumentException invalid) {
            throw new ReorganizationTypes.RedirectPathInvalidException("targetType");
        }
    }
}
