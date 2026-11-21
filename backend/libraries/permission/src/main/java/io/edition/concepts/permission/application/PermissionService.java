package io.edition.concepts.permission.application;

import io.edition.concepts.permission.api.*;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.permission.api.PermissionEvents;
import io.edition.concepts.permission.domain.PermissionPolicy;
import io.edition.concepts.permission.domain.PermissionRepository;
import io.edition.shared.PageWindow;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 动作与事件共享事务；缓存查询与即时批量查询复用同一纯判权规则。 */
@Service
@Transactional
class PermissionService implements PermissionApi {

    @Override
    @Transactional(readOnly = true)
    public Policy snapshot() {
        return repository.snapshot();
    }

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    // PermissionPolicy 保持纯净；事务、事件和缓存协调只出现在 application 层。
    private final PermissionRepository repository;
    private final PermissionDecisionCache cache;
    private final ApplicationEventPublisher events;
    private final PermissionPolicy policy = new PermissionPolicy();

    PermissionService(
            PermissionRepository repository, PermissionDecisionCache cache, ApplicationEventPublisher events) {
        this.repository = repository;
        this.cache = cache;
        this.events = events;
    }

    @Override
    public void defineRole(Role role, Set<Operation> operations) {
        repository.saveRole(role, Set.copyOf(operations));
        events.publishEvent(new PermissionEvents.RoleDefined(role));
    }

    @Override
    public void grant(Resource resource, Principal principal, Role role) {
        repository.saveGrant(resource, principal, role);
        events.publishEvent(new PermissionEvents.Granted(resource, principal, role));
    }

    @Override
    public void revoke(Resource resource, Principal principal) {
        repository.deleteGrant(resource, principal);
        events.publishEvent(new PermissionEvents.Revoked(resource, principal));
    }

    @Override
    public RestrictResult restrict(Resource resource, Set<Principal> principals, long expectedRevision) {
        requireRevision(expectedRevision);
        if (!repository.replaceRestriction(resource, Set.copyOf(principals), expectedRevision)) {
            return new RestrictResult.Conflict(repository.restriction(resource));
        }
        events.publishEvent(new PermissionEvents.Restricted(resource));
        return new RestrictResult.Restricted(repository.restriction(resource));
    }

    @Override
    public UnrestrictResult unrestrict(Resource resource, long expectedRevision) {
        requireRevision(expectedRevision);
        if (!repository.removeRestriction(resource, expectedRevision)) {
            return new UnrestrictResult.Conflict(repository.restriction(resource));
        }
        events.publishEvent(new PermissionEvents.Unrestricted(resource));
        return new UnrestrictResult.Unrestricted(repository.restriction(resource));
    }

    @Override
    public void clearResource(Resource resource) {
        repository.clearResource(resource);
        events.publishEvent(new PermissionEvents.ResourceCleared(resource));
    }

    @Override
    public void clearPrincipal(Principal principal) {
        repository.clearPrincipal(principal);
        events.publishEvent(new PermissionEvents.PrincipalCleared(principal));
    }

    @Override
    @Transactional(readOnly = true)
    public Set<UUID> tenantIdsOf(Principal principal) {
        return repository.tenantIdsOf(principal);
    }

    @Override
    @Transactional(readOnly = true)
    public Decision decide(List<Resource> chain, Principal principal, Operation operation) {
        return decide(chain, Subject.of(principal), operation);
    }

    @Override
    @Transactional(readOnly = true)
    public Decision decide(List<Resource> chain, Subject subject, Operation operation) {
        List<Resource> stableChain = List.copyOf(chain);
        return cache.get(
                stableChain,
                subject,
                operation,
                () -> policy.decide(stableChain, subject, operation, new RepositoryView(repository)));
    }

    @Override
    @Transactional(readOnly = true)
    public Set<List<Resource>> filterFresh(Set<List<Resource>> chains, Principal principal, Operation operation) {
        return policy.filter(chains, principal, operation, new BatchPermissionView(repository, chains));
    }

    @Override
    @Transactional(readOnly = true)
    public Set<List<Resource>> filterFresh(Set<List<Resource>> chains, Subject subject, Operation operation) {
        return policy.filter(chains, subject, operation, new BatchPermissionView(repository, chains));
    }

    @Override
    @Transactional(readOnly = true)
    public Decision decideFresh(List<Resource> chain, Principal principal, Operation operation) {
        return policy.decide(List.copyOf(chain), Subject.of(principal), operation, new RepositoryView(repository));
    }

    @Override
    @Transactional(readOnly = true)
    public Set<List<Resource>> filter(Set<List<Resource>> chains, Principal principal, Operation operation) {
        return filter(chains, Subject.of(principal), operation);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<List<Resource>> filter(Set<List<Resource>> chains, Subject subject, Operation operation) {
        return chains.stream()
                .filter(chain -> decide(chain, subject, operation).allowed())
                .map(List::copyOf)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Role> effectiveRole(List<Resource> chain, Principal principal) {
        return policy.effectiveRole(List.copyOf(chain), principal, new RepositoryView(repository));
    }

    @Override
    @Transactional(readOnly = true)
    public Set<Operation> operations(Role role) {
        return repository.operations(role);
    }

    @Override
    @Transactional(readOnly = true)
    public RestrictionView restriction(Resource resource) {
        return repository.restriction(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Resource, RestrictionView> restrictions(Set<Resource> resources) {
        return repository.restrictions(Set.copyOf(resources));
    }

    @Override
    @Transactional(readOnly = true)
    public GrantPage grants(Set<Resource> resources, String cursor, int limit) {
        int pageSize = limit <= 0 ? DEFAULT_PAGE_SIZE : Math.min(limit, MAX_PAGE_SIZE);
        List<PermissionRepository.StoredGrant> rows =
                repository.grants(Set.copyOf(resources), decodeCursor(cursor), pageSize + 1);
        var window = PageWindow.of(rows, pageSize, row -> encodeCursor(row.cursorId()));
        return new GrantPage(
                window.items().stream()
                        .map(PermissionRepository.StoredGrant::grant)
                        .toList(),
                window.nextCursor());
    }

    private record RepositoryView(PermissionRepository repository) implements PermissionPolicy.View {
        @Override
        public Set<Operation> operations(Role role) {
            return repository.operations(role);
        }

        @Override
        public java.util.Optional<Role> grant(Resource resource, Principal principal) {
            return repository.grant(resource, principal);
        }

        @Override
        public RestrictionView restriction(Resource resource) {
            return repository.restriction(resource);
        }
    }

    private static void requireRevision(long revision) {
        if (revision < 0) {
            throw new IllegalArgumentException("restriction revision must not be negative");
        }
    }

    private static UUID decodeCursor(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            return null;
        }
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.US_ASCII);
            return UUID.fromString(decoded);
        } catch (IllegalArgumentException invalid) {
            throw new IllegalArgumentException("invalid permission grant cursor", invalid);
        }
    }

    private static String encodeCursor(UUID id) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(id.toString().getBytes(StandardCharsets.US_ASCII));
    }
}
