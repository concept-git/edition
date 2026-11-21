/** 概念模块 Site [Target] —— 规格见本包 CONCEPT.md；slug 属挂载表。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.hosting.site",
        displayName = "Site",
        allowedDependencies = {"shared"})
package io.edition.concepts.site;

import io.edition.concepts.site.api.*;
