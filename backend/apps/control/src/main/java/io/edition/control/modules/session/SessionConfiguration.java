package io.edition.control.modules.session;

import io.edition.control.modules.session.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.session")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.session.persistence")
public class SessionConfiguration {}
