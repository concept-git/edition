package io.edition.control.modules.site.domain;

import io.edition.control.modules.site.api.*;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

public record Slug(String value) {
    private static final int MAX_CODE_POINTS = 80;
    private static final Pattern SHAPE = Pattern.compile("[\\p{L}\\p{N}]+(?:-[\\p{L}\\p{N}]+)*");

    public Slug {
        Objects.requireNonNull(value, "slug");
        value = Normalizer.normalize(value.strip(), Normalizer.Form.NFKC).toLowerCase(Locale.ROOT);
        int length = value.codePointCount(0, value.length());
        if (length < 1 || length > MAX_CODE_POINTS || !SHAPE.matcher(value).matches()) throw new Invalid();
    }

    public static final class Invalid extends RuntimeException {}
}
