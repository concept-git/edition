package io.edition.concepts.site.domain;

import io.edition.concepts.site.api.*;

public record SiteName(String value) {
    public SiteName {
        if (value == null || value.isBlank()) throw new Invalid();
        value = value.strip();
        if (value.length() > 120) throw new Invalid();
    }

    public static final class Invalid extends RuntimeException {}
}
