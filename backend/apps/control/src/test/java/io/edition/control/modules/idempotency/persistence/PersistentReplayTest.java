package io.edition.control.modules.idempotency.persistence;

import static org.junit.jupiter.api.Assertions.*;

import io.edition.control.modules.idempotency.api.IdempotencyApi.Command;
import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class PersistentReplayTest {
    private final ApplicationContextRunner service =
            new ApplicationContextRunner().withUserConfiguration(IdempotencyEncryptionConfiguration.class);

    @Test
    void restartingWithTheSameKeyCanRecoverOnlyTheOriginalCallersReceipt() {
        var settings = service.withPropertyValues(
                "io.edition.idempotency.encryption-key=" + Base64.getEncoder().encodeToString(new byte[32]));
        var original = new Command("user", UUID.randomUUID(), "issue", "one", "body");
        var other = new Command("user", UUID.randomUUID(), "issue", "one", "body");
        settings.run(first -> {
            String receipt = first.getBean(IdempotencyResponseCipher.class).encrypt(original, "private result");
            assertFalse(receipt.contains("private result"));
            settings.run(restarted -> {
                var reader = restarted.getBean(IdempotencyResponseCipher.class);
                assertEquals("private result", reader.decrypt(original, receipt));
                assertThrows(IllegalStateException.class, () -> reader.decrypt(other, receipt));
                assertThrows(IllegalStateException.class, () -> reader.decrypt(original, "unrecognized receipt"));
            });
        });
    }

    @Test
    void productionCannotStartWithAnAbsentOrUnusableReplayKey() {
        for (String key : new String[] {"", "invalid!", "YQ=="}) {
            service.withPropertyValues("io.edition.idempotency.encryption-key=" + key)
                    .run(ctx -> assertNotNull(ctx.getStartupFailure()));
        }
    }
}
