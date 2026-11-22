package io.edition.control.modules.plugindevelopment;

import io.edition.control.modules.plugindevelopment.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.plugindevelopment")
public class PluginDevelopmentConfiguration {}
