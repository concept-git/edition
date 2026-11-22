/**
 * 权限管理 flow：拥有 Space grant、Page restriction、主体搜索与有效权限解释的组合入口。
 * Permission 状态仍归概念模块；真实归属走组合根 {@code ResourceChain}，
 * 本包只做 ACL 元权限与跨概念投影。
 */
@org.springframework.modulith.NamedInterface("authoring")
package io.edition.control.usecases.authoring.permission;
