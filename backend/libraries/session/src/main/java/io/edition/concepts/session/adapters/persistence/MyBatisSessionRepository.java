package io.edition.concepts.session.adapters.persistence;

import io.edition.concepts.session.api.*;
import io.edition.concepts.session.api.SessionApi.*;
import io.edition.concepts.session.domain.SessionRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/** 会话状态的持久值翻译；所有动作加入调用方事务。 */
@Repository
class MyBatisSessionRepository implements SessionRepository {
    private final SessionMapper mapper;

    MyBatisSessionRepository(SessionMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public java.util.Map<SessionId, Info> snapshots(java.util.Set<SessionId> ids, Instant now) {
        if (ids.isEmpty()) return java.util.Map.of();
        return mapper.snapshots(ids.stream().map(id -> id.value().toString()).toList(), now).stream()
                .map(row -> new Info(
                        new SessionId(UUID.fromString(row.id())),
                        new HolderId(UUID.fromString(row.principalId())),
                        row.expiresAt(),
                        row.active()))
                .collect(java.util.stream.Collectors.toUnmodifiableMap(
                        Info::id, java.util.function.Function.identity()));
    }

    @Override
    public SessionId insert(
            HolderId holder, String refreshHash, Device device, String approximateIp, Instant expiresAt, Instant now) {
        return new SessionId(UUID.fromString(mapper.insert(
                holder.value(),
                refreshHash,
                device.name(),
                device.browser(),
                device.os(),
                approximateIp,
                expiresAt,
                now)));
    }

    @Override
    public Optional<State> lockByRefreshHash(String hash) {
        return Optional.ofNullable(mapper.lockByHash(hash)).map(this::state);
    }

    @Override
    public Optional<State> findByRefreshHash(String hash) {
        return Optional.ofNullable(mapper.findByHash(hash)).map(this::state);
    }

    @Override
    public void rotate(SessionId id, String oldHash, String newHash, Instant rotatedAt) {
        if (mapper.rotate(id.value(), oldHash, newHash, rotatedAt) != 1) {
            throw new IllegalStateException("session refresh rotation lost");
        }
    }

    @Override
    public void end(SessionId id, HolderId holder, Instant now) {
        mapper.endOwned(id.value(), holder.value(), now);
    }

    @Override
    public void end(SessionId id, Instant now) {
        mapper.end(id.value(), now);
    }

    @Override
    public void endAll(HolderId holder, Instant now) {
        mapper.endAll(holder.value(), now);
    }

    @Override
    public void deleteAll(HolderId holder) {
        mapper.deleteAll(holder.value());
    }

    @Override
    public Optional<HolderId> activePrincipal(SessionId id, Instant now) {
        return Optional.ofNullable(mapper.activePrincipal(id.value(), now))
                .map(UUID::fromString)
                .map(HolderId::new);
    }

    @Override
    public void touch(SessionId id, Instant threshold, Instant now) {
        mapper.touch(id.value(), threshold, now);
    }

    @Override
    public List<State> list(HolderId holder, Instant beforeSeenAt, UUID beforeId, int limit, Instant now) {
        return mapper.list(holder.value(), beforeSeenAt, beforeId, limit, now).stream()
                .map(this::state)
                .toList();
    }

    private State state(SessionMapper.Row row) {
        return new State(
                new SessionId(UUID.fromString(row.id())),
                new HolderId(UUID.fromString(row.principalId())),
                row.refreshTokenHash(),
                row.previousRefreshTokenHash(),
                row.rotatedAt(),
                new Device(row.deviceName(), row.deviceBrowser(), row.deviceOs()),
                row.ipApproximate(),
                row.expiresAt(),
                row.createdAt(),
                row.lastSeenAt(),
                row.endedAt());
    }
}
