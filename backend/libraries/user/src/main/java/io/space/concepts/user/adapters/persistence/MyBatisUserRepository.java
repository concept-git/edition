package io.space.concepts.user.adapters.persistence;

import io.space.concepts.user.api.*;
import io.space.concepts.user.api.UserApi.AccountProfile;
import io.space.concepts.user.api.UserApi.Profile;
import io.space.concepts.user.api.UserApi.SearchItem;
import io.space.concepts.user.api.UserApi.Status;
import io.space.concepts.user.api.UserApi.UserId;
import io.space.concepts.user.domain.EmailVerification.Challenge;
import io.space.concepts.user.domain.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/** 只翻译本概念的身份值；字面前缀先转义 SQL 通配符，查询故障直接向外传播。 */
@Repository
class MyBatisUserRepository implements UserRepository {

    private final UserMapper mapper;

    MyBatisUserRepository(UserMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public long readerEpoch(UserId user) {
        return mapper.readerEpoch(user.value());
    }

    @Override
    public long revokeReaderSessions(UserId user) {
        return mapper.revokeReaderSessions(user.value());
    }

    @Override
    public Optional<UserId> insert(String email, String name, String verifyTokenHash, Instant verifyExpiresAt) {
        return Optional.ofNullable(mapper.insertUser(email, name, verifyTokenHash, verifyExpiresAt))
                .map(id -> new UserId(UUID.fromString(id)));
    }

    @Override
    public Optional<Challenge> verification(UserId user) {
        return Optional.ofNullable(mapper.findChallenge(user.value()))
                .map(row -> new Challenge(row.verifyTokenHash(), row.verifyExpiresAt(), row.verified()));
    }

    @Override
    public void markVerified(UserId user) {
        mapper.markVerified(user.value());
    }

    @Override
    public void replaceVerification(UserId user, String hash, java.time.Instant expiresAt) {
        mapper.replaceVerification(user.value(), hash, expiresAt);
    }

    @Override
    public Optional<UserId> findByEmail(String email) {
        return Optional.ofNullable(mapper.findIdByEmail(email)).map(id -> new UserId(UUID.fromString(id)));
    }

    @Override
    public boolean isPlatformOperator(UserId user) {
        return Boolean.TRUE.equals(mapper.isPlatformOperator(user.value()));
    }

    @Override
    public Optional<Profile> findProfile(UserId user) {
        return Optional.ofNullable(mapper.findProfile(user.value()))
                .map(row -> new Profile(row.name(), row.verified()));
    }

    @Override
    public Optional<AccountProfile> findAccountProfile(UserId user) {
        return Optional.ofNullable(mapper.findAccountProfile(user.value())).map(MyBatisUserRepository::accountProfile);
    }

    @Override
    public Optional<AccountProfile> lockAccountProfile(UserId user) {
        return Optional.ofNullable(mapper.lockAccountProfile(user.value())).map(MyBatisUserRepository::accountProfile);
    }

    @Override
    public List<SearchItem> search(String queryPrefix, UserId before, int limit) {
        String literal = queryPrefix.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return mapper.search(literal + "%", before == null ? null : before.value(), limit).stream()
                .map(row -> new SearchItem(
                        new UserId(UUID.fromString(row.id())),
                        row.email(),
                        row.name(),
                        Status.valueOf(row.status().toUpperCase(Locale.ROOT)),
                        row.platformOperator(),
                        row.updatedAt()))
                .toList();
    }

    @Override
    public void updateProfile(UserId user, String name, String locale, String avatar) {
        mapper.updateProfile(user.value(), name, locale, avatar);
    }

    @Override
    public void setStatus(UserId user, String status) {
        mapper.setStatus(user.value(), status);
    }

    @Override
    public void erase(UserId user) {
        if (mapper.erase(user.value()) != 1) {
            throw new IllegalStateException("user must be deactivated before erase");
        }
    }

    private static AccountProfile accountProfile(UserMapper.AccountProfileRow row) {
        return new AccountProfile(
                new UserId(UUID.fromString(row.id())),
                row.email(),
                row.name(),
                row.avatarUrl(),
                row.locale(),
                row.verified(),
                Status.valueOf(row.status().toUpperCase(Locale.ROOT)),
                row.platformOperator());
    }
}
