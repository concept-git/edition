package io.edition.concepts.bundleexport.adapters;

import io.edition.concepts.bundleexport.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.bundleexport")
public class BundleExportConfiguration {}
