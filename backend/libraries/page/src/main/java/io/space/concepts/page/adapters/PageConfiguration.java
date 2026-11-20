package io.space.concepts.page.adapters;

import io.space.concepts.page.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.page")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.page.adapters.persistence")
public class PageConfiguration {}
