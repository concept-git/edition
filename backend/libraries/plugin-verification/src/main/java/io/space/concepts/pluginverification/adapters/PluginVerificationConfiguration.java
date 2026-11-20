package io.space.concepts.pluginverification.adapters;

import io.space.concepts.pluginverification.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.pluginverification")
public class PluginVerificationConfiguration {}
