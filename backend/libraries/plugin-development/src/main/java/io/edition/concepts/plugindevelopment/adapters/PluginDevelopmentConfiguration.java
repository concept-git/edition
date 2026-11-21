package io.edition.concepts.plugindevelopment.adapters;

import io.edition.concepts.plugindevelopment.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.plugindevelopment")
public class PluginDevelopmentConfiguration {}
