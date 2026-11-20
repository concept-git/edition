package io.space.concepts.revision;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.revision.api.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@org.springframework.context.annotation.Import(io.space.concepts.revision.adapters.RevisionConfiguration.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class RevisionModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    RevisionApi revisions;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    @Transactional
    void recordsListsRetrievesAndDiffsAppendOnlyHistory() {
        var fixture = fixture();
        var item = fixture.item();
        var actor = fixture.actor();

        assertThat(revisions.record(item, 1, "alpha\nbeta\n", actor, null).n()).isEqualTo(1);
        assertThat(revisions
                        .record(item, 2, "alpha\ngamma\n", actor, "restored-from:1")
                        .n())
                .isEqualTo(2);

        assertThat(revisions.page(item, null, 20).items())
                .extracting(RevisionApi.Entry::n)
                .containsExactly(2, 1);
        assertThat(revisions.detail(item, 1).orElseThrow().content()).contains("beta");
        assertThat(revisions.diff(item, 1, 2).orElseThrow().hunks()).hasSize(1);
        assertThatThrownBy(() -> revisions.record(item, 4, "gap", actor, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("expected 3");
    }

    @Test
    @Transactional
    void pagesUtf8SizeDeltasAcrossTheCursorAndPrunedHistory() {
        var fixture = fixture();
        var item = fixture.item();
        var actor = fixture.actor();
        revisions.record(item, 1, "A", actor, null);
        revisions.record(item, 2, "汉字", actor, null);
        revisions.record(item, 3, "é", actor, null);

        var first = revisions.page(item, null, 2);
        assertThat(first.items()).extracting(RevisionApi.Entry::n).containsExactly(3, 2);
        assertThat(first.items()).extracting(RevisionApi.Entry::sizeBytes).containsExactly(2L, 6L);
        assertThat(first.items()).extracting(RevisionApi.Entry::sizeDelta).containsExactly(-4L, 5L);
        var last = revisions.page(item, first.nextCursor(), 2);
        assertThat(last.items()).extracting(RevisionApi.Entry::n).containsExactly(1);
        assertThat(last.items()).extracting(RevisionApi.Entry::sizeDelta).containsExactly(1L);
        assertThat(last.nextCursor()).isNull();

        revisions.prune(item, 2);
        assertThat(revisions.page(item, null, 2).items())
                .extracting(RevisionApi.Entry::sizeDelta)
                .containsExactly(-4L, 6L);
        assertThat(revisions.detail(item, 2).orElseThrow().entry().sizeDelta()).isEqualTo(6L);
    }

    private Fixture fixture() {
        UUID tenant = UUID.randomUUID();
        UUID page = UUID.randomUUID();
        UUID author = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", tenant, "Tenant " + tenant);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        fixtures.update("""
                insert into authoring.pages (
                  id, tenant_id, title, format, created_by_type, created_by, updated_by_type, updated_by)
                values (?, ?, 'Guide', 'markdown', 'user', ?, 'user', ?)
                """, page, tenant, author, author);

        return new Fixture(new RevisionApi.ItemId(page), new RevisionApi.Actor(RevisionApi.ActorType.USER, author));
    }

    private record Fixture(RevisionApi.ItemId item, RevisionApi.Actor actor) {}
}
