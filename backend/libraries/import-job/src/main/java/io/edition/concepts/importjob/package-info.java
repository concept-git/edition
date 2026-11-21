/** Platform concept ImportJob: durable, observable asynchronous import intentions. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.importjob",
        displayName = "ImportJob",
        allowedDependencies = {"shared"})
package io.edition.concepts.importjob;

import io.edition.concepts.importjob.api.*;
