package io.space.control.compositions.authoring.termination;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.search.api.SearchApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.tag.api.TagApi;
import io.space.concepts.tag.api.TagEvents;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.authoring.permission.PutSiteGrantUseCase;
import io.space.control.compositions.authoring.permission.PutSpaceGrantUseCase;
import io.space.control.compositions.authoring.space.ArchiveSpaceUseCase;
import io.space.control.compositions.authoring.space.CreateSpaceUseCase;
import io.space.control.compositions.authoring.space.RestoreSpaceUseCase;
import io.space.control.compositions.authoring.space.ViewSpaceUseCase;
import io.space.control.compositions.hosting.site.*;
import io.space.control.compositions.hosting.site.CreateSiteUseCase;
import io.space.control.compositions.hosting.site.MountSpaceUseCase;
import io.space.control.compositions.hosting.site.SiteTypes;
import io.space.control.compositions.hosting.site.UpdateSiteUseCase;
import io.space.control.compositions.hosting.site.ViewSiteUseCase;
import io.space.control.compositions.platform.tenant.ListTenantsUseCase;
import io.space.control.compositions.platform.tenant.ProvisionTenantUseCase;
import io.space.control.compositions.platform.tenant.ResumeTenantUseCase;
import io.space.control.compositions.platform.tenant.SuspendTenantUseCase;
import io.space.control.compositions.releases.release.PublishPageUseCase;
import io.space.control.compositions.resource.SiteNotFoundException;
import io.space.control.compositions.resource.SpaceNotFoundException;
import io.space.control.support.FixtureDatabaseConfiguration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
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
@org.springframework.test.context.event.RecordApplicationEvents
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
class TerminationSyncsTest {
    @org.springframework.beans.factory.annotation.Autowired
    PublishPageUseCase publishPageUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PurgeExpiredUseCase purgeExpiredUseCase;

    @Autowired
    org.springframework.test.context.event.ApplicationEvents events;

    @Autowired
    TagApi tags;

    @Autowired
    SearchApi search;

    @Autowired
    @Qualifier("jdbcTemplate")
    JdbcTemplate runtimeJdbc;

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    org.springframework.transaction.PlatformTransactionManager manager;

    @Autowired
    io.space.concepts.site.api.SiteApi siteApi;

    @Autowired
    io.space.concepts.objectstore.api.ObjectReservationsApi reservations;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSiteUseCase createSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewSiteUseCase viewSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    UpdateSiteUseCase updateSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    MountSpaceUseCase mountSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DeleteSpaceUseCase deleteSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    DeleteSiteUseCase deleteSiteUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ListDeletionsUseCase listDeletionsUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    CreateSpaceUseCase createSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ViewSpaceUseCase viewSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    ArchiveSpaceUseCase archiveSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    RestoreSpaceUseCase restoreSpaceUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutSpaceGrantUseCase putSpaceGrantUseCase;

    @org.springframework.beans.factory.annotation.Autowired
    PutSiteGrantUseCase putSiteGrantUseCase;

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
    MembershipApi memberships;

    @Autowired
    ApiTokenApi tokens;

    @Autowired
    TenantScopeApi tenantScope;

    @Autowired
    @Qualifier(FixtureDatabaseConfiguration.FIXTURE_JDBC)
    JdbcTemplate jdbc;

    @Autowired
    PageApi pages;

    @Autowired
    SpaceApi spaceApi;

    @Autowired
    ReleaseApi releases;

    @Test
    void deletingAnArchivedSpacePreservesRevokedTokenHistoryAndAllowsReplay() {
        var tenant = tenant("Delete", "owner-delete@site-syncs.test");
        UUID id = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Delete me", "authored", key())
                .value()
                .id();
        UUID owner =
                jdbc.queryForObject("select id from iam.users where email='owner-delete@site-syncs.test'", UUID.class);
        var issued = tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()), () -> (ApiTokenApi.IssueResult.Issued) tokens.issue(
                        owner,
                        tenant.id(),
                        id,
                        "CI",
                        Set.of(ApiTokenApi.Scope.READ),
                        Instant.now().plusSeconds(3600)));
        UUID page = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            var created = (PageApi.CreateResult.Created)
                    pages.create(PageApi.Actor.user(owner), PageApi.Format.MARKDOWN, "Page");
            spaceApi.place(new SpaceApi.SpaceId(id), created.page().id(), "page");
            tags.tag(new TagApi.ItemId(created.page().id()), "cleanup");
            return created.page().id();
        });
        assertThatExceptionOfType(TerminationErrors.NotArchived.class)
                .isThrownBy(() ->
                        deleteSpaceUseCase.deleteSpace(tenant.ownerCredential(), tenant.id(), id, "Delete me", key()));
        archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), id, key());
        assertThatExceptionOfType(TerminationErrors.Confirmation.class)
                .isThrownBy(() ->
                        deleteSpaceUseCase.deleteSpace(tenant.ownerCredential(), tenant.id(), id, "wrong", key()));
        String key = key();
        var result = deleteSpaceUseCase.deleteSpace(tenant.ownerCredential(), tenant.id(), id, "Delete me", key);
        assertThat(deleteSpaceUseCase
                        .deleteSpace(tenant.ownerCredential(), tenant.id(), id, "Delete me", key)
                        .value())
                .isEqualTo(result.value());
        assertThat(jdbc.queryForObject("select count(*) from authoring.spaces where id=?", Integer.class, id))
                .isZero();
        assertThat(jdbc.queryForObject("select count(*) from authoring.pages where id=?", Integer.class, page))
                .isZero();
        assertThat(events.stream(TagEvents.Untagged.class)).contains(new TagEvents.Untagged(page, "cleanup"));
        assertThat(jdbc.queryForObject(
                        "select revoked_at is not null from iam.api_tokens where id=?",
                        Boolean.class,
                        issued.metadata().id().value()))
                .isTrue();
        assertThat(tokens.authenticate(issued.secret())).isInstanceOf(ApiTokenApi.Authentication.Invalid.class);
        assertThat(listDeletionsUseCase
                        .listDeletions(tenant.ownerCredential(), tenant.id(), null, 20)
                        .items())
                .hasSize(1);
    }

    @Test
    void purgeChecksRetentionAndClearsExpiredUnreferencedPages() {
        var tenant = tenant("Purge", "owner-purge@site-syncs.test");
        UUID id = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Purge", "authored", key())
                .value()
                .id();
        UUID page = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            var created = (PageApi.CreateResult.Created)
                    pages.create(PageApi.Actor.system(), PageApi.Format.MARKDOWN, "Page");
            spaceApi.place(new SpaceApi.SpaceId(id), created.page().id(), "page");
            pages.trash(new PageApi.PageId(created.page().id()), PageApi.Actor.system());
            tags.tag(new TagApi.ItemId(created.page().id()), "expired");
            return created.page().id();
        });
        assertThat(purgeExpiredUseCase.purgeExpired(tenant.id()).purged()).isZero();
        jdbc.update("update authoring.pages set trashed_at=now()-interval '31 days' where id=?", page);
        var result = purgeExpiredUseCase.purgeExpired(tenant.id());
        assertThat(result.purged()).isEqualTo(1);
        assertThat(jdbc.queryForObject(
                        "select count(*) from authoring.space_page_placements where" + " page_id=?",
                        Integer.class,
                        page))
                .isZero();
        assertThat(jdbc.queryForObject("select count(*) from authoring.pages where id=?", Integer.class, page))
                .isZero();
        assertThat(events.stream(TagEvents.Untagged.class)).contains(new TagEvents.Untagged(page, "expired"));
    }

    @Test
    void siteTerminationClearsSearchThroughItsContractAndRollsBackOnFailure() {
        var tenant = tenant("Search termination", "search-termination@site-syncs.test");
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Search", key())
                .value()
                .id();
        var scope = new SearchApi.ScopeId(site);
        tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            search.configureBoost(scope, java.util.List.of("body", "title", "headings"));
        });
        jdbc.execute("create function shared.fail_site_terminal_test() returns trigger language plpgsql as $$"
                + " begin raise exception 'injected site failure'; end $$");
        jdbc.execute("create trigger fail_site_terminal_test before delete on hosting.sites for each row"
                + " execute function shared.fail_site_terminal_test()");
        try {
            assertThatThrownBy(() ->
                            deleteSiteUseCase.deleteSite(tenant.ownerCredential(), tenant.id(), site, "Search", key()))
                    .isInstanceOf(org.springframework.dao.DataAccessException.class);
            tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
                assertThat(search.configuredBoost(scope).revision()).isEqualTo(1);
            });
        } finally {
            jdbc.execute("drop trigger fail_site_terminal_test on hosting.sites");
            jdbc.execute("drop function shared.fail_site_terminal_test()");
        }
        String deletionKey = key();
        var receipt = deleteSiteUseCase.deleteSite(tenant.ownerCredential(), tenant.id(), site, "Search", deletionKey);
        assertThat(deleteSiteUseCase
                        .deleteSite(tenant.ownerCredential(), tenant.id(), site, "Search", deletionKey)
                        .value())
                .isEqualTo(receipt.value());
        assertThat(jdbc.queryForObject(
                        "select count(*) from hosting.search_settings where site_id=?", Long.class, site))
                .isZero();
    }

    @Test
    void wrongNameAndConcurrentNameChangeCannotDeleteASite() {
        var tenant = tenant("Confirm", "owner-confirm@site-syncs.test");
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Before", key())
                .value()
                .id();
        updateSiteUseCase.updateSite(tenant.ownerCredential(), tenant.id(), site, name("After"), key());
        assertThatExceptionOfType(TerminationErrors.Confirmation.class)
                .isThrownBy(() ->
                        deleteSiteUseCase.deleteSite(tenant.ownerCredential(), tenant.id(), site, "Before", key()));
        assertThat(viewSiteUseCase
                        .viewSite(tenant.ownerCredential(), tenant.id(), site)
                        .name())
                .isEqualTo("After");
        deleteSiteUseCase.deleteSite(tenant.ownerCredential(), tenant.id(), site, "After", key());
        assertThat(listDeletionsUseCase
                        .listDeletions(tenant.ownerCredential(), tenant.id(), null, 20)
                        .items())
                .hasSize(1);
    }

    @Test
    void retainedReleaseBlocksPurgeAndDeletionProducesAtomicAudit() {
        var tenant = tenant("Protected", "owner-protected@site-syncs.test");
        UUID id = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Protected", "authored", key())
                .value()
                .id();
        UUID page = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            var created = (PageApi.CreateResult.Created)
                    pages.create(PageApi.Actor.system(), PageApi.Format.MARKDOWN, "Protected page");
            spaceApi.place(new SpaceApi.SpaceId(id), created.page().id(), "page");
            return created.page().id();
        });
        publishPageUseCase.publishPage(tenant.ownerCredential(), tenant.id(), id, page, key());
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> pages.trash(new PageApi.PageId(page), PageApi.Actor.system()));
        jdbc.update("update authoring.pages set trashed_at=now()-interval '31 days' where id=?", page);
        assertThat(purgeExpiredUseCase.purgeExpired(tenant.id()).protectedCount())
                .isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from authoring.pages where id=?", Integer.class, page))
                .isEqualTo(1);
        archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), id, key());
        deleteSpaceUseCase.deleteSpace(tenant.ownerCredential(), tenant.id(), id, "Protected", key());
        assertThat(jdbc.queryForObject("select count(*) from releases.releases where space_id=?", Integer.class, id))
                .isZero();
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.audit_log where action='Space.delete'" + " and target_id=?",
                        Integer.class,
                        id))
                .isEqualTo(1);
    }

    @Test
    void sourceCleanupStopsAfterEightFailuresAndManualRetryStillChecksReferences() {
        String key = "cleanup-test-" + UUID.randomUUID();
        reservations.observe(key, Instant.now().minus(java.time.Duration.ofDays(1)));
        for (int attempt = 0; attempt < 8; attempt++) {
            jdbc.update(
                    "update shared.source_objects set next_retry_at=now()-interval '1 second' where" + " storage_key=?",
                    key);
            assertThat(reservations.collect(key, () -> false, () -> {
                        throw new io.space.concepts.objectstore.api.ObjectStoreApi.Unavailable(
                                "injected storage outage", null);
                    }))
                    .isFalse();
            assertThat(reservations.candidates(1000)).doesNotContain(key);
        }
        assertThat(reservations.failed(Set.of(key))).isTrue();
        jdbc.update(
                "update shared.source_objects set next_retry_at=now()-interval '1 second' where" + " storage_key=?",
                key);
        assertThat(reservations.candidates(1000)).doesNotContain(key);
        reservations.retry(Set.of(key));
        assertThat(reservations.failed(Set.of(key))).isFalse();
        assertThat(reservations.collect(key, () -> true, () -> {
                    throw new AssertionError("Referenced content must not be removed");
                }))
                .isFalse();
        jdbc.update("delete from shared.source_objects where storage_key=?", key);
    }

    @Test
    void physicalInventoryIsPublishedOnlyAfterACompleteScan() {
        jdbc.update("delete from shared.object_inventory_cursor");
        var store = org.mockito.Mockito.mock(io.space.concepts.objectstore.api.ObjectStoreApi.class);
        var batch = java.util.stream.IntStream.range(0, 1000)
                .mapToObj(n -> new io.space.concepts.objectstore.api.ObjectStoreApi.StoredObject(
                        "inventory-test-" + n, Instant.now(), 7))
                .toList();
        org.mockito.Mockito.when(store.inventory(null, 1000)).thenReturn(batch);
        org.mockito.Mockito.when(store.inventory("inventory-test-999", 1000)).thenReturn(java.util.List.of());
        reservations.scan(store);
        assertThat(reservations.inventoryStats().bytes()).isNull();
        reservations.scan(store);
        assertThat(reservations.inventoryStats().objects()).isEqualTo(1000);
        assertThat(reservations.inventoryStats().bytes()).isEqualTo(7000);
        assertThat(reservations.inventoryStats().measuredAt()).isNotNull();
        jdbc.update("delete from shared.source_objects where storage_key like 'inventory-test-%'");
    }

    @Test
    void aGrantWaitingForADeletedSiteCannotRecreatePermissionRows() throws Exception {
        var tenant = tenant("Grant race", "grant-race@site-syncs.test");
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Race", key())
                .value()
                .id();
        var waiting = new java.util.concurrent.atomic.AtomicReference<java.util.concurrent.Future<?>>();
        try (var executor = java.util.concurrent.Executors.newSingleThreadExecutor()) {
            new org.springframework.transaction.support.TransactionTemplate(manager)
                    .executeWithoutResult(tx ->
                            tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
                                siteApi.lock(new io.space.concepts.site.api.SiteApi.SiteId(site))
                                        .orElseThrow();
                                waiting.set(executor.submit(() -> putSiteGrantUseCase.putSiteGrant(
                                        tenant.ownerCredential(), tenant.id(), site, "anonymous", "reader")));
                                org.awaitility.Awaitility.await()
                                        .atMost(java.time.Duration.ofSeconds(3))
                                        .untilAsserted(() -> assertThat(jdbc.queryForObject(
                                                        "select"
                                                                + " count(*)"
                                                                + " from"
                                                                + " pg_stat_activity"
                                                                + " where"
                                                                + " datname=current_database()"
                                                                + " and wait_event_type='Lock'"
                                                                + " and query"
                                                                + " ilike"
                                                                + " '%hosting.sites%'",
                                                        Long.class))
                                                .isPositive());
                                deleteSiteUseCase.deleteSite(
                                        tenant.ownerCredential(), tenant.id(), site, "Race", key());
                            }));
            assertThatThrownBy(() -> waiting.get().get(3, java.util.concurrent.TimeUnit.SECONDS))
                    .hasCauseInstanceOf(SiteNotFoundException.class);
        }
        assertThat(jdbc.queryForObject(
                        "select count(*) from iam.permission_grants where resource_id=?", Long.class, site))
                .isZero();
    }

    @Test
    void aMountWaitingForADeletedSpaceCannotRestoreTheAssociation() throws Exception {
        var tenant = tenant("Mount race", "mount-race@site-syncs.test");
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Site", key())
                .value()
                .id();
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Race", "authored", key())
                .value()
                .id();
        var waiting = new java.util.concurrent.atomic.AtomicReference<java.util.concurrent.Future<?>>();
        try (var executor = java.util.concurrent.Executors.newSingleThreadExecutor()) {
            new org.springframework.transaction.support.TransactionTemplate(manager)
                    .executeWithoutResult(tx ->
                            tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
                                spaceApi.lock(new SpaceApi.SpaceId(space)).orElseThrow();
                                waiting.set(executor.submit(() -> mountSpaceUseCase.mountSpace(
                                        tenant.ownerCredential(), tenant.id(), site, "docs", space, key())));
                                org.awaitility.Awaitility.await()
                                        .atMost(java.time.Duration.ofSeconds(3))
                                        .untilAsserted(() -> assertThat(jdbc.queryForObject(
                                                        "select"
                                                                + " count(*)"
                                                                + " from"
                                                                + " pg_stat_activity"
                                                                + " where"
                                                                + " datname=current_database()"
                                                                + " and wait_event_type='Lock'"
                                                                + " and query"
                                                                + " ilike"
                                                                + " '%authoring.spaces%'",
                                                        Long.class))
                                                .isPositive());
                                archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), space, key());
                                deleteSpaceUseCase.deleteSpace(
                                        tenant.ownerCredential(), tenant.id(), space, "Race", key());
                            }));
            assertThatThrownBy(() -> waiting.get().get(3, java.util.concurrent.TimeUnit.SECONDS))
                    .hasCauseInstanceOf(SpaceNotFoundException.class);
        }
        assertThat(jdbc.queryForObject("select count(*) from hosting.site_mounts where space_id=?", Long.class, space))
                .isZero();
    }

    @Test
    void aDatabaseFailureMidCascadeRollsBackPagesMountsAndSuccessAuditFacts() {
        var tenant = tenant("Atomic delete", "atomic-delete@site-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Atomic", "authored", key())
                .value()
                .id();
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Mounted", key())
                .value()
                .id();
        mountSpaceUseCase.mountSpace(tenant.ownerCredential(), tenant.id(), site, "docs", space, key());
        var ids = tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
            var result = new java.util.ArrayList<UUID>();
            for (int n = 0; n < 2; n++) {
                var created = (PageApi.CreateResult.Created)
                        pages.create(PageApi.Actor.system(), PageApi.Format.MARKDOWN, "Page " + n);
                spaceApi.place(new SpaceApi.SpaceId(space), created.page().id(), "page-" + n);
                tags.tag(new TagApi.ItemId(created.page().id()), "preserved");
                result.add(created.page().id());
            }
            return result.stream().sorted().toList();
        });
        archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), space, key());
        jdbc.execute("create function shared.fail_terminal_test() returns trigger language plpgsql as $$"
                + " begin if old.id=TG_ARGV[0]::uuid then raise exception 'injected terminal"
                + " failure'; end if; return old; end $$");
        jdbc.execute("create trigger fail_terminal_test before delete on authoring.pages for each row"
                + " execute function shared.fail_terminal_test('"
                + ids.getLast()
                + "')");
        try {
            assertThatThrownBy(() -> deleteSpaceUseCase.deleteSpace(
                            tenant.ownerCredential(), tenant.id(), space, "Atomic", key()))
                    .isInstanceOf(org.springframework.dao.DataAccessException.class);
            assertThat(jdbc.queryForObject("select count(*) from authoring.pages where id=any(?)", Long.class, (Object)
                            ids.toArray(UUID[]::new)))
                    .isEqualTo(2);
            assertThat(jdbc.queryForObject(
                            "select count(*) from authoring.page_tags where page_id=any(?)", Long.class, (Object)
                                    ids.toArray(UUID[]::new)))
                    .isEqualTo(2);
            assertThat(jdbc.queryForObject(
                            "select count(*) from hosting.site_mounts where space_id=?", Long.class, space))
                    .isEqualTo(1);
            assertThat(jdbc.queryForObject(
                            "select count(*) from shared.deletion_records where" + " resource_id=?", Long.class, space))
                    .isZero();
            assertThat(jdbc.queryForObject(
                            "select count(*) from shared.audit_log where target_id=? and"
                                    + " action='Space.delete' and kind='fact'",
                            Long.class,
                            space))
                    .isZero();
        } finally {
            jdbc.execute("drop trigger fail_terminal_test on authoring.pages");
            jdbc.execute("drop function shared.fail_terminal_test()");
        }
    }

    @Test
    @org.junit.jupiter.api.Timeout(15)
    void aRunningImportBoundsDeletionLockWaitAndLeavesTheSpaceIntact() {
        var tenant = tenant("Import lock", "import-lock@site-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Busy", "synced", key())
                .value()
                .id();
        archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), space, key());
        try (var executor = java.util.concurrent.Executors.newSingleThreadExecutor()) {
            new org.springframework.transaction.support.TransactionTemplate(manager).executeWithoutResult(tx -> {
                runtimeJdbc.queryForObject(
                        "select pg_advisory_xact_lock(hashtext('import:' ||" + " ?::text))", Object.class, space);
                long started = System.nanoTime();
                var deletion = executor.submit(() ->
                        deleteSpaceUseCase.deleteSpace(tenant.ownerCredential(), tenant.id(), space, "Busy", key()));
                assertThatThrownBy(() -> deletion.get(8, java.util.concurrent.TimeUnit.SECONDS))
                        .hasCauseInstanceOf(TerminationErrors.Busy.class);
                long elapsed = java.util.concurrent.TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started);
                assertThat(elapsed).isBetween(4500L, 7500L);
                System.out.println("TERMINATION_IMPORT_LOCK configuredWaitMs=5000" + " observedRequestMs=" + elapsed);
            });
        }
        assertThat(jdbc.queryForObject("select count(*) from authoring.spaces where id=?", Long.class, space))
                .isEqualTo(1);
        assertThat(jdbc.queryForObject(
                        "select count(*) from shared.deletion_records where resource_id=?", Long.class, space))
                .isZero();
    }

    @Test
    void aRestoreWaitingForADeletedSpaceCannotRecreateIt() {
        var tenant = tenant("Restore race", "restore-race@site-syncs.test");
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Race", "authored", key())
                .value()
                .id();
        archiveSpaceUseCase.archiveSpace(tenant.ownerCredential(), tenant.id(), space, key());
        var waiting = new java.util.concurrent.atomic.AtomicReference<java.util.concurrent.Future<?>>();
        try (var executor = java.util.concurrent.Executors.newSingleThreadExecutor()) {
            new org.springframework.transaction.support.TransactionTemplate(manager)
                    .executeWithoutResult(tx ->
                            tenantScope.inTenant(new TenantRegistryApi.TenantId(tenant.id()), () -> {
                                spaceApi.lock(new SpaceApi.SpaceId(space)).orElseThrow();
                                waiting.set(executor.submit(() -> restoreSpaceUseCase.restoreSpace(
                                        tenant.ownerCredential(), tenant.id(), space, key())));
                                org.awaitility.Awaitility.await()
                                        .atMost(java.time.Duration.ofSeconds(3))
                                        .untilAsserted(() -> assertThat(jdbc.queryForObject(
                                                        "select"
                                                                + " count(*)"
                                                                + " from"
                                                                + " pg_stat_activity"
                                                                + " where"
                                                                + " datname=current_database()"
                                                                + " and wait_event_type='Lock'"
                                                                + " and query"
                                                                + " ilike"
                                                                + " '%authoring.spaces%'",
                                                        Long.class))
                                                .isPositive());
                                deleteSpaceUseCase.deleteSpace(
                                        tenant.ownerCredential(), tenant.id(), space, "Race", key());
                            }));
            assertThatThrownBy(() -> waiting.get().get(3, java.util.concurrent.TimeUnit.SECONDS))
                    .hasCauseInstanceOf(SpaceNotFoundException.class);
        }
        assertThat(jdbc.queryForObject("select count(*) from authoring.spaces where id=?", Long.class, space))
                .isZero();
    }

    @Test
    void aSpaceAdministratorSeesOnlyCountsForHiddenSitesButDeletionUnmountsThem() {
        var tenant = tenant("Private mounts", "private-mounts@test.example");
        UUID space = createSpaceUseCase
                .createSpace(tenant.ownerCredential(), tenant.id(), "Shared space", "authored", key())
                .value()
                .id();
        UUID site = createSiteUseCase
                .createSite(tenant.ownerCredential(), tenant.id(), "Hidden site", key())
                .value()
                .id();
        mountSpaceUseCase.mountSpace(tenant.ownerCredential(), tenant.id(), site, "hidden-slug", space, key());
        var member = verifiedUser("space-only-admin@test.example");
        tenantScope.inTenant(
                new TenantRegistryApi.TenantId(tenant.id()),
                () -> memberships.add(
                        MembershipApi.Group.tenant(tenant.id()),
                        new MembershipApi.MemberId(member.value()),
                        MembershipApi.Role.MEMBER));
        putSpaceGrantUseCase.putSpaceGrant(
                tenant.ownerCredential(), tenant.id(), space, "user:" + member.value(), "admin");
        var access = credential(member);
        var detail = viewSpaceUseCase.viewSpace(access, tenant.id(), space);
        assertThat(detail.mountCount()).isEqualTo(1);
        assertThat(detail.mounts()).isEmpty();
        archiveSpaceUseCase.archiveSpace(access, tenant.id(), space, key());
        deleteSpaceUseCase.deleteSpace(access, tenant.id(), space, "Shared space", key());
        assertThat(jdbc.queryForObject("select count(*) from hosting.site_mounts where site_id=?", Long.class, site))
                .isZero();
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

    private static SiteTypes.UpdatePatch name(String name) {
        return SiteTypes.UpdatePatch.fromJson(
                true, name, false, null, false, false, false, null, false, null, false, null, false, null, false, null,
                false, null, false, null, false, null);
    }

    private static SiteTypes.UpdatePatch home(UUID space) {
        return SiteTypes.UpdatePatch.fromJson(
                false, null, false, null, false, false, false, null, false, null, false, null, false, null, false, null,
                false, null, true, space, false, null);
    }

    private record TenantFixture(UUID id, String ownerCredential) {}
}
