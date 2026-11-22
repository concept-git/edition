package io.edition.control.modules.user.api;

import io.edition.shared.ValidationViolation;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * User 概念的唯一对外门面。error case 是可被 sync 匹配的输出（sealed 结果变体），
 * 业务可达失败不抛异常；前置违反（空参等）直接抛，属编程错误。
 */
public interface UserApi {
    /** Current version for independently scoped reader sessions. */
    long readerEpoch(UserId user);

    /** Advance the account's reader session version in the caller's transaction. */
    long revokeReaderSessions(UserId user);

    int MIN_SEARCH_PREFIX_LENGTH = 2;

    RegisterResult register(String email, String name);

    VerifyResult verify(UserId user, String token);

    Optional<Verification> requestVerification(UserId user);

    boolean verificationPending(UserId user, String token);

    record Verification(String token, Instant expiresAt) {}

    Optional<UserId> byEmail(String email);

    Optional<Profile> profile(UserId user);

    Optional<AccountProfile> accountProfile(UserId user);

    Optional<AccountProfile> lockAccountProfile(UserId user);

    boolean isActive(UserId user);

    /**
     * 平台运营员标记（由运维手工置位）。只解锁平台运维面，对租户内资源零隐式权限——
     * 于是"运营员看过客户内容"必然留下一条授权痕迹。
     */
    boolean isPlatformOperator(UserId user);

    UpdateProfileResult updateProfile(UserId user, String name, String locale, String avatar);

    LifecycleResult deactivate(UserId user);

    LifecycleResult reactivate(UserId user);

    EraseResult erase(UserId user);

    SearchPage search(String query, String cursor, int limit);

    record UserId(UUID value) {
        public UserId {
            Objects.requireNonNull(value, "user id");
        }
    }

    sealed interface RegisterResult {

        /** verifyToken 明文只交给邮件投递编排，绝不进入 HTTP 响应或日志。 */
        record Registered(UserId user, String verifyToken) implements RegisterResult {}

        record EmailTaken(String email) implements RegisterResult {}
    }

    sealed interface VerifyResult {

        record Verified(UserId user) implements VerifyResult {}

        record Rejected() implements VerifyResult {}
    }

    record Profile(String name, boolean verified) {}

    record AccountProfile(
            UserId id,
            String email,
            String name,
            String avatar,
            String locale,
            boolean verified,
            Status status,
            boolean platformOperator) {}

    enum Status {
        ACTIVE,
        DEACTIVATED,
        ERASED
    }

    record SearchItem(
            UserId id, String email, String name, Status status, boolean platformOperator, Instant updatedAt) {}

    record SearchPage(List<SearchItem> users, String nextCursor) {
        public SearchPage {
            users = List.copyOf(users);
        }
    }

    sealed interface LifecycleResult {
        record Ok(Status status, boolean changed) implements LifecycleResult {}

        record NotFound() implements LifecycleResult {}

        record Erased() implements LifecycleResult {}
    }

    sealed interface EraseResult {
        record Ok(boolean changed) implements EraseResult {}

        record NotFound() implements EraseResult {}

        record MustBeDeactivated() implements EraseResult {}
    }

    sealed interface UpdateProfileResult {
        record Updated(AccountProfile profile) implements UpdateProfileResult {}

        record Rejected(List<ValidationViolation> violations) implements UpdateProfileResult {
            public Rejected {
                violations = List.copyOf(violations);
            }
        }
    }
}
