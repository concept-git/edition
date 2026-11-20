/** Audit facts, bounded queries and irreversible actor redaction; no concept dependencies. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.audit",
        displayName = "Audit",
        allowedDependencies = {"shared"})
package io.space.concepts.audit;

import io.space.concepts.audit.api.*;
