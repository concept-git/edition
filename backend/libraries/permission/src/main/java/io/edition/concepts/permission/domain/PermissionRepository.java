package io.edition.concepts.permission.domain;

import io.edition.concepts.permission.api.*;
import io.edition.concepts.permission.api.PermissionApi.Grant;
import io.edition.concepts.permission.api.PermissionApi.Operation;
import io.edition.concepts.permission.api.PermissionApi.Principal;
import io.edition.concepts.permission.api.PermissionApi.Resource;
import io.edition.concepts.permission.api.PermissionApi.RestrictionView;
import io.edition.concepts.permission.api.PermissionApi.Role;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Permission 状态的持久化端口。domain 只依赖此端口，不知道 MyBatis 或表结构。
 */
public interface PermissionRepository {

    void saveRole(Role role, Set<Operation> operations);

    Set<Operation> operations(Role role);

    void saveGrant(Resource resource, Principal principal, Role role);

    void deleteGrant(Resource resource, Principal principal);

    Optional<Role> grant(Resource resource, Principal principal);

    boolean replaceRestriction(Resource resource, Set<Principal> principals, long expectedRevision);

    boolean removeRestriction(Resource resource, long expectedRevision);

    void clearResource(Resource resource);

    void clearPrincipal(Principal principal);

    Set<java.util.UUID> tenantIdsOf(Principal principal);

    RestrictionView restriction(Resource resource);

    Map<Resource, RestrictionView> restrictions(Set<Resource> resources);

    List<StoredGrant> grants(Set<Resource> resources, UUID after, int limit);

    io.edition.concepts.permission.api.PermissionApi.Policy snapshot();

    record StoredGrant(UUID cursorId, Grant grant) {}
}
