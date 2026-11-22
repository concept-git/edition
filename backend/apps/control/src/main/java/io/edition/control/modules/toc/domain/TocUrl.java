package io.edition.control.modules.toc.domain;

import io.edition.control.modules.toc.api.*;
import java.net.URI;
import java.util.Locale;
import java.util.Objects;

/** 外链：strip 后仅 http(s)、带 host、长度 ≤2048。 */
public record TocUrl(String value) {
    public static final int MAX_LENGTH = 2048;

    public TocUrl {
        Objects.requireNonNull(value, "url");
        value = value.strip();
        if (value.isEmpty() || value.length() > MAX_LENGTH) throw new Invalid();
        URI parsed;
        try {
            parsed = URI.create(value);
        } catch (IllegalArgumentException invalid) {
            throw new Invalid();
        }
        String scheme = parsed.getScheme() == null ? "" : parsed.getScheme().toLowerCase(Locale.ROOT);
        if (!scheme.equals("http") && !scheme.equals("https")) throw new Invalid();
        if (parsed.getHost() == null || parsed.getHost().isBlank()) throw new Invalid();
    }

    public static final class Invalid extends RuntimeException {}
}
