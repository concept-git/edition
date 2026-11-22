package io.edition.control.modules.contenttype.persistence;

import io.edition.control.modules.contenttype.api.*;
import io.edition.control.modules.contenttype.application.ports.ContentTypeRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ContentTypeStore implements ContentTypeRepository {
    private final JdbcTemplate jdbc;

    public ContentTypeStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void serialize(String type) {
        jdbc.queryForObject(
                "select pg_advisory_xact_lock(hashtextextended(shared.require_tenant_id()::text || ':contenttype:' || ?,0))",
                Object.class,
                type);
    }

    public Optional<String> state(String type) {
        return jdbc
                .query(
                        "select payload::text from shared.content_types where content_type=?",
                        (r, n) -> r.getString(1),
                        type)
                .stream()
                .findFirst();
    }

    public List<String> states() {
        return jdbc.query(
                "select payload::text from shared.content_types order by content_type", (r, n) -> r.getString(1));
    }

    public void state(String type, String payload) {
        jdbc.update(
                "insert into shared.content_types(tenant_id,content_type,payload,active_version_id) values(shared.require_tenant_id(),?,?::jsonb,case when (?::jsonb->>'activeVersionRef') like 'builtin:%' then null else (?::jsonb->>'activeVersionRef')::uuid end) on conflict(tenant_id,content_type) do update set payload=excluded.payload,active_version_id=excluded.active_version_id",
                type, payload, payload, payload);
    }

    public void version(UUID id, String type, String version, String payload) {
        jdbc.update(
                "insert into shared.content_type_versions(id,tenant_id,content_type,version,payload) values(?,shared.require_tenant_id(),?,?,?::jsonb)",
                id,
                type,
                version,
                payload);
    }

    public Optional<String> version(UUID id) {
        return jdbc
                .query(
                        "select payload::text from shared.content_type_versions where id=?",
                        (r, n) -> r.getString(1),
                        id)
                .stream()
                .findFirst();
    }

    public Optional<String> matching(String type, String digest) {
        return jdbc
                .query(
                        "select payload::text from shared.content_type_versions where content_type=? and payload->>'digest'=? order by id limit 1",
                        (r, n) -> r.getString(1),
                        type,
                        digest)
                .stream()
                .findFirst();
    }

    public boolean versionExists(String type, String label) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "select exists(select 1 from shared.content_type_versions where content_type=? and version=?)",
                Boolean.class,
                type,
                label));
    }

    public List<String> versions(String type) {
        return jdbc.query("""
        select jsonb_build_object('versionRef',id::text,'contentType',content_type,'version',version,'digest',payload->'digest','createdAt',payload->'createdAt')::text
        from shared.content_type_versions where content_type=? order by payload->>'createdAt' desc,id desc limit 100
        """, (r, n) -> r.getString(1), type);
    }
}
