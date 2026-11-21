/** Platform concept Webhook: signed subscriptions and durable delivery attempts. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.webhook",
        displayName = "Webhook",
        allowedDependencies = {"shared"})
package io.edition.concepts.webhook;

import io.edition.concepts.webhook.api.*;
