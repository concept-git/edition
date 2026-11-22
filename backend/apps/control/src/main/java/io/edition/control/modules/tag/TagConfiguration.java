package io.edition.control.modules.tag;

import io.edition.control.modules.tag.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.tag")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.tag.persistence")
public class TagConfiguration {}
