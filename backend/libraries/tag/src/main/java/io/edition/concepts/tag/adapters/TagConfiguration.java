package io.edition.concepts.tag.adapters;

import io.edition.concepts.tag.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.tag")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.tag.adapters.persistence")
public class TagConfiguration {}
