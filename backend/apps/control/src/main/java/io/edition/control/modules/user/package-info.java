/** 概念模块 User —— 规格见本包 CONCEPT.md；概念模块零相互引用（仅可用 shared）。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.user",
        displayName = "User",
        allowedDependencies = {"shared"})
package io.edition.control.modules.user;

import io.edition.control.modules.user.api.*;
