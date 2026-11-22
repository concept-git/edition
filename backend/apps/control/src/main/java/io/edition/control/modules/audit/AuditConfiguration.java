package io.edition.control.modules.audit;

import io.edition.control.modules.audit.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.audit")
public class AuditConfiguration {}
