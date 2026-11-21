package io.edition.control.compositions.authoring.tagging;

import io.edition.concepts.tag.api.TagApi;
import java.util.Optional;

/** 标签 flow 的 label 翻译；写路径非法词 validation_failed，listTags 的非法 q 给空目录。 */
final class TagLabels {
    private TagLabels() {}

    static String require(String raw, String field) {
        if (raw == null || raw.isBlank()) {
            throw new TaggingTypes.TagInvalidException(field, "required");
        }
        return TagApi.parse(raw).orElseThrow(() -> new TaggingTypes.TagInvalidException(field, "invalid_format"));
    }

    /**
     * 空 q 表示不按前缀收窄。非空则与打标同一套归一化；非法词返回 empty，
     * listTags 给空目录 200（前缀匹配找不到词，不 422 探测）。
     */
    static Optional<String> optionalPrefix(String q) {
        if (q == null || q.isBlank()) return Optional.of("");
        return TagApi.parse(q);
    }
}
