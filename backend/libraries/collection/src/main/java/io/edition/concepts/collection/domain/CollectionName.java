package io.edition.concepts.collection.domain;

import io.edition.concepts.collection.api.*;
import java.util.Objects;

/** 分组名：strip 后 1..200 个 code point。 */
public record CollectionName(String value) {
    public static final int MAX_CODE_POINTS = 200;

    public CollectionName {
        Objects.requireNonNull(value, "name");
        value = value.strip();
        int length = value.codePointCount(0, value.length());
        if (length < 1 || length > MAX_CODE_POINTS) throw new Invalid();
    }

    public static final class Invalid extends RuntimeException {}
}
