package io.edition.control.modules.apitoken.persistence;

import io.edition.control.modules.apitoken.api.*;
import io.edition.control.modules.apitoken.api.ApiTokenApi;
import io.edition.control.modules.apitoken.api.ApiTokenApi.Metadata;
import io.edition.control.modules.apitoken.api.ApiTokenApi.TokenId;
import io.edition.control.modules.apitoken.domain.ApiTokenRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

/** 仅翻译本概念的持久值；认证窄查询由数据库函数处理租户尚未解析的入口。 */
@Repository
class MyBatisApiTokenRepository implements ApiTokenRepository {
    private final ApiTokenMapper mapper;

    MyBatisApiTokenRepository(ApiTokenMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void insert(
            TokenId id,
            UUID owner,
            UUID tenant,
            UUID space,
            String name,
            byte[] secretHash,
            Set<String> scopes,
            Instant expiry,
            Instant createdAt) {
        mapper.insert(
                id.value(),
                owner,
                tenant,
                space,
                name,
                secretHash,
                scopes.stream().sorted().toList(),
                expiry,
                createdAt);
    }

    @Override
    public Optional<SecretRow> secret(TokenId id) {
        return Optional.ofNullable(mapper.secret(id.value())).map(MyBatisApiTokenRepository::secret);
    }

    @Override
    public List<SecretRow> verifiers(UUID tenant) {
        return mapper.verifiers(tenant).stream()
                .map(MyBatisApiTokenRepository::secret)
                .toList();
    }

    /** 认证与交付投影共用散列、过期和撤销字段的翻译，避免两条读取路径漂移。 */
    private static SecretRow secret(ApiTokenMapper.SecretRow row) {
        return new SecretRow(
                new TokenId(row.id()),
                row.tenantId(),
                row.spaceId(),
                row.secretHash(),
                Set.copyOf(Arrays.asList(row.scopes().split(","))),
                row.expiresAt(),
                row.revokedAt());
    }

    @Override
    public Optional<Metadata> metadata(TokenId id) {
        return Optional.ofNullable(mapper.metadata(id.value())).map(MyBatisApiTokenRepository::metadata);
    }

    @Override
    public List<Metadata> ownedBy(UUID owner, UUID tenant, boolean includeRevoked) {
        return mapper.ownedBy(owner, tenant, includeRevoked).stream()
                .map(MyBatisApiTokenRepository::metadata)
                .toList();
    }

    @Override
    public List<Metadata> ownedBy(UUID owner, boolean includeRevoked) {
        return mapper.ownedByAcrossTenants(owner, includeRevoked).stream()
                .map(MyBatisApiTokenRepository::metadata)
                .toList();
    }

    @Override
    public List<Metadata> inSpace(UUID tenant, UUID space, boolean includeRevoked) {
        return mapper.inSpace(tenant, space, includeRevoked).stream()
                .map(MyBatisApiTokenRepository::metadata)
                .toList();
    }

    @Override
    public void revoke(TokenId id, Instant revokedAt) {
        mapper.revoke(id.value(), revokedAt);
    }

    @Override
    public void anonymize(TokenId id, Instant revokedAt, byte[] tombstoneHash) {
        mapper.anonymize(id.value(), revokedAt, tombstoneHash);
    }

    private static Metadata metadata(ApiTokenMapper.MetadataRow row) {
        Set<ApiTokenApi.Scope> scopes = Arrays.stream(row.scopes().split(","))
                .map(ApiTokenApi.Scope::parse)
                .collect(Collectors.toUnmodifiableSet());
        return new Metadata(
                new TokenId(row.id()),
                row.ownerId(),
                row.tenantId(),
                row.spaceId(),
                row.name(),
                scopes,
                row.expiresAt(),
                row.revokedAt(),
                row.createdAt());
    }
}
