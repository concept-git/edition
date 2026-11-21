/** Platform concept DeletionRecovery: durable resource cleanup records; no concept dependencies. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.deletionrecovery",
        displayName = "DeletionRecovery",
        allowedDependencies = {"shared"})
package io.edition.concepts.deletionrecovery;

import io.edition.concepts.deletionrecovery.api.*;
