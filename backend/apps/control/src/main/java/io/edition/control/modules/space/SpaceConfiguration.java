package io.edition.control.modules.space;

import io.edition.control.modules.space.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.space")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.space.persistence")
public class SpaceConfiguration {}
