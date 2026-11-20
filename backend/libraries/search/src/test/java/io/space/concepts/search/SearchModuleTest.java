package io.space.concepts.search;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.search.api.*;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.search.adapters.SearchConfiguration.class)
class SearchModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    SearchApi search;

    @Autowired
    io.space.testing.DatabaseScope tenants;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixture;

    @Autowired
    @Qualifier("jdbcTemplate")
    JdbcTemplate runtime;

    @Test
    void configurationIsVersionedAndTerminationIsScopedAndIdempotent() {
        UUID tenant = UUID.randomUUID();
        UUID site = UUID.randomUUID();
        UUID other = UUID.randomUUID();
        fixture.update("insert into shared.tenants(id,name) values (?, 'Search termination')", tenant);
        for (UUID id : List.of(site, other)) {
            fixture.update(
                    "insert into hosting.sites(id,tenant_id,name,created_by,updated_by) values(?,?,'Site',?,?)",
                    id,
                    tenant,
                    UUID.randomUUID(),
                    UUID.randomUUID());
        }
        var scope = new SearchApi.ScopeId(site);
        var kept = new SearchApi.ScopeId(other);
        tenants.inTenant(tenant, () -> {
            assertThat(runtime.queryForObject("select current_user", String.class))
                    .isEqualTo("space_app");
            search.configureBoost(scope, List.of("body", "title", "headings"));
            search.configureBoost(kept, List.of("headings", "body", "title"));
            assertThat(search.configuredBoost(scope).fields()).containsExactly("body", "title", "headings");
            assertThat(search.configuredBoost(scope).revision()).isEqualTo(1);
            assertThat(search.configureBoost(scope, List.of("body", "title", "headings"))
                            .revision())
                    .isEqualTo(2);

            search.terminateScope(scope);
            search.terminateScope(scope);
            search.terminateScope(new SearchApi.ScopeId(UUID.randomUUID()));
            assertThat(search.configuredBoost(scope)).isEqualTo(SearchApi.Boost.defaults());
            assertThat(search.configuredBoost(kept).revision()).isEqualTo(1);
        });
    }
}
