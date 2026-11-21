package io.edition.concepts.page.adapters;

import io.edition.concepts.page.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.page")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.page.adapters.persistence")
public class PageConfiguration {}
