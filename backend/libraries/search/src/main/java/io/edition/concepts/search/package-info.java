/** 概念模块 Search [Item] —— 规格见本包 CONCEPT.md；index/deindex 仅由发版 sync 喂入。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.hosting.search",
        displayName = "Search",
        allowedDependencies = {"shared"})
package io.edition.concepts.search;

import io.edition.concepts.search.api.*;
