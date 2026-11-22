package io.edition.control.modules.mailoutbox;

import io.edition.control.modules.mailoutbox.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.mailoutbox")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.mailoutbox.persistence")
public class MailOutboxConfiguration {}
