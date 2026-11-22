/** 概念模块 Release [Scope, Bundle] —— 规格见本包 CONCEPT.md；不可变快照 + 原子 promote。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.releases.release",
        displayName = "Release",
        allowedDependencies = {"shared"})
package io.edition.control.modules.release;

import io.edition.control.modules.release.api.*;
