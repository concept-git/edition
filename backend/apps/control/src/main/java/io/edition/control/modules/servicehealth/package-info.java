/** Process heartbeats for the platform 服务状态 page; infrastructure state, never business facts. */
@org.springframework.modulith.ApplicationModule(
        id = "platform.servicehealth",
        displayName = "ServiceHealth",
        allowedDependencies = {"shared"})
package io.edition.control.modules.servicehealth;

import io.edition.control.modules.servicehealth.api.*;
