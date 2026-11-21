package io.edition.concepts.permission.application;

import io.edition.concepts.permission.api.*;
import io.edition.concepts.permission.api.PermissionEvents;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 事务提交后再失效缓存，避免数据库回滚时先清缓存而制造短暂的错误读。
 */
@Component
class PermissionCacheInvalidator {

    private final PermissionDecisionCache cache;

    PermissionCacheInvalidator(PermissionDecisionCache cache) {
        this.cache = cache;
    }

    @TransactionalEventListener
    void roleDefined(PermissionEvents.RoleDefined event) {
        // 角色操作集可能被重定义，无法只按资源定位，必须清空全部判定。
        cache.invalidateAll();
    }

    @TransactionalEventListener
    void granted(PermissionEvents.Granted event) {
        cache.invalidateResource(event.resource());
    }

    @TransactionalEventListener
    void revoked(PermissionEvents.Revoked event) {
        cache.invalidateResource(event.resource());
    }

    @TransactionalEventListener
    void restricted(PermissionEvents.Restricted event) {
        cache.invalidateResource(event.resource());
    }

    @TransactionalEventListener
    void unrestricted(PermissionEvents.Unrestricted event) {
        cache.invalidateResource(event.resource());
    }

    @TransactionalEventListener
    void resourceCleared(PermissionEvents.ResourceCleared event) {
        cache.invalidateResource(event.resource());
    }

    @TransactionalEventListener
    void principalCleared(PermissionEvents.PrincipalCleared event) {
        cache.invalidatePrincipal(event.principal());
    }
}
