package io.space.control.compositions.iam.apitoken;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.control.compositions.flow.InvalidCursorException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

/**
 * 令牌列表是内存合并后的集合：去重排序与 offset 游标。
 * 与键集游标不同，故不进 {@code shared.KeysetCursor}。
 */
final class TokenList {
    private TokenList() {}

    static List<ApiTokenApi.Metadata> distinctSorted(List<ApiTokenApi.Metadata> tokens) {
        var unique = new LinkedHashMap<UUID, ApiTokenApi.Metadata>();
        tokens.stream()
                .sorted(Comparator.comparing(ApiTokenApi.Metadata::createdAt)
                        .reversed()
                        .thenComparing(token -> token.id().value(), Comparator.reverseOrder()))
                .forEach(token -> unique.putIfAbsent(token.id().value(), token));
        return List.copyOf(unique.values());
    }

    static String cursor(int offset) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(Integer.toString(offset).getBytes(StandardCharsets.US_ASCII));
    }

    static int offset(String cursor) {
        if (cursor == null || cursor.isBlank()) return 0;
        try {
            return Integer.parseInt(new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.US_ASCII));
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
    }
}
