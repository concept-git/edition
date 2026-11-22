package io.edition.control.modules.team;

import io.edition.control.modules.team.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.team")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.team.persistence")
public class TeamConfiguration {}
