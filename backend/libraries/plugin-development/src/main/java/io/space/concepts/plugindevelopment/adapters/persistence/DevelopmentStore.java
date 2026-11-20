package io.space.concepts.plugindevelopment.adapters.persistence;

import io.space.concepts.plugindevelopment.api.*;
import io.space.concepts.plugindevelopment.application.ports.DevelopmentRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DevelopmentStore implements DevelopmentRepository {
    private final JdbcTemplate jdbc;

    public DevelopmentStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(UUID id, String payload) {
        jdbc.update(
                "insert into shared.plugin_developments(id,tenant_id,payload) values(?,shared.require_tenant_id(),?::jsonb)",
                id,
                payload);
    }

    public Optional<String> find(UUID id, boolean lock) {
        return jdbc
                .query(
                        "select payload::text from shared.plugin_developments where id=? and deleted_at is null"
                                + (lock ? " for update" : ""),
                        (r, n) -> r.getString(1),
                        id)
                .stream()
                .findFirst();
    }

    public List<String> list() {
        return jdbc.query("""
                select jsonb_build_object('id',id,'name',payload->'name','contentType',payload->'contentType',
                  'revision',payload->'revision','sourceDigest',payload->'sourceDigest',
                  'createdAt',payload->'createdAt','updatedAt',payload->'updatedAt')::text
                from shared.plugin_developments where deleted_at is null
                order by payload->>'updatedAt' desc,id desc limit 100
                """, (r, n) -> r.getString(1));
    }

    public boolean exists(UUID id) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "select exists(select 1 from shared.plugin_developments where id=? and deleted_at is null)",
                Boolean.class,
                id));
    }

    public void save(UUID id, String payload) {
        jdbc.update("update shared.plugin_developments set payload=?::jsonb where id=?", payload, id);
    }

    public void delete(UUID id) {
        jdbc.update("update shared.plugin_developments set deleted_at=now() where id=?", id);
    }

    public void candidate(UUID id, UUID development, String payload) {
        jdbc.update(
                "insert into shared.plugin_candidates(id,tenant_id,development_id,payload) values(?,shared.require_tenant_id(),?,?::jsonb)",
                id,
                development,
                payload);
    }

    public List<String> candidates(UUID id) {
        return jdbc.query("""
                select jsonb_build_object('id',id,'developmentId',development_id,'sourceRevision',payload->'sourceRevision',
                  'sourceDigest',payload->'sourceDigest','bundleDigest',payload->'bundleDigest',
                  'entryPoint',payload->'entryPoint','environment',payload->'environment','createdAt',payload->'createdAt')::text
                from shared.plugin_candidates where development_id=?
                order by payload->>'createdAt' desc,id desc limit 100
                """, (r, n) -> r.getString(1), id);
    }

    public Optional<String> candidate(UUID development, UUID id) {
        return jdbc
                .query(
                        "select payload::text from shared.plugin_candidates where development_id=? and id=?",
                        (r, n) -> r.getString(1),
                        development,
                        id)
                .stream()
                .findFirst();
    }
}
