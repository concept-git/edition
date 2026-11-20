package io.space.control.compositions.authoring.tagging;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * 标签目录游标：内部是 {@code pageCount|label}，对外 URL-safe Base64。
 * 不复用时间型 {@code KeysetCursor}（排序键不是时间）。
 */
final class TagCountCursor {
    private static final String SEPARATOR = "|";

    private TagCountCursor() {}

    static String encode(long pageCount, String label) {
        String raw = pageCount + SEPARATOR + label;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    static Optional<Key> decode(String cursor) {
        if (cursor == null || cursor.isBlank()) return Optional.empty();
        try {
            String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
            int separator = raw.indexOf(SEPARATOR);
            if (separator < 1) throw new IllegalArgumentException("cursor lacks a separator");
            return Optional.of(new Key(
                    Long.parseLong(raw.substring(0, separator)), raw.substring(separator + SEPARATOR.length())));
        } catch (IllegalArgumentException | IndexOutOfBoundsException invalid) {
            throw new IllegalArgumentException("invalid tag cursor", invalid);
        }
    }

    record Key(long pageCount, String label) {}
}
