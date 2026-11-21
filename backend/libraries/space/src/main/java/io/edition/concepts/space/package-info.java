/** 概念模块 Space [Item] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.authoring.space",
        displayName = "Space",
        allowedDependencies = {"shared"})
package io.edition.concepts.space;

import io.edition.concepts.space.api.*;
