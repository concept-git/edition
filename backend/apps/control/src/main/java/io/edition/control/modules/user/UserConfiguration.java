package io.edition.control.modules.user;

import io.edition.control.modules.user.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.user")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.user.persistence")
public class UserConfiguration {}
