package io.edition.concepts.readersecurity.adapters.persistence;

import io.edition.concepts.readersecurity.api.ReaderStateApi;
import io.edition.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
class JdbcReaderState implements ReaderStateApi {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final JdbcTemplate jdbc;
    private final Duration accessTtl;

    JdbcReaderState(JdbcTemplate jdbc, @Value("${io.edition.reader-auth.access-ttl:PT10M}") Duration accessTtl) {
        if (accessTtl.isNegative() || accessTtl.isZero() || accessTtl.compareTo(Duration.ofMinutes(10)) > 0)
            throw new IllegalArgumentException("reader access TTL must be positive and at most ten minutes");
        this.jdbc = jdbc;
        this.accessTtl = accessTtl;
    }

    public Credentials open(Site site, UUID user, long epoch) {
        var now = Instant.now();
        var credentials = issue(now.plus(Duration.ofDays(30)));
        jdbc.update(
                """
                insert into reader_state.sessions(session_id,site_id,user_id,host,access_hash,refresh_hash,
                    access_expires_at,expires_at,identity_epoch) values(?,?,?,?,?,?,?,?,?)
                """,
                UUID.randomUUID(),
                site.id(),
                user,
                site.host(),
                hash(credentials.access()),
                hash(credentials.refresh()),
                Timestamp.from(now.plus(accessTtl)),
                Timestamp.from(credentials.expiresAt()),
                epoch);
        return credentials;
    }

    public Optional<Session> lookup(Site site, Proof kind, String credential) {
        if (!valid(credential)) return Optional.empty();
        String proof =
                kind == Proof.ACCESS ? "access_hash=? and access_expires_at>statement_timestamp()" : "refresh_hash=?";
        return jdbc
                .query(
                        """
                select session_id,user_id,identity_epoch,expires_at from reader_state.sessions
                 where site_id=? and host=? and ended_at is null and expires_at>statement_timestamp() and
                """ + proof,
                        (row, ignored) -> new Session(
                                row.getObject(1, UUID.class),
                                site,
                                row.getObject(2, UUID.class),
                                row.getLong(3),
                                row.getTimestamp(4).toInstant()),
                        site.id(),
                        site.host(),
                        hash(credential))
                .stream()
                .findFirst();
    }

    public Optional<Credentials> rotate(Session session, String refresh) {
        if (!valid(refresh)) return Optional.empty();
        var next = issue(session.expiresAt());
        int changed = jdbc.update(
                """
                update reader_state.sessions set access_hash=?,refresh_hash=?,
                  access_expires_at=least(expires_at,statement_timestamp()+?*interval '1 millisecond')
                where session_id=? and refresh_hash=? and ended_at is null and expires_at>statement_timestamp()
                """, hash(next.access()), hash(next.refresh()), accessTtl.toMillis(), session.id(), hash(refresh));
        return changed == 1 ? Optional.of(next) : Optional.empty();
    }

    public void end(Site site, String refresh) {
        if (!valid(refresh)) return;
        jdbc.update("""
                update reader_state.sessions set ended_at=statement_timestamp()
                 where site_id=? and host=? and refresh_hash=? and ended_at is null
                """, site.id(), site.host(), hash(refresh));
    }

    public List<History> history(Site site, UUID user) {
        scope(site.id().toString(), user, false);
        return jdbc.query(
                """
                select space_id,page_id,viewed_at from reader_state.page_history
                 where site_id=? and user_id=? order by viewed_at desc,space_id limit 100
                """,
                (row, ignored) -> new History(
                        row.getObject(1, UUID.class),
                        row.getObject(2, UUID.class),
                        row.getTimestamp(3).toInstant()),
                site.id(),
                user);
    }

    public void visit(Site site, UUID user, UUID spaceId, UUID pageId) {
        scope(site.id().toString(), user, false);
        jdbc.update("""
                insert into reader_state.page_history(site_id,user_id,space_id,page_id) values(?,?,?,?)
                on conflict(site_id,user_id,space_id) do update
                 set page_id=excluded.page_id,viewed_at=statement_timestamp()
                """, site.id(), user, spaceId, pageId);
    }

    public void erase(UUID user) {
        scope("", user, true);
        jdbc.update("delete from reader_state.page_history where user_id=?", user);
        jdbc.update("delete from reader_state.history where user_id=?", user);
        jdbc.update("delete from reader_state.sessions where user_id=?", user);
    }

    private void scope(String site, UUID user, boolean erasure) {
        jdbc.queryForList("""
                select set_config('reader_state.site_id',?,true),set_config('reader_state.user_id',?,true),
                       set_config('reader_state.erasure',?,true)
                """, site, user.toString(), Boolean.toString(erasure));
    }

    private static Credentials issue(Instant expires) {
        return new Credentials(secret(), secret(), expires);
    }

    private static boolean valid(String secret) {
        return secret != null && secret.matches("rs1_[A-Za-z0-9_-]{43}");
    }

    private static String secret() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return "rs1_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String value) {
        return HexFormat.of().formatHex(Sha256.digest(value.getBytes(StandardCharsets.US_ASCII)));
    }
}
