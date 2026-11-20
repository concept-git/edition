package io.space.concepts.apitoken.adapters;

import io.space.concepts.apitoken.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.apitoken")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.apitoken.adapters.persistence")
public class ApiTokenConfiguration {}
