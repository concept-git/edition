package io.space.concepts.bundleexport.adapters;

import io.space.concepts.bundleexport.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.bundleexport")
public class BundleExportConfiguration {}
