/** 概念模块 Redirect [Scope, Target] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.hosting.redirect",
        displayName = "Redirect",
        allowedDependencies = {"shared"})
package io.edition.control.modules.redirect;

import io.edition.control.modules.redirect.api.*;
