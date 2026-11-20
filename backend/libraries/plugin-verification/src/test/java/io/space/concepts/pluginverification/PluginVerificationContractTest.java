package io.space.concepts.pluginverification;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.pluginverification.api.*;
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
        io.space.concepts.pluginverification.adapters.PluginVerificationConfiguration.class)
@org.springframework.transaction.annotation.Transactional
class PluginVerificationContractTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    PluginVerificationApi api;

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
    void browserSuccessCannotOverrideAServerFailureOrGrantProductionEligibility() {
        UUID development = UUID.randomUUID(), candidate = UUID.randomUUID();
        var input = new PluginVerificationApi.Input(
                development,
                candidate,
                "source",
                "bundle",
                "fixture",
                "browser-es2022-v1",
                new PluginVerificationApi.Evidence(true, List.of()));
        var result = api.record(input, List.of(new PluginVerificationApi.Check("server", false, "rejected")));
        assertThat(result.browserEvidence().passed()).isTrue();
        assertThat(result.serverValidation().passed()).isFalse();
        assertThat(result.productionEligible()).isFalse();
        assertThat(api.find(result.id())).contains(result);
        assertThat(api.list(development))
                .singleElement()
                .satisfies(row -> assertThat(row.candidateId()).isEqualTo(candidate));
    }
}
