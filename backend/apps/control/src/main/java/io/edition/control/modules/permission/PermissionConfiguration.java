package io.edition.control.modules.permission;

import io.edition.control.modules.permission.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.permission")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.permission.persistence")
public class PermissionConfiguration {}
