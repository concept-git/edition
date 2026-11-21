package io.edition.concepts.webhook.adapters;

import io.edition.concepts.webhook.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.webhook")
public class WebhookConfiguration {}
