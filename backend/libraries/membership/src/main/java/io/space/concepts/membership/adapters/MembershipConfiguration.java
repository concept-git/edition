package io.space.concepts.membership.adapters;

import io.space.concepts.membership.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.membership")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.membership.adapters.persistence")
public class MembershipConfiguration {}
