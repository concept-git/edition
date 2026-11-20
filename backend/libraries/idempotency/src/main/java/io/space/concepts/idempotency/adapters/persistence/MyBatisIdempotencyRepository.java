package io.space.concepts.idempotency.adapters.persistence;

import io.space.concepts.idempotency.api.*;
import io.space.concepts.idempotency.api.IdempotencyApi.Command;
import io.space.concepts.idempotency.api.IdempotencyApi.StoredResponse;
import io.space.concepts.idempotency.domain.IdempotencyRepository;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisIdempotencyRepository implements IdempotencyRepository {

    private final IdempotencyMapper mapper;
    private final IdempotencyResponseCipher responseCipher;

    MyBatisIdempotencyRepository(IdempotencyMapper mapper, IdempotencyResponseCipher responseCipher) {
        this.mapper = mapper;
        this.responseCipher = responseCipher;
    }

    @Override
    public int deleteExpired(Command scope, Instant now) {
        return mapper.deleteScopeIfExpired(
                scope.principalType(), scope.principalId(), scope.operation(), scope.key(), now);
    }

    @Override
    public boolean insertProcessing(Command command, Instant createdAt, Instant expiresAt) {
        return mapper.insertProcessing(
                        command.principalType(),
                        command.principalId(),
                        command.operation(),
                        command.key(),
                        command.requestFingerprint(),
                        createdAt,
                        expiresAt)
                == 1;
    }

    @Override
    public Optional<Record> find(Command scope) {
        return Optional.ofNullable(
                        mapper.find(scope.principalType(), scope.principalId(), scope.operation(), scope.key()))
                .map(row -> record(scope, row));
    }

    @Override
    public void complete(Command scope, StoredResponse response) {
        int changed = mapper.complete(
                scope.principalType(),
                scope.principalId(),
                scope.operation(),
                scope.key(),
                response.status(),
                responseCipher.encrypt(scope, response.body()),
                response.contentType());
        if (changed != 1) {
            throw new IllegalStateException("idempotency record was not processing");
        }
    }

    @Override
    public int deleteExpired(Instant cutoff, int limit) {
        return mapper.deleteExpired(cutoff, limit);
    }

    private Record record(Command scope, IdempotencyMapper.Row row) {
        var state = Record.State.valueOf(row.state().toUpperCase(Locale.ROOT));
        StoredResponse response = state == Record.State.COMPLETED
                ? new StoredResponse(
                        row.responseStatus(),
                        responseCipher.decrypt(
                                new Command(
                                        scope.principalType(),
                                        scope.principalId(),
                                        scope.operation(),
                                        scope.key(),
                                        row.requestFingerprint()),
                                row.responseBody()),
                        row.responseContentType())
                : null;
        return new Record(row.requestFingerprint(), state, response);
    }
}
