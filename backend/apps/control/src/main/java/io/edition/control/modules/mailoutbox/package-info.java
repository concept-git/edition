@org.springframework.modulith.ApplicationModule(
        id = "platform.mailoutbox",
        displayName = "MailOutbox",
        allowedDependencies = {"shared"})
package io.edition.control.modules.mailoutbox;

import io.edition.control.modules.mailoutbox.api.*;
