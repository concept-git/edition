package io.edition.control.modules.tenantregistry.api;

import io.edition.control.modules.tenantregistry.api.TenantRegistryApi.TenantId;

/** 登记处完成事件。事件类型属于本模块，不点名他人（审计消费随票 27）。 */
public final class TenantEvents {

    private TenantEvents() {}

    public record Provisioned(TenantId tenant, String name) {}

    public record Suspended(TenantId tenant) {}

    public record Resumed(TenantId tenant) {}
}
