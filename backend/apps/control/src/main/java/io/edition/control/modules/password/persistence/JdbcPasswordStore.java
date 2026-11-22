package io.edition.control.modules.password.persistence;

import io.edition.control.modules.password.api.*;
import io.edition.control.modules.password.application.ports.PasswordStore;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;

@org.springframework.stereotype.Repository
class JdbcPasswordStore implements PasswordStore {
    private final JdbcTemplate jdbc;

    JdbcPasswordStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void set(UUID user, String encoded) {
        jdbc.update(
                "insert into iam.password_credentials(user_id,password_hash) values(?,?)"
                        + " on conflict(user_id) do update set password_hash=excluded.password_hash,failures=0,locked_until=null,"
                        + " reset_token_hash=null,reset_expires_at=null,updated_at=now()",
                user,
                encoded);
    }

    @Override
    public void failures(UUID user, int failures, Instant until) {
        jdbc.update(
                "update iam.password_credentials set failures=?,locked_until=?,updated_at=now() where user_id=?",
                failures,
                until == null ? null : java.sql.Timestamp.from(until),
                user);
    }

    @Override
    public void clearFailures(UUID user) {
        jdbc.update(
                "update iam.password_credentials set failures=0,locked_until=null,updated_at=now() where user_id=?",
                user);
    }

    @Override
    public void replace(UUID user, String encoded) {
        jdbc.update(
                "update iam.password_credentials set password_hash=?,failures=0,locked_until=null,"
                        + " reset_token_hash=null,reset_expires_at=null,updated_at=now() where user_id=?",
                encoded,
                user);
    }

    @Override
    public void requestReset(UUID user, String tokenHash, Instant expires) {
        jdbc.update(
                "update iam.password_credentials set reset_token_hash=?,reset_expires_at=?,updated_at=now() where user_id=?",
                tokenHash,
                java.sql.Timestamp.from(expires),
                user);
    }

    @Override
    public List<UUID> lockResetOwners(String tokenHash) {
        return jdbc.query(
                "select user_id from iam.password_credentials where reset_token_hash=? and reset_expires_at>now() for update",
                (r, n) -> r.getObject(1, UUID.class),
                tokenHash);
    }

    @Override
    public List<UUID> resetOwners(String tokenHash) {
        return jdbc.query(
                "select user_id from iam.password_credentials where reset_token_hash=? and reset_expires_at>now()",
                (r, n) -> r.getObject(1, UUID.class),
                tokenHash);
    }

    @Override
    public boolean isSet(UUID user) {
        return jdbc.queryForObject(
                "select exists(select 1 from iam.password_credentials where user_id=?)", Boolean.class, user);
    }

    @Override
    public boolean resetPending(UUID user, String tokenHash) {
        return jdbc.queryForObject(
                "select exists(select 1 from iam.password_credentials where user_id=? and reset_token_hash=? and reset_expires_at>now())",
                Boolean.class,
                user,
                tokenHash);
    }

    @Override
    public void terminate(UUID user) {
        jdbc.update("delete from iam.password_credentials where user_id=?", user);
    }

    @Override
    public void lock(UUID user) {
        jdbc.queryForObject("select pg_advisory_xact_lock(hashtextextended(?,0))", Object.class, user.toString());
    }

    @Override
    public List<Account> accounts(UUID user) {
        return jdbc.query(
                "select password_hash,failures,locked_until from iam.password_credentials where user_id=? for update",
                (r, n) -> new Account(
                        r.getString("password_hash"),
                        r.getInt("failures"),
                        r.getTimestamp("locked_until") == null
                                ? null
                                : r.getTimestamp("locked_until").toInstant()),
                user);
    }
}
