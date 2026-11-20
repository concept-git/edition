package io.space.concepts.redirect;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.redirect.api.*;
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
@org.springframework.context.annotation.Import(io.space.concepts.redirect.adapters.RedirectConfiguration.class)
class RedirectModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    RedirectApi redirects;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void exactWinsThenLongestPrefixAndOverwritePointsAtLatestStableTarget(PublishedEvents events) {
        UUID site = site();
        var scope = new RedirectApi.ScopeId(site);
        UUID broad = UUID.randomUUID();
        UUID narrow = UUID.randomUUID();
        UUID exact = UUID.randomUUID();
        registered(scope, "/docs/*", broad, RedirectApi.Origin.AUTO);
        registered(scope, "/docs/old/*", narrow, RedirectApi.Origin.AUTO);
        registered(scope, "/docs/old/file", exact, RedirectApi.Origin.MANUAL);

        assertThat(redirects.lookup(scope, "/docs/old/file").orElseThrow().targetId())
                .isEqualTo(exact);
        assertThat(redirects.lookup(scope, "/docs/old/image.png").orElseThrow().targetId())
                .isEqualTo(narrow);
        assertThat(redirects.lookup(scope, "/docs/other").orElseThrow().targetId())
                .isEqualTo(broad);

        UUID latest = UUID.randomUUID();
        registered(scope, "/docs/old/file", latest, RedirectApi.Origin.AUTO);
        var overwritten = redirects.get(scope, "/docs/old/file").orElseThrow();
        assertThat(overwritten.targetId()).isEqualTo(latest);
        assertThat(overwritten.origin()).isEqualTo(RedirectApi.Origin.AUTO);
        assertThat(events.ofType(RedirectEvents.Registered.class)).hasSize(4);
    }

    @Test
    void listFiltersOriginAndRetireIsIdempotent() {
        UUID site = site();
        var scope = new RedirectApi.ScopeId(site);
        registered(scope, "/a", UUID.randomUUID(), RedirectApi.Origin.AUTO);
        registered(scope, "/b", UUID.randomUUID(), RedirectApi.Origin.MANUAL);

        var manual = redirects.list(scope, Optional.of(RedirectApi.Origin.MANUAL), null, 20);
        assertThat(manual.items()).extracting(RedirectApi.Rule::path).containsExactly("/b");
        redirects.retire(scope, "/b");
        redirects.retire(scope, "/b");
        assertThat(redirects.get(scope, "/b")).isEmpty();
    }

    @Test
    void prefixRulesTreatSqlWildcardsAsLiteralPathCharacters() {
        var scope = new RedirectApi.ScopeId(site());
        UUID target = UUID.randomUUID();
        registered(scope, "/a_b/*", target, RedirectApi.Origin.MANUAL);
        registered(scope, "/percent%/*", target, RedirectApi.Origin.MANUAL);
        assertThat(redirects.lookup(scope, "/axb/child")).isEmpty();
        assertThat(redirects.lookup(scope, "/percent-anything/child")).isEmpty();
        assertThat(redirects.lookup(scope, "/a_b/child"))
                .get()
                .extracting(RedirectApi.Rule::targetId)
                .isEqualTo(target);
        assertThat(redirects.lookup(scope, "/percent%/child"))
                .get()
                .extracting(RedirectApi.Rule::targetId)
                .isEqualTo(target);
    }

    private RedirectApi.Rule registered(
            RedirectApi.ScopeId scope, String path, UUID target, RedirectApi.Origin origin) {
        UUID tenant =
                fixtures.queryForObject("select tenant_id from hosting.sites where id=?", UUID.class, scope.value());
        fixtures.update(
                "insert into authoring.pages(id,tenant_id,title,format,created_by_type,updated_by_type) values(?,?,'Target','markdown','system','system') on conflict do nothing",
                target,
                tenant);
        return ((RedirectApi.RegisterResult.Registered)
                        redirects.register(scope, path, RedirectApi.TargetType.PAGE, target, origin))
                .rule();
    }

    private UUID site() {
        UUID tenant = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", tenant, "Tenant " + tenant);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        UUID site = UUID.randomUUID();
        fixtures.update("""
                insert into hosting.sites (id, tenant_id, name, created_by, updated_by)
                values (?, ?, 'Docs', ?, ?)
                """, site, tenant, UUID.randomUUID(), UUID.randomUUID());
        return site;
    }
}
