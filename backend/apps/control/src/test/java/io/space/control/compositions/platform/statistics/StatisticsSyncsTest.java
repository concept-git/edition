package io.space.control.compositions.platform.statistics;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.hosting.site.CreateSiteUseCase;
import io.space.control.compositions.platform.operations.RetryJobUseCase;
import io.space.control.compositions.platform.search.ConfigureSearchUseCase;
import io.space.control.compositions.platform.search.ReindexSearchUseCase;
import io.space.control.compositions.platform.search.SearchConfigurationUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.support.FixtureDatabaseConfiguration;
import io.space.delivery.contract.TelemetryEvent;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = "io.space.analytics.ingest-key=stats-test-ingestion-key-at-least-32-characters")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class StatisticsSyncsTest {
    @org.springframework.beans.factory.annotation.Autowired
    ReindexSearchUseCase reindexSearchUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SearchConfigurationUseCase searchConfigurationUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    private static final String KEY = "stats-test-ingestion-key-at-least-32-characters";

    @Autowired
    io.space.concepts.analytics.api.AnalyticsApi analytics;

    @org.springframework.beans.factory.annotation.Autowired
    RetryJobUseCase retryJobUseCase;

    @Autowired
    io.space.control.compositions.access.TenantAccess tenantAccess;

    @Autowired
    io.space.concepts.release.api.ReleaseApi releases;

    @Autowired
    io.space.concepts.importjob.api.ImportJobApi jobs;

    @org.springframework.beans.factory.annotation.Autowired
    IngestUseCase ingestUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    TrafficUseCase trafficUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SearchUseCase searchUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ConfigureSearchUseCase configureSearchUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSiteUseCase createSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ProvisionTenantUseCase provisionTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListTenantsUseCase listTenantsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    SuspendTenantUseCase suspendTenantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ResumeTenantUseCase resumeTenantUseCase;

    @Autowired
    UserApi users;

    @Autowired
    SessionApi sessions;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Test
    void replayedEventsAndSearchSessionsCountOnceAndPrivateQueriesAreOmitted() {
        var tenant = tenant("Stats", "stats-owner@test.example");
        var site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Docs", key())
                .value()
                .id();
        var source = UUID.randomUUID();
        var session = UUID.randomUUID();
        var other = UUID.randomUUID();
        var now = Instant.now();
        var events = List.of(
                event(source, now, tenant.id(), site, "pv", null, null, false),
                event(source, now, tenant.id(), site, "pv", null, null, false),
                event(source, now, tenant.id(), site, "search", session, "  Missing  ", true),
                event(source, now, tenant.id(), site, "search", session, "missing", true),
                event(source, now, tenant.id(), site, "observable", session, null, false),
                event(source, now, tenant.id(), site, "click", session, null, false),
                event(source, now, tenant.id(), site, "click", session, null, false),
                event(source, now, tenant.id(), site, "search", other, "person@example.org", true));
        ingestUseCase.ingest(KEY, events);
        ingestUseCase.ingest(KEY, events);
        var traffic = trafficUseCase.traffic(
                tenant.ownerCredential(), tenant.id(), site, now.minusSeconds(60), now.plusSeconds(60), "day");
        assertThat(traffic.pv()).isEqualTo(2);
        assertThat(traffic.series()).hasSize(1);
        assertThat(traffic.series().getFirst().uv()).isEqualTo(1);
        assertThat(traffic.health().status()).isEqualTo("ready");
        var search = searchUseCase.search(
                tenant.ownerCredential(), tenant.id(), site, now.minusSeconds(60), now.plusSeconds(60));
        assertThat(search.searches()).isEqualTo(2);
        assertThat(search.observable()).isEqualTo(1);
        assertThat(search.clicked()).isEqualTo(1);
        assertThat(search.clickRate()).isEqualTo(1.0);
        assertThat(search.zeroResults()).containsExactly(new StatisticsTypes.Ranked("missing", 1));
        assertThat(search.popular()).containsExactly(new StatisticsTypes.Ranked("missing", 1));
    }

    @Test
    void foreignScopesCannotBeIngestedOrReadAndNoDataIsExplicit() {
        var a = tenant("Stats A", "stats-a@test.example");
        var b = tenant("Stats B", "stats-b@test.example");
        var site = createSiteUseCase
                .createSite(b.ownerCredential(), b.id(), "Private", key())
                .value()
                .id();
        ingestUseCase.ingest(
                KEY, List.of(event(UUID.randomUUID(), Instant.now(), a.id(), site, "pv", null, null, false)));
        var traffic = trafficUseCase.traffic(b.ownerCredential(), b.id(), site, null, null, "day");
        assertThat(traffic.health().status()).isEqualTo("no_data");
        assertThatThrownBy(() -> trafficUseCase.traffic(a.ownerCredential(), b.id(), site, null, null, "day"))
                .isInstanceOf(PermissionDeniedException.class);
        assertThatThrownBy(() -> ingestUseCase.ingest("incorrect", List.of()))
                .isInstanceOf(PermissionDeniedException.class);
        assertThatThrownBy(() ->
                        trafficUseCase.traffic(b.ownerCredential(), b.id(), site, Instant.now(), Instant.EPOCH, "day"))
                .isInstanceOf(StatisticsInputInvalid.class);
    }

    @Test
    void searchConfigurationIsVersionedIdempotentAndRejectsInvalidOrders() {
        var tenant = tenant("Search configuration", "search-settings@test.example");
        var site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Docs", key())
                .value()
                .id();
        assertThat(searchConfigurationUseCase
                        .searchConfiguration(tenant.ownerCredential(), tenant.id(), site)
                        .fields())
                .containsExactly("title", "headings", "body");
        String requestKey = key();
        var fields = List.of("body", "headings", "title");
        var first = configureSearchUseCase
                .configureSearch(tenant.ownerCredential(), tenant.id(), site, fields, requestKey)
                .value();
        assertThat(first.revision()).isEqualTo(1);
        assertThat(configureSearchUseCase
                        .configureSearch(tenant.ownerCredential(), tenant.id(), site, fields, requestKey)
                        .value())
                .isEqualTo(first);
        assertThatThrownBy(() -> configureSearchUseCase.configureSearch(
                        tenant.ownerCredential(), tenant.id(), site, List.of("title", "title", "body"), key()))
                .isInstanceOf(io.space.control.compositions.flow.FlowException.class)
                .extracting(failure -> ((io.space.control.compositions.flow.FlowException) failure).code())
                .isEqualTo(io.space.control.compositions.flow.ProblemCode.VALIDATION_FAILED);
        var operator = verifiedUser("search-operator@test.example");
        jdbc.update("update iam.users set platform_operator=true where id=?", operator.value());
        var rebuilt = reindexSearchUseCase
                .reindexSearch(credential(operator), tenant.id(), site, key())
                .value();
        assertThat(rebuilt.revision()).isEqualTo(2);
        assertThat(rebuilt.fields()).isEqualTo(fields);
    }

    @Test
    void platformRecoveryDoesNotRequireCustomerMembershipButCannotBypassResourceState() {
        var tenant = tenant("Recovery", "recovery-owner@test.example");
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Imported", "synced", key())
                .value()
                .id();
        UUID job = tenantAccess.inTenant(tenant.id(), () -> {
            var draft = releases.draft(
                    new io.space.concepts.release.api.ReleaseApi.ScopeId(space),
                    new io.space.concepts.release.api.ReleaseApi.Source(
                            io.space.concepts.release.api.ReleaseApi.SourceKind.IMPORT, null, null));
            var queued = jobs.enqueue(tenant.id(), space, draft.id(), "abc", "recovery-zip", "recovery-test");
            jobs.fail(queued.id(), "dependency_failed", "dependency_unavailable");
            return queued.id();
        });
        var operator = verifiedUser("recovery-operator@test.example");
        jdbc.update("update iam.users set platform_operator=true where id=?", operator.value());
        var credential = credential(operator);
        String requestKey = key();
        retryJobUseCase.retryJob(credential, tenant.id(), job, requestKey, true);
        retryJobUseCase.retryJob(credential, tenant.id(), job, requestKey, true);
        assertThat(tenantAccess.inTenant(
                        tenant.id(), () -> jobs.view(job).orElseThrow().status()))
                .isEqualTo("queued");
        assertThatThrownBy(() -> retryJobUseCase.retryJob(credential, tenant.id(), job, key(), false))
                .isInstanceOf(PermissionDeniedException.class);
    }

    @Test
    void rawRetentionRemovesOldEventsAndLongRangeResponsesDeclareMissingHistory() {
        var tenant = tenant("Retention", "retention-owner@test.example");
        var site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Docs", key())
                .value()
                .id();
        var now = Instant.now();
        var source = UUID.randomUUID();
        ingestUseCase.ingest(
                KEY,
                List.of(
                        event(
                                source,
                                now.minus(java.time.Duration.ofDays(31)),
                                tenant.id(),
                                site,
                                "pv",
                                null,
                                null,
                                false),
                        event(source, now, tenant.id(), site, "pv", null, null, false)));
        tenantAccess.inTenant(
                tenant.id(),
                () -> analytics.retain(
                        now.minus(java.time.Duration.ofDays(30)), now.minus(java.time.Duration.ofDays(366))));
        var traffic = trafficUseCase.traffic(
                tenant.ownerCredential(),
                tenant.id(),
                site,
                now.minus(java.time.Duration.ofDays(45)),
                now.plusSeconds(1),
                "day");
        assertThat(traffic.pv()).isEqualTo(1);
        assertThat(traffic.health().status()).isEqualTo("partial");
        assertThat(traffic.health().retainedFrom()).isAfter(now.minus(java.time.Duration.ofDays(31)));
    }

    @Test
    void collectorGapsAreVisibleWithoutInventingSiteTraffic() {
        var tenant = tenant("Collector health", "collector-health@test.example");
        var site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Observed", key())
                .value()
                .id();
        var empty = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Empty", key())
                .value()
                .id();
        UUID collector = UUID.randomUUID();
        ingestUseCase.ingest(
                KEY,
                List.of(
                        event(UUID.randomUUID(), Instant.now(), tenant.id(), site, "pv", null, null, false),
                        new TelemetryEvent(
                                UUID.randomUUID(),
                                collector,
                                Instant.now(),
                                null,
                                null,
                                null,
                                "collector_heartbeat",
                                null,
                                null,
                                null,
                                null,
                                null,
                                false,
                                false,
                                1)));
        assertThat(trafficUseCase
                        .traffic(tenant.ownerCredential(), tenant.id(), site, null, null, "day")
                        .health()
                        .lossDetected())
                .isTrue();
        assertThat(trafficUseCase
                        .traffic(tenant.ownerCredential(), tenant.id(), site, null, null, "day")
                        .health()
                        .status())
                .isEqualTo("partial");
        assertThat(trafficUseCase
                        .traffic(tenant.ownerCredential(), tenant.id(), empty, null, null, "day")
                        .health()
                        .status())
                .isEqualTo("no_data");
        jdbc.update("delete from shared.analytics_sources where id=?", collector);
    }

    private TelemetryEvent event(
            UUID source, Instant time, UUID tenant, UUID site, String type, UUID session, String query, boolean zero) {
        return new TelemetryEvent(
                UUID.randomUUID(),
                source,
                time,
                tenant,
                site,
                null,
                type,
                "/docs?secret=discarded",
                query,
                session,
                "0123456789abcdef0123456789abcdef",
                "example.org",
                zero,
                false,
                0);
    }

    private TenantFixture tenant(String name, String ownerEmail) {
        UserApi.UserId operator = verifiedUser("operator-" + UUID.randomUUID() + "@site-syncs.test");
        jdbc.update("update iam.users set platform_operator = true where id = ?", operator.value());
        UserApi.UserId owner = verifiedUser(ownerEmail);
        UUID tenant = provisionTenantUseCase
                .provisionTenant(credential(operator), name, ownerEmail)
                .tenant()
                .id();
        return new TenantFixture(tenant, credential(owner));
    }

    private UserApi.UserId verifiedUser(String email) {
        var registered = (UserApi.RegisterResult.Registered) users.register(email, "Site User");
        jdbc.update(
                "update iam.users set verified = true where id = ?",
                registered.user().value());
        return registered.user();
    }

    private String credential(UserApi.UserId user) {
        var started = (SessionApi.StartResult.Started) sessions.start(
                new SessionApi.HolderId(user.value()), new SessionApi.Device("Test", "Test", "Test"), "unknown");
        return started.credentials().accessToken();
    }

    private static String key() {
        return UUID.randomUUID().toString();
    }

    private record TenantFixture(UUID id, String ownerCredential) {}
}
