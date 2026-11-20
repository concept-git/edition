package io.space.concepts.managementtoken.adapters.persistence;

import io.space.concepts.managementtoken.api.*;
import io.space.concepts.managementtoken.api.ManagementTokenApi.Metadata;
import io.space.concepts.managementtoken.api.ManagementTokenApi.Scope;
import io.space.concepts.managementtoken.domain.ManagementTokenRepository;
import io.space.shared.KeysetCursor;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisManagementTokenRepository implements ManagementTokenRepository {
    private final ManagementTokenMapper mapper;

    MyBatisManagementTokenRepository(ManagementTokenMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void insert(Metadata token, byte[] hash) {
        mapper.insert(
                token, hash, token.scopes().stream().map(Scope::value).sorted().toList());
    }

    @Override
    public Optional<SecretRow> secret(UUID id) {
        return Optional.ofNullable(mapper.secret(id)).map(row -> new SecretRow(metadata(row), row.secretHash()));
    }

    @Override
    public List<Metadata> ownedBy(UUID owner, Optional<KeysetCursor> cursor, int limit) {
        return mapper
                .ownedBy(
                        owner,
                        cursor.map(KeysetCursor::at).orElse(null),
                        cursor.map(KeysetCursor::id).orElse(null),
                        limit)
                .stream()
                .map(MyBatisManagementTokenRepository::metadata)
                .toList();
    }

    @Override
    public void revoke(UUID id, UUID owner, Instant now) {
        mapper.revoke(id, owner, now);
    }

    @Override
    public void revokeAll(UUID owner, Instant now) {
        mapper.revokeAll(owner, now);
    }

    @Override
    public void eraseAll(UUID owner, Instant now, byte[] hash) {
        mapper.eraseAll(owner, now, hash);
    }

    @Override
    public void touch(UUID id, Instant now) {
        mapper.touch(id, now);
    }

    private static Metadata metadata(ManagementTokenMapper.Row row) {
        return new Metadata(
                row.id(),
                row.ownerId(),
                row.name(),
                Arrays.stream(row.scopes().split(",")).map(Scope::parse).collect(Collectors.toUnmodifiableSet()),
                row.tenantId(),
                row.expiresAt(),
                row.createdAt(),
                row.lastUsedAt(),
                row.revokedAt());
    }
}
