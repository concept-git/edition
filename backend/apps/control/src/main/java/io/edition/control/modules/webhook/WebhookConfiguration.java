package io.edition.control.modules.webhook;

import io.edition.control.modules.webhook.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.webhook")
public class WebhookConfiguration {}
