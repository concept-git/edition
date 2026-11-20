package io.space.concepts.release.adapters;

import io.space.concepts.release.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.release")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.release.adapters.persistence")
public class ReleaseConfiguration {}
