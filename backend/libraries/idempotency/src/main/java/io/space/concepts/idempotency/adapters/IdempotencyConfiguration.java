package io.space.concepts.idempotency.adapters;

import io.space.concepts.idempotency.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.idempotency")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.idempotency.adapters.persistence")
public class IdempotencyConfiguration {}
