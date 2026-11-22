package io.edition.control.modules.apitoken;

import io.edition.control.modules.apitoken.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.apitoken")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.apitoken.persistence")
public class ApiTokenConfiguration {}
