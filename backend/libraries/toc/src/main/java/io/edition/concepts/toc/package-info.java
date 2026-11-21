/** 概念模块 Toc [Target] —— 规格见本包 CONCEPT.md；纯展示，零寻址职责。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.authoring.toc",
        displayName = "Toc",
        allowedDependencies = {"shared"})
package io.edition.concepts.toc;

import io.edition.concepts.toc.api.*;
