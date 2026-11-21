package io.edition.concepts.objectstore.adapters.persistence;

import io.edition.concepts.objectstore.api.*;
import io.edition.concepts.objectstore.api.ObjectReservationsApi;
import java.util.*;
import java.util.function.BooleanSupplier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.*;

@Repository
public class SourceObjectReservations implements ObjectReservationsApi {
    private final JdbcTemplate jdbc;

    public SourceObjectReservations(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void protect(String key) {
        lock(key);
        jdbc.update(
                "insert into shared.source_objects(storage_key,protected_until)"
                        + " values(?,now()+interval '2 hours') on conflict(storage_key) do update set"
                        + " protected_until=excluded.protected_until,attempts=0,next_retry_at=now(),last_error=null",
                key);
    }

    public void lock(String key) {
        jdbc.queryForObject(
                "select pg_advisory_xact_lock(hashtextextended('source-object:' || ?,0))", Object.class, key);
    }

    public List<String> candidates(int limit) {
        return jdbc.query(
                "select storage_key from shared.source_objects where protected_until<now() and"
                        + " attempts<8 and next_retry_at<=now() order by"
                        + " next_retry_at,protected_until,storage_key limit ?",
                (r, n) -> r.getString(1),
                limit);
    }

    @Transactional
    public boolean collect(String key, BooleanSupplier referenced, Runnable remove) {
        if (!Boolean.TRUE.equals(jdbc.queryForObject(
                "select pg_try_advisory_xact_lock(hashtextextended('source-object:' ||" + " ?,0))",
                Boolean.class,
                key))) return false;
        var expiry = jdbc.query(
                "select protected_until<now() and attempts<8 and next_retry_at<=now() from"
                        + " shared.source_objects where storage_key=? for update",
                (r, n) -> r.getBoolean(1),
                key);
        if (expiry.isEmpty() || !expiry.getFirst()) return false;
        if (referenced.getAsBoolean()) {
            jdbc.update(
                    "update shared.source_objects set protected_until=now()+interval '1 hour' where" + " storage_key=?",
                    key);
            return false;
        }
        try {
            remove.run();
        } catch (io.edition.concepts.objectstore.api.ObjectStoreApi.Unavailable unavailable) {
            jdbc.update(
                    "update shared.source_objects set"
                            + " attempts=attempts+1,last_error='dependency_unavailable',next_retry_at=now()+(least(3600,power(2,least(attempts+1,12))*30)+random()*30)*interval"
                            + " '1 second' where storage_key=?",
                    key);
            return false;
        }
        jdbc.update("delete from shared.source_objects where storage_key=?", key);
        return true;
    }

    public void observe(String key, java.time.Instant modifiedAt) {
        jdbc.update(
                "insert into shared.source_objects(storage_key,protected_until) values(?,?) on"
                        + " conflict do nothing",
                key,
                java.sql.Timestamp.from(modifiedAt.plus(java.time.Duration.ofHours(2))));
    }

    public boolean failed(Set<String> keys) {
        if (keys.isEmpty()) return false;
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "select exists(select 1 from shared.source_objects where storage_key=any(?)" + " and attempts>=8)",
                Boolean.class,
                (Object) keys.toArray(String[]::new)));
    }

    public void retry(Set<String> keys) {
        if (!keys.isEmpty())
            jdbc.update(
                    "update shared.source_objects set"
                            + " attempts=0,next_retry_at=now(),last_error=null where"
                            + " storage_key=any(?)",
                    (Object) keys.toArray(String[]::new));
    }

    public long failedCount() {
        return jdbc.queryForObject("select count(*) from shared.source_objects where attempts>=8", Long.class);
    }

    public int retryFailed() {
        return jdbc.update("update shared.source_objects set attempts=0,next_retry_at=now(),last_error=null"
                + " where attempts>=8");
    }

    @Transactional
    public void scan(io.edition.concepts.objectstore.api.ObjectStoreApi objects) {
        if (!Boolean.TRUE.equals(jdbc.queryForObject(
                "select pg_try_advisory_xact_lock(hashtextextended('source-inventory',0))", Boolean.class))) return;
        jdbc.update("insert into shared.object_inventory_cursor(singleton) values(true) on conflict do" + " nothing");
        var batch = objects.inventory(inventoryCursor(), 1000);
        for (var item : batch) observe(item.key(), item.modifiedAt());
        long bytes = batch.stream()
                .mapToLong(io.edition.concepts.objectstore.api.ObjectStoreApi.StoredObject::sizeBytes)
                .sum();
        if (batch.size() < 1000)
            jdbc.update(
                    "update shared.object_inventory_cursor set"
                            + " total_objects=scan_objects+?,total_bytes=scan_bytes+?,completed_at=now(),scan_objects=0,scan_bytes=0,after_key=null"
                            + " where singleton",
                    batch.size(),
                    bytes);
        else
            jdbc.update(
                    "update shared.object_inventory_cursor set"
                            + " scan_objects=scan_objects+?,scan_bytes=scan_bytes+?,after_key=? where"
                            + " singleton",
                    batch.size(),
                    bytes,
                    batch.getLast().key());
    }

    public InventoryStats inventoryStats() {
        var rows = jdbc.query(
                "select total_objects,total_bytes,completed_at from"
                        + " shared.object_inventory_cursor where singleton",
                (r, n) -> new InventoryStats(
                        r.getObject(1, Long.class),
                        r.getObject(2, Long.class),
                        r.getTimestamp(3) == null ? null : r.getTimestamp(3).toInstant()));
        return rows.isEmpty() ? new InventoryStats(null, null, null) : rows.getFirst();
    }

    public String inventoryCursor() {
        var rows = jdbc.query(
                "select after_key from shared.object_inventory_cursor where singleton", (r, n) -> r.getString(1));
        return rows.isEmpty() ? null : rows.getFirst();
    }

    public void advanceInventory(String after) {
        jdbc.update(
                "insert into shared.object_inventory_cursor(singleton,after_key) values(true,?) on"
                        + " conflict(singleton) do update set after_key=excluded.after_key",
                after);
    }
}
