@org.springframework.modulith.ApplicationModule(
        id = "platform.mailoutbox",
        displayName = "MailOutbox",
        allowedDependencies = {"shared"})
package io.edition.concepts.mailoutbox;

import io.edition.concepts.mailoutbox.api.*;
