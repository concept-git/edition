package io.edition.concepts.user.adapters;

import io.edition.concepts.user.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.user")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.user.adapters.persistence")
public class UserConfiguration {}
