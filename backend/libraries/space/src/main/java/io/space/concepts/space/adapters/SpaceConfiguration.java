package io.space.concepts.space.adapters;

import io.space.concepts.space.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.space")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.space.adapters.persistence")
public class SpaceConfiguration {}
