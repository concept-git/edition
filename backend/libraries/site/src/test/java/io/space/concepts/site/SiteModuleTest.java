package io.space.concepts.site;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.site.api.*;
import java.util.List;
import java.util.Optional;
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
@org.springframework.context.annotation.Import(io.space.concepts.site.adapters.SiteConfiguration.class)
class SiteModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    SiteApi sites;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    // OP: after create, mount, setHome then _targetAt and home bind the same target
    @Test
    void createThenMountGivesTheTargetASiteAddress(PublishedEvents events) {
        UUID tenant = tenant();
        var actor = actor();
        UUID space = space(tenant);
        var created = sites.create(actor, tenant, "Acme Docs");
        var id = new SiteApi.SiteId(created.id());

        assertThat(sites.mount(actor, id, space, "api")).isInstanceOf(SiteApi.MountResult.Mounted.class);
        assertThat(sites.setHome(actor, id, Optional.of(space))).isInstanceOf(SiteApi.MutationResult.Changed.class);
        assertThat(sites.targetAt(id, "api")).contains(space);
        assertThat(sites.view(id).orElseThrow().home()).isEqualTo(space);
        assertThat(sites.tenantOf(id)).contains(tenant);
        assertThat(sites.mountsOf(space)).extracting(SiteApi.Occurrence::slug).containsExactly("api");
        assertThat(events.ofType(SiteEvents.Created.class)).hasSize(1);
        assertThat(events.ofType(SiteEvents.Mounted.class)).hasSize(1);
    }

    // OP: after setBranding / setTitleTemplate then _view reads them back
    @Test
    void brandingAndTitleTemplatePresentTheSiteAsOneAppearance() {
        UUID tenant = tenant();
        var actor = actor();
        var id = new SiteApi.SiteId(sites.create(actor, tenant, "Acme Docs").id());
        var branding = new SiteApi.Branding(
                "https://cdn.example.com/logo.svg", "https://cdn.example.com/favicon.ico", "#0f172a");

        assertThat(sites.setBranding(actor, id, branding)).isInstanceOf(SiteApi.MutationResult.Changed.class);
        assertThat(sites.setTitleTemplate(actor, id, Optional.of("%s | Acme Docs")))
                .isInstanceOf(SiteApi.MutationResult.Changed.class);

        SiteApi.View view = sites.view(id).orElseThrow();
        assertThat(view.branding()).isEqualTo(branding);
        assertThat(view.titleTemplate()).isEqualTo("%s | Acme Docs");
    }

    @Test
    void brandingPreservesJsonStringEscapes() {
        UUID tenant = tenant();
        var actor = actor();
        var id = new SiteApi.SiteId(
                sites.create(actor, tenant, "Escaped branding").id());
        var branding = new SiteApi.Branding("https://cdn.example.com/标识.svg", "line\nfeed\tand\"quote\\", "");

        jdbc.update(
                "update hosting.sites set branding = ?::jsonb where id = ?",
                "{\"logo\":\"https://cdn.example.com/" + "\\u6807\\u8bc6.svg"
                        + "\",\"favicon\":\"line\\nfeed\\tand\\\"quote\\\\\",\"primaryColor\":\"\"}",
                id.value());
        assertThat(sites.view(id).orElseThrow().branding()).isEqualTo(branding);

        sites.setBranding(actor, id, branding);
        assertThat(sites.view(id).orElseThrow().branding()).isEqualTo(branding);
    }

    @Test
    void remountMovesTheSlugAndReleasesTheOldOne() {
        UUID tenant = tenant();
        var actor = actor();
        UUID space = space(tenant);
        var id = new SiteApi.SiteId(sites.create(actor, tenant, "Acme Docs").id());
        sites.mount(actor, id, space, "api");

        var moved = (SiteApi.MountResult.Mounted) sites.remount(actor, id, "api", "developers");
        assertThat(sites.targetAt(id, "developers")).contains(space);
        assertThat(sites.targetAt(id, "api")).isEmpty();
        assertThat(moved.site().mounts()).extracting(SiteApi.Mount::slug).containsExactly("developers");
    }

    @Test
    void sameSiteRejectsASecondMountOfTheSameTarget() {
        UUID tenant = tenant();
        var actor = actor();
        UUID space = space(tenant);
        var id = new SiteApi.SiteId(sites.create(actor, tenant, "Docs").id());
        sites.mount(actor, id, space, "api");

        assertThat(sites.mount(actor, id, space, "docs")).isInstanceOf(SiteApi.MountResult.TargetAlreadyMounted.class);
        assertThat(sites.mount(actor, id, UUID.randomUUID(), "api")).isInstanceOf(SiteApi.MountResult.SlugTaken.class);
    }

    @Test
    void unmountClearsHomeAndDeleteRequiresEmptyMounts() {
        UUID tenant = tenant();
        var actor = actor();
        UUID space = space(tenant);
        var id = new SiteApi.SiteId(sites.create(actor, tenant, "Docs").id());
        sites.mount(actor, id, space, "api");
        sites.setHome(actor, id, Optional.of(space));
        assertThat(sites.view(id).orElseThrow().home()).isEqualTo(space);

        sites.unmount(actor, id, "api");
        assertThat(sites.targetAt(id, "api")).isEmpty();
        assertThat(sites.view(id).orElseThrow().home()).isNull();
        assertThat(sites.delete(actor, id)).isInstanceOf(SiteApi.DeleteResult.Deleted.class);
        assertThat(sites.view(id)).isEmpty();
    }

    @Test
    void deleteRejectsASiteThatStillHasMounts() {
        UUID tenant = tenant();
        var actor = actor();
        var id = new SiteApi.SiteId(sites.create(actor, tenant, "Docs").id());
        sites.mount(actor, id, space(tenant), "api");
        assertThat(sites.delete(actor, id)).isInstanceOf(SiteApi.DeleteResult.NotEmpty.class);
    }

    @Test
    void pagesByStableUpdatedCursor() {
        UUID tenant = tenant();
        var actor = actor();
        sites.create(actor, tenant, "A");
        sites.create(actor, tenant, "B");
        var first = sites.pageByTenant(tenant, null, 1);
        var second = sites.pageByTenant(tenant, first.nextCursor(), 1);
        assertThat(first.items()).hasSize(1);
        assertThat(second.items()).hasSize(1);
        assertThat(first.items().getFirst().id())
                .isNotEqualTo(second.items().getFirst().id());
    }

    @Test
    void tenantListsAndPagesKeepEachSitesOrderedMounts() {
        UUID tenant = tenant();
        var actor = actor();
        var mounted = new SiteApi.SiteId(sites.create(actor, tenant, "Mounted").id());
        var empty = new SiteApi.SiteId(sites.create(actor, tenant, "Empty").id());
        UUID first = space(tenant), second = space(tenant);
        sites.mount(actor, mounted, first, "first");
        sites.mount(actor, mounted, second, "second");
        sites.reorder(actor, mounted, List.of("second", "first"));
        UUID anotherTenant = tenant();
        var foreign =
                new SiteApi.SiteId(sites.create(actor, anotherTenant, "Foreign").id());
        sites.mount(actor, foreign, space(anotherTenant), "foreign");

        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        var listed = sites.listByTenant(tenant);
        assertThat(listed).extracting(SiteApi.View::id).containsExactlyInAnyOrder(mounted.value(), empty.value());
        assertThat(listed.stream()
                        .filter(v -> v.id().equals(mounted.value()))
                        .findFirst()
                        .orElseThrow()
                        .mounts())
                .extracting(SiteApi.Mount::slug)
                .containsExactly("second", "first");
        assertThat(listed.stream()
                        .filter(v -> v.id().equals(empty.value()))
                        .findFirst()
                        .orElseThrow()
                        .mounts())
                .isEmpty();

        var page = sites.pageByTenant(tenant, null, 1);
        var next = sites.pageByTenant(tenant, page.nextCursor(), 1);
        for (var view : List.of(page.items().getFirst(), next.items().getFirst())) {
            assertThat(view.mounts())
                    .isEqualTo(sites.view(new SiteApi.SiteId(view.id()))
                            .orElseThrow()
                            .mounts());
        }
        assertThat(next.nextCursor()).isNull();
    }

    @Test
    void reorderRequiresAPermutationOfCurrentSlugs() {
        UUID tenant = tenant();
        var actor = actor();
        var id = new SiteApi.SiteId(sites.create(actor, tenant, "Docs").id());
        UUID first = space(tenant);
        UUID second = space(tenant);
        sites.mount(actor, id, first, "a");
        sites.mount(actor, id, second, "b");
        var changed = (SiteApi.MutationResult.Changed) sites.reorder(actor, id, List.of("b", "a"));
        assertThat(changed.site().mounts()).extracting(SiteApi.Mount::slug).containsExactly("b", "a");
    }

    private UUID tenant() {
        UUID id = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", id, "Tenant " + id);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, id.toString());
        return id;
    }

    private UUID space(UUID tenant) {
        UUID id = UUID.randomUUID();
        fixtures.update("""
                insert into authoring.spaces (id, tenant_id, name, mode)
                values (?, ?, 'Space', 'authored')
                """, id, tenant);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        return id;
    }

    private static SiteApi.ActorId actor() {
        return new SiteApi.ActorId(UUID.randomUUID());
    }
}
