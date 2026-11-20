package io.space.concepts.audit.adapters;

import io.space.concepts.audit.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.audit")
public class AuditConfiguration {}
