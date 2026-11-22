package io.edition.control.modules.servicehealth;

import io.edition.control.modules.servicehealth.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.servicehealth")
public class ServiceHealthConfiguration {}
