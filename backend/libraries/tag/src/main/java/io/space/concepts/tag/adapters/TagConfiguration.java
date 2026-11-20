package io.space.concepts.tag.adapters;

import io.space.concepts.tag.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.tag")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.tag.adapters.persistence")
public class TagConfiguration {}
