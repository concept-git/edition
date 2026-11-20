package io.space.concepts.toc.adapters;

import io.space.concepts.toc.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.toc")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.toc.adapters.persistence")
public class TocConfiguration {}
