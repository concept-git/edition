package io.space.concepts.analytics.adapters;

import io.space.concepts.analytics.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.analytics")
public class AnalyticsConfiguration {}
