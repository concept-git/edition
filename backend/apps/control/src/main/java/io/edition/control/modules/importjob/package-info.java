/** Platform concept ImportJob: durable, observable asynchronous import intentions. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.importjob",
        displayName = "ImportJob",
        allowedDependencies = {"shared"})
package io.edition.control.modules.importjob;

import io.edition.control.modules.importjob.api.*;
