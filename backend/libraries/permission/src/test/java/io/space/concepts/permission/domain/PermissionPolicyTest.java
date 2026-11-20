package io.space.concepts.permission.domain;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.permission.api.*;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.permission.api.PermissionApi.Decision;
import io.space.concepts.permission.api.PermissionApi.DecisionTrace;
import io.space.concepts.permission.api.PermissionApi.Operation;
import io.space.concepts.permission.api.PermissionApi.Principal;
import io.space.concepts.permission.api.PermissionApi.PrincipalType;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.permission.api.PermissionApi.ResourceType;
import io.space.concepts.permission.api.PermissionApi.Role;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PermissionPolicyTest {

    private static final Resource SITE =
            new Resource(ResourceType.SITE, UUID.fromString("00000000-0000-0000-0000-000000000001"));
    private static final Resource SPACE =
            new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000002"));
    private static final Resource PAGE =
            new Resource(ResourceType.PAGE, UUID.fromString("00000000-0000-0000-0000-000000000008"));
    private static final Principal ANONYMOUS = Principal.anonymous();
    private static final Principal ALICE =
            new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000003"));
    private static final Principal BOB =
            new Principal(PrincipalType.USER, UUID.fromString("00000000-0000-0000-0000-000000000004"));
    private static final Principal DOCS_TEAM =
            new Principal(PrincipalType.TEAM, UUID.fromString("00000000-0000-0000-0000-000000000006"));
    private static final Principal REVIEW_TEAM =
            new Principal(PrincipalType.TEAM, UUID.fromString("00000000-0000-0000-0000-000000000007"));
    private static final Role READER = new Role("reader");
    private static final Role AUTHOR = new Role("author");
    private static final Role NONE = new Role("none");
    private static final Operation READ = new Operation("read");
    private static final Operation WRITE = new Operation("write");

    @Test
    void innerAffiliationGrantsReplaceOuterInheritanceAndCombineTheirOperations() {
        var subject = new PermissionApi.Subject(ALICE, Set.of(DOCS_TEAM, REVIEW_TEAM));
        var view = new StubView(
                Map.of(READER, Set.of(READ), AUTHOR, Set.of(READ, WRITE)),
                Map.of(
                        new GrantKey(SITE, ALICE), READER,
                        new GrantKey(SPACE, DOCS_TEAM), AUTHOR,
                        new GrantKey(SPACE, REVIEW_TEAM), READER),
                Map.of());

        Decision decision = new PermissionPolicy().decide(List.of(SITE, SPACE), subject, WRITE, view);

        assertThat(decision.allowed()).isTrue();
        assertThat(decision.effectiveRole()).isEmpty();
        assertThat(decision.effectiveOperations()).containsExactlyInAnyOrder(READ, WRITE);
        assertThat(decision.matchedGrants())
                .extracting(PermissionApi.Grant::principal)
                .containsExactlyInAnyOrder(DOCS_TEAM, REVIEW_TEAM);
        assertThat(decision.trace())
                .extracting(PermissionApi.DecisionTrace::decisive)
                .containsExactly(false, true);
    }

    @Test
    void everyRestrictionMatchesAgainstTheWholeIdentityClosureAndKeepsItsRevisionInTheTrace() {
        var subject = new PermissionApi.Subject(ALICE, Set.of(DOCS_TEAM));
        var view = new RevisionedStubView(
                Map.of(READER, Set.of(READ)),
                Map.of(new GrantKey(SPACE, ALICE), READER),
                Map.of(PAGE, new PermissionApi.RestrictionView(true, Set.of(DOCS_TEAM), 7)));

        Decision decision = new PermissionPolicy().decide(List.of(SPACE, PAGE), subject, READ, view);

        assertThat(decision.allowed()).isTrue();
        assertThat(decision.trace().getLast().restriction().revision()).isEqualTo(7);
        assertThat(decision.trace().getLast().restrictionMatches()).containsExactly(DOCS_TEAM);
    }

    @Test
    void innerResourceInheritsTheOuterGrant() {
        var view = new StubView(Map.of(READER, Set.of(READ)), Map.of(new GrantKey(SITE, ANONYMOUS), READER), Map.of());

        Decision decision = new PermissionPolicy().decide(List.of(SITE, SPACE), ANONYMOUS, READ, view);

        assertThat(decision.allowed()).isTrue();
        assertThat(decision.effectiveRole()).contains(READER);
        assertThat(decision.effectiveOperations()).containsExactly(READ);
    }

    @Test
    void innermostGrantOverridesAnInheritedGrant() {
        var view = new StubView(
                Map.of(READER, Set.of(READ), NONE, Set.of()),
                Map.of(
                        new GrantKey(SITE, ANONYMOUS), READER,
                        new GrantKey(SPACE, ANONYMOUS), NONE),
                Map.of());

        Decision decision = new PermissionPolicy().decide(List.of(SITE, SPACE), ANONYMOUS, READ, view);

        assertThat(decision.allowed()).isFalse();
        assertThat(decision.effectiveRole()).contains(NONE);
        assertThat(decision.effectiveOperations()).isEmpty();
    }

    @Test
    void anyRestrictionOnTheChainCanOnlyNarrowAccess() {
        var view = new StubView(
                Map.of(READER, Set.of(READ)), Map.of(new GrantKey(SITE, BOB), READER), Map.of(SPACE, Set.of(ALICE)));

        Decision decision = new PermissionPolicy().decide(List.of(SITE, SPACE), BOB, READ, view);

        assertThat(decision.allowed()).isFalse();
        assertThat(decision.effectiveRole()).contains(READER);
        assertThat(decision.trace())
                .extracting(DecisionTrace::restrictionSatisfied)
                .containsExactly(true, false);
    }

    @Test
    void accessIsDeniedWithoutAnyGrant() {
        var view = new StubView(Map.of(READER, Set.of(READ)), Map.of(), Map.of());

        Decision decision = new PermissionPolicy().decide(List.of(SITE, SPACE), ANONYMOUS, READ, view);

        assertThat(decision.allowed()).isFalse();
        assertThat(decision.effectiveRole()).isEmpty();
        assertThat(decision.effectiveOperations()).isEmpty();
    }

    @Test
    void filterAndEffectiveRoleUseTheSameDecisionPolicy() {
        Resource privateSpace =
                new Resource(ResourceType.SPACE, UUID.fromString("00000000-0000-0000-0000-000000000005"));
        var view = new StubView(
                Map.of(READER, Set.of(READ)),
                Map.of(new GrantKey(SITE, ANONYMOUS), READER),
                Map.of(privateSpace, Set.of(ALICE)));
        PermissionPolicy policy = new PermissionPolicy();

        Set<List<Resource>> permitted =
                policy.filter(Set.of(List.of(SITE, SPACE), List.of(SITE, privateSpace)), ANONYMOUS, READ, view);

        assertThat(permitted).containsExactly(List.of(SITE, SPACE));
        assertThat(policy.effectiveRole(List.of(SITE, SPACE), ANONYMOUS, view)).contains(READER);
    }

    private record GrantKey(Resource resource, Principal principal) {}

    private record StubView(
            Map<Role, Set<Operation>> roles, Map<GrantKey, Role> grants, Map<Resource, Set<Principal>> restrictions)
            implements PermissionPolicy.View {

        @Override
        public Set<Operation> operations(Role role) {
            return roles.getOrDefault(role, Set.of());
        }

        @Override
        public Optional<Role> grant(Resource resource, Principal principal) {
            return Optional.ofNullable(grants.get(new GrantKey(resource, principal)));
        }

        @Override
        public PermissionApi.RestrictionView restriction(Resource resource) {
            Set<Principal> principals = restrictions.get(resource);
            return principals == null
                    ? PermissionApi.RestrictionView.inactive(0)
                    : new PermissionApi.RestrictionView(true, principals, 0);
        }
    }

    private record RevisionedStubView(
            Map<Role, Set<Operation>> roles,
            Map<GrantKey, Role> grants,
            Map<Resource, PermissionApi.RestrictionView> restrictions)
            implements PermissionPolicy.View {
        @Override
        public Set<Operation> operations(Role role) {
            return roles.getOrDefault(role, Set.of());
        }

        @Override
        public Optional<Role> grant(Resource resource, Principal principal) {
            return Optional.ofNullable(grants.get(new GrantKey(resource, principal)));
        }

        @Override
        public PermissionApi.RestrictionView restriction(Resource resource) {
            return restrictions.getOrDefault(resource, PermissionApi.RestrictionView.inactive(0));
        }
    }
}
