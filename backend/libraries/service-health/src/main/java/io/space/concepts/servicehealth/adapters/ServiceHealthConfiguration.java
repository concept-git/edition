package io.space.concepts.servicehealth.adapters;

import io.space.concepts.servicehealth.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.servicehealth")
public class ServiceHealthConfiguration {}
