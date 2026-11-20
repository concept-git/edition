package io.space.concepts.user.domain;

import io.space.concepts.user.api.*;
import io.space.concepts.user.api.UserApi.AccountProfile;
import io.space.concepts.user.api.UserApi.Profile;
import io.space.concepts.user.api.UserApi.SearchItem;
import io.space.concepts.user.api.UserApi.UserId;
import io.space.concepts.user.domain.EmailVerification.Challenge;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/** 全局身份持久化端口；账户行锁保护验证及生命周期，抹除后稳定 id 仍保留。 */
public interface UserRepository {
    long readerEpoch(UserId user);

    long revokeReaderSessions(UserId user);

    /** 邮箱唯一性由 DB 约束守护：占用时返回 empty（并发安全）。 */
    Optional<UserId> insert(String email, String name, String verifyTokenHash, Instant verifyExpiresAt);

    Optional<Challenge> verification(UserId user);

    void markVerified(UserId user);

    void replaceVerification(UserId user, String tokenHash, Instant expiresAt);

    Optional<UserId> findByEmail(String email);

    boolean isPlatformOperator(UserId user);

    Optional<Profile> findProfile(UserId user);

    Optional<AccountProfile> findAccountProfile(UserId user);

    Optional<AccountProfile> lockAccountProfile(UserId user);

    List<SearchItem> search(String queryPrefix, UserId before, int limit);

    void updateProfile(UserId user, String name, String locale, String avatar);

    void setStatus(UserId user, String status);

    void erase(UserId user);
}
