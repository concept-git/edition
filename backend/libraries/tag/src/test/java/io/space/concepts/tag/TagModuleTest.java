package io.space.concepts.tag;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import io.space.concepts.tag.api.*;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Tag 模块缝：跨页同词、rename 合并、单页 50 上限经真实 PG。 */
@ApplicationModuleTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.tag.adapters.TagConfiguration.class)
class TagModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    TagApi tags;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Autowired
    PlatformTransactionManager transactions;

    @Test
    @Transactional
    void tagsAcrossItemsShareALabelAndRenameMovesEveryBinding(PublishedEvents events) {
        Fixture f = fixture();
        assertThat(tags.tag(new TagApi.ItemId(f.one), "  BeTa ")).isInstanceOf(TagApi.TagResult.Tagged.class);
        assertThat(tags.tag(new TagApi.ItemId(f.two), "BETA")).isInstanceOf(TagApi.TagResult.Tagged.class);
        assertThat(tags.tag(new TagApi.ItemId(f.one), "beta")).isInstanceOf(TagApi.TagResult.Tagged.class);

        assertThat(tags.byLabel("beta")).containsExactlyInAnyOrder(f.one, f.two);
        assertThat(tags.labelsOf(new TagApi.ItemId(f.one))).containsExactly("beta");

        assertThat(tags.rename("beta", "ga")).isInstanceOf(TagApi.RenameResult.Renamed.class);
        assertThat(tags.byLabel("ga")).containsExactlyInAnyOrder(f.one, f.two);
        assertThat(tags.byLabel("beta")).isEmpty();
        assertThat(events.ofType(TagEvents.Tagged.class)).hasSize(2);
        assertThat(events.ofType(TagEvents.Renamed.class)).hasSize(1);
    }

    @Test
    @Transactional
    void renameMergesWhenTheTargetAlreadyExistsAndFiftyIsAFiniteOutput() {
        Fixture f = fixture();
        tags.tag(new TagApi.ItemId(f.one), "beta");
        tags.tag(new TagApi.ItemId(f.one), "ga");
        tags.tag(new TagApi.ItemId(f.two), "beta");
        assertThat(tags.rename("beta", "ga")).isInstanceOf(TagApi.RenameResult.Renamed.class);
        assertThat(tags.labelsOf(new TagApi.ItemId(f.one))).containsExactly("ga");
        assertThat(tags.labelsOf(new TagApi.ItemId(f.two))).containsExactly("ga");

        tags.untag(new TagApi.ItemId(f.one), "ga");
        for (int index = 0; index < 50; index++) {
            assertThat(tags.tag(new TagApi.ItemId(f.one), "t" + index)).isInstanceOf(TagApi.TagResult.Tagged.class);
        }
        assertThat(tags.tag(new TagApi.ItemId(f.one), "overflow")).isInstanceOf(TagApi.TagResult.TooMany.class);
        assertThat(tags.labelsOf(new TagApi.ItemId(f.one))).hasSize(50);

        assertThat(tags.untag(new TagApi.ItemId(f.one), "missing")).isInstanceOf(TagApi.UntagResult.Untagged.class);
        assertThat(tags.rename("nope", "else")).isInstanceOf(TagApi.RenameResult.NotFound.class);
        assertThat(tags.rename("nope", "nope")).isInstanceOf(TagApi.RenameResult.NotFound.class);
        assertThat(tags.tag(new TagApi.ItemId(f.one), "a/b")).isInstanceOf(TagApi.TagResult.Invalid.class);
        assertThat(tags.matching("t")).isNotEmpty();
        assertThat(tags.popular(3)).isNotEmpty();
    }

    @Test
    void renameMergesWithAConcurrentUncommittedTargetTag() throws Exception {
        var tx = new TransactionTemplate(transactions);
        Fixture f = tx.execute(status -> {
            Fixture created = fixture();
            tags.tag(new TagApi.ItemId(created.one), "source");
            return created;
        });
        var inserted = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        String connection = "tag-rename-" + f.one;
        try (var pool = Executors.newFixedThreadPool(2)) {
            var tagging = pool.submit(() -> tx.execute(status -> {
                tenant(f.tenant);
                var result = tags.tag(new TagApi.ItemId(f.one), "target");
                inserted.countDown();
                try {
                    if (!release.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("tag wait timed out");
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(interrupted);
                }
                return result;
            }));
            try {
                assertThat(inserted.await(5, TimeUnit.SECONDS)).isTrue();
                var renaming = pool.submit(() -> tx.execute(status -> {
                    tenant(f.tenant);
                    jdbc.queryForObject("select set_config('application_name', ?, true)", String.class, connection);
                    return tags.rename("source", "target");
                }));
                await().atMost(Duration.ofSeconds(5))
                        .untilAsserted(() -> assertThat(fixtures.queryForObject(
                                        "select count(*) from pg_stat_activity where application_name=? and wait_event_type='Lock'",
                                        Integer.class,
                                        connection))
                                .isEqualTo(1));
                release.countDown();
                assertThat(tagging.get(10, TimeUnit.SECONDS)).isInstanceOf(TagApi.TagResult.Tagged.class);
                assertThat(renaming.get(10, TimeUnit.SECONDS)).isInstanceOf(TagApi.RenameResult.Renamed.class);
                tx.executeWithoutResult(status -> {
                    tenant(f.tenant);
                    assertThat(tags.labelsOf(new TagApi.ItemId(f.one))).containsExactly("target");
                });
            } finally {
                release.countDown();
            }
        }
    }

    private void tenant(UUID tenant) {
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
    }

    private Fixture fixture() {
        UUID tenant = UUID.randomUUID();
        UUID space = UUID.randomUUID();
        UUID one = UUID.randomUUID();
        UUID two = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", tenant, "Tenant " + tenant);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        fixtures.update(
                "insert into authoring.spaces (id, tenant_id, name, mode) values (?, ?, 'Docs', 'authored')",
                space,
                tenant);
        insertPage(one, tenant, space, "one");
        insertPage(two, tenant, space, "two");
        return new Fixture(tenant, one, two);
    }

    private void insertPage(UUID page, UUID tenant, UUID space, String slug) {
        fixtures.update("""
                insert into authoring.pages (
                  id, tenant_id, title, format, created_by_type, updated_by_type)
                values (?, ?, ?, 'markdown', 'system', 'system')
                """, page, tenant, slug);
        fixtures.update(
                "insert into authoring.space_page_placements (space_id, page_id, slug) values (?, ?, ?)",
                space,
                page,
                slug);
    }

    private record Fixture(UUID tenant, UUID one, UUID two) {}
}
