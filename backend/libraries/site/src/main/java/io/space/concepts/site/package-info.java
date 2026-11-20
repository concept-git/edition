/** 概念模块 Site [Target] —— 规格见本包 CONCEPT.md；slug 属挂载表。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.hosting.site",
        displayName = "Site",
        allowedDependencies = {"shared"})
package io.space.concepts.site;

import io.space.concepts.site.api.*;
