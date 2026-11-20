@org.springframework.modulith.ApplicationModule(
        id = "platform.mailoutbox",
        displayName = "MailOutbox",
        allowedDependencies = {"shared"})
package io.space.concepts.mailoutbox;

import io.space.concepts.mailoutbox.api.*;
