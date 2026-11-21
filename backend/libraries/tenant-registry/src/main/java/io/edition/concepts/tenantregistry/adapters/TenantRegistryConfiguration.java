package io.edition.concepts.tenantregistry.adapters;

import io.edition.concepts.tenantregistry.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.tenantregistry")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.tenantregistry.adapters.persistence")
public class TenantRegistryConfiguration {}
