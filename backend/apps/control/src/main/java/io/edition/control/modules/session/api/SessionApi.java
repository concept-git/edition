package io.edition.control.modules.session.api;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** Session [Principal] 概念的唯一对外门面。 */
public interface SessionApi {

    java.util.Map<SessionId, Info> snapshots(java.util.Set<SessionId> sessions);

    record Info(SessionId id, HolderId holder, Instant expiresAt, boolean active) {}

    StartResult start(HolderId holder, Device device, String approximateIp);

    RenewResult renew(String refreshToken);

    void end(SessionId session, HolderId requester);

    void endByRefresh(String refreshToken);

    void endAll(HolderId holder);

    void eraseAll(HolderId holder);

    Optional<HolderId> principal(SessionId session);

    Optional<SessionId> sessionOf(String refreshToken);

    Page listOf(HolderId holder, String cursor, int limit, SessionId current);

    void touch(SessionId session);

    record HolderId(UUID value) {
        public HolderId {
            Objects.requireNonNull(value, "holder id");
        }
    }

    record SessionId(UUID value) {
        public SessionId {
            Objects.requireNonNull(value, "session id");
        }
    }

    record Device(String name, String browser, String os) {
        public Device {
            name = clean(name);
            browser = clean(browser);
            os = clean(os);
        }

        private static String clean(String value) {
            return value == null || value.isBlank() ? "Unknown" : value.substring(0, Math.min(100, value.length()));
        }
    }

    record Credentials(SessionId session, String accessToken, String refreshToken, String tokenType, long expiresIn) {}

    sealed interface StartResult {
        record Started(Credentials credentials) implements StartResult {}
    }

    sealed interface RenewResult {
        record Renewed(Credentials credentials) implements RenewResult {}

        record Rejected(Reason reason) implements RenewResult {}

        enum Reason {
            INVALID,
            EXPIRED,
            CONCURRENT_REUSE,
            REPLAYED
        }
    }

    record View(
            SessionId id,
            Device device,
            String ipApproximate,
            Instant createdAt,
            Instant lastSeenAt,
            Instant expiresAt,
            boolean current) {}

    record Page(List<View> sessions, String nextCursor) {
        public Page {
            sessions = List.copyOf(sessions);
        }
    }
}
