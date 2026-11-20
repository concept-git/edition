package io.space.concepts.plugindevelopment;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.plugindevelopment.api.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
@org.springframework.test.annotation.DirtiesContext(
        classMode = org.springframework.test.annotation.DirtiesContext.ClassMode.AFTER_CLASS)
@SpringBootTest(
        classes = io.space.ConceptTestApplication.class,
        properties = {})
@org.springframework.context.annotation.Import(
        io.space.concepts.plugindevelopment.adapters.PluginDevelopmentConfiguration.class)
@org.springframework.transaction.annotation.Transactional
class PluginDevelopmentContractTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    PluginDevelopmentApi api;

    @Autowired
    JdbcTemplate runtime;

    @org.junit.jupiter.api.BeforeEach
    void tenantContext() {
        UUID tenant = UUID.randomUUID();
        fixtures.update("insert into shared.tenants(id,name) values(?, 'Contract test')", tenant);
        runtime.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
    }

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void staleSavesAndDigestMismatchesPreserveTheCurrentDraftAndCandidateHistory() {
        var source =
                new PluginDevelopmentApi.Source(Map.of("index.js", "export default 1"), "{}", "{}", "[]", "{}", null);
        var draft = api.create("Demo", "demo", source);
        var saved = api.save(draft.id(), draft.revision(), "Renamed", "demo", source);
        assertThatThrownBy(() -> api.save(draft.id(), draft.revision(), "Stale", "demo", source))
                .isInstanceOf(PluginDevelopmentApi.Conflict.class);
        assertThat(api.find(draft.id()).orElseThrow()).isEqualTo(saved);
        assertThatThrownBy(() ->
                        api.compile(draft.id(), saved.revision(), "wrong", "index.js", "bundle", "browser-es2022-v1"))
                .isInstanceOf(PluginDevelopmentApi.Invalid.class);
        assertThat(api.candidates(draft.id())).isEmpty();
        var candidate = api.compile(
                draft.id(),
                saved.revision(),
                saved.sourceDigest(),
                "index.js",
                "export default 1",
                "browser-es2022-v1");
        api.delete(draft.id(), saved.revision());
        assertThat(api.find(draft.id())).isEmpty();
        assertThat(api.candidate(draft.id(), candidate.id())).contains(candidate);
    }
}
