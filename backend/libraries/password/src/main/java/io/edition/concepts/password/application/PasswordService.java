package io.edition.concepts.password.application;

import io.edition.concepts.password.api.*;
import io.edition.concepts.password.application.ports.PasswordStore;
import io.edition.concepts.password.domain.PasswordStrength;
import io.edition.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Password state joins its caller’s primary-database transaction. */
@Service
@Transactional
public class PasswordService implements PasswordApi {
    private static final int MAX_FAILURES = 5;
    private final PasswordStore store;
    private final ApplicationEventPublisher events;
    private final Duration lockDuration;
    private final Duration resetTtl;
    private final Argon2PasswordEncoder passwords = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    private final String dummyHash = passwords.encode(UUID.randomUUID().toString());
    private final SecureRandom random = new SecureRandom();

    public PasswordService(
            PasswordStore store,
            ApplicationEventPublisher events,
            @Value("${identity.password.lock-duration:PT15M}") Duration lockDuration,
            @Value("${identity.password.reset-ttl:PT30M}") Duration resetTtl) {
        this.store = store;
        this.events = events;
        this.lockDuration = lockDuration;
        this.resetTtl = resetTtl;
    }

    public SetResult set(AccountId user, String password) {
        var violations = PasswordStrength.violations(password);
        if (!violations.isEmpty()) return new SetResult.TooWeak(violations);
        String encoded = passwords.encode(password);
        store.lock(user.value());
        store.set(user.value(), encoded);
        events.publishEvent(new PasswordEvents.PasswordSet(user));
        return new SetResult.Ok(user);
    }

    public AuthenticateResult authenticate(AccountId user, String password) {
        return switch (verify(user.value(), password)) {
            case ChangeResult.Ok ignored -> new AuthenticateResult.Authenticated(user);
            case ChangeResult.Locked ignored -> new AuthenticateResult.Rejected(AuthenticateResult.Reason.LOCKED);
            case ChangeResult.BadPassword ignored ->
                new AuthenticateResult.Rejected(AuthenticateResult.Reason.BAD_PASSWORD);
            case ChangeResult.TooWeak ignored ->
                throw new IllegalStateException("verification cannot validate new password strength");
        };
    }

    private ChangeResult verify(UUID user, String password) {
        store.lock(user);
        var row = store.accounts(user).stream().findFirst().orElse(null);
        if (row == null) {
            fakeAuthenticate(password);
            return new ChangeResult.BadPassword();
        }
        if (row.lockedUntil() != null && row.lockedUntil().isAfter(Instant.now()))
            return new ChangeResult.Locked(row.lockedUntil());
        if (password == null || !passwords.matches(password, row.hash())) {
            int failures = (row.lockedUntil() == null ? row.failures() : 0) + 1;
            Instant until = failures >= MAX_FAILURES ? Instant.now().plus(lockDuration) : null;
            store.failures(user, failures, until);
            return until == null ? new ChangeResult.BadPassword() : new ChangeResult.Locked(until);
        }
        store.clearFailures(user);
        return new ChangeResult.Ok(new AccountId(user));
    }

    public ChangeResult change(AccountId user, String oldPassword, String newPassword) {
        var violations = PasswordStrength.violations(newPassword);
        if (!violations.isEmpty()) return new ChangeResult.TooWeak(violations);
        var verified = verify(user.value(), oldPassword);
        if (!(verified instanceof ChangeResult.Ok)) return verified;
        store.replace(user.value(), passwords.encode(newPassword));
        events.publishEvent(new PasswordEvents.PasswordChanged(user));
        return new ChangeResult.Ok(user);
    }

    public ResetRequest requestReset(AccountId user) {
        store.lock(user.value());
        if (!store.isSet(user.value())) throw new IllegalStateException("password is not set");
        String token = secret();
        Instant expires = Instant.now().plus(resetTtl);
        store.requestReset(user.value(), hash(token), expires);
        events.publishEvent(new PasswordEvents.ResetRequested(user));
        return new ResetRequest(user, token, expires);
    }

    public ResetResult reset(String token, String newPassword) {
        var violations = PasswordStrength.violations(newPassword);
        if (!violations.isEmpty()) return new ResetResult.TooWeak(violations);
        if (token == null || token.isBlank()) return new ResetResult.TokenInvalid();
        var users = store.lockResetOwners(hash(token));
        if (users.isEmpty()) return new ResetResult.TokenInvalid();
        var user = new AccountId(users.getFirst());
        store.replace(user.value(), passwords.encode(newPassword));
        events.publishEvent(new PasswordEvents.PasswordReset(user));
        return new ResetResult.Ok(user);
    }

    @Transactional(readOnly = true)
    public Optional<AccountId> resetOwner(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        return store.resetOwners(hash(token)).stream().findFirst().map(AccountId::new);
    }

    @Transactional(readOnly = true)
    public boolean isSet(AccountId user) {
        return store.isSet(user.value());
    }

    @Transactional(readOnly = true)
    public boolean resetPending(AccountId user, String token) {
        return token != null && !token.isBlank() && store.resetPending(user.value(), hash(token));
    }

    public void terminate(AccountId user) {
        store.lock(user.value());
        store.terminate(user.value());
    }

    public void fakeAuthenticate(String password) {
        passwords.matches(password == null ? "" : password, dummyHash);
    }

    private String secret() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String token) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(Sha256.digest(token.getBytes(StandardCharsets.UTF_8)));
    }
}
