package io.edition.concepts.readersecurity.api;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReaderStateApi {
    record Site(UUID id, String host) {}

    record Session(UUID id, Site site, UUID user, long epoch, Instant expiresAt) {}

    record Credentials(String access, String refresh, Instant expiresAt) {
        @Override
        public String toString() {
            return "ReaderCredentials[redacted]";
        }
    }

    record History(UUID spaceId, UUID pageId, Instant viewedAt) {}

    enum Proof {
        ACCESS,
        REFRESH
    }

    Credentials open(Site site, UUID user, long epoch);

    Optional<Session> lookup(Site site, Proof kind, String credential);

    Optional<Credentials> rotate(Session session, String refresh);

    void end(Site site, String refresh);

    List<History> history(Site site, UUID user);

    void visit(Site site, UUID user, UUID spaceId, UUID pageId);

    void erase(UUID user);
}
