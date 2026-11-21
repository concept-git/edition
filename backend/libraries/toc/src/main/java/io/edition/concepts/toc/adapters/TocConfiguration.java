package io.edition.concepts.toc.adapters;

import io.edition.concepts.toc.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.toc")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.toc.adapters.persistence")
public class TocConfiguration {}
