package io.edition.concepts.redirect.adapters;

import io.edition.concepts.redirect.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.redirect")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.redirect.adapters.persistence")
public class RedirectConfiguration {}
