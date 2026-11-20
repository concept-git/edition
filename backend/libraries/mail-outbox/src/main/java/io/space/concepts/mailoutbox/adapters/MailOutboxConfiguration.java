package io.space.concepts.mailoutbox.adapters;

import io.space.concepts.mailoutbox.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.mailoutbox")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.mailoutbox.adapters.persistence")
public class MailOutboxConfiguration {}
