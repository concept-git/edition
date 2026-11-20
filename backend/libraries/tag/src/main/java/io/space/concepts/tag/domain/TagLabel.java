package io.space.concepts.tag.domain;

import io.space.concepts.tag.api.*;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Objects;

/** 标签词：NFKC、strip、内部空白压成单空格、Locale.ROOT 小写；1..64 个 code point。 */
public record TagLabel(String value) {
    public static final int MAX_CODE_POINTS = 64;

    public TagLabel {
        Objects.requireNonNull(value, "label");
        value = normalize(value);
        if (!legal(value)) throw new Invalid();
    }

    public static String normalize(String raw) {
        String nfkc = Normalizer.normalize(raw, Normalizer.Form.NFKC);
        String stripped = nfkc.strip();
        return stripped.replaceAll("(?U)\\s+", " ").toLowerCase(Locale.ROOT);
    }

    public static boolean legal(String normalized) {
        if (normalized.isEmpty()) return false;
        int length = normalized.codePointCount(0, normalized.length());
        if (length > MAX_CODE_POINTS) return false;
        return normalized.codePoints().noneMatch(TagLabel::forbidden);
    }

    private static boolean forbidden(int codePoint) {
        return codePoint < 0x20
                || codePoint == 0x7F
                || (codePoint >= 0x80 && codePoint <= 0x9F)
                || codePoint == '/'
                || codePoint == '\\';
    }

    public static final class Invalid extends RuntimeException {}
}
