package io.space.concepts.session.adapters;

import io.space.concepts.session.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.session")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.session.adapters.persistence")
public class SessionConfiguration {}
