package io.edition.concepts.password.adapters;

import io.edition.concepts.password.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.password")
public class PasswordConfiguration {}
