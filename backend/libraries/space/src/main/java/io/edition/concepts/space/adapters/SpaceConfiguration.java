package io.edition.concepts.space.adapters;

import io.edition.concepts.space.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.space")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.space.adapters.persistence")
public class SpaceConfiguration {}
