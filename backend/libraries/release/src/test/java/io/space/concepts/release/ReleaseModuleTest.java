package io.space.concepts.release;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.release.api.*;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

@ApplicationModuleTest
@org.springframework.context.annotation.Import(io.space.concepts.release.adapters.ReleaseConfiguration.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class ReleaseModuleTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    ReleaseApi releases;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Autowired
    PlatformTransactionManager transactions;

    @Test
    @Transactional
    void draftsLoadValidatesAndPromotesAnEmptyBundle(PublishedEvents events) {
        Fixture fixture = fixture();
        var drafted = releases.draft(fixture.scope, source());
        assertThat(drafted.label()).isEqualTo("1");
        assertThat(drafted.status()).isEqualTo(ReleaseApi.Status.DRAFT);
        assertThat(releases.keep(fixture.scope)).isEqualTo(ReleaseApi.DEFAULT_KEEP);

        var loaded = releases.load(id(drafted), emptyBundle());
        assertThat(loaded).isInstanceOf(ReleaseApi.LoadResult.Loaded.class);
        var validated = releases.validate(id(drafted), List.of());
        assertThat(validated).isInstanceOf(ReleaseApi.ValidateResult.Ok.class);
        assertThat(((ReleaseApi.ValidateResult.Ok) validated).release().status())
                .isEqualTo(ReleaseApi.Status.VALIDATED);

        var promoted = releases.promote(id(drafted));
        assertThat(promoted).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        assertThat(releases.live(fixture.scope).orElseThrow().id()).isEqualTo(drafted.id());
        assertThat(releases.live(fixture.scope).orElseThrow().promotedAt()).isNotNull();
        assertThat(events.ofType(ReleaseEvents.Drafted.class)).hasSize(1);
        assertThat(events.ofType(ReleaseEvents.Loaded.class)).hasSize(1);
        assertThat(events.ofType(ReleaseEvents.Validated.class)).hasSize(1);
        assertThat(events.ofType(ReleaseEvents.Promoted.class)).hasSize(1);
    }

    @Test
    @Transactional
    void secondLoadIsAProgrammingErrorAndInvalidBundleStaysDraft() {
        Fixture fixture = fixture();
        var drafted = releases.draft(fixture.scope, source());
        assertThat(releases.load(id(drafted), emptyBundle())).isInstanceOf(ReleaseApi.LoadResult.Loaded.class);
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> releases.load(id(drafted), emptyBundle()));

        var other = releases.draft(fixture.scope, source());
        assertThat(other.label()).isEqualTo("2");
        var invalid = releases.load(
                id(other),
                new ReleaseApi.Bundle(
                        "2.0", " ", Instant.parse("2026-09-01T00:00:00Z"), List.of(), List.of(), Map.of()));
        assertThat(invalid).isInstanceOf(ReleaseApi.LoadResult.InvalidBundle.class);
        assertThat(releases.status(id(other))).contains(ReleaseApi.Status.DRAFT);
        assertThat(((ReleaseApi.LoadResult.InvalidBundle) invalid).report().blocking())
                .isTrue();
    }

    @Test
    @Transactional
    void contentLargerThanTwoMebibytesIsInvalidBundle() {
        Fixture fixture = fixture();
        var drafted = releases.draft(fixture.scope, source());
        String body = "a".repeat(ReleaseApi.MAX_CONTENT_BYTES + 1);
        var page = page("guide", body, "guide");
        var loaded = releases.load(id(drafted), bundle(List.of(page), List.of(), checksums(page)));
        assertThat(loaded).isInstanceOf(ReleaseApi.LoadResult.InvalidBundle.class);
        assertThat(((ReleaseApi.LoadResult.InvalidBundle) loaded).report().errors())
                .extracting(ReleaseApi.Issue::code)
                .contains("content_too_large");
    }

    @Test
    @Transactional
    void duplicateSlugsRemainInspectableAsValidationErrors() {
        Fixture fixture = fixture();
        var drafted = releases.draft(fixture.scope, source());
        var first = page("duplicate", "First body", "first");
        var second = page("duplicate", "Second body", "second");
        assertThat(releases.load(id(drafted), bundle(List.of(first, second), List.of(), checksums(first, second))))
                .isInstanceOf(ReleaseApi.LoadResult.Loaded.class);
        var result = releases.validate(id(drafted), List.of());
        assertThat(result).isInstanceOf(ReleaseApi.ValidateResult.Errors.class);
        assertThat(((ReleaseApi.ValidateResult.Errors) result).report().errors())
                .extracting(ReleaseApi.Issue::code)
                .contains("slug_conflict");
        assertThat(releases.status(id(drafted))).contains(ReleaseApi.Status.DRAFT);
        assertThat(releases.export(id(drafted)).orElseThrow().pages()).hasSize(2);
        assertThatExceptionOfType(IllegalStateException.class).isThrownBy(() -> releases.promote(id(drafted)));
    }

    @Test
    @Transactional
    void duplicatePageIdentityIsAFiniteLoadRejection() {
        var fixture = fixture();
        var draft = releases.draft(fixture.scope, source());
        UUID same = UUID.randomUUID();
        var first = page(same, "first", "A", "a");
        var second = page(same, "second", "B", "b");
        var result = releases.load(id(draft), bundle(List.of(first, second), List.of(), checksums(first, second)));
        assertThat(result).isInstanceOf(ReleaseApi.LoadResult.InvalidBundle.class);
        assertThat(((ReleaseApi.LoadResult.InvalidBundle) result).report().errors())
                .extracting(ReleaseApi.Issue::code)
                .contains("duplicate_page_id");
        assertThat(releases.status(id(draft))).contains(ReleaseApi.Status.DRAFT);
        assertThat(releases.export(id(draft))).isEmpty();
    }

    @Test
    @Transactional
    void overlayFlagsAndApproveUnblocksPromoteWhileIntrinsicErrorsStayDraft(PublishedEvents events) {
        Fixture fixture = fixture();
        var page = page("guide", "See [missing](missing-page).", "guide");
        var broken = releases.draft(fixture.scope, source());
        releases.load(id(broken), bundle(List.of(page), List.of(), checksums(page)));
        var errors = releases.validate(id(broken), List.of());
        assertThat(errors).isInstanceOf(ReleaseApi.ValidateResult.Errors.class);
        assertThat(releases.status(id(broken))).contains(ReleaseApi.Status.DRAFT);
        assertThatExceptionOfType(IllegalStateException.class).isThrownBy(() -> releases.promote(id(broken)));

        var overlay = releases.draft(fixture.scope, source());
        var clean = page("ok", "Hello", "ok");
        releases.load(id(overlay), bundle(List.of(clean), List.of(), checksums(clean)));
        var flagged = releases.validate(
                id(overlay), List.of(new ReleaseApi.CoverageWarning(clean.pageId(), clean.externalId())));
        assertThat(flagged).isInstanceOf(ReleaseApi.ValidateResult.Warnings.class);
        assertThat(releases.status(id(overlay))).contains(ReleaseApi.Status.FLAGGED);
        assertThatExceptionOfType(IllegalStateException.class).isThrownBy(() -> releases.promote(id(overlay)));
        assertThat(releases.approve(id(overlay))).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        assertThat(releases.promote(id(overlay))).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        assertThat(events.ofType(ReleaseEvents.Flagged.class)).hasSize(1);
    }

    @Test
    @Transactional
    void hintsStayInfoAndEmptyCoverageValidates() {
        Fixture fixture = fixture();
        var drafted = releases.draft(fixture.scope, source());
        var attachment = new ReleaseApi.AttachmentRef("attachments/unused.bin", "store/unused", ContentHash.hex("x"));
        var page = new ReleaseApi.PageSnapshot(
                UUID.randomUUID(),
                "guide",
                "Guide",
                ReleaseApi.Format.MARKDOWN,
                "Hello",
                "content/guide.md",
                ReleaseApi.Seo.empty(),
                null,
                Map.of(),
                "guide",
                List.of(attachment),
                0);
        releases.load(id(drafted), bundle(List.of(page), List.of(), checksums(page)));
        var ok = (ReleaseApi.ValidateResult.Ok) releases.validate(id(drafted), List.of());
        assertThat(ok.release().status()).isEqualTo(ReleaseApi.Status.VALIDATED);
        assertThat(ok.release().report().info())
                .extracting(ReleaseApi.Issue::code)
                .contains("seo_description_missing", "unused_attachment");
    }

    @Test
    @Transactional
    void discardDeletesTheRowAndExportRoundTripsPages() {
        Fixture fixture = fixture();
        var drafted = releases.draft(fixture.scope, source());
        var page = page("guide", "# Guide", "guide");
        releases.load(id(drafted), bundle(List.of(page), List.of(), checksums(page)));
        var exported = releases.export(id(drafted)).orElseThrow();
        assertThat(exported.pages())
                .singleElement()
                .extracting(ReleaseApi.PageSnapshot::content)
                .isEqualTo("# Guide");
        assertThat(exported.checksums()).containsKey("guide");
        assertThat(exported.generator()).isEqualTo("space");

        assertThat(releases.discard(id(drafted))).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        assertThat(releases.status(id(drafted))).isEmpty();
        assertThat(releases.export(id(drafted))).isEmpty();
        assertThat(jdbc.queryForObject("select count(*) from releases.releases where id = ?", Long.class, drafted.id()))
                .isZero();
    }

    @Test
    @Transactional
    void snapshotRowsRejectUpdates() {
        Fixture fixture = fixture();
        var drafted = releases.draft(fixture.scope, source());
        var page = page("guide", "body", "guide");
        releases.load(id(drafted), bundle(List.of(page), List.of(), checksums(page)));
        assertThatExceptionOfType(Exception.class)
                .isThrownBy(() -> jdbc.update(
                        "update releases.release_pages set title = 'mutated' where release_id = ?", drafted.id()));
        assertThatExceptionOfType(Exception.class)
                .isThrownBy(() -> jdbc.update(
                        "update releases.release_toc set tree = '[]'::jsonb where release_id = ?", drafted.id()));
        assertThatExceptionOfType(Exception.class)
                .isThrownBy(() -> jdbc.update(
                        "update releases.release_contents set body = 'x' where tenant_id = ?", fixture.tenant));
    }

    @Test
    @Transactional
    void setRetentionWritesKeepWithoutPruningAndPruneHonorsKeep() {
        Fixture fixture = fixture();
        ReleaseApi.View live = null;
        for (int index = 1; index <= 4; index++) {
            live = promoteFresh(fixture, "p" + index);
        }
        assertThat(releases.setRetention(fixture.scope, 1)).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        assertThat(releases.keep(fixture.scope)).isEqualTo(1);
        assertThat(releases.list(fixture.scope)).hasSize(4);
        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> releases.setRetention(fixture.scope, 0));
        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> releases.setRetention(fixture.scope, 51));

        var pruned = releases.prune(fixture.scope);
        assertThat(pruned).hasSize(2);
        assertThat(releases.list(fixture.scope)).hasSize(2);
        assertThat(releases.live(fixture.scope).orElseThrow().id()).isEqualTo(live.id());
        assertThat(releases.list(fixture.scope))
                .extracting(ReleaseApi.View::status)
                .containsExactlyInAnyOrder(ReleaseApi.Status.LIVE, ReleaseApi.Status.ARCHIVED);
        assertThat(jdbc.queryForObject(
                        "select count(*) from releases.release_contents where tenant_id = ?",
                        Long.class,
                        fixture.tenant))
                .isEqualTo(2L);
    }

    @Test
    @Transactional
    void promotingAnArchivedReleaseRestoresItAsLive() {
        Fixture fixture = fixture();
        var first = promoteFresh(fixture, "first");
        var second = promoteFresh(fixture, "second");
        assertThat(releases.status(id(first))).contains(ReleaseApi.Status.ARCHIVED);
        assertThat(releases.promote(id(first))).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        assertThat(releases.live(fixture.scope).orElseThrow().id()).isEqualTo(first.id());
        assertThat(releases.status(id(second))).contains(ReleaseApi.Status.ARCHIVED);
    }

    @Test
    @Transactional
    void diffUsesContentHashAndLabelAnnotateLastOfWork() {
        Fixture fixture = fixture();
        UUID shared = UUID.randomUUID();
        UUID onlyLeft = UUID.randomUUID();
        UUID onlyRight = UUID.randomUUID();
        var leftPage = page(shared, "same", "old", "same");
        var removed = page(onlyLeft, "gone", "bye", "gone");
        var rightPage = page(shared, "same", "new", "same");
        var added = page(onlyRight, "fresh", "hi", "fresh");
        var left = load(fixture, bundle(List.of(leftPage, removed), List.of(), checksums(leftPage, removed)));
        var right = load(fixture, bundle(List.of(rightPage, added), List.of(), checksums(rightPage, added)));
        var delta = releases.diff(id(left), id(right)).orElseThrow();
        assertThat(delta.added()).containsExactly(onlyRight);
        assertThat(delta.removed()).containsExactly(onlyLeft);
        assertThat(delta.changed()).containsExactly(shared);

        assertThat(releases.setLabel(id(left), "  nightly  ")).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        assertThat(releases.annotate(id(left), " notes ")).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        assertThat(releases.list(fixture.scope))
                .filteredOn(view -> view.id().equals(left.id()))
                .singleElement()
                .satisfies(view -> {
                    assertThat(view.label()).isEqualTo("nightly");
                    assertThat(view.notes()).isEqualTo("notes");
                });
        assertThat(releases.lastOf(fixture.scope, ReleaseApi.SourceKind.BUILD)).isPresent();
        assertThat(releases.scopeOf(id(left))).contains(fixture.scope);
        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> releases.setLabel(id(left), "x".repeat(33)));
    }

    @Test
    void concurrentPromoteLeavesAtMostOneLive() throws Exception {
        var template = new TransactionTemplate(transactions);
        Fixture fixture = template.execute(status -> fixture());
        ReleaseApi.ReleaseId first =
                template.execute(status -> bind(fixture.tenant, () -> id(validated(fixture, "a"))));
        ReleaseApi.ReleaseId second =
                template.execute(status -> bind(fixture.tenant, () -> id(validated(fixture, "b"))));
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(2);
        try {
            var left = pool.submit(() -> {
                ready.countDown();
                start.await();
                return template.execute(status -> bind(fixture.tenant, () -> releases.promote(first)));
            });
            var right = pool.submit(() -> {
                ready.countDown();
                start.await();
                return template.execute(status -> bind(fixture.tenant, () -> releases.promote(second)));
            });
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            assertThat(left.get(15, TimeUnit.SECONDS)).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
            assertThat(right.get(15, TimeUnit.SECONDS)).isInstanceOf(ReleaseApi.MutationResult.Changed.class);
        } finally {
            pool.shutdownNow();
        }
        Long liveCount = template.execute(status -> bind(
                fixture.tenant,
                () -> jdbc.queryForObject(
                        "select count(*) from releases.releases where space_id = ? and status = 'live'",
                        Long.class,
                        fixture.scope.value())));
        assertThat(liveCount).isOne();
    }

    private ReleaseApi.View promoteFresh(Fixture fixture, String slug) {
        var ready = validated(fixture, slug);
        return ((ReleaseApi.MutationResult.Changed) releases.promote(id(ready))).release();
    }

    private ReleaseApi.View validated(Fixture fixture, String slug) {
        var page = page(slug, "body-" + slug, slug);
        var drafted = load(fixture, bundle(List.of(page), List.of(), checksums(page)));
        var result = releases.validate(id(drafted), List.of());
        return ((ReleaseApi.ValidateResult.Ok) result).release();
    }

    private ReleaseApi.View load(Fixture fixture, ReleaseApi.Bundle bundle) {
        var drafted = releases.draft(fixture.scope, source());
        var loaded = releases.load(id(drafted), bundle);
        assertThat(loaded).isInstanceOf(ReleaseApi.LoadResult.Loaded.class);
        return drafted;
    }

    private Fixture fixture() {
        UUID tenant = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", tenant, "Tenant " + tenant);
        bind(tenant, () -> null);
        UUID space = jdbc.queryForObject(
                "insert into authoring.spaces (tenant_id, name, mode) values (?, 'Docs', 'authored') returning id",
                UUID.class,
                tenant);
        return new Fixture(tenant, new ReleaseApi.ScopeId(space));
    }

    private <T> T bind(UUID tenant, java.util.function.Supplier<T> work) {
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
        return work.get();
    }

    private static ReleaseApi.ReleaseId id(ReleaseApi.View view) {
        return new ReleaseApi.ReleaseId(view.id());
    }

    private static ReleaseApi.Source source() {
        return new ReleaseApi.Source(ReleaseApi.SourceKind.BUILD, "test", UUID.randomUUID());
    }

    private static ReleaseApi.Bundle emptyBundle() {
        return new ReleaseApi.Bundle(
                "1.0", "space", Instant.parse("2026-09-01T00:00:00Z"), List.of(), List.of(), Map.of());
    }

    private static ReleaseApi.PageSnapshot page(String slug, String content, String externalId) {
        return page(UUID.randomUUID(), slug, content, externalId);
    }

    private static ReleaseApi.PageSnapshot page(UUID pageId, String slug, String content, String externalId) {
        return new ReleaseApi.PageSnapshot(
                pageId,
                slug,
                "Title",
                ReleaseApi.Format.MARKDOWN,
                content,
                "content/" + externalId + ".md",
                ReleaseApi.Seo.empty(),
                null,
                Map.of(),
                externalId,
                List.of(),
                0);
    }

    private static Map<String, String> checksums(ReleaseApi.PageSnapshot... pages) {
        Map<String, String> checksums = new LinkedHashMap<>();
        for (var page : pages) {
            checksums.put(page.contentPath(), ContentHash.checksum(page.content()));
            for (var attachment : page.attachments()) {
                checksums.put(attachment.path(), "sha256:" + ContentHash.stripPrefix(attachment.sha256()));
            }
        }
        return checksums;
    }

    private static ReleaseApi.Bundle bundle(
            List<ReleaseApi.PageSnapshot> pages, List<ReleaseApi.TocNode> toc, Map<String, String> checksums) {
        return new ReleaseApi.Bundle("1.0", "space", Instant.parse("2026-09-01T00:00:00Z"), pages, toc, checksums);
    }

    private record Fixture(UUID tenant, ReleaseApi.ScopeId scope) {}
}
