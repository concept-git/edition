package io.edition.control.modules.redirect;

import io.edition.control.modules.redirect.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.redirect")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.redirect.persistence")
public class RedirectConfiguration {}
