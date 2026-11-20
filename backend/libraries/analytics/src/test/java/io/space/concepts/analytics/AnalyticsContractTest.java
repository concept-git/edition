package io.space.concepts.analytics;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.analytics.api.*;
import java.time.Instant;
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
@org.springframework.context.annotation.Import(io.space.concepts.analytics.adapters.AnalyticsConfiguration.class)
class AnalyticsContractTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    AnalyticsApi api;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void activityCountsDistinctAuthorsAndRespectsTheRequestedInterval() {
        UUID tenant = UUID.randomUUID(), space = UUID.randomUUID(), actor = UUID.randomUUID();
        scope.inTenant(tenant, () -> {
            Instant now = Instant.parse("2026-10-01T00:00:00Z");
            api.activity(tenant, space, null, actor, "promote", now);
            api.activity(tenant, space, null, actor, "edit", now);
            api.activity(tenant, space, null, actor, "edit", now);
            assertThat(api.usageActivity(space, now, now.plusSeconds(1)))
                    .isEqualTo(new AnalyticsApi.UsageActivity(1, 1));
            assertThat(api.usageActivity(space, now.plusSeconds(1), now.plusSeconds(2)))
                    .isEqualTo(new AnalyticsApi.UsageActivity(0, 0));
        });
    }
}
