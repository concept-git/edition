/** 概念模块 Team [Scope] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.team",
        displayName = "Team",
        allowedDependencies = {"shared"})
package io.edition.concepts.team;

import io.edition.concepts.team.api.*;
