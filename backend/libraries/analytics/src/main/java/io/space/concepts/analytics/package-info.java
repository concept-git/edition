/** Read-side operational analytics event projection; never writes business concepts. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.analytics",
        displayName = "Analytics",
        allowedDependencies = {"shared"})
package io.space.concepts.analytics;

import io.space.concepts.analytics.api.*;
