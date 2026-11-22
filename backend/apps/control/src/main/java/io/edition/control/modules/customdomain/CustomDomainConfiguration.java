package io.edition.control.modules.customdomain;

import io.edition.control.modules.customdomain.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.customdomain")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.customdomain.persistence")
public class CustomDomainConfiguration {}
