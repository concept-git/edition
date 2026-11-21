package io.edition.concepts.importformat.adapters;

import io.edition.concepts.importformat.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.importformat")
public class ImportFormatConfiguration {}
