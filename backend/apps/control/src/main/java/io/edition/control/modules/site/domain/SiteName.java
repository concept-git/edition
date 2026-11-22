package io.edition.control.modules.site.domain;

import io.edition.control.modules.site.api.*;

public record SiteName(String value) {
    public SiteName {
        if (value == null || value.isBlank()) throw new Invalid();
        value = value.strip();
        if (value.length() > 120) throw new Invalid();
    }

    public static final class Invalid extends RuntimeException {}
}
