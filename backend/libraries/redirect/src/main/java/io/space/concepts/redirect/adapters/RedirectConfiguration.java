package io.space.concepts.redirect.adapters;

import io.space.concepts.redirect.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.redirect")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.redirect.adapters.persistence")
public class RedirectConfiguration {}
