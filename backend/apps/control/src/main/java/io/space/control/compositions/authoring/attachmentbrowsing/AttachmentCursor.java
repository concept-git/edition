package io.space.control.compositions.authoring.attachmentbrowsing;

import io.space.control.compositions.flow.InvalidCursorException;
import io.space.shared.KeysetCursor;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;

/** 条件绑定的续扫位置；仅用于定位，永不作为授权凭据。 */
record AttachmentCursor(String scope) {
    static AttachmentCursor forQuery(UUID tenant, UUID space, String q, String type) {
        return new AttachmentCursor(tenant + ":" + space + ":" + type + ":created-ref-desc:v1:"
                + Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(q.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8)));
    }

    String decode(String cursor) {
        if (cursor == null) return null;
        try {
            if (cursor.length() > 2048) throw new IllegalArgumentException("cursor too long");
            String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
            String prefix = scope + "|";
            if (!raw.startsWith(prefix)) throw new IllegalArgumentException("cursor scope mismatch");
            String position = raw.substring(prefix.length());
            if (KeysetCursor.decode(position).isEmpty()) throw new IllegalArgumentException("missing position");
            return position;
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
    }

    String encode(String position) {
        return position == null
                ? null
                : Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString((scope + "|" + position).getBytes(StandardCharsets.UTF_8));
    }
}
