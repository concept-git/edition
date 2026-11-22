/**
 * 平台运营 flow 的组织根（入口是 /admin 运维面）：只做索引，不承载 sync。
 *
 * <p>具体 flow 按入口一层浅包归放：tenant、operations、servicehealth、
 * maildelivery、mailadmin、webhook。本包只是 syncs 模块内部的工程分组，不形成新的 Modulith 模块边界。
 * 命名接口向 gateway 暴露 flow 入口——gateway 看不见 platform.tenantregistry 登记处本身，
 * 开通与冻结只能经由这里的 flow。
 */
@org.springframework.modulith.NamedInterface("platform")
package io.edition.control.usecases.platform;
