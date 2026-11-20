package io.space.concepts.page.domain;

import io.space.concepts.page.api.*;
import java.util.Objects;

public record PageTitle(String value) {
    private static final int MAX_CODE_POINTS = 200;

    public PageTitle {
        Objects.requireNonNull(value, "page title");
        value = value.strip();
        int length = value.codePointCount(0, value.length());
        if (length < 1 || length > MAX_CODE_POINTS) throw new Invalid();
    }

    public static final class Invalid extends RuntimeException {}
}
