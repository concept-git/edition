package io.edition.control.modules.site;

import io.edition.control.modules.site.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.site")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.site.persistence")
public class SiteConfiguration {}
