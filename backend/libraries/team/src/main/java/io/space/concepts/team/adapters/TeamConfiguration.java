package io.space.concepts.team.adapters;

import io.space.concepts.team.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.team")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.team.adapters.persistence")
public class TeamConfiguration {}
