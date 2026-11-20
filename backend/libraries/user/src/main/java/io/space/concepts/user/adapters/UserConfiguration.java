package io.space.concepts.user.adapters;

import io.space.concepts.user.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.user")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.user.adapters.persistence")
public class UserConfiguration {}
