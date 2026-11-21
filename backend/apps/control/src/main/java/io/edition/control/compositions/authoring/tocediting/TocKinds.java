package io.edition.control.compositions.authoring.tocediting;

import io.edition.concepts.toc.api.TocApi;
import java.util.Locale;

/** 目录条目 kind 翻译；非法值 422 validation_failed。 */
final class TocKinds {
    private TocKinds() {}

    static TocApi.Kind parse(String kind) {
        if (kind == null) throw new TocEditingTypes.TocInvalidException("kind", "required");
        try {
            return TocApi.Kind.valueOf(kind.strip().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ignored) {
            throw new TocEditingTypes.TocInvalidException("kind", "invalid_format");
        }
    }
}
