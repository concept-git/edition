package io.space.control.compositions.authoring.termination;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.tenantregistry.api.*;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@SpringBootTest
@Testcontainers
@Import(PurgeBoundaryTest.Time.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PurgeBoundaryTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    PageApi pages;

    @Autowired
    TenantRegistryApi tenants;

    @Autowired
    TenantScopeApi scope;

    @Autowired
    Clock clock;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate fixture;

    @Test
    void eligibilityIsStrictlyAfterTheRetentionBoundary() {
        var tenant = ((TenantRegistryApi.ProvisionResult.Provisioned) tenants.provision("Purge boundary"))
                .tenant()
                .id();
        var page = scope.inTenant(
                tenant,
                () -> ((PageApi.CreateResult.Created)
                                pages.create(PageApi.Actor.system(), PageApi.Format.MARKDOWN, "Boundary"))
                        .page());
        var duration = Duration.ofDays(30);
        fixture.update(
                "update authoring.pages set trashed_at=? where id=?",
                java.sql.Timestamp.from(clock.instant().minus(duration)),
                page.id());
        assertThat(scope.inTenant(tenant, () -> pages.purge(new PageApi.PageId(page.id()), duration)))
                .isFalse();
        fixture.update(
                "update authoring.pages set trashed_at=? where id=?",
                java.sql.Timestamp.from(clock.instant().minus(duration).minusNanos(1000)),
                page.id());
        assertThat(scope.inTenant(tenant, () -> pages.purge(new PageApi.PageId(page.id()), duration)))
                .isTrue();
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Time {
        @Bean
        @Primary
        Clock purgeClock() {
            return Clock.fixed(Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS), ZoneOffset.UTC);
        }
    }
}
