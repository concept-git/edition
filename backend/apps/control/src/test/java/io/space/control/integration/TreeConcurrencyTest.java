package io.space.control.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import io.space.concepts.collection.api.CollectionApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.toc.api.TocApi;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
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

@SpringBootTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class TreeConcurrencyTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    TocApi toc;

    @Autowired
    CollectionApi collections;

    @Autowired
    TenantScopeApi scope;

    @Autowired
    JdbcTemplate runtime;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate owner;

    @Test
    void twoFirstTocEntriesHaveDifferentDensePositions() throws Exception {
        var f = fixture();
        var id = new TocApi.TocId(f.space());
        overlap(
                f,
                () -> toc.addEntry(id, null, "First", TocApi.Kind.GROUP, null, null, null),
                () -> toc.addEntry(id, null, "Second", TocApi.Kind.GROUP, null, null, null));
        scope.inTenant(
                f.tenant(),
                () -> assertThat(toc.tree(id)).extracting(TocApi.View::position).containsExactly(0, 1));
    }

    @Test
    void tocActionsReportMissingWhenDeletionCommitsWhileWaitingForTheTree() throws Exception {
        for (String operation : java.util.List.of("move", "remove", "relabel")) {
            var f = fixture();
            var entry = scope.inTenant(
                    f.tenant(),
                    () -> ((TocApi.AddResult.Added) toc.addEntry(
                                    new TocApi.TocId(f.space()), null, "Entry", TocApi.Kind.GROUP, null, null, null))
                            .entry());
            var id = new TocApi.EntryId(entry.id());
            Object result = overlap(f, () -> toc.remove(id), () -> switch (operation) {
                case "move" -> toc.move(id, null, 0);
                case "remove" -> toc.remove(id);
                default -> toc.relabel(id, "Renamed");
            });
            assertThat(result.getClass().getSimpleName()).isEqualTo("NotFound");
        }
    }

    @Test
    void collectionActionsReportMissingWhenDeletionCommitsWhileWaitingForTheTree() throws Exception {
        for (String operation : java.util.List.of("move", "remove", "place")) {
            var f = fixture();
            var entry = scope.inTenant(
                    f.tenant(),
                    () -> ((CollectionApi.CreateResult.Created)
                                    collections.create(f.tenant().value(), null, "Group", null, null))
                            .collection());
            var id = new CollectionApi.CollectionId(entry.id());
            Object result = overlap(f, () -> collections.remove(id), () -> switch (operation) {
                case "move" -> collections.move(id, null, 0);
                case "remove" -> collections.remove(id);
                default -> collections.place(f.space(), id, null);
            });
            assertThat(result.getClass().getSimpleName()).isEqualTo("NotFound");
        }
    }

    private Object overlap(Fixture f, Supplier<?> firstAction, Supplier<?> secondAction) throws Exception {
        var ready = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        String secondName = "tree-second-" + UUID.randomUUID();
        try (var pool = Executors.newFixedThreadPool(2)) {
            var first = pool.submit(() -> scope.inTenant(f.tenant(), () -> {
                var result = firstAction.get();
                ready.countDown();
                try {
                    if (!release.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("tree gate timed out");
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(interrupted);
                }
                return result;
            }));
            try {
                assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
                var second = pool.submit(() -> scope.inTenant(f.tenant(), () -> {
                    runtime.queryForObject("select set_config('application_name',?,true)", String.class, secondName);
                    return secondAction.get();
                }));
                await().atMost(Duration.ofSeconds(5))
                        .until(() -> second.isDone()
                                || owner.queryForObject(
                                                "select count(*) from pg_stat_activity where application_name=? and wait_event_type='Lock'",
                                                Integer.class,
                                                secondName)
                                        == 1);
                release.countDown();
                first.get(10, TimeUnit.SECONDS);
                return second.get(10, TimeUnit.SECONDS);
            } finally {
                release.countDown();
            }
        }
    }

    private Fixture fixture() {
        UUID tenant = UUID.randomUUID(), space = UUID.randomUUID();
        owner.update("insert into shared.tenants(id,name) values (?,?)", tenant, "Tree concurrency");
        owner.update(
                "insert into authoring.spaces(id,tenant_id,name,mode) values (?,?,?,'authored')",
                space,
                tenant,
                "Docs");
        return new Fixture(new TenantRegistryApi.TenantId(tenant), space);
    }

    private record Fixture(TenantRegistryApi.TenantId tenant, UUID space) {}
}
