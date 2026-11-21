package io.edition;

import static org.junit.jupiter.api.Assertions.*;

import io.edition.concepts.idempotency.api.IdempotencyApi;
import io.edition.concepts.idempotency.api.IdempotencyApi.Command;
import io.edition.concepts.idempotency.api.IdempotencyApi.StoredResponse;
import io.edition.concepts.idempotency.api.IdempotencyKeyReusedException;
import io.edition.concepts.idempotency.api.IdempotencyRequestInProgressException;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class RetryBehaviorTest extends PlatformBehaviorSuite {
    @Autowired
    IdempotencyApi retries;

    @Test
    void aRepeatedWriteReturnsTheOriginalResultAndConflictingPayloadsAreRejected() {
        var principal = UUID.randomUUID();
        var write = new Command("user", principal, "publish", "publish-notes", "version-one");
        var original = new StoredResponse(201, "published", "text/plain");
        var other = new StoredResponse(200, "different", "text/plain");
        assertEquals(original, retries.execute(write, () -> original));
        assertEquals(original, retries.execute(write, () -> other));
        var conflict = new Command("user", principal, "publish", "publish-notes", "version-two");
        assertThrows(IdempotencyKeyReusedException.class, () -> retries.execute(conflict, () -> other));
        assertEquals(original, retries.execute(write, () -> other));
    }

    @Test
    void anInterruptedWriteCanBeRetriedAndAnActiveWriteCannotBeReentered() {
        var write = new Command("user", UUID.randomUUID(), "archive", "archive-notes", "notes");
        var success = new StoredResponse(204, "", "application/json");
        assertThrows(
                IdempotencyRequestInProgressException.class,
                () -> retries.execute(write, () -> retries.execute(write, () -> success)));
        assertEquals(success, retries.execute(write, () -> success));
    }

    @Test
    void cleanupIsBoundedAndDoesNotRemoveUnexpiredReceipts() {
        var write = new Command("user", UUID.randomUUID(), "move", "move-notes", "group-two");
        var original = new StoredResponse(200, "moved", "text/plain");
        retries.execute(write, () -> original);
        assertEquals(0, retries.deleteExpired(Instant.EPOCH, 1));
        assertEquals(original, retries.execute(write, () -> new StoredResponse(404, "gone", "text/plain")));
        for (int invalid : new int[] {0, 10001}) {
            assertThrows(IllegalArgumentException.class, () -> retries.deleteExpired(Instant.now(), invalid));
        }
    }
}
