package io.space.concepts.toc.domain;

import io.space.concepts.toc.api.*;
import io.space.concepts.toc.api.TocApi;

/** kind 与 targetId/url 互斥：target 必有页、link 必有 URL、group 两者皆无。 */
public final class KindBinding {
    private KindBinding() {}

    public static void require(TocApi.Kind kind, java.util.UUID targetId, String url) {
        switch (kind) {
            case TARGET -> {
                if (targetId == null) throw new Invalid("targetId", "required");
                if (url != null && !url.isBlank()) throw new Invalid("url", "forbidden");
            }
            case LINK -> {
                if (targetId != null) throw new Invalid("targetId", "forbidden");
                if (url == null) throw new Invalid("url", "required");
            }
            case GROUP -> {
                if (targetId != null) throw new Invalid("targetId", "forbidden");
                if (url != null && !url.isBlank()) throw new Invalid("url", "forbidden");
            }
        }
    }

    public static final class Invalid extends RuntimeException {
        public final String field;
        public final String code;

        public Invalid(String field, String code) {
            this.field = field;
            this.code = code;
        }
    }
}
