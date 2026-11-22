package io.edition.control.modules.managementtoken;

import io.edition.control.modules.managementtoken.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.managementtoken")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.managementtoken.persistence")
public class ManagementTokenConfiguration {}
