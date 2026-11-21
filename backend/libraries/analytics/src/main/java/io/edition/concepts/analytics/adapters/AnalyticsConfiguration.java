package io.edition.concepts.analytics.adapters;

import io.edition.concepts.analytics.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.analytics")
public class AnalyticsConfiguration {}
