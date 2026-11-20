package io.space.concepts.toc;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.toc.api.*;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Toc 模块缝：add/move/remove/replace 经真实 PG；replace 超深不留半棵树。 */
@ApplicationModuleTest
@org.springframework.context.annotation.Import(io.space.concepts.toc.adapters.TocConfiguration.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class TocModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    TocApi toc;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    @Transactional
    void arrangesAGroupAndTargetInOrder(PublishedEvents events) {
        Fixture f = fixture();
        var group = (TocApi.AddResult.Added) toc.addEntry(f.toc, null, "指南", TocApi.Kind.GROUP, null, null, null);
        var page = (TocApi.AddResult.Added) toc.addEntry(
                f.toc, new TocApi.EntryId(group.entry().id()), "快速开始", TocApi.Kind.TARGET, f.page, null, null);

        List<TocApi.View> tree = toc.tree(f.toc);
        assertThat(tree).hasSize(1);
        assertThat(tree.getFirst().label()).isEqualTo("指南");
        assertThat(tree.getFirst().depth()).isEqualTo(1);
        assertThat(tree.getFirst().children()).singleElement().satisfies(child -> {
            assertThat(child.label()).isEqualTo("快速开始");
            assertThat(child.kind()).isEqualTo(TocApi.Kind.TARGET);
            assertThat(child.targetId()).isEqualTo(f.page);
            assertThat(child.depth()).isEqualTo(2);
        });
        assertThat(toc.entriesFor(f.page))
                .extracting(TocApi.View::id)
                .containsExactly(page.entry().id());
        assertThat(toc.move(new TocApi.EntryId(page.entry().id()), null, 1))
                .isInstanceOf(TocApi.MoveResult.Moved.class);
        assertThat(toc.tree(f.toc)).extracting(TocApi.View::label).containsExactly("指南", "快速开始");
        assertThat(events.ofType(TocEvents.EntryAdded.class)).hasSize(2);
        assertThat(events.ofType(TocEvents.EntryMoved.class)).hasSize(1);
    }

    @Test
    @Transactional
    void eighthLevelAndReplaceRollbackAreFiniteOutputs() {
        Fixture f = fixture();
        UUID parent = null;
        for (int level = 1; level <= 7; level++) {
            var added = (TocApi.AddResult.Added) toc.addEntry(
                    f.toc,
                    parent == null ? null : new TocApi.EntryId(parent),
                    "L" + level,
                    TocApi.Kind.GROUP,
                    null,
                    null,
                    null);
            parent = added.entry().id();
        }
        assertThat(toc.addEntry(f.toc, new TocApi.EntryId(parent), "L8", TocApi.Kind.GROUP, null, null, null))
                .isInstanceOf(TocApi.AddResult.DepthExceeded.class);

        TocApi.Draft tooDeep = nest("root", 8);
        assertThat(toc.replace(f.toc, List.of(tooDeep))).isInstanceOf(TocApi.ReplaceResult.DepthExceeded.class);
        assertThat(toc.tree(f.toc)).isNotEmpty();

        assertThat(toc.replace(
                        f.toc,
                        List.of(new TocApi.Draft("外链", TocApi.Kind.LINK, null, "https://example.com/docs", List.of()))))
                .isInstanceOf(TocApi.ReplaceResult.Replaced.class);
        assertThat(toc.tree(f.toc))
                .singleElement()
                .extracting(TocApi.View::kind)
                .isEqualTo(TocApi.Kind.LINK);
    }

    @Test
    @Transactional
    void removeDropsDescendantsAndLeavesTheTargetPage() {
        Fixture f = fixture();
        var group = (TocApi.AddResult.Added) toc.addEntry(f.toc, null, "组", TocApi.Kind.GROUP, null, null, null);
        toc.addEntry(f.toc, new TocApi.EntryId(group.entry().id()), "页", TocApi.Kind.TARGET, f.page, null, null);
        assertThat(toc.remove(new TocApi.EntryId(group.entry().id()))).isInstanceOf(TocApi.RemoveResult.Removed.class);
        assertThat(toc.tree(f.toc)).isEmpty();
        assertThat(jdbc.queryForObject("select count(*) from authoring.pages where id = ?", Long.class, f.page))
                .isEqualTo(1L);
        assertThat(toc.relabel(new TocApi.EntryId(UUID.randomUUID()), "x"))
                .isInstanceOf(TocApi.RelabelResult.NotFound.class);
    }

    private TocApi.Draft nest(String label, int depth) {
        if (depth == 1) return new TocApi.Draft(label, TocApi.Kind.GROUP, null, null, List.of());
        return new TocApi.Draft(label, TocApi.Kind.GROUP, null, null, List.of(nest("c", depth - 1)));
    }

    @Test
    @Transactional
    void movingWithinTheRootKeepsDensePersistedOrder() {
        Fixture f = fixture();
        var first = (TocApi.AddResult.Added) toc.addEntry(f.toc, null, "First", TocApi.Kind.GROUP, null, null, null);
        var second = (TocApi.AddResult.Added) toc.addEntry(f.toc, null, "Second", TocApi.Kind.GROUP, null, null, null);
        toc.move(new TocApi.EntryId(first.entry().id()), null, 1);

        assertThat(toc.tree(f.toc))
                .extracting(TocApi.View::id)
                .containsExactly(second.entry().id(), first.entry().id());
        assertThat(toc.tree(f.toc)).extracting(TocApi.View::position).containsExactly(0, 1);
    }

    private Fixture fixture() {
        UUID tenant = UUID.randomUUID();
        UUID space = UUID.randomUUID();
        UUID page = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", tenant, "Tenant " + tenant);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        fixtures.update(
                "insert into authoring.spaces (id, tenant_id, name, mode) values (?, ?, 'Docs', 'authored')",
                space,
                tenant);
        fixtures.update("""
                insert into authoring.pages (
                  id, tenant_id, title, format, created_by_type, updated_by_type)
                values (?, ?, 'Quick start', 'markdown', 'system', 'system')
                """, page, tenant);
        fixtures.update(
                "insert into authoring.space_page_placements (space_id, page_id, slug) values (?, ?, 'quick-start')",
                space,
                page);
        return new Fixture(new TocApi.TocId(space), page);
    }

    private record Fixture(TocApi.TocId toc, UUID page) {}
}
