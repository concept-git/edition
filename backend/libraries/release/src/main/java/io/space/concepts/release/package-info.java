/** 概念模块 Release [Scope, Bundle] —— 规格见本包 CONCEPT.md；不可变快照 + 原子 promote。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.releases.release",
        displayName = "Release",
        allowedDependencies = {"shared"})
package io.space.concepts.release;

import io.space.concepts.release.api.*;
