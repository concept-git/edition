package io.edition.concepts.page.domain;

import io.edition.concepts.page.api.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Pattern;

/** SEO / 图标 / 属性字段的规范化与不变量；违反以 (field, code) 抛出，供 application 翻译为有限输出。 */
final class PageMetadata {
    static final int SEO_TITLE_MAX = 200;
    static final int SEO_DESCRIPTION_MAX = 500;
    static final int SEO_KEYWORDS_MAX = 500;
    static final int IMAGE_URL_MAX = 2048;
    static final int PROPERTY_KEY_MAX = 64;
    static final int PROPERTY_VALUE_MAX_BYTES = 4 * 1024;
    private static final Pattern PROPERTY_KEY = Pattern.compile("^[A-Za-z][A-Za-z0-9_-]*$");

    private PageMetadata() {}

    /** 空白视为清空；超长为 too_long。返回 null 表示清空。 */
    static String text(String field, String value, int maxCodePoints) {
        if (value == null) return null;
        String stripped = value.strip();
        if (stripped.isEmpty()) return null;
        if (stripped.codePointCount(0, stripped.length()) > maxCodePoints) throw invalid(field, "too_long");
        return stripped;
    }

    static String imageUrl(String field, String value) {
        if (value == null) return null;
        String stripped = value.strip();
        if (stripped.isEmpty()) return null;
        if (stripped.codePointCount(0, stripped.length()) > IMAGE_URL_MAX) throw invalid(field, "too_long");
        final URI uri;
        try {
            uri = new URI(stripped);
        } catch (URISyntaxException malformed) {
            throw invalid(field, "invalid_url");
        }
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (!(scheme.equals("http") || scheme.equals("https")) || uri.getHost() == null) {
            throw invalid(field, "invalid_url");
        }
        return stripped;
    }

    static String propertyKey(String field) {
        if (field == null) throw invalid("field", "invalid_format");
        String key = field.strip();
        if (key.codePointCount(0, key.length()) > PROPERTY_KEY_MAX
                || !PROPERTY_KEY.matcher(key).matches()) {
            throw invalid("field", "invalid_format");
        }
        return key;
    }

    static String propertyValue(String value) {
        if (value == null) throw invalid("value", "required");
        if (value.getBytes(StandardCharsets.UTF_8).length > PROPERTY_VALUE_MAX_BYTES)
            throw invalid("value", "too_long");
        return value;
    }

    private static Page.InvalidField invalid(String field, String code) {
        return new Page.InvalidField(field, code);
    }
}
