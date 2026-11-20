package io.space.concepts.site.adapters;

import io.space.concepts.site.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.site")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.site.adapters.persistence")
public class SiteConfiguration {}
