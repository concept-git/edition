package io.edition.control.modules.apitoken.domain;

import io.edition.control.modules.apitoken.api.*;
import io.edition.control.modules.apitoken.api.ApiTokenApi.Metadata;
import io.edition.control.modules.apitoken.api.ApiTokenApi.TokenId;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface ApiTokenRepository {
    void insert(
            TokenId id,
            UUID owner,
            UUID tenant,
            UUID space,
            String name,
            byte[] secretHash,
            Set<String> scopes,
            Instant expiry,
            Instant createdAt);

    Optional<SecretRow> secret(TokenId id);

    List<SecretRow> verifiers(UUID tenant);

    Optional<Metadata> metadata(TokenId id);

    List<Metadata> ownedBy(UUID owner, UUID tenant, boolean includeRevoked);

    List<Metadata> ownedBy(UUID owner, boolean includeRevoked);

    List<Metadata> inSpace(UUID tenant, UUID space, boolean includeRevoked);

    void revoke(TokenId id, Instant revokedAt);

    void anonymize(TokenId id, Instant revokedAt, byte[] tombstoneHash);

    record SecretRow(
            TokenId id,
            UUID tenantId,
            UUID spaceId,
            byte[] secretHash,
            Set<String> scopes,
            Instant expiry,
            Instant revokedAt) {
        public SecretRow {
            secretHash = secretHash.clone();
            scopes = Set.copyOf(scopes);
        }

        @Override
        public byte[] secretHash() {
            return secretHash.clone();
        }
    }
}
