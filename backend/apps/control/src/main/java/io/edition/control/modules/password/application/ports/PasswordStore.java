package io.edition.control.modules.password.application.ports;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Credential state, independent of the account concept and joined to the caller's transaction. */
public interface PasswordStore {
    record Account(String hash, int failures, Instant lockedUntil) {}

    void set(UUID user, String encoded);

    void failures(UUID user, int failures, Instant until);

    void clearFailures(UUID user);

    void replace(UUID user, String encoded);

    void requestReset(UUID user, String tokenHash, Instant expires);

    List<UUID> lockResetOwners(String tokenHash);

    List<UUID> resetOwners(String tokenHash);

    boolean isSet(UUID user);

    boolean resetPending(UUID user, String tokenHash);

    void terminate(UUID user);

    void lock(UUID user);

    List<Account> accounts(UUID user);
}
