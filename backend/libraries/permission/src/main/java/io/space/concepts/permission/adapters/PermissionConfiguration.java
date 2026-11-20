package io.space.concepts.permission.adapters;

import io.space.concepts.permission.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.permission")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.permission.adapters.persistence")
public class PermissionConfiguration {}
