package io.edition.concepts.apitoken.adapters;

import io.edition.concepts.apitoken.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.apitoken")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.apitoken.adapters.persistence")
public class ApiTokenConfiguration {}
