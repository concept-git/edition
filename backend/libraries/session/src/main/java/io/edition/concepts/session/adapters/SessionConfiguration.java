package io.edition.concepts.session.adapters;

import io.edition.concepts.session.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.session")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.session.adapters.persistence")
public class SessionConfiguration {}
