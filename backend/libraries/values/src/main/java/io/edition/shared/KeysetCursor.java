package io.edition.shared;

import java.nio.charset.StandardCharsets;
import java.time.DateTimeException;
import java.time.Instant;
import java.util.Base64;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * 键集分页的不透明游标（API.md §0）：内部是 `时间|稳定 id`，对外是 URL-safe Base64。
 *
 * <p>所有按 (时间, id) 排序的列表共用同一实现，避免各概念各抄一份并在异常捕获上出现差异
 * （历史上 {@code Instant.parse} 抛出的 {@link DateTimeException} 曾漏捕而变成 500）。
 * 非法游标一律抛 {@link IllegalArgumentException}，由组合层翻译为 400 invalid_cursor。
 */
public record KeysetCursor(Instant at, UUID id) {

    private static final String SEPARATOR = "|";

    public KeysetCursor {
        Objects.requireNonNull(at, "at");
        Objects.requireNonNull(id, "id");
    }

    public String encode() {
        return encode(at, id);
    }

    public static String encode(Instant at, UUID id) {
        String raw = at.toString() + SEPARATOR + id;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    /** 空白游标表示"从头开始"，返回 empty；其余任何解析失败都抛 IllegalArgumentException。 */
    public static Optional<KeysetCursor> decode(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            return Optional.empty();
        }
        try {
            String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
            int separator = raw.lastIndexOf(SEPARATOR);
            if (separator < 0) {
                throw new IllegalArgumentException("cursor lacks a separator");
            }
            return Optional.of(new KeysetCursor(
                    Instant.parse(raw.substring(0, separator)),
                    UUID.fromString(raw.substring(separator + SEPARATOR.length()))));
        } catch (IllegalArgumentException | DateTimeException | IndexOutOfBoundsException invalid) {
            throw new IllegalArgumentException("invalid keyset cursor", invalid);
        }
    }
}
