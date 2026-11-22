package io.edition.control.modules.bundleexport;

import io.edition.control.modules.bundleexport.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.bundleexport")
public class BundleExportConfiguration {}
