package io.space.concepts.plugindevelopment.adapters;

import io.space.concepts.plugindevelopment.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.plugindevelopment")
public class PluginDevelopmentConfiguration {}
