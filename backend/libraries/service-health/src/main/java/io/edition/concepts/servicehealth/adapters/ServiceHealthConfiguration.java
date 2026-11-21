package io.edition.concepts.servicehealth.adapters;

import io.edition.concepts.servicehealth.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.servicehealth")
public class ServiceHealthConfiguration {}
