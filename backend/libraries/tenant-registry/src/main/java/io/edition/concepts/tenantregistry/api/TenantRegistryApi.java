package io.edition.concepts.tenantregistry.api;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * 租户登记处的唯一对外门面（平台概念 TenantRegistry，见本包 CONCEPT.md）。
 * 只回答"这个租户叫什么、是否被冻结"；隔离由成员 + 授权 + 空间 + 域名达成。
 */
public interface TenantRegistryApi {

    ProvisionResult provision(String name);

    /** 幂等：已冻结再冻结不报错。 */
    void suspend(TenantId tenant);

    /** 幂等：未冻结再恢复不报错。 */
    void resume(TenantId tenant);

    Optional<Status> status(TenantId tenant);

    Optional<View> view(TenantId tenant);

    /** 按 id 批量取视图（`/me` 的租户清单据此显示名称与状态）。 */
    List<View> viewsOf(Collection<TenantId> tenants);

    Page list(String cursor, int limit);

    record TenantId(UUID value) {
        public TenantId {
            Objects.requireNonNull(value, "tenant id");
        }
    }

    enum Status {
        ACTIVE,
        SUSPENDED
    }

    record View(TenantId id, String name, Status status, Instant createdAt) {}

    record Page(List<View> tenants, String nextCursor) {
        public Page {
            tenants = List.copyOf(tenants);
        }
    }

    sealed interface ProvisionResult {

        record Provisioned(View tenant) implements ProvisionResult {}

        record InvalidName(String reason) implements ProvisionResult {}
    }
}
