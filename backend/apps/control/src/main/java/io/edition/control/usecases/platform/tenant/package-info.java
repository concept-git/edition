/**
 * 租户开通与冻结 flow：平台运营员登记租户、落座或邀请首个 owner、冻结/恢复、列出租户。
 *
 * <p>拥有：开通 sync 与租户登记处的 error case（tenant_name_invalid / tenant_not_found）。
 * 复用组合根的 {@code PlatformOperatorGuard}（主体属性判定，不走资源链）与 {@code OwnerRootAccess}。
 * 不拥有租户状态（那在 platform.tenantregistry 登记处），不承接租户内的成员管理。
 */
@org.springframework.modulith.NamedInterface("platform")
package io.edition.control.usecases.platform.tenant;
