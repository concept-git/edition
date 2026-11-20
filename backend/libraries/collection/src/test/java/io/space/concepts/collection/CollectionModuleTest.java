package io.space.concepts.collection;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.collection.api.*;
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

/** Collection 模块缝：create/place/move/remove 经真实 PG；非空删除不丢空间。 */
@ApplicationModuleTest
@org.springframework.context.annotation.Import(io.space.concepts.collection.adapters.CollectionConfiguration.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class CollectionModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    CollectionApi collections;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    @Transactional
    void placesASpaceAndRejectsRemovingANonEmptyGroup(PublishedEvents events) {
        Fixture f = fixture();
        var created = (CollectionApi.CreateResult.Created)
                collections.create(f.tenant, null, "产品文档", CollectionApi.IconKey.BOOK, null);
        assertThat(collections.place(
                        f.space,
                        new CollectionApi.CollectionId(created.collection().id()),
                        null))
                .isInstanceOf(CollectionApi.PlaceResult.Placed.class);
        assertThat(collections.itemsIn(
                        new CollectionApi.CollectionId(created.collection().id())))
                .containsExactly(f.space);
        assertThat(collections.pathOf(f.space)).containsExactly("产品文档");
        assertThat(collections.remove(
                        new CollectionApi.CollectionId(created.collection().id())))
                .isInstanceOf(CollectionApi.RemoveResult.NotEmpty.class);
        assertThat(jdbc.queryForObject("select count(*) from authoring.spaces where id = ?", Long.class, f.space))
                .isEqualTo(1L);
        collections.unplace(f.space);
        assertThat(collections.remove(
                        new CollectionApi.CollectionId(created.collection().id())))
                .isInstanceOf(CollectionApi.RemoveResult.Removed.class);
        assertThat(events.ofType(CollectionEvents.Created.class)).hasSize(1);
        assertThat(events.ofType(CollectionEvents.Placed.class)).hasSize(1);
        assertThat(events.ofType(CollectionEvents.Unplaced.class)).hasSize(1);
        assertThat(events.ofType(CollectionEvents.Removed.class)).hasSize(1);
    }

    @Test
    @Transactional
    void fourthLevelAndCycleAreFiniteOutputs() {
        Fixture f = fixture();
        UUID parent = null;
        for (int level = 1; level <= 3; level++) {
            var added = (CollectionApi.CreateResult.Created) collections.create(
                    f.tenant, parent == null ? null : new CollectionApi.CollectionId(parent), "L" + level, null, null);
            parent = added.collection().id();
        }
        assertThat(collections.create(f.tenant, new CollectionApi.CollectionId(parent), "L4", null, null))
                .isInstanceOf(CollectionApi.CreateResult.DepthExceeded.class);

        var root = (CollectionApi.CreateResult.Created) collections.create(f.tenant, null, "父", null, null);
        var child = (CollectionApi.CreateResult.Created) collections.create(
                f.tenant, new CollectionApi.CollectionId(root.collection().id()), "子", null, null);
        assertThat(collections.move(
                        new CollectionApi.CollectionId(root.collection().id()),
                        new CollectionApi.CollectionId(child.collection().id()),
                        0))
                .isInstanceOf(CollectionApi.MoveResult.CycleDetected.class);
        assertThat(collections.create(f.tenant, null, "父", null, null))
                .isInstanceOf(CollectionApi.CreateResult.NameTaken.class);
    }

    @Test
    @Transactional
    void renameSetIconAndInvalidPlacePositionAreFiniteOutputs() {
        Fixture f = fixture();
        var created = (CollectionApi.CreateResult.Created)
                collections.create(f.tenant, null, "产品文档", CollectionApi.IconKey.BOOK, null);
        CollectionApi.CollectionId id =
                new CollectionApi.CollectionId(created.collection().id());
        var renamed = (CollectionApi.RenameResult.Renamed) collections.rename(id, "新产品");
        assertThat(renamed.tree()).extracting(CollectionApi.View::name).containsExactly("新产品");
        var icon = (CollectionApi.SetIconResult.Changed) collections.setIcon(id, CollectionApi.IconKey.GUIDE);
        assertThat(icon.tree().getFirst().icon()).isEqualTo(CollectionApi.IconKey.GUIDE);
        assertThat(collections.place(f.space, id, 99)).isInstanceOf(CollectionApi.PlaceResult.PositionInvalid.class);
        assertThat(collections.place(f.space, id, 0)).isInstanceOf(CollectionApi.PlaceResult.Placed.class);
    }

    @Test
    @Transactional
    void movingATallSubtreeUnderAnotherRootExceedsMaxDepth() {
        Fixture f = fixture();
        var tall = (CollectionApi.CreateResult.Created) collections.create(f.tenant, null, "高", null, null);
        var mid = (CollectionApi.CreateResult.Created) collections.create(
                f.tenant, new CollectionApi.CollectionId(tall.collection().id()), "中", null, null);
        collections.create(
                f.tenant, new CollectionApi.CollectionId(mid.collection().id()), "叶", null, null);
        var other = (CollectionApi.CreateResult.Created) collections.create(f.tenant, null, "旁", null, null);
        assertThat(collections.move(
                        new CollectionApi.CollectionId(tall.collection().id()),
                        new CollectionApi.CollectionId(other.collection().id()),
                        0))
                .isInstanceOf(CollectionApi.MoveResult.DepthExceeded.class);
    }

    @Test
    @Transactional
    void sameParentAndSameGroupMovesKeepDenseOrder() {
        Fixture f = fixture();
        var first = (CollectionApi.CreateResult.Created) collections.create(f.tenant, null, "First", null, null);
        var second = (CollectionApi.CreateResult.Created) collections.create(f.tenant, null, "Second", null, null);
        var firstId = new CollectionApi.CollectionId(first.collection().id());
        collections.move(firstId, null, 1);
        assertThat(collections.tree(f.tenant))
                .extracting(CollectionApi.View::id)
                .containsExactly(second.collection().id(), first.collection().id());
        assertThat(collections.tree(f.tenant))
                .extracting(CollectionApi.View::position)
                .containsExactly(0, 1);

        UUID other = UUID.randomUUID();
        fixtures.update(
                "insert into authoring.spaces(id,tenant_id,name,mode) values (?,?,'Other','authored')",
                other,
                f.tenant);
        collections.place(f.space, firstId, null);
        collections.place(other, firstId, null);
        collections.place(f.space, firstId, 1);
        assertThat(collections.itemsIn(firstId)).containsExactly(other, f.space);
    }

    private Fixture fixture() {
        UUID tenant = UUID.randomUUID();
        UUID space = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", tenant, "Tenant " + tenant);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        fixtures.update(
                "insert into authoring.spaces (id, tenant_id, name, mode) values (?, ?, 'Docs', 'authored')",
                space,
                tenant);
        return new Fixture(tenant, space);
    }

    private record Fixture(UUID tenant, UUID space) {}
}
