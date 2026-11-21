package io.edition.concepts.managementtoken.domain;

import io.edition.concepts.managementtoken.api.*;
import io.edition.concepts.managementtoken.api.ManagementTokenApi.Metadata;
import io.edition.shared.KeysetCursor;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManagementTokenRepository {
    void insert(Metadata metadata, byte[] hash);

    Optional<SecretRow> secret(UUID id);

    List<Metadata> ownedBy(UUID owner, Optional<KeysetCursor> cursor, int limit);

    void revoke(UUID id, UUID owner, Instant now);

    void revokeAll(UUID owner, Instant now);

    void eraseAll(UUID owner, Instant now, byte[] tombstoneHash);

    void touch(UUID id, Instant now);

    record SecretRow(Metadata metadata, byte[] hash) {
        public SecretRow {
            hash = hash.clone();
        }

        @Override
        public byte[] hash() {
            return hash.clone();
        }

        @Override
        public String toString() {
            return "SecretRow[metadata=" + metadata + ", hash=REDACTED]";
        }
    }
}
