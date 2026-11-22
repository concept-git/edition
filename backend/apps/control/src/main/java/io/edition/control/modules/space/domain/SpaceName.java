package io.edition.control.modules.space.domain;

import io.edition.control.modules.space.api.*;

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
