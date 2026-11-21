package io.edition.concepts.permission.application;

import io.edition.concepts.permission.api.*;
import io.edition.concepts.permission.api.PermissionApi.*;
import io.edition.concepts.permission.domain.PermissionPolicy;
import io.edition.concepts.permission.domain.PermissionRepository;
import java.util.*;

/** 仅在当前事务使用的批量授权投影；分批加载完整事实，不能跨请求缓存或与旧权限拼接。 */
final class BatchPermissionView implements PermissionPolicy.View {
    private final Map<Resource, Map<Principal, Role>> grants = new HashMap<>();
    private final Map<Resource, RestrictionView> restrictions = new HashMap<>();
    private final Map<Role, Set<Operation>> operations = new HashMap<>();

    BatchPermissionView(PermissionRepository repository, Set<List<Resource>> chains) {
        var resources =
                new ArrayList<>(chains.stream().flatMap(List::stream).collect(java.util.stream.Collectors.toSet()));
        for (int offset = 0; offset < resources.size(); offset += 500) {
            var chunk = Set.copyOf(resources.subList(offset, Math.min(offset + 500, resources.size())));
            restrictions.putAll(repository.restrictions(chunk));
            UUID cursor = null;
            while (true) {
                var batch = repository.grants(chunk, cursor, 1000);
                for (var stored : batch) {
                    var g = stored.grant();
                    grants.computeIfAbsent(g.resource(), r -> new HashMap<>()).put(g.principal(), g.role());
                    operations.computeIfAbsent(g.role(), repository::operations);
                }
                if (batch.size() < 1000) break;
                cursor = batch.getLast().cursorId();
            }
        }
    }

    public Set<Operation> operations(Role role) {
        return operations.getOrDefault(role, Set.of());
    }

    public Optional<Role> grant(Resource resource, Principal principal) {
        return Optional.ofNullable(grants.getOrDefault(resource, Map.of()).get(principal));
    }

    public RestrictionView restriction(Resource resource) {
        return restrictions.getOrDefault(resource, RestrictionView.inactive(0));
    }
}
