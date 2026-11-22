package io.edition.control.modules.permission.persistence;

import io.edition.control.modules.permission.api.*;
import io.edition.control.modules.permission.api.PermissionApi.Grant;
import io.edition.control.modules.permission.api.PermissionApi.Operation;
import io.edition.control.modules.permission.api.PermissionApi.Principal;
import io.edition.control.modules.permission.api.PermissionApi.PrincipalType;
import io.edition.control.modules.permission.api.PermissionApi.Resource;
import io.edition.control.modules.permission.api.PermissionApi.ResourceType;
import io.edition.control.modules.permission.api.PermissionApi.RestrictionView;
import io.edition.control.modules.permission.api.PermissionApi.Role;
import io.edition.control.modules.permission.domain.PermissionRepository;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

/** 本概念的授权、白名单及版本墓碑投影；单条、批量与发布快照共用值翻译。 */
@Repository
class MyBatisPermissionRepository implements PermissionRepository {

    private final PermissionMapper mapper;

    MyBatisPermissionRepository(PermissionMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public io.edition.control.modules.permission.api.PermissionApi.Policy snapshot() {
        var grants = mapper.allGrants().stream()
                .map(MyBatisPermissionRepository::grant)
                .toList();
        return new io.edition.control.modules.permission.api.PermissionApi.Policy(
                grants, restrictionViews(mapper.activeRestrictions()));
    }

    @Override
    public void saveRole(Role role, Set<Operation> operations) {
        var values = operations.stream().map(Operation::value).sorted().toList();
        mapper.saveRole(role.value(), values);
    }

    @Override
    public Set<Operation> operations(Role role) {
        return mapper.findOperations(role.value()).stream().map(Operation::new).collect(Collectors.toUnmodifiableSet());
    }

    @Override
    public void saveGrant(Resource resource, Principal principal, Role role) {
        mapper.saveGrant(
                resource.type().value(), resource.id(), principal.type().value(), principal.id(), role.value());
    }

    @Override
    public void deleteGrant(Resource resource, Principal principal) {
        mapper.deleteGrant(
                resource.type().value(), resource.id(),
                principal.type().value(), principal.id());
    }

    @Override
    public Optional<Role> grant(Resource resource, Principal principal) {
        return Optional.ofNullable(mapper.findGrant(
                        resource.type().value(), resource.id(),
                        principal.type().value(), principal.id()))
                .map(Role::new);
    }

    @Override
    public boolean replaceRestriction(Resource resource, Set<Principal> principals, long expectedRevision) {
        boolean matched = expectedRevision == 0
                && mapper.insertActiveRestrictionScope(resource.type().value(), resource.id()) == 1;
        if (!matched) {
            matched = mapper.activateRestrictionScope(resource.type().value(), resource.id(), expectedRevision) == 1;
        }
        if (!matched) {
            return false;
        }
        mapper.deleteRestrictionMembers(resource.type().value(), resource.id());
        principals.forEach(principal -> mapper.insertRestriction(
                resource.type().value(), resource.id(), principal.type().value(), principal.id()));
        return true;
    }

    @Override
    public boolean removeRestriction(Resource resource, long expectedRevision) {
        boolean matched = expectedRevision == 0
                && mapper.insertInactiveRestrictionScope(resource.type().value(), resource.id()) == 1;
        if (!matched) {
            matched = mapper.deactivateRestrictionScope(resource.type().value(), resource.id(), expectedRevision) == 1;
        }
        if (!matched) {
            matched =
                    mapper.lockInactiveRestrictionScope(resource.type().value(), resource.id(), expectedRevision) == 1;
        }
        if (!matched) {
            return false;
        }
        mapper.deleteRestrictionMembers(resource.type().value(), resource.id());
        return true;
    }

    @Override
    public void clearResource(Resource resource) {
        mapper.clearResourceGrants(resource.type().value(), resource.id());
        mapper.deleteRestriction(resource.type().value(), resource.id());
    }

    @Override
    public void clearPrincipal(Principal principal) {
        mapper.clearPrincipalGrants(principal.type().value(), principal.id());
        mapper.clearPrincipalRestrictions(principal.type().value(), principal.id());
    }

    @Override
    public Set<UUID> tenantIdsOf(Principal principal) {
        return mapper.tenantIdsOf(principal.type().value(), principal.id()).stream()
                .map(UUID::fromString)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    @Override
    public RestrictionView restriction(Resource resource) {
        var scope = mapper.findRestrictionScope(resource.type().value(), resource.id());
        if (scope == null) {
            return RestrictionView.inactive(0);
        }
        if (!scope.active()) {
            return RestrictionView.inactive(scope.revision());
        }
        var rows = mapper.findRestrictions(resource.type().value(), resource.id());
        Set<Principal> principals = rows.stream()
                .map(row -> principal(row.principalType(), row.principalId()))
                .collect(Collectors.toUnmodifiableSet());
        return new RestrictionView(true, principals, scope.revision());
    }

    @Override
    public Map<Resource, RestrictionView> restrictions(Set<Resource> resources) {
        if (resources.isEmpty()) {
            return Map.of();
        }
        var found = restrictionViews(mapper.findRestrictionProjections(resourceRows(resources)));
        var result = new LinkedHashMap<Resource, RestrictionView>();
        resources.forEach(resource -> result.put(resource, found.getOrDefault(resource, RestrictionView.inactive(0))));
        return Map.copyOf(result);
    }

    @Override
    public List<StoredGrant> grants(Set<Resource> resources, UUID after, int limit) {
        if (resources.isEmpty()) {
            return List.of();
        }
        return mapper.pageGrants(resourceRows(resources), after, limit).stream()
                .map(row -> new StoredGrant(row.id(), grant(row)))
                .toList();
    }

    private static List<PermissionMapper.ResourceRow> resourceRows(Set<Resource> resources) {
        return resources.stream()
                .map(resource -> new PermissionMapper.ResourceRow(
                        resource.type().value(), resource.id().toString()))
                .toList();
    }

    private static Grant grant(PermissionMapper.GrantRow row) {
        return new Grant(
                new Resource(ResourceType.valueOf(row.resourceType().toUpperCase(Locale.ROOT)), row.resourceId()),
                principal(row.principalType(), row.principalId()),
                new Role(row.role()));
    }

    private static Principal principal(String type, UUID id) {
        return new Principal(PrincipalType.valueOf(type.toUpperCase(Locale.ROOT)), id);
    }

    /** 快照和批量判权共用同一投影；空的 active 白名单与 inactive 墓碑不可混淆。 */
    private static Map<Resource, RestrictionView> restrictionViews(
            List<PermissionMapper.RestrictionProjectionRow> rows) {
        var grouped = new LinkedHashMap<Resource, RestrictionRows>();
        for (var row : rows) {
            var resource =
                    new Resource(ResourceType.valueOf(row.resourceType().toUpperCase(Locale.ROOT)), row.resourceId());
            var scope = grouped.computeIfAbsent(
                    resource, ignored -> new RestrictionRows(row.active(), row.revision(), new LinkedHashSet<>()));
            if (row.principalType() != null) scope.principals().add(principal(row.principalType(), row.principalId()));
        }
        var result = new LinkedHashMap<Resource, RestrictionView>();
        grouped.forEach((resource, scope) -> result.put(
                resource,
                scope.active()
                        ? new RestrictionView(true, scope.principals(), scope.revision())
                        : RestrictionView.inactive(scope.revision())));
        return Map.copyOf(result);
    }

    private record RestrictionRows(boolean active, long revision, Set<Principal> principals) {}
}
