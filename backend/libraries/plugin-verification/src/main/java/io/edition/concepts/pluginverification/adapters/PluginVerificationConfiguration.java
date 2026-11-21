package io.edition.concepts.pluginverification.adapters;

import io.edition.concepts.pluginverification.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.pluginverification")
public class PluginVerificationConfiguration {}
