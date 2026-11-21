package io.edition.concepts.readersecurity.adapters;

import io.edition.concepts.readersecurity.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.readersecurity")
public class ReaderSecurityConfiguration {}
