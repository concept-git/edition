/** 概念模块 Revision [Item, Content] —— 规格见本包 CONCEPT.md；append-only。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.authoring.revision",
        displayName = "Revision",
        allowedDependencies = {"shared"})
package io.space.concepts.revision;

import io.space.concepts.revision.api.*;
