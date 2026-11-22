package io.edition.control.modules.membership;

import io.edition.control.modules.membership.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.membership")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.membership.persistence")
public class MembershipConfiguration {}
