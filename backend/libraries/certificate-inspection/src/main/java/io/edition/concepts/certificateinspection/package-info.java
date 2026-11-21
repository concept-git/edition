/** Read-only inspection of actual edge TLS certificates. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.certificateinspection",
        displayName = "CertificateInspection",
        allowedDependencies = {"shared"})
package io.edition.concepts.certificateinspection;

import io.edition.concepts.certificateinspection.api.*;
