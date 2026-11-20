package io.space.control.compositions.access;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.permission.api.PermissionApi.Decision;
import io.space.concepts.permission.api.PermissionApi.Operation;
import io.space.concepts.permission.api.PermissionApi.Principal;
import io.space.concepts.permission.api.PermissionApi.PrincipalType;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.permission.api.PermissionApi.ResourceType;
import io.space.concepts.permission.api.PermissionApi.Role;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.control.compositions.principal.PrincipalResolution;
import io.space.control.compositions.principal.PrincipalResolver;
import io.space.control.compositions.principal.UnresolvedPrincipalException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;

class PermissionGuardTest {

    private static final Principal ALICE =
            new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000201"));
    private static final Principal BUILD_TOKEN =
            new Principal(PrincipalType.TOKEN, UUID.fromString("00000000-0000-0000-0000-000000000203"));
    private static final Resource SPACE =
            new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000202"));
    private static final Resource TENANT =
            new Resource(ResourceType.TENANT, UUID.fromString("00000000-0000-0000-0000-000000000204"));

    @Test
    void resolvesTheCredentialThenAllowsOnlyAnAllowedPermissionDecision() {
        PermissionGuard guard =
                guard(credential -> Optional.of(PrincipalResolver.Resolution.unrestricted(ALICE)), true, null);

        PermissionGuard.Result result =
                guard.check(new PrincipalResolver.Credential("session-token"), List.of(SPACE), new Operation("write"));

        assertThat(result).isEqualTo(PermissionGuard.Result.ALLOW);
    }

    @Test
    void deniesWhenNoResolverRecognizesTheCredentialOrPermissionDenies() {
        Operation write = new Operation("write");

        assertThat(guard(credential -> Optional.empty(), true, null)
                        .check(new PrincipalResolver.Credential("unknown"), List.of(SPACE), write))
                .isEqualTo(PermissionGuard.Result.UNRESOLVED);
        assertThat(guard(credential -> Optional.of(PrincipalResolver.Resolution.unrestricted(ALICE)), false, null)
                        .check(new PrincipalResolver.Credential("known"), List.of(SPACE), write))
                .isEqualTo(PermissionGuard.Result.DENY);
    }

    @Test
    void aScopedTokenMustPassItsScopeBeforeResourcePermission() {
        Operation read = new Operation("read");
        Operation write = new Operation("write");
        PermissionGuard guard = guard(
                credential -> Optional.of(
                        PrincipalResolver.Resolution.scoped(BUILD_TOKEN, Set.of(read), TENANT.id(), SPACE.id())),
                true,
                null);

        assertThat(guard.check(new PrincipalResolver.Credential("api-token"), List.of(TENANT, SPACE), write))
                .isEqualTo(PermissionGuard.Result.DENY);
        assertThatThrownBy(() ->
                        guard.require(new PrincipalResolver.Credential("api-token"), List.of(TENANT, SPACE), write))
                .isInstanceOf(PermissionDeniedException.class);
    }

    @Test
    void resolutionKeepsAuthenticationFailureSeparateAndEnforcesTokenScopeShape() {
        PermissionGuard unresolved = guard(credential -> Optional.empty(), true, null);

        assertThatThrownBy(() -> unresolved.require(
                        new PrincipalResolver.Credential("unknown"), List.of(SPACE), new Operation("read")))
                .isInstanceOf(UnresolvedPrincipalException.class);
        assertThatThrownBy(() -> PrincipalResolver.Resolution.unrestricted(BUILD_TOKEN))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> PrincipalResolver.Resolution.scoped(
                        ALICE, Set.of(new Operation("read")), TENANT.id(), SPACE.id()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    /** 冻结检查发生在授权判定之前：有权限也照样拒，且它只看链首的租户根。 */
    @Test
    void aSuspendedTenantIsRefusedBeforeThePermissionDecision() {
        var tenantId = UUID.fromString("00000000-0000-0000-0000-000000000301");
        PermissionGuard guard =
                guard(credential -> Optional.of(PrincipalResolver.Resolution.unrestricted(ALICE)), true, tenantId);
        var chain = List.of(new Resource(ResourceType.TENANT, tenantId), SPACE);

        assertThat(guard.check(new PrincipalResolver.Credential("session"), chain, new Operation("admin")))
                .isEqualTo(PermissionGuard.Result.TENANT_SUSPENDED);
        assertThatThrownBy(
                        () -> guard.require(new PrincipalResolver.Credential("session"), chain, new Operation("admin")))
                .isInstanceOf(TenantSuspendedException.class);
    }

    /** 平台运维面不走资源链，因此天然豁免冻结——否则 suspend 之后就再也 resume 不了。 */
    @Test
    void aChainWithoutATenantRootIsUnaffectedBySuspension() {
        PermissionGuard guard = guard(
                credential -> Optional.of(PrincipalResolver.Resolution.unrestricted(ALICE)),
                true,
                UUID.fromString("00000000-0000-0000-0000-000000000301"));

        assertThat(guard.check(new PrincipalResolver.Credential("session"), List.of(SPACE), new Operation("write")))
                .isEqualTo(PermissionGuard.Result.ALLOW);
    }

    private static PermissionGuard guard(PrincipalResolver resolver, boolean allowed, UUID suspended) {
        return new PermissionGuard(
                new PrincipalResolution(List.of(resolver)),
                new StubPermissionApi(allowed),
                new StubTenantRegistry(suspended),
                new DirectTenantScope());
    }

    /** 判权发生在租户上下文内；单测无数据库，直接执行以证明 guard 的编排顺序。 */
    private static final class DirectTenantScope implements TenantScopeApi {
        @Override
        public <T> T inTenant(TenantRegistryApi.TenantId tenant, Supplier<T> work) {
            return work.get();
        }

        @Override
        public void inTenant(TenantRegistryApi.TenantId tenant, Runnable work) {
            work.run();
        }

        @Override
        public <T> T withoutTenant(BootstrapReason reason, Supplier<T> work) {
            return work.get();
        }
    }

    private record StubTenantRegistry(UUID suspended) implements TenantRegistryApi {

        @Override
        public Optional<Status> status(TenantId tenant) {
            return Optional.of(tenant.value().equals(suspended) ? Status.SUSPENDED : Status.ACTIVE);
        }

        @Override
        public ProvisionResult provision(String name) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void suspend(TenantId tenant) {}

        @Override
        public void resume(TenantId tenant) {}

        @Override
        public Optional<View> view(TenantId tenant) {
            return Optional.empty();
        }

        @Override
        public List<View> viewsOf(Collection<TenantId> tenants) {
            return List.of();
        }

        @Override
        public Page list(String cursor, int limit) {
            return new Page(List.of(), null);
        }
    }

    private static final class StubPermissionApi implements PermissionApi {
        @Override
        public Policy snapshot() {
            throw new UnsupportedOperationException("not used by guard");
        }

        @Override
        public Set<List<Resource>> filterFresh(Set<List<Resource>> chains, Principal principal, Operation operation) {
            return filter(chains, principal, operation);
        }

        @Override
        public Decision decideFresh(List<Resource> chain, Principal principal, Operation operation) {
            return decide(chain, principal, operation);
        }

        @Override
        public Decision decide(List<Resource> chain, Subject subject, Operation operation) {
            return decide(chain, subject.primary(), operation);
        }

        @Override
        public Set<List<Resource>> filterFresh(Set<List<Resource>> chains, Subject subject, Operation operation) {
            return filter(chains, subject.primary(), operation);
        }

        @Override
        public Set<List<Resource>> filter(Set<List<Resource>> chains, Subject subject, Operation operation) {
            return filter(chains, subject.primary(), operation);
        }

        private final boolean allowed;

        private StubPermissionApi(boolean allowed) {
            this.allowed = allowed;
        }

        @Override
        public Decision decide(List<Resource> chain, Principal principal, Operation operation) {
            return new Decision(
                    allowed,
                    Optional.of(new Role("author")),
                    java.util.Set.of(),
                    java.util.List.of(),
                    java.util.List.of());
        }

        @Override
        public void defineRole(Role role, Set<Operation> operations) {}

        @Override
        public void grant(Resource resource, Principal principal, Role role) {}

        @Override
        public void revoke(Resource resource, Principal principal) {}

        @Override
        public RestrictResult restrict(Resource resource, Set<Principal> principals, long expectedRevision) {
            return new RestrictResult.Restricted(new RestrictionView(true, principals, expectedRevision + 1));
        }

        @Override
        public UnrestrictResult unrestrict(Resource resource, long expectedRevision) {
            return new UnrestrictResult.Unrestricted(RestrictionView.inactive(expectedRevision + 1));
        }

        @Override
        public void clearResource(Resource resource) {}

        @Override
        public void clearPrincipal(Principal principal) {}

        @Override
        public Set<UUID> tenantIdsOf(Principal principal) {
            return Set.of();
        }

        @Override
        public Set<List<Resource>> filter(Set<List<Resource>> chains, Principal principal, Operation operation) {
            return Set.of();
        }

        @Override
        public Optional<Role> effectiveRole(List<Resource> chain, Principal principal) {
            return Optional.empty();
        }

        @Override
        public Set<Operation> operations(Role role) {
            return Set.of();
        }

        @Override
        public RestrictionView restriction(Resource resource) {
            return RestrictionView.inactive(0);
        }

        @Override
        public Map<Resource, RestrictionView> restrictions(Set<Resource> resources) {
            return resources.stream()
                    .collect(java.util.stream.Collectors.toUnmodifiableMap(
                            resource -> resource, resource -> RestrictionView.inactive(0)));
        }

        @Override
        public GrantPage grants(Set<Resource> resources, String cursor, int limit) {
            return new GrantPage(List.of(), null);
        }
    }
}
