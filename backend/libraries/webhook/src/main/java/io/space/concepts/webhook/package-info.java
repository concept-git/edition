/** Platform concept Webhook: signed subscriptions and durable delivery attempts. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.webhook",
        displayName = "Webhook",
        allowedDependencies = {"shared"})
package io.space.concepts.webhook;

import io.space.concepts.webhook.api.*;
