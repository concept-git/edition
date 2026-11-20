package io.space.concepts.tenantregistry.adapters;

import io.space.concepts.tenantregistry.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.tenantregistry")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.tenantregistry.adapters.persistence")
public class TenantRegistryConfiguration {}
