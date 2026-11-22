package io.edition.control.modules.idempotency.api;

import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;
import org.junit.jupiter.api.Test;

class ReplayInputTest {
    @Test
    void receiptKeysMustIdentifyASingleRequestWithinTheStorageLimit() {
        var actor = UUID.randomUUID();
        assertDoesNotThrow(() -> new IdempotencyApi.Command("user", actor, "archive", "x".repeat(255), "rev1"));
        for (String bad : new String[] {" ", "x".repeat(256)}) {
            assertThrows(
                    IllegalArgumentException.class,
                    () -> new IdempotencyApi.Command("user", actor, "archive", bad, "rev1"));
        }
    }

    @Test
    void aReceiptCanOnlyRepresentAValidHttpResponse() {
        assertThrows(IllegalArgumentException.class, () -> new IdempotencyApi.StoredResponse(99, "", "text/plain"));
        assertThrows(IllegalArgumentException.class, () -> new IdempotencyApi.StoredResponse(600, "", "text/plain"));
        assertThrows(IllegalArgumentException.class, () -> new IdempotencyApi.StoredResponse(200, "", " "));
    }
}
