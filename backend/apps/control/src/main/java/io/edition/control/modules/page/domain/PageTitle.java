package io.edition.control.modules.page.domain;

import io.edition.control.modules.page.api.*;
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
