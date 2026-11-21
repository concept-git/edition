package io.edition.concepts.password.api;

import io.edition.concepts.password.api.PasswordApi.AccountId;

/**
 * Password 动作的完成事件。永不携带明文或哈希。
 */
public final class PasswordEvents {

    private PasswordEvents() {}

    public record PasswordSet(AccountId user) {}

    public record PasswordChanged(AccountId user) {}

    public record ResetRequested(AccountId user) {}

    public record PasswordReset(AccountId user) {}
}
