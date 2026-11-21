/**
 * 共享内核：Ids(UUIDv7)、审计注解、错误码、分页游标。
 * 规则：只含被动类型，永不反向依赖业务模块（allowedDependencies 为空）。
 */
@org.springframework.modulith.ApplicationModule(
        displayName = "Shared Kernel",
        allowedDependencies = {})
package io.edition.shared;
