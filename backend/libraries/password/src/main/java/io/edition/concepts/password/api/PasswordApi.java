package io.edition.concepts.password.api;

import io.edition.shared.ValidationViolation;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Password [User] 概念的唯一对外门面。类型参数落为不透明 id（AccountId），不引入 User 类型。
 * error case 是可被 sync 匹配的输出（sealed 结果变体）。
 */
public interface PasswordApi {

    SetResult set(AccountId user, String password);

    AuthenticateResult authenticate(AccountId user, String password);

    ChangeResult change(AccountId user, String oldPassword, String newPassword);

    ResetRequest requestReset(AccountId user);

    ResetResult reset(String token, String newPassword);

    java.util.Optional<AccountId> resetOwner(String token);

    void terminate(AccountId user);

    /** 检查凭据是否已设置，供签发挑战和会话前的完整性判断。 */
    boolean isSet(AccountId user);

    boolean resetPending(AccountId user, String token);

    /** 未知邮箱的等成本 Argon2 验证；永不改变任何账户状态。 */
    void fakeAuthenticate(String password);

    record AccountId(UUID value) {
        public AccountId {
            Objects.requireNonNull(value, "account id");
        }
    }

    sealed interface SetResult {

        record Ok(AccountId user) implements SetResult {}

        record TooWeak(List<ValidationViolation> violations) implements SetResult {
            public TooWeak {
                violations = List.copyOf(violations);
            }
        }
    }

    sealed interface AuthenticateResult {

        record Authenticated(AccountId user) implements AuthenticateResult {}

        record Rejected(Reason reason) implements AuthenticateResult {}

        enum Reason {
            BAD_PASSWORD,
            LOCKED
        }
    }

    sealed interface ChangeResult {
        record Ok(AccountId user) implements ChangeResult {}

        record BadPassword() implements ChangeResult {}

        record Locked(Instant until) implements ChangeResult {}

        record TooWeak(List<ValidationViolation> violations) implements ChangeResult {
            public TooWeak {
                violations = List.copyOf(violations);
            }
        }
    }

    record ResetRequest(AccountId user, String token, Instant expiresAt) {}

    sealed interface ResetResult {
        record Ok(AccountId user) implements ResetResult {}

        record TokenInvalid() implements ResetResult {}

        record TooWeak(List<ValidationViolation> violations) implements ResetResult {
            public TooWeak {
                violations = List.copyOf(violations);
            }
        }
    }
}
