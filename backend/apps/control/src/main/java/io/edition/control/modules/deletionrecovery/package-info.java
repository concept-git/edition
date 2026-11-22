/** Platform concept DeletionRecovery: durable resource cleanup records; no concept dependencies. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.deletionrecovery",
        displayName = "DeletionRecovery",
        allowedDependencies = {"shared"})
package io.edition.control.modules.deletionrecovery;

import io.edition.control.modules.deletionrecovery.api.*;
