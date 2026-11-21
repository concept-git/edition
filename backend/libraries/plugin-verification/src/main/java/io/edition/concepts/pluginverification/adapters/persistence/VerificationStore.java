package io.edition.concepts.pluginverification.adapters.persistence;

import io.edition.concepts.pluginverification.api.*;
import io.edition.concepts.pluginverification.application.ports.VerificationRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class VerificationStore implements VerificationRepository {
    private final JdbcTemplate jdbc;

    public VerificationStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(UUID id, UUID development, String payload) {
        jdbc.update(
                "insert into shared.plugin_verifications(id,tenant_id,development_id,payload) values(?,shared.require_tenant_id(),?,?::jsonb)",
                id,
                development,
                payload);
    }

    public Optional<String> find(UUID id) {
        return jdbc
                .query("select payload::text from shared.plugin_verifications where id=?", (r, n) -> r.getString(1), id)
                .stream()
                .findFirst();
    }

    public List<String> list(UUID development) {
        return jdbc.query("""
                select jsonb_build_object('id',id,'developmentId',development_id,'candidateId',payload->'candidateId',
                  'sourceDigest',payload->'sourceDigest','bundleDigest',payload->'bundleDigest','fixtureDigest',payload->'fixtureDigest',
                  'environment',payload->'environment','browserPassed',payload#>'{browserEvidence,passed}',
                  'serverPassed',payload#>'{serverValidation,passed}','productionEligible',payload->'productionEligible',
                  'createdAt',payload->'createdAt')::text
                from shared.plugin_verifications where (?::uuid is null or development_id=?)
                order by payload->>'createdAt' desc,id desc limit 100
                """, (r, n) -> r.getString(1), development, development);
    }
}
