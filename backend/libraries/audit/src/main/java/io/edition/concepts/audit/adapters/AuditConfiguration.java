package io.edition.concepts.audit.adapters;

import io.edition.concepts.audit.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.audit")
public class AuditConfiguration {}
