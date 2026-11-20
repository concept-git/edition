package io.space.concepts.webhook.adapters;

import io.space.concepts.webhook.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.webhook")
public class WebhookConfiguration {}
