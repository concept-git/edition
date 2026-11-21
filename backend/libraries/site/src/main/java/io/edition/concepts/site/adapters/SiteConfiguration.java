package io.edition.concepts.site.adapters;

import io.edition.concepts.site.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.site")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.site.adapters.persistence")
public class SiteConfiguration {}
