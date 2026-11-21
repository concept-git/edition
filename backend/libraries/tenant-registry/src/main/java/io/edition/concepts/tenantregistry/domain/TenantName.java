package io.edition.concepts.tenantregistry.domain;

import io.edition.concepts.tenantregistry.api.*;
import java.util.Objects;
import java.util.Optional;

/**
 * 租户显示名。不要求全局唯一——租户始终以稳定 id 指代，同名是运营现实（同一集团多套文档）。
 * 非法名是可返回的业务失败（{@link #parse} 返回 empty），不抛异常。
 */
public record TenantName(String value) {

    public static final int MAX_LENGTH = 120;

    public TenantName {
        Objects.requireNonNull(value, "tenant name");
    }

    public static Optional<TenantName> parse(String raw) {
        if (raw == null) {
            return Optional.empty();
        }
        String stripped = raw.strip();
        if (stripped.isEmpty() || stripped.length() > MAX_LENGTH) {
            return Optional.empty();
        }
        return Optional.of(new TenantName(stripped));
    }
}
