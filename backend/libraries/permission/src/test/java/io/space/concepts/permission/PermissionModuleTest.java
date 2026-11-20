package io.space.concepts.permission;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.permission.api.*;
import io.space.concepts.permission.api.PermissionApi.Operation;
import io.space.concepts.permission.api.PermissionApi.Principal;
import io.space.concepts.permission.api.PermissionApi.PrincipalType;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.permission.api.PermissionApi.ResourceType;
import io.space.concepts.permission.api.PermissionApi.Role;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.permission.adapters.PermissionConfiguration.class)
class PermissionModuleTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    PermissionApi rawPermissions;

    PermissionApi permissions;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    org.springframework.jdbc.core.JdbcTemplate fixtures;

    @org.junit.jupiter.api.BeforeEach
    void scopeContractActions() {
        fixtures.execute(
                "do $$ begin create role permission_test_operator in role space_app; exception when duplicate_object then null; end $$");
        fixtures.execute("grant select, insert, update on iam.permission_roles to permission_test_operator");
        UUID tenant = UUID.randomUUID();
        fixtures.update("insert into shared.tenants(id,name) values(?,'Permission contract')", tenant);
        permissions = (PermissionApi) java.lang.reflect.Proxy.newProxyInstance(
                PermissionApi.class.getClassLoader(),
                new Class<?>[] {PermissionApi.class},
                (proxy, method, args) -> scope.inTenant(tenant, () -> {
                    try {
                        runtimeRole();
                        seedResources(args, tenant);
                        return method.invoke(rawPermissions, args);
                    } catch (java.lang.reflect.InvocationTargetException failure) {
                        if (failure.getCause() instanceof RuntimeException rejected) throw rejected;
                        throw new IllegalStateException(failure.getCause());
                    } catch (IllegalAccessException failure) {
                        throw new IllegalStateException(failure);
                    }
                }));
    }

    @Autowired
    org.springframework.jdbc.core.JdbcTemplate runtime;

    private void runtimeRole() {
        // System defineRole needs catalog DML; the test role inherits RLS and has no bypass privilege.
        runtime.execute("set local role permission_test_operator");
        assertThat(runtime.queryForObject(
                        "select rolbypassrls from pg_roles where rolname=current_user", Boolean.class))
                .isFalse();
    }

    private void seedResources(Object value, UUID tenant) {
        if (value instanceof Resource resource) {
            switch (resource.type()) {
                case SITE ->
                    fixtures.update(
                            "insert into hosting.sites(id,tenant_id,name,created_by,updated_by) values(?,?,'Permission site',?,?) on conflict do nothing",
                            resource.id(),
                            tenant,
                            UUID.randomUUID(),
                            UUID.randomUUID());
                case SPACE ->
                    fixtures.update(
                            "insert into authoring.spaces(id,tenant_id,name,mode) values(?,?,'Permission space','authored') on conflict do nothing",
                            resource.id(),
                            tenant);
                case PAGE ->
                    fixtures.update(
                            "insert into authoring.pages(id,tenant_id,title,format,created_by_type,updated_by_type) values(?,?,'Permission page','markdown','system','system') on conflict do nothing",
                            resource.id(),
                            tenant);
                default -> {}
            }
        } else if (value instanceof Object[] values) {
            for (Object item : values) seedResources(item, tenant);
        } else if (value instanceof Iterable<?> values) {
            for (Object item : values) seedResources(item, tenant);
        }
    }

    @Test
    void aDefinedRoleCanBeGrantedAndDecidedThroughTheModuleFacade() {
        Resource site = new Resource(ResourceType.SITE, UUID.fromString("00000000-0000-0000-0000-000000000101"));
        Role auditor = new Role("auditor");
        Operation read = new Operation("read");

        permissions.defineRole(auditor, Set.of(read));
        permissions.grant(site, Principal.anonymous(), auditor);

        PermissionApi.Decision decision = permissions.decide(List.of(site), Principal.anonymous(), read);
        assertThat(decision.allowed()).isTrue();
        assertThat(decision.effectiveRole()).contains(auditor);
        assertThat(decision.effectiveOperations()).containsExactly(read);
        assertThat(permissions.operations(auditor)).containsExactly(read);
    }

    // OP: grant on outer then _decide([outer, inner]) allows; inner none overrides
    @Test
    void innerResourceInheritsOuterGrantUntilOverridden() {
        Resource outer = new Resource(ResourceType.SITE, UUID.fromString("00000000-0000-0000-0000-000000000140"));
        Resource inner = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000141"));
        Operation read = new Operation("read");

        permissions.grant(outer, Principal.anonymous(), new Role("reader"));
        assertThat(permissions
                        .decide(List.of(outer, inner), Principal.anonymous(), read)
                        .allowed())
                .isTrue();

        permissions.grant(inner, Principal.anonymous(), new Role("none"));
        assertThat(permissions
                        .decide(List.of(outer, inner), Principal.anonymous(), read)
                        .allowed())
                .isFalse();
    }

    // OP: restrict intersects the subject closure; a miss is deny
    @Test
    void restrictionIntersectsTheSubjectClosure() {
        Resource outer = new Resource(ResourceType.SITE, UUID.fromString("00000000-0000-0000-0000-000000000142"));
        Resource inner = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000143"));
        Principal bob = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000144"));
        Principal teamA = new Principal(PrincipalType.TEAM, UUID.fromString("00000000-0000-0000-0000-000000000145"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000146"));
        Operation read = new Operation("read");
        var subject = new PermissionApi.Subject(bob, Set.of(teamA));

        permissions.grant(outer, teamA, new Role("reader"));
        permissions.restrict(inner, Set.of(teamA), 0);
        assertThat(permissions.decide(List.of(outer, inner), subject, read).allowed())
                .isTrue();
        assertThat(permissions.filterFresh(Set.of(List.of(outer, inner)), subject, read))
                .containsExactly(List.of(outer, inner));

        permissions.restrict(inner, Set.of(alice), 1);
        assertThat(permissions.decide(List.of(outer, inner), subject, read).allowed())
                .isFalse();
        assertThat(permissions.filterFresh(Set.of(List.of(outer, inner)), subject, read))
                .isEmpty();
    }

    @Test
    void revokingTheEffectiveGrantReturnsToDefaultDeny() {
        Resource space = new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000102"));
        Role reader = new Role("reader");
        Operation read = new Operation("read");

        permissions.grant(space, Principal.anonymous(), reader);
        permissions.revoke(space, Principal.anonymous());

        assertThat(permissions
                        .decide(List.of(space), Principal.anonymous(), read)
                        .allowed())
                .isFalse();
    }

    @Test
    void aPrimaryGrantWinsOverAffiliationGrantsAtTheSameResourceLayer() {
        Resource space = new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000118"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000119"));
        Principal team = new Principal(PrincipalType.TEAM, UUID.fromString("00000000-0000-0000-0000-000000000120"));

        permissions.grant(space, alice, new Role("reader"));
        permissions.grant(space, team, new Role("author"));

        PermissionApi.Decision decision = permissions.decide(
                List.of(space), new PermissionApi.Subject(alice, Set.of(team)), new Operation("write"));

        assertThat(decision.allowed()).isFalse();
        assertThat(decision.effectiveRole()).contains(new Role("reader"));
        assertThat(decision.matchedGrants())
                .extracting(PermissionApi.Grant::principal)
                .containsExactly(alice);
    }

    @Test
    void affiliationGrantEventsInvalidateCachedSubjectDecisions() {
        Resource space = new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000131"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000132"));
        Principal team = new Principal(PrincipalType.TEAM, UUID.fromString("00000000-0000-0000-0000-000000000133"));
        var subject = new PermissionApi.Subject(alice, Set.of(team));
        Operation read = new Operation("read");

        assertThat(permissions.decide(List.of(space), subject, read).allowed()).isFalse();
        permissions.grant(space, team, new Role("reader"));
        assertThat(permissions.decide(List.of(space), subject, read).allowed()).isTrue();
        permissions.revoke(space, team);
        assertThat(permissions.decide(List.of(space), subject, read).allowed()).isFalse();
    }

    @Test
    void aPageRestrictionNarrowsAnInheritedGrantAndCanBeRemoved() {
        Resource site = new Resource(ResourceType.SITE, UUID.fromString("00000000-0000-0000-0000-000000000103"));
        Resource page = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000104"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000105"));
        Principal bob = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000106"));
        Operation read = new Operation("read");

        permissions.grant(site, bob, new Role("reader"));
        assertThat(permissions.decide(List.of(site, page), bob, read).allowed()).isTrue();
        permissions.restrict(page, Set.of(alice), 0);
        assertThat(permissions.decide(List.of(site, page), bob, read).allowed()).isFalse();

        permissions.unrestrict(page, 1);
        assertThat(permissions.decide(List.of(site, page), bob, read).allowed()).isTrue();
    }

    @Test
    void clearingEitherSideRemovesDanglingPermissionState() {
        Resource firstSpace = new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000107"));
        Resource secondSpace =
                new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000108"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000109"));
        Operation read = new Operation("read");

        permissions.grant(firstSpace, alice, new Role("reader"));
        permissions.grant(secondSpace, alice, new Role("reader"));
        assertThat(permissions.decide(List.of(firstSpace), alice, read).allowed())
                .isTrue();
        permissions.clearResource(firstSpace);
        assertThat(permissions.decide(List.of(firstSpace), alice, read).allowed())
                .isFalse();
        assertThat(permissions.decide(List.of(secondSpace), alice, read).allowed())
                .isTrue();

        permissions.clearPrincipal(alice);
        assertThat(permissions.decide(List.of(secondSpace), alice, read).allowed())
                .isFalse();
    }

    @Test
    void clearingAPrincipalAdvancesEveryChangedRestrictionRevision() {
        Resource page = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000137"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000138"));
        Principal bob = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000139"));
        permissions.restrict(page, Set.of(alice, bob), 0);

        permissions.clearPrincipal(alice);

        assertThat(permissions.restriction(page)).isEqualTo(new PermissionApi.RestrictionView(true, Set.of(bob), 2));
        assertThat(permissions.restrict(page, Set.of(alice), 1))
                .isEqualTo(new PermissionApi.RestrictResult.Conflict(
                        new PermissionApi.RestrictionView(true, Set.of(bob), 2)));
    }

    @Test
    void mutationsPublishConceptEventsAndInvalidateCachedDecisions(PublishedEvents events) {
        Resource space = new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000110"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000111"));
        Resource page = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000115"));
        Operation read = new Operation("read");
        Role reviewer = new Role("reviewer");

        assertThat(permissions.decide(List.of(space), alice, read).allowed()).isFalse();
        permissions.defineRole(reviewer, Set.of(read));
        permissions.grant(space, alice, reviewer);
        assertThat(permissions.decide(List.of(space), alice, read).allowed()).isTrue();
        permissions.revoke(space, alice);
        assertThat(permissions.decide(List.of(space), alice, read).allowed()).isFalse();
        permissions.restrict(page, Set.of(alice), 0);
        permissions.unrestrict(page, 1);
        permissions.clearResource(page);
        permissions.clearPrincipal(alice);

        assertThat(events.ofType(PermissionEvents.RoleDefined.class)).hasSize(1);
        assertThat(events.ofType(PermissionEvents.Granted.class)).hasSize(1);
        assertThat(events.ofType(PermissionEvents.Revoked.class)).hasSize(1);
        assertThat(events.ofType(PermissionEvents.Restricted.class)).hasSize(1);
        assertThat(events.ofType(PermissionEvents.Unrestricted.class)).hasSize(1);
        assertThat(events.ofType(PermissionEvents.ResourceCleared.class)).hasSize(1);
        assertThat(events.ofType(PermissionEvents.PrincipalCleared.class)).hasSize(1);
    }

    @Test
    void anEmptyRestrictionRemainsDenyAllInsteadOfLookingUnrestricted() {
        Resource site = new Resource(ResourceType.SITE, UUID.fromString("00000000-0000-0000-0000-000000000112"));
        Resource page = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000113"));

        permissions.grant(site, Principal.anonymous(), new Role("reader"));
        permissions.restrict(page, Set.of(), 0);

        assertThat(permissions
                        .decide(List.of(site, page), Principal.anonymous(), new Operation("read"))
                        .allowed())
                .isFalse();
    }

    @Test
    void aStaleRestrictionReplacementConflictsWithoutOverwritingTheCurrentWhitelist() {
        Resource page = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000121"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000122"));
        Principal bob = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000123"));

        PermissionApi.RestrictResult first = permissions.restrict(page, Set.of(alice), 0);
        PermissionApi.RestrictResult stale = permissions.restrict(page, Set.of(bob), 0);

        assertThat(first).isInstanceOf(PermissionApi.RestrictResult.Restricted.class);
        assertThat(stale).isInstanceOf(PermissionApi.RestrictResult.Conflict.class);
        assertThat(permissions.restriction(page)).isEqualTo(new PermissionApi.RestrictionView(true, Set.of(alice), 1));
    }

    @Test
    void concurrentRestrictionReplacementsHaveExactlyOneWinningRevision() throws Exception {
        Resource page = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000134"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000135"));
        Principal bob = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000136"));
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(2);
        try {
            var first = pool.submit(() -> {
                ready.countDown();
                start.await();
                return permissions.restrict(page, Set.of(alice), 0);
            });
            var second = pool.submit(() -> {
                ready.countDown();
                start.await();
                return permissions.restrict(page, Set.of(bob), 0);
            });
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
            start.countDown();

            var results = List.of(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS));

            assertThat(results.stream().filter(PermissionApi.RestrictResult.Restricted.class::isInstance))
                    .hasSize(1);
            assertThat(results.stream().filter(PermissionApi.RestrictResult.Conflict.class::isInstance))
                    .hasSize(1);
            assertThat(permissions.restriction(page).revision()).isEqualTo(1);
            assertThat(Set.of(Set.of(alice), Set.of(bob)))
                    .contains(permissions.restriction(page).principals());
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void grantsForSelectedResourcesUseAnOpaqueCursorWithoutDuplicates() {
        Resource space = new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000124"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000125"));
        Principal bob = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000126"));
        Principal team = new Principal(PrincipalType.TEAM, UUID.fromString("00000000-0000-0000-0000-000000000127"));
        permissions.grant(space, alice, new Role("reader"));
        permissions.grant(space, bob, new Role("author"));
        permissions.grant(space, team, new Role("maintainer"));

        PermissionApi.GrantPage first = permissions.grants(Set.of(space), null, 2);
        PermissionApi.GrantPage second = permissions.grants(Set.of(space), first.nextCursor(), 2);

        assertThat(first.items()).hasSize(2);
        assertThat(first.nextCursor()).isNotNull();
        assertThat(second.items()).hasSize(1);
        assertThat(second.nextCursor()).isNull();
        assertThat(java.util.stream.Stream.concat(first.items().stream(), second.items().stream())
                        .map(PermissionApi.Grant::principal)
                        .toList())
                .containsExactlyInAnyOrder(alice, bob, team);
    }

    @Test
    void restrictionsProjectActiveAndNeverRestrictedResourcesInOneQuery() {
        Resource restrictedPage =
                new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000128"));
        Resource openPage = new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000129"));
        Principal alice = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000130"));
        permissions.restrict(restrictedPage, Set.of(alice), 0);

        var restrictions = permissions.restrictions(Set.of(restrictedPage, openPage));

        assertThat(restrictions)
                .containsEntry(restrictedPage, new PermissionApi.RestrictionView(true, Set.of(alice), 1));
        assertThat(restrictions).containsEntry(openPage, PermissionApi.RestrictionView.inactive(0));
    }

    @Test
    void redefiningARoleInvalidatesEveryDecisionUsingItsOperations() {
        Resource space = new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000114"));
        Role temporaryReader = new Role("temporary-reader");
        Operation read = new Operation("read");

        permissions.defineRole(temporaryReader, Set.of(read));
        permissions.grant(space, Principal.anonymous(), temporaryReader);
        assertThat(permissions
                        .decide(List.of(space), Principal.anonymous(), read)
                        .allowed())
                .isTrue();

        permissions.defineRole(temporaryReader, Set.of());
        assertThat(permissions
                        .decide(List.of(space), Principal.anonymous(), read)
                        .allowed())
                .isFalse();
    }

    @Test
    void moduleQueriesHonorTheInnermostGrantAndRestrictionCleanup() {
        UUID sharedId = UUID.fromString("00000000-0000-0000-0000-000000000116");
        Resource site = new Resource(ResourceType.SITE, sharedId);
        Resource page = new Resource(ResourceType.PAGE, sharedId);
        Principal bob = new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000117"));
        Operation read = new Operation("read");

        permissions.grant(site, bob, new Role("reader"));
        permissions.grant(page, bob, new Role("none"));
        assertThat(permissions.effectiveRole(List.of(site, page), bob)).contains(new Role("none"));
        assertThat(permissions.filter(Set.of(List.of(site), List.of(site, page)), bob, read))
                .containsExactly(List.of(site));

        permissions.revoke(page, bob);
        permissions.restrict(page, Set.of(), 0);
        assertThat(permissions.decide(List.of(site, page), bob, read).allowed()).isFalse();
        permissions.clearResource(page);

        assertThat(permissions.decide(List.of(site, page), bob, read).allowed()).isTrue();
        assertThat(permissions.decide(List.of(site), bob, read).allowed()).isTrue();
    }
}
