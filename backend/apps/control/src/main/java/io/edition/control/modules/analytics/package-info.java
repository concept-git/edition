/** Read-side operational analytics event projection; never writes business concepts. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.analytics",
        displayName = "Analytics",
        allowedDependencies = {"shared"})
package io.edition.control.modules.analytics;

import io.edition.control.modules.analytics.api.*;
