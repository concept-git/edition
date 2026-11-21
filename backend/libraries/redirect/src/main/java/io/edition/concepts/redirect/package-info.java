/** 概念模块 Redirect [Scope, Target] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.hosting.redirect",
        displayName = "Redirect",
        allowedDependencies = {"shared"})
package io.edition.concepts.redirect;

import io.edition.concepts.redirect.api.*;
