package io.edition.concepts.servicehealth.adapters.persistence;

import io.edition.concepts.servicehealth.api.*;
import io.edition.concepts.servicehealth.api.ServiceHealthApi;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

@Repository
public class JdbcServiceHealth implements ServiceHealthApi {
    private static final TypeReference<Map<String, Object>> DETAILS = new TypeReference<>() {};
    private final JdbcTemplate jdbc;
    private final JsonMapper json;

    public JdbcServiceHealth(JdbcTemplate jdbc, JsonMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    @Override
    public void beat(String service, String instance, String version, Map<String, Object> details) {
        jdbc.queryForObject(
                "select shared.record_service_heartbeat(?,?,?,?::jsonb)",
                Object.class,
                service,
                instance,
                version,
                json.writeValueAsString(details == null ? Map.of() : details));
    }

    @Override
    public List<Heartbeat> heartbeats() {
        return jdbc.query(
                """
                select service,instance,version,seen_at,details::text
                from shared.service_heartbeats order by seen_at desc, service, instance
                """,
                (row, index) -> new Heartbeat(
                        row.getString("service"),
                        row.getString("instance"),
                        row.getString("version"),
                        row.getObject("seen_at", OffsetDateTime.class).toInstant(),
                        json.readValue(row.getString("details"), DETAILS)));
    }

    @Override
    public long databaseBytes() {
        return jdbc.queryForObject("select pg_database_size(current_database())", Long.class);
    }
}
