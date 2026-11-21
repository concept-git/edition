package io.edition.concepts.tenantregistry.api;

import io.edition.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import java.util.function.Supplier;

/**
 * 租户上下文（事务级 `app.tenant_id`）。
 *
 * <p>DDL 已对 shared.tenants、iam.memberships、iam.invites 等表 enable + force RLS，策略
 * `for all to space_app` 全靠这个 GUC。Flyway 使用 owner/migration pool，业务连接
 * 使用 `SET ROLE space_app`；运行时角色不是表 owner、没有 BYPASSRLS。
 *
 * <p>两条 bootstrap 路径天生没有上下文，必须显式声明理由（见 {@link BootstrapReason}）：
 * 开通时租户行尚不存在，接受邀请时解 token 之前不知道属于哪个租户
 * （正是 iam.invites 的 DDL 注释所预警的"invite bootstrap 需窄解析入口"）。
 */
public interface TenantScopeApi {

    <T> T inTenant(TenantId tenant, Supplier<T> work);

    void inTenant(TenantId tenant, Runnable work);

    <T> T withoutTenant(BootstrapReason reason, Supplier<T> work);

    enum BootstrapReason {

        /** 租户行尚不存在：`with check (id = app.tenant_id)` 只能在插入后才有值。 */
        TENANT_PROVISIONING,

        /** 解邀请 token 之前不知道属于哪个租户：窄解析入口。 */
        INVITE_RESOLUTION,

        /** 按 API token UUID 精确定位前不知道其绑定租户：只允许单行认证查询。 */
        TOKEN_RESOLUTION,

        /** 全局 User 停用/抹除时只按 owner id 枚举其 token bindings，随后逐 tenant 清理。 */
        USER_SECURITY_CASCADE
    }
}
