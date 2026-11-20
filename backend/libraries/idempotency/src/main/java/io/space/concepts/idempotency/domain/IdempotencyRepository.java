package io.space.concepts.idempotency.domain;

import io.space.concepts.idempotency.api.*;
import io.space.concepts.idempotency.api.IdempotencyApi.Command;
import io.space.concepts.idempotency.api.IdempotencyApi.StoredResponse;
import java.time.Instant;
import java.util.Optional;

public interface IdempotencyRepository {

    int deleteExpired(Command scope, Instant now);

    boolean insertProcessing(Command command, Instant createdAt, Instant expiresAt);

    Optional<Record> find(Command scope);

    void complete(Command scope, StoredResponse response);

    int deleteExpired(Instant cutoff, int limit);

    record Record(String requestFingerprint, State state, StoredResponse response) {
        public enum State {
            PROCESSING,
            COMPLETED
        }
    }
}
