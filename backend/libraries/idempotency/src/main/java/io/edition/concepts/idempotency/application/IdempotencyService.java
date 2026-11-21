package io.edition.concepts.idempotency.application;

import io.edition.concepts.idempotency.api.*;
import io.edition.concepts.idempotency.api.IdempotencyApi;
import io.edition.concepts.idempotency.api.IdempotencyKeyReusedException;
import io.edition.concepts.idempotency.api.IdempotencyRequestInProgressException;
import io.edition.concepts.idempotency.domain.IdempotencyRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.function.Supplier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class IdempotencyService implements IdempotencyApi {

    static final Duration TTL = Duration.ofHours(24);

    private final IdempotencyRepository repository;
    private final Clock clock;

    IdempotencyService(IdempotencyRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Override
    @Transactional
    public StoredResponse execute(Command command, Supplier<StoredResponse> action) {
        Instant now = clock.instant();
        repository.deleteExpired(command, now);

        if (repository.insertProcessing(command, now, now.plus(TTL))) {
            StoredResponse response = action.get();
            repository.complete(command, response);
            return response;
        }

        var existing = repository
                .find(command)
                .orElseThrow(() -> new IllegalStateException("conflicting idempotency record disappeared"));
        if (!existing.requestFingerprint().equals(command.requestFingerprint())) {
            throw new IdempotencyKeyReusedException();
        }
        if (existing.state() == IdempotencyRepository.Record.State.PROCESSING) {
            throw new IdempotencyRequestInProgressException();
        }
        return existing.response();
    }

    @Override
    @Transactional
    public int deleteExpired(Instant cutoff, int limit) {
        if (limit < 1 || limit > 10_000) {
            throw new IllegalArgumentException("cleanup limit must be between 1 and 10000");
        }
        return repository.deleteExpired(cutoff, limit);
    }
}
