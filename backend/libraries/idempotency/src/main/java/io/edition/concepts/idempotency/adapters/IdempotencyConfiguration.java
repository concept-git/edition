package io.edition.concepts.idempotency.adapters;

import io.edition.concepts.idempotency.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.idempotency")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.idempotency.adapters.persistence")
public class IdempotencyConfiguration {}
