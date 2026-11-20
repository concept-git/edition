package io.space.concepts.session.application;

import io.space.concepts.session.api.*;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.session.api.SessionEvents;
import io.space.concepts.session.domain.SessionRepository;
import io.space.shared.KeysetCursor;
import io.space.shared.PageWindow;
import io.space.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.util.Base64;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 会话及刷新轮换的事务入口；绝对期限不续期，状态加入调用方主库事务。 */
@Service
@Transactional
class SessionService implements SessionApi {
    private static final Logger log = LoggerFactory.getLogger(SessionService.class);
    private static final Duration REFRESH_TTL = Duration.ofDays(30);
    private static final Duration REPLAY_GRACE = Duration.ofSeconds(10);
    private static final Duration TOUCH_INTERVAL = Duration.ofMinutes(5);

    private final SessionRepository repository;
    private final JwtEncoder encoder;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    private final Duration accessTtl;
    private final String keyId;
    private final org.springframework.context.ApplicationEventPublisher events;

    SessionService(
            SessionRepository repository,
            JwtEncoder encoder,
            Clock clock,
            @Value("${io.space.session.access-ttl:PT10M}") Duration accessTtl,
            @Value("${io.space.session.key-id:space-session-1}") String keyId,
            org.springframework.context.ApplicationEventPublisher events) {
        this.repository = repository;
        this.encoder = encoder;
        this.clock = clock;
        this.accessTtl = accessTtl;
        this.keyId = keyId;
        this.events = events;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<SessionId, Info> snapshots(java.util.Set<SessionId> ids) {
        return repository.snapshots(ids, clock.instant());
    }

    @Override
    public StartResult start(HolderId holder, Device device, String approximateIp) {
        var now = clock.instant();
        var refresh = randomToken();
        var session = repository.insert(holder, hash(refresh), device, approximateIp, now.plus(REFRESH_TTL), now);
        var credentials = credentials(session, holder, refresh, now);
        log.atInfo()
                .addKeyValue("event", "session.started")
                .addKeyValue("sessionId", session.value())
                .addKeyValue("principalId", holder.value())
                .log("session started");
        return new StartResult.Started(credentials);
    }

    @Override
    public RenewResult renew(String refreshToken) {
        var now = clock.instant();
        var presentedHash = hash(refreshToken);
        var state = repository.lockByRefreshHash(presentedHash).orElse(null);
        if (state == null || state.endedAt() != null) {
            return new RenewResult.Rejected(RenewResult.Reason.INVALID);
        }
        if (!state.expiresAt().isAfter(now)) {
            repository.end(state.id(), now);
            events.publishEvent(new SessionEvents.Changed(state.id()));
            return new RenewResult.Rejected(RenewResult.Reason.EXPIRED);
        }
        if (presentedHash.equals(state.previousRefreshHash())) {
            if (state.rotatedAt() != null && now.isBefore(state.rotatedAt().plus(REPLAY_GRACE))) {
                return new RenewResult.Rejected(RenewResult.Reason.CONCURRENT_REUSE);
            }
            repository.end(state.id(), now);
            events.publishEvent(new SessionEvents.Changed(state.id()));
            log.atWarn()
                    .addKeyValue("event", "session.replay")
                    .addKeyValue("sessionId", state.id().value())
                    .log("refresh replay revoked session");
            return new RenewResult.Rejected(RenewResult.Reason.REPLAYED);
        }
        var nextRefresh = randomToken();
        repository.rotate(state.id(), presentedHash, hash(nextRefresh), now);
        log.atInfo()
                .addKeyValue("event", "session.refreshed")
                .addKeyValue("sessionId", state.id().value())
                .log("session refreshed");
        return new RenewResult.Renewed(credentials(state.id(), state.holder(), nextRefresh, now));
    }

    @Override
    public void end(SessionId session, HolderId requester) {
        var current =
                repository.snapshots(java.util.Set.of(session), clock.instant()).get(session);
        if (current == null || !current.holder().equals(requester)) return;
        repository.end(session, requester, clock.instant());
        events.publishEvent(new SessionEvents.Changed(session));
        log.atInfo()
                .addKeyValue("event", "session.revoked")
                .addKeyValue("sessionId", session.value())
                .log("session revoked");
    }

    @Override
    public void endByRefresh(String refreshToken) {
        repository.lockByRefreshHash(hash(refreshToken)).ifPresent(state -> {
            repository.end(state.id(), clock.instant());
            events.publishEvent(new SessionEvents.Changed(state.id()));
        });
    }

    @Override
    public void endAll(HolderId holder) {
        repository.endAll(holder, clock.instant());
        events.publishEvent(new SessionEvents.HolderChanged(holder));
    }

    @Override
    public void eraseAll(HolderId holder) {
        repository.deleteAll(holder);
        events.publishEvent(new SessionEvents.HolderChanged(holder));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<HolderId> principal(SessionId session) {
        return repository.activePrincipal(session, clock.instant());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SessionId> sessionOf(String refreshToken) {
        // 只读解析（限流取键）不加行锁，避免与同一凭据的 renew 相互排队。
        return repository
                .findByRefreshHash(hash(refreshToken))
                .filter(state -> state.endedAt() == null && state.expiresAt().isAfter(clock.instant()))
                .map(SessionRepository.State::id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page listOf(HolderId holder, String cursor, int limit, SessionId current) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        var position = KeysetCursor.decode(cursor).orElse(null);
        var rows = repository.list(
                holder,
                position == null ? null : position.at(),
                position == null ? null : position.id(),
                safeLimit + 1,
                clock.instant());
        var window = PageWindow.of(
                rows,
                safeLimit,
                row -> KeysetCursor.encode(row.lastSeenAt(), row.id().value()));
        return new Page(
                window.items().stream()
                        .map(row -> new View(
                                row.id(),
                                row.device(),
                                row.approximateIp(),
                                row.createdAt(),
                                row.lastSeenAt(),
                                row.expiresAt(),
                                row.id().equals(current)))
                        .toList(),
                window.nextCursor());
    }

    @Override
    public void touch(SessionId session) {
        var now = clock.instant();
        repository.touch(session, now.minus(TOUCH_INTERVAL), now);
    }

    private Credentials credentials(SessionId session, HolderId holder, String refresh, java.time.Instant now) {
        var claims = JwtClaimsSet.builder()
                .issuer("space")
                .subject(holder.value().toString())
                .issuedAt(now)
                .expiresAt(now.plus(accessTtl))
                .claim("sid", session.value().toString())
                .build();
        var header = JwsHeader.with(SignatureAlgorithm.RS256).keyId(keyId).build();
        var access = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new Credentials(session, access, refresh, "Bearer", accessTtl.toSeconds());
    }

    private String randomToken() {
        var bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String value) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(Sha256.digest(value.getBytes(StandardCharsets.UTF_8)));
    }
}
