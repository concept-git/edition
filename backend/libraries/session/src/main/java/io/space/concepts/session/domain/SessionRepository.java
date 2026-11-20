package io.space.concepts.session.domain;

import io.space.concepts.session.api.*;
import io.space.concepts.session.api.SessionApi.Device;
import io.space.concepts.session.api.SessionApi.HolderId;
import io.space.concepts.session.api.SessionApi.SessionId;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository {
    java.util.Map<SessionId, io.space.concepts.session.api.SessionApi.Info> snapshots(
            java.util.Set<SessionId> ids, Instant now);

    SessionId insert(
            HolderId holder, String refreshHash, Device device, String approximateIp, Instant expiresAt, Instant now);
    /** 取行锁，供 renew/end 的原子轮换使用。 */
    Optional<State> lockByRefreshHash(String hash);

    /** 只读解析，不加锁。 */
    Optional<State> findByRefreshHash(String hash);

    void rotate(SessionId id, String oldHash, String newHash, Instant rotatedAt);

    void end(SessionId id, HolderId holder, Instant now);

    void end(SessionId id, Instant now);

    void endAll(HolderId holder, Instant now);

    void deleteAll(HolderId holder);

    Optional<HolderId> activePrincipal(SessionId id, Instant now);

    void touch(SessionId id, Instant threshold, Instant now);

    List<State> list(HolderId holder, Instant beforeSeenAt, UUID beforeId, int limit, Instant now);

    record State(
            SessionId id,
            HolderId holder,
            String refreshHash,
            String previousRefreshHash,
            Instant rotatedAt,
            Device device,
            String approximateIp,
            Instant expiresAt,
            Instant createdAt,
            Instant lastSeenAt,
            Instant endedAt) {}
}
