package io.edition.concepts.team.adapters;

import io.edition.concepts.team.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.team")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.team.adapters.persistence")
public class TeamConfiguration {}
