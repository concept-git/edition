/**
 * 租户准入与判权。本包不是 flow 组，也不是第五限界上下文；仍属 syncs 模块。
 *
 * <p>{@code TenantAccess} 进入租户作用域；{@code PermissionGuard} 判资源链；
 * {@code PlatformOperatorGuard} / {@code OwnerRootAccess} 是另外两条入口。
 * {@code NamedInterface("syncs")} 把组合根公开类型暴露给 gateway，与 flow 组名无关。
 */
@org.springframework.modulith.NamedInterface("syncs")
package io.edition.control.compositions.access;
