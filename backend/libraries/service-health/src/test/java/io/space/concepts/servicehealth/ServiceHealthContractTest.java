package io.space.concepts.servicehealth;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.servicehealth.api.*;
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
        io.space.concepts.servicehealth.adapters.ServiceHealthConfiguration.class)
class ServiceHealthContractTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    ServiceHealthApi api;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void heartbeatUpsertsOneInstanceAndRetainsIndependentInstances() {
        api.beat("space-management", "one", "v1", Map.of("ready", true));
        api.beat("space-management", "one", "v2", Map.of("ready", false));
        api.beat("space-management", "two", "v1", Map.of());
        assertThat(api.heartbeats())
                .filteredOn(h -> h.service().equals("space-management"))
                .hasSize(2);
        assertThat(api.heartbeats())
                .filteredOn(h -> h.instance().equals("one"))
                .singleElement()
                .satisfies(h -> {
                    assertThat(h.version()).isEqualTo("v2");
                    assertThat(h.details()).containsEntry("ready", false);
                });
        assertThat(api.databaseBytes()).isPositive();
    }
}
