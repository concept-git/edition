package io.space.concepts.readersecurity.adapters;

import io.space.concepts.readersecurity.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.readersecurity")
public class ReaderSecurityConfiguration {}
