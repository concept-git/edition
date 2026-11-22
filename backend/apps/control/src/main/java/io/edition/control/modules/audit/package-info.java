/** Audit facts, bounded queries and irreversible actor redaction; no concept dependencies. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.audit",
        displayName = "Audit",
        allowedDependencies = {"shared"})
package io.edition.control.modules.audit;

import io.edition.control.modules.audit.api.*;
