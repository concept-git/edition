package io.space.concepts.space.domain;

import io.space.concepts.space.api.*;

/** Space 名称值对象：唯一规范化与校验入口。 */
public record SpaceName(String value) {
    public SpaceName {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("space name must not be blank");
        }
        value = value.strip();
        if (value.length() > 120) {
            throw new IllegalArgumentException("space name must contain at most 120 characters");
        }
    }
}
