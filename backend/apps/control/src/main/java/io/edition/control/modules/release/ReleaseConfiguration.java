package io.edition.control.modules.release;

import io.edition.control.modules.release.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.release")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.release.persistence")
public class ReleaseConfiguration {}
