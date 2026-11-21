package io.edition.concepts.permission.adapters;

import io.edition.concepts.permission.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.permission")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.permission.adapters.persistence")
public class PermissionConfiguration {}
