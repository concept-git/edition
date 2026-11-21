package io.edition.concepts.membership.adapters;

import io.edition.concepts.membership.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.membership")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.membership.adapters.persistence")
public class MembershipConfiguration {}
