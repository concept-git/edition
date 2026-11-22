package io.edition.control.modules.idempotency;

import io.edition.control.modules.idempotency.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.idempotency")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.idempotency.persistence")
public class IdempotencyConfiguration {}
