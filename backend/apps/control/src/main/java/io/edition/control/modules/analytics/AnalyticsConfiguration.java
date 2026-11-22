package io.edition.control.modules.analytics;

import io.edition.control.modules.analytics.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.analytics")
public class AnalyticsConfiguration {}
