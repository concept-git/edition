package io.edition.concepts.collection.adapters;

import io.edition.concepts.collection.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.collection")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.collection.adapters.persistence")
public class CollectionConfiguration {}
