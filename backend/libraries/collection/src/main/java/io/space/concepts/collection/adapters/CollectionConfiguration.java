package io.space.concepts.collection.adapters;

import io.space.concepts.collection.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.collection")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.collection.adapters.persistence")
public class CollectionConfiguration {}
