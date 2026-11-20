package io.space.concepts.customdomain.adapters;

import io.space.concepts.customdomain.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.customdomain")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.customdomain.adapters.persistence")
public class CustomDomainConfiguration {}
