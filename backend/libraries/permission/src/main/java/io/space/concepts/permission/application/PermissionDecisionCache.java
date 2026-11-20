package io.space.concepts.permission.application;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.space.concepts.permission.api.*;
import io.space.concepts.permission.api.PermissionApi.Decision;
import io.space.concepts.permission.api.PermissionApi.Operation;
import io.space.concepts.permission.api.PermissionApi.Principal;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.permission.api.PermissionApi.Subject;
import java.time.Duration;
import java.util.List;
import java.util.function.Supplier;
import org.springframework.stereotype.Component;

/**
 * 判定缓存只保存可重建的查询结果；授权事实仍以 PostgreSQL 为唯一真相源。
 */
@Component
class PermissionDecisionCache {

    private final Cache<Key, Decision> decisions = Caffeine.newBuilder()
            .maximumSize(20_000)
            .expireAfterWrite(Duration.ofMinutes(5))
            .build();

    Decision get(List<Resource> chain, Subject subject, Operation operation, Supplier<Decision> loader) {
        Key key = new Key(List.copyOf(chain), subject, operation);
        return decisions.get(key, ignored -> loader.get());
    }

    void invalidateResource(Resource resource) {
        decisions.asMap().keySet().removeIf(key -> key.chain().contains(resource));
    }

    void invalidatePrincipal(Principal principal) {
        decisions.asMap().keySet().removeIf(key -> key.subject().identities().contains(principal));
    }

    void invalidateAll() {
        decisions.invalidateAll();
    }

    private record Key(List<Resource> chain, Subject subject, Operation operation) {}
}
