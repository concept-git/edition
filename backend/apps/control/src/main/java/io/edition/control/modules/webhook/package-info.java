/** Platform concept Webhook: signed subscriptions and durable delivery attempts. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.webhook",
        displayName = "Webhook",
        allowedDependencies = {"shared"})
package io.edition.control.modules.webhook;

import io.edition.control.modules.webhook.api.*;
