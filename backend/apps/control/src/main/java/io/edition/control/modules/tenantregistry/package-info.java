/**
 * 平台概念 TenantRegistry，规格见本包 CONCEPT.md；Tenant 身份本身仍是不透明类型。
 * 拥有 shared.tenants 的写入（该表在共享内核 schema，人人可读、单一写入者）。
 * sync 可依赖本模块；gateway 看不见它（gateway 只见 shared + sync），
 * 其他概念模块也不得依赖它——租户隔离靠成员 + 授权 + 空间 + 域名，而非查登记处。
 */
@org.springframework.modulith.ApplicationModule(
        id = "platform.tenantregistry",
        displayName = "TenantRegistry",
        allowedDependencies = {"shared"})
package io.edition.control.modules.tenantregistry;

import io.edition.control.modules.tenantregistry.api.*;
