package io.space.shared;

import java.util.Objects;

/** 概念 error case 与 HTTP problem 共用的有限字段违反项。 */
public record ValidationViolation(String field, String code) {

    public ValidationViolation {
        field = requireToken(field, "field");
        code = requireToken(code, "code");
    }

    private static String requireToken(String value, String label) {
        Objects.requireNonNull(value, label);
        var normalized = value.strip();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(label + " must not be blank");
        }
        return normalized;
    }
}
