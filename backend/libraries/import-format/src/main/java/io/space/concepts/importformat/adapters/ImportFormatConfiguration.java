package io.space.concepts.importformat.adapters;

import io.space.concepts.importformat.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.importformat")
public class ImportFormatConfiguration {}
