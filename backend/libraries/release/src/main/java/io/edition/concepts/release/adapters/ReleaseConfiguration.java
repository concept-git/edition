package io.edition.concepts.release.adapters;

import io.edition.concepts.release.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.release")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.release.adapters.persistence")
public class ReleaseConfiguration {}
