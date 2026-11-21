package io.edition.concepts.customdomain.adapters;

import io.edition.concepts.customdomain.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.customdomain")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.customdomain.adapters.persistence")
public class CustomDomainConfiguration {}
