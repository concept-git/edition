package io.space.concepts.space;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.space.api.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@org.springframework.transaction.annotation.Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.space.adapters.SpaceConfiguration.class)
class SpaceModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    SpaceApi spaces;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void createsBothModesWithExplicitTenantStamp(PublishedEvents events) {
        UUID tenant = tenant();
        var actor = actor();
        var authored = spaces.create(actor, tenant, "作者空间", SpaceApi.Mode.AUTHORED);
        var synced = spaces.create(actor, tenant, "同步空间", SpaceApi.Mode.SYNCED);

        assertThat(spaces.listByTenant(tenant))
                .extracting(SpaceApi.View::mode)
                .containsExactlyInAnyOrder(SpaceApi.Mode.AUTHORED, SpaceApi.Mode.SYNCED);
        assertThat(jdbc.queryForObject(
                        "select tenant_id from authoring.spaces where id = ?", UUID.class, authored.id()))
                .isEqualTo(tenant);
        assertThat(events.ofType(SpaceEvents.Created.class)).hasSize(2);
        assertThat(synced.status()).isEqualTo(SpaceApi.Status.ACTIVE);
        assertThat(authored.createdBy()).isEqualTo(actor.value());
        assertThat(spaces.tenantOf(new SpaceApi.SpaceId(authored.id()))).contains(tenant);
    }

    @Test
    void archivedSpaceRejectsMetadataWritesAndRestoreAllowsThem() {
        UUID tenant = tenant();
        var actor = actor();
        var created = spaces.create(actor, tenant, "空间", SpaceApi.Mode.AUTHORED);
        var id = new SpaceApi.SpaceId(created.id());

        assertThat(spaces.archive(actor, id)).isInstanceOf(SpaceApi.LookupResult.Found.class);
        assertThat(spaces.rename(actor, id, "新名称")).isInstanceOf(SpaceApi.MutationResult.Archived.class);
        assertThat(spaces.describe(actor, id, SpaceApi.Patch.unchanged(), SpaceApi.Patch.set("说明")))
                .isInstanceOf(SpaceApi.MutationResult.Archived.class);
        assertThat(spaces.listByTenant(tenant))
                .extracting(SpaceApi.View::status)
                .containsExactly(SpaceApi.Status.ARCHIVED);

        assertThat(spaces.restore(actor, id)).isInstanceOf(SpaceApi.LookupResult.Found.class);
        assertThat(spaces.rename(actor, id, "新名称")).isInstanceOf(SpaceApi.MutationResult.Changed.class);
        assertThat(spaces.describe(actor, id, SpaceApi.Patch.set(SpaceApi.IconKey.BOOK), SpaceApi.Patch.set("说明")))
                .isInstanceOf(SpaceApi.MutationResult.Changed.class);
        assertThat(spaces.describe(actor, id, SpaceApi.Patch.set(SpaceApi.IconKey.CODE), SpaceApi.Patch.unchanged()))
                .isInstanceOf(SpaceApi.MutationResult.Changed.class);
        assertThat(spaces.view(id).orElseThrow().description()).isEqualTo("说明");
    }

    @Test
    void missingSpaceHasFiniteNotFoundOutput() {
        tenant();
        var missing = new SpaceApi.SpaceId(UUID.randomUUID());
        var actor = actor();
        assertThat(spaces.archive(actor, missing)).isInstanceOf(SpaceApi.LookupResult.NotFound.class);
        assertThat(spaces.rename(actor, missing, "不存在")).isInstanceOf(SpaceApi.MutationResult.NotFound.class);
        assertThat(spaces.view(missing)).isEmpty();
    }

    @Test
    void convertIsIdempotentForTheSameModeAndForcesAutoReleaseOnAuthored() {
        UUID tenant = tenant();
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        var actor = actor();
        var created = spaces.create(actor, tenant, "可转换", SpaceApi.Mode.SYNCED);
        var id = new SpaceApi.SpaceId(created.id());
        UUID item = page(tenant, actor.value());
        assertThat(spaces.place(id, item, "home")).isInstanceOf(SpaceApi.PlacementResult.Placed.class);

        assertThat(spaces.convert(actor, id, SpaceApi.Mode.SYNCED)).isInstanceOf(SpaceApi.MutationResult.Changed.class);
        var authored = (SpaceApi.MutationResult.Changed) spaces.convert(actor, id, SpaceApi.Mode.AUTHORED);
        assertThat(authored.space().mode()).isEqualTo(SpaceApi.Mode.AUTHORED);
        assertThat(authored.space().autoRelease()).isTrue();
        assertThat(spaces.spaceOf(item)).contains(id);
        assertThat(spaces.convert(actor, id, SpaceApi.Mode.SYNCED)).isInstanceOf(SpaceApi.MutationResult.Changed.class);
        assertThat(spaces.view(id).orElseThrow().mode()).isEqualTo(SpaceApi.Mode.SYNCED);
        assertThat(spaces.spaceOf(item)).contains(id);
    }

    @Test
    void setAutoReleasePersistsAndIsIdempotent(PublishedEvents events) {
        UUID tenant = tenant();
        var actor = actor();
        var created = spaces.create(actor, tenant, "Wiki", SpaceApi.Mode.AUTHORED);
        var id = new SpaceApi.SpaceId(created.id());

        var off = (SpaceApi.MutationResult.Changed) spaces.setAutoRelease(actor, id, false);
        assertThat(off.space().autoRelease()).isFalse();
        assertThat(spaces.setAutoRelease(actor, id, false)).isInstanceOf(SpaceApi.MutationResult.Changed.class);
        assertThat(spaces.view(id).orElseThrow().autoRelease()).isFalse();
        assertThat(events.ofType(SpaceEvents.AutoReleaseSet.class)).hasSize(1);
        assertThat(spaces.setAutoRelease(actor, new SpaceApi.SpaceId(UUID.randomUUID()), true))
                .isInstanceOf(SpaceApi.MutationResult.NotFound.class);
    }

    @Test
    void pagesByStableUpdatedCursorAndFiltersMode() {
        UUID tenant = tenant();
        var actor = actor();
        spaces.create(actor, tenant, "A", SpaceApi.Mode.AUTHORED);
        spaces.create(actor, tenant, "B", SpaceApi.Mode.SYNCED);
        spaces.create(actor, tenant, "C", SpaceApi.Mode.AUTHORED);

        var first = spaces.pageByTenant(
                tenant, null, 1, java.util.Optional.empty(), java.util.Optional.of(SpaceApi.Mode.AUTHORED));
        var second = spaces.pageByTenant(
                tenant,
                first.nextCursor(),
                1,
                java.util.Optional.empty(),
                java.util.Optional.of(SpaceApi.Mode.AUTHORED));

        assertThat(first.items()).hasSize(1);
        assertThat(second.items()).hasSize(1);
        assertThat(first.items().getFirst().id())
                .isNotEqualTo(second.items().getFirst().id());
    }

    // OP: after archive (s), place (s, y, "new") : (error: space_archived), restore (s)
    // then place succeeds — 整体进入只读、整体恢复
    @Test
    void archivedSpaceRejectsPlacementAndRestoreAllowsIt() {
        UUID tenant = tenant();
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        var actor = actor();
        var spaceId = new SpaceApi.SpaceId(
                spaces.create(actor, tenant, "Docs", SpaceApi.Mode.AUTHORED).id());
        UUID item = page(tenant, actor.value());

        assertThat(spaces.archive(actor, spaceId)).isInstanceOf(SpaceApi.LookupResult.Found.class);
        assertThat(spaces.place(spaceId, item, "new")).isInstanceOf(SpaceApi.PlacementResult.SpaceArchived.class);
        assertThat(spaces.spaceOf(item)).isEmpty();

        assertThat(spaces.restore(actor, spaceId)).isInstanceOf(SpaceApi.LookupResult.Found.class);
        assertThat(spaces.place(spaceId, item, "new")).isInstanceOf(SpaceApi.PlacementResult.Placed.class);
        assertThat(spaces.spaceOf(item)).contains(spaceId);
        assertThat(spaces.itemAt(spaceId, "new")).contains(item);
    }

    @Test
    void placementOwnsCanonicalFilePathsAndPrefixConflicts() {
        UUID tenant = tenant();
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        var actor = actor();
        var space = spaces.create(actor, tenant, "Docs", SpaceApi.Mode.AUTHORED);
        UUID first = page(tenant, actor.value());
        UUID second = page(tenant, actor.value());

        assertThat(spaces.place(new SpaceApi.SpaceId(space.id()), first, "skills/Ｇuide-中文/SKILL.md"))
                .isInstanceOf(SpaceApi.PlacementResult.Placed.class);
        assertThat(spaces.spaceOf(first)).contains(new SpaceApi.SpaceId(space.id()));
        assertThat(spaces.itemAt(new SpaceApi.SpaceId(space.id()), "skills/Ｇuide-中文/SKILL.md"))
                .contains(first);
        assertThat(spaces.place(new SpaceApi.SpaceId(space.id()), second, "skills/Ｇuide-中文"))
                .isInstanceOf(SpaceApi.PlacementResult.SlugTaken.class);
    }

    @Test
    void reslugMovesTheAddressAndIsIdempotentForTheCurrentSlug() {
        UUID tenant = tenant();
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        var actor = actor();
        var spaceId = new SpaceApi.SpaceId(
                spaces.create(actor, tenant, "Docs", SpaceApi.Mode.AUTHORED).id());
        UUID item = page(tenant, actor.value());
        assertThat(spaces.place(spaceId, item, "a")).isInstanceOf(SpaceApi.PlacementResult.Placed.class);

        var moved = (SpaceApi.PlacementResult.Placed) spaces.reslug(spaceId, item, "b");
        assertThat(moved.placement().slug()).isEqualTo("b");
        assertThat(spaces.itemAt(spaceId, "b")).contains(item);
        assertThat(spaces.itemAt(spaceId, "a")).isEmpty();
        assertThat(spaces.spaceOf(item)).contains(spaceId);

        assertThat(spaces.reslug(spaceId, item, "b")).isInstanceOf(SpaceApi.PlacementResult.Placed.class);
        assertThat(spaces.itemAt(spaceId, "b")).contains(item);
    }

    @Test
    void reslugRejectsTakenInvalidArchivedAndMissingTargets() {
        UUID tenant = tenant();
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        var actor = actor();
        var space = spaces.create(actor, tenant, "Docs", SpaceApi.Mode.AUTHORED);
        var spaceId = new SpaceApi.SpaceId(space.id());
        var other = new SpaceApi.SpaceId(
                spaces.create(actor, tenant, "Other", SpaceApi.Mode.AUTHORED).id());
        UUID item = page(tenant, actor.value());
        UUID occupant = page(tenant, actor.value());
        UUID elsewhere = page(tenant, actor.value());
        spaces.place(spaceId, item, "a");
        spaces.place(spaceId, occupant, "taken");
        spaces.place(other, elsewhere, "x");

        assertThat(spaces.reslug(spaceId, item, "taken")).isInstanceOf(SpaceApi.PlacementResult.SlugTaken.class);
        assertThat(spaces.itemAt(spaceId, "a")).contains(item);
        assertThat(spaces.reslug(spaceId, item, "../guide")).isInstanceOf(SpaceApi.PlacementResult.SlugInvalid.class);
        assertThat(spaces.reslug(new SpaceApi.SpaceId(UUID.randomUUID()), item, "b"))
                .isInstanceOf(SpaceApi.PlacementResult.SpaceNotFound.class);
        assertThat(spaces.reslug(spaceId, UUID.randomUUID(), "b"))
                .isInstanceOf(SpaceApi.PlacementResult.ItemNotInSpace.class);
        assertThat(spaces.reslug(spaceId, elsewhere, "b")).isInstanceOf(SpaceApi.PlacementResult.ItemNotInSpace.class);

        spaces.archive(actor, spaceId);
        assertThat(spaces.reslug(spaceId, item, "b")).isInstanceOf(SpaceApi.PlacementResult.SpaceArchived.class);
        assertThat(spaces.itemAt(spaceId, "a")).contains(item);
    }

    @Test
    void transferAtomicallyMovesMembershipAndAddress() {
        UUID tenant = tenant();
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        var actor = actor();
        var source = new SpaceApi.SpaceId(
                spaces.create(actor, tenant, "Source", SpaceApi.Mode.AUTHORED).id());
        var target = new SpaceApi.SpaceId(
                spaces.create(actor, tenant, "Target", SpaceApi.Mode.AUTHORED).id());
        UUID item = page(tenant, actor.value());
        spaces.place(source, item, "old");

        var moved = (SpaceApi.TransferResult.Transferred) spaces.transfer(item, target, "new");
        assertThat(moved.from().space()).isEqualTo(source);
        assertThat(moved.to().space()).isEqualTo(target);
        assertThat(moved.to().slug()).isEqualTo("new");
        assertThat(spaces.itemAt(source, "old")).isEmpty();
        assertThat(spaces.itemAt(target, "new")).contains(item);
        assertThat(spaces.spaceOf(item)).contains(target);
    }

    private UUID tenant() {
        UUID id = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", id, "Tenant " + id);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, id.toString());
        return id;
    }

    private static SpaceApi.ActorId actor() {
        return new SpaceApi.ActorId(UUID.randomUUID());
    }

    private UUID page(UUID tenant, UUID actor) {
        UUID page = UUID.randomUUID();
        fixtures.update("""
                insert into authoring.pages (
                  id, tenant_id, title, format, created_by_type, created_by, updated_by_type, updated_by)
                values (?, ?, 'Page', 'markdown', 'user', ?, 'user', ?)
                """, page, tenant, actor, actor);
        return page;
    }
}
