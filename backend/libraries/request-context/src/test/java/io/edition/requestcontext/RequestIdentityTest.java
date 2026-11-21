package io.edition.requestcontext;

import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;

class RequestIdentityTest {
    @Test
    void anonymousWorkCannotInheritTheCallersCredentialAndTheNextRequestStartsClean() {
        var caller = UUID.randomUUID();
        try (var request = CredentialAuditContext.open(caller)) {
            assertNull(CompletableFuture.supplyAsync(CredentialAuditContext::current)
                    .join());
            try (var anonymous = CredentialAuditContext.open(null)) {
                assertNull(CredentialAuditContext.current());
            }
            assertEquals(caller, CredentialAuditContext.current());
        }
        assertNull(CredentialAuditContext.current());
    }
}
