package io.edition.control.modules.toc;

import io.edition.control.modules.toc.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.toc")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.toc.persistence")
public class TocConfiguration {}
