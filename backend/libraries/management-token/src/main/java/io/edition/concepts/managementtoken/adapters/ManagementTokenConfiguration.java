package io.edition.concepts.managementtoken.adapters;

import io.edition.concepts.managementtoken.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.managementtoken")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.managementtoken.adapters.persistence")
public class ManagementTokenConfiguration {}
