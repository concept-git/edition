package io.space.concepts.managementtoken.adapters;

import io.space.concepts.managementtoken.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.managementtoken")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.managementtoken.adapters.persistence")
public class ManagementTokenConfiguration {}
