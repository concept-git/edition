/** Platform concept DeletionRecovery: durable resource cleanup records; no concept dependencies. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.deletionrecovery",
        displayName = "DeletionRecovery",
        allowedDependencies = {"shared"})
package io.space.concepts.deletionrecovery;

import io.space.concepts.deletionrecovery.api.*;
