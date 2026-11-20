/** Platform concept ImportJob: durable, observable asynchronous import intentions. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.importjob",
        displayName = "ImportJob",
        allowedDependencies = {"shared"})
package io.space.concepts.importjob;

import io.space.concepts.importjob.api.*;
