package io.space.concepts.search.adapters;

import io.space.concepts.search.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.search")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.search.adapters.persistence")
public class SearchConfiguration {}
