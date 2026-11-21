package io.edition.concepts.search.adapters;

import io.edition.concepts.search.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.search")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.search.adapters.persistence")
public class SearchConfiguration {}
