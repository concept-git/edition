/** 概念模块 Team [Scope] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.team",
        displayName = "Team",
        allowedDependencies = {"shared"})
package io.edition.control.modules.team;

import io.edition.control.modules.team.api.*;
