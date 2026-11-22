package io.edition.control.modules.managementtoken.application;

import io.edition.control.modules.managementtoken.api.*;
import io.edition.control.modules.managementtoken.api.ManagementTokenApi;
import io.edition.control.modules.managementtoken.domain.ManagementTokenRepository;
import io.edition.control.modules.managementtoken.domain.ManagementTokenSecret;
import io.edition.shared.KeysetCursor;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class ManagementTokenService implements ManagementTokenApi {
    private final ManagementTokenRepository repository;
    private final Clock clock;

    ManagementTokenService(ManagementTokenRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Override
    public IssueResult issue(UUID owner, String name, Set<Scope> scopes, UUID tenant, Instant expiry) {
        if (scopes == null || scopes.isEmpty() || scopes.stream().anyMatch(java.util.Objects::isNull))
            return new IssueResult.InvalidScope();
        if (tenant != null
                && scopes.stream()
                        .anyMatch(scope -> scope.value().startsWith("account:")
                                || scope.value().startsWith("platform:"))) return new IssueResult.InvalidScope();
        Instant now = clock.instant();
        if (expiry == null || !expiry.isAfter(now) || expiry.isAfter(now.plus(365, ChronoUnit.DAYS)))
            return new IssueResult.InvalidExpiry();
        if (name == null
                || name.isBlank()
                || name.strip().codePointCount(0, name.strip().length()) > 120)
            throw new IllegalArgumentException("invalid management token name");
        UUID id = UUID.randomUUID();
        var secret = ManagementTokenSecret.issue(id);
        var metadata = new Metadata(id, owner, name.strip(), scopes, tenant, expiry, now, null, null);
        repository.insert(metadata, secret.hash());
        return new IssueResult.Issued(metadata, secret.secret());
    }

    @Override
    @Transactional(readOnly = true)
    public Authentication authenticate(String secret) {
        var parsed = ManagementTokenSecret.parse(secret);
        if (parsed.isEmpty()) return new Authentication.Invalid();
        var stored = repository.secret(parsed.get().id());
        if (stored.isEmpty()) return new Authentication.Invalid();
        var row = stored.get();
        var token = row.metadata();
        if (!ManagementTokenSecret.matches(row.hash(), parsed.get().hash())
                || token.revokedAt() != null
                || !token.expiry().isAfter(clock.instant())) return new Authentication.Invalid();
        return new Authentication.Authenticated(
                token.id(), token.ownerId(), token.scopes(), token.tenantId(), token.expiry());
    }

    @Override
    @Transactional(readOnly = true)
    public Page ownedBy(UUID owner, String cursor, int limit) {
        var found = repository.ownedBy(owner, KeysetCursor.decode(cursor), limit + 1);
        boolean more = found.size() > limit;
        var items = found.subList(0, Math.min(found.size(), limit));
        String next = more
                ? KeysetCursor.encode(
                        items.getLast().createdAt(), items.getLast().id())
                : null;
        return new Page(items, next);
    }

    @Override
    public void revoke(UUID token, UUID owner) {
        repository.revoke(token, owner, clock.instant());
    }

    @Override
    public void revokeAll(UUID owner) {
        repository.revokeAll(owner, clock.instant());
    }

    @Override
    public void eraseAll(UUID owner) {
        byte[] tombstone = new byte[32];
        new SecureRandom().nextBytes(tombstone);
        repository.eraseAll(owner, clock.instant(), tombstone);
    }

    @Override
    public void touch(UUID token) {
        repository.touch(token, clock.instant());
    }
}
