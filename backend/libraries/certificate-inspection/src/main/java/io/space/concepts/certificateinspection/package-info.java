/** Read-only inspection of actual edge TLS certificates. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.certificateinspection",
        displayName = "CertificateInspection",
        allowedDependencies = {"shared"})
package io.space.concepts.certificateinspection;

import io.space.concepts.certificateinspection.api.*;
