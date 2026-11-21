/** Audit facts, bounded queries and irreversible actor redaction; no concept dependencies. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.audit",
        displayName = "Audit",
        allowedDependencies = {"shared"})
package io.edition.concepts.audit;

import io.edition.concepts.audit.api.*;
