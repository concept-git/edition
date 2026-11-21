package io.edition.concepts.apitoken.application;

import io.edition.concepts.apitoken.api.*;
import io.edition.concepts.apitoken.api.ApiTokenApi;
import io.edition.concepts.apitoken.domain.ApiTokenRepository;
import io.edition.concepts.apitoken.domain.ApiTokenSecret;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 校验签发上限并存散列；吊销与匿名化事件和事实同事务提交，认证始终只读。 */
@Service
@Transactional
class ApiTokenService implements ApiTokenApi {
    private static final Set<Scope> ALLOWED_SCOPES = Set.of(Scope.READ, Scope.WRITE, Scope.PUBLISH);
    private final ApiTokenRepository repository;
    private final SecureRandom random = new SecureRandom();
    private final Clock clock;
    private final org.springframework.context.ApplicationEventPublisher events;

    ApiTokenService(
            ApiTokenRepository repository, Clock clock, org.springframework.context.ApplicationEventPublisher events) {
        this.repository = repository;
        this.clock = clock;
        this.events = events;
    }

    @Override
    public IssueResult issue(UUID owner, UUID tenant, UUID space, String name, Set<Scope> scopes, Instant expiry) {
        if (scopes == null || scopes.isEmpty() || !ALLOWED_SCOPES.containsAll(scopes)) {
            return new IssueResult.InvalidScope();
        }
        Instant now = clock.instant();
        if (expiry == null || !expiry.isAfter(now) || expiry.isAfter(now.plus(365, ChronoUnit.DAYS))) {
            return new IssueResult.InvalidExpiry();
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("token name must not be blank");
        }

        TokenId id = new TokenId(UUID.randomUUID());
        ApiTokenSecret.Issued secret = ApiTokenSecret.issue(id.value());
        repository.insert(
                id,
                owner,
                tenant,
                space,
                name.strip(),
                secret.hash(),
                scopes.stream().map(Scope::value).collect(Collectors.toUnmodifiableSet()),
                expiry,
                now);
        Metadata metadata =
                repository.metadata(id).orElseThrow(() -> new IllegalStateException("issued token was not persisted"));
        events.publishEvent(new io.edition.concepts.apitoken.api.ApiTokenEvents.Changed(id));
        return new IssueResult.Issued(metadata, secret.secret());
    }

    @Override
    public void revoke(TokenId token) {
        repository.revoke(token, clock.instant());
        events.publishEvent(new io.edition.concepts.apitoken.api.ApiTokenEvents.Changed(token));
    }

    @Override
    public void anonymize(TokenId token) {
        var tombstoneHash = new byte[32];
        random.nextBytes(tombstoneHash);
        repository.anonymize(token, clock.instant(), tombstoneHash);
        events.publishEvent(new io.edition.concepts.apitoken.api.ApiTokenEvents.Changed(token));
    }

    @Override
    @Transactional(readOnly = true)
    public Authentication authenticate(String secret) {
        var parsed = ApiTokenSecret.parse(secret);
        if (parsed.isEmpty()) return new Authentication.Invalid();
        var stored = repository.secret(new TokenId(parsed.orElseThrow().tokenId()));
        if (stored.isEmpty()) return new Authentication.Invalid();
        var row = stored.orElseThrow();
        if (!ApiTokenSecret.matches(row.secretHash(), parsed.orElseThrow().hash())
                || row.revokedAt() != null
                || !row.expiry().isAfter(clock.instant())) {
            return new Authentication.Invalid();
        }
        Set<Scope> scopes = row.scopes().stream().map(Scope::parse).collect(Collectors.toUnmodifiableSet());
        return new Authentication.Authenticated(row.id(), row.tenantId(), row.spaceId(), scopes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Metadata> ownedBy(UUID owner, UUID tenant, boolean includeRevoked) {
        return repository.ownedBy(owner, tenant, includeRevoked);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Metadata> ownedBy(UUID owner, boolean includeRevoked) {
        return repository.ownedBy(owner, includeRevoked);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Metadata> inSpace(UUID tenant, UUID space, boolean includeRevoked) {
        return repository.inSpace(tenant, space, includeRevoked);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Metadata> metadata(TokenId token) {
        return repository.metadata(token);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Verifier> verifiers(UUID tenant) {
        return repository.verifiers(tenant).stream()
                .map(row -> new Verifier(
                        row.id().value(),
                        row.tenantId(),
                        row.spaceId(),
                        java.util.HexFormat.of().formatHex(row.secretHash()),
                        row.scopes().stream().map(Scope::parse).collect(Collectors.toUnmodifiableSet()),
                        row.expiry(),
                        row.revokedAt() == null))
                .toList();
    }
}
