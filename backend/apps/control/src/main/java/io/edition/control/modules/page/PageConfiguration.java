package io.edition.control.modules.page;

import io.edition.control.modules.page.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.page")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.page.persistence")
public class PageConfiguration {}
