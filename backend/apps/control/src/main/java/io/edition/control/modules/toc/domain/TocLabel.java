package io.edition.control.modules.toc.domain;

import io.edition.control.modules.toc.api.*;
import java.util.Objects;

/** 目录文案：strip 后 1..200 个 code point。 */
public record TocLabel(String value) {
    public static final int MAX_CODE_POINTS = 200;

    public TocLabel {
        Objects.requireNonNull(value, "label");
        value = value.strip();
        int length = value.codePointCount(0, value.length());
        if (length < 1 || length > MAX_CODE_POINTS) throw new Invalid();
    }

    public static final class Invalid extends RuntimeException {}
}
