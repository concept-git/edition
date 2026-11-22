package io.edition.control.modules.importformat;

import io.edition.control.modules.importformat.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.importformat")
public class ImportFormatConfiguration {}
