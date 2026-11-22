/** Read-only inspection of actual edge TLS certificates. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.certificateinspection",
        displayName = "CertificateInspection",
        allowedDependencies = {"shared"})
package io.edition.control.modules.certificateinspection;

import io.edition.control.modules.certificateinspection.api.*;
